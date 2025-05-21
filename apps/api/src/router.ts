import { Hono } from 'hono';
import type { Context } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { pages, sections, qdpiMoves, pageNotes, vaultEntries, pageLinks } from '../../../packages/db/src/schema';
import { symbolMetadata } from '../../../the-corpus/symbols/metadata';
import { eq, and, like, desc, gte, lte } from 'drizzle-orm';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware';
import colorMap from '../../../the-corpus/colors';
import {
  Glyph,
  Action,
  Context as GlyphContext,
  State,
  Role,
  Relation,
  Polarity,
  Rotation,
  Modality,
  encodeGlyphNumeric,
} from '../../../packages/utils/glyphCodec';
import { join } from 'path';
import { readdirSync } from 'fs';
import { t, AppContext } from './trpc';
import { TRPCError } from '@trpc/server'; // Explicit import for TRPCError
import { requireRole } from './middleware/requireRole';
import { roleCapabilities, RoleType } from '../../../packages/types/roles';
import { qdpiActionCapabilities } from '../../../packages/types/actionPermissions';

export const db = drizzle(new Database('db.sqlite'));

const pageSelect = {
  id: pages.id,
  section: pages.section,
  sectionName: pages.sectionName,
  corpusSymbol: pages.corpusSymbol,
  pageNumber: pages.pageNumber,
  globalIndex: pages.globalIndex,
  text: pages.text,
};

export const appRouter = t.router({
  savePageNote: t.procedure
    .input(
      z.object({
        pageId: z.number(),
        noteText: z.string().min(1),
        userId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Implement Role-based access control (e.g., Role.Guest restrictions).
      // const userRole = ctx.user?.role;
      // if (userRole === Role.Guest) { throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Guests cannot save notes.' }); }

      // 1. Save the note
      const noteResult = await db.insert(pageNotes).values({
        pageId: input.pageId,
        noteText: input.noteText,
        userId: input.userId,
      }).returning({ insertedId: pageNotes.id });

      const newNoteId = noteResult[0].insertedId;

      // 2. Log the QDPI move
      const glyphData: Glyph = {
        action: Action.Write,
        context: GlyphContext.Reaction,
        state: State.Private,
        role: Role.Human,
        relation: Relation.S2O,
        polarity: Polarity.Internal,
        rotation: Rotation.N,
        modality: Modality.Text,
      };
      const numericGlyph = encodeGlyphNumeric(glyphData);

      await db.insert(qdpiMoves).values({
        numericGlyph,
        action: glyphData.action,
        context: glyphData.context,
        state: glyphData.state,
        role: glyphData.role,
        relation: glyphData.relation,
        polarity: glyphData.polarity,
        rotation: glyphData.rotation,
        modality: glyphData.modality,
        userId: input.userId,
        operationDetails: `Saved note on pageId: ${input.pageId}, noteId: ${newNoteId}`,
      });

      // --- BEGIN MCP Action Trigger ---
      try {
        const mcpId = "Arieol Owlist";
        const targetNoteId = newNoteId;
        const userNoteContent = input.noteText;
        const originalUserId = input.userId; // This might be undefined if user is not logged in

        if (originalUserId) { // Only trigger if there's a user to attribute the trigger to
          await ctx.router.invokeMcpAction({
            mcpId: mcpId,
            mcpActionType: Action.Write,
            targetEntityId: String(targetNoteId),
            promptText: userNoteContent,
            userId: originalUserId,
            mcpContext: GlyphContext.Reaction,
            mcpState: State.Public,
            mcpPolarity: Polarity.External,
            mcpRotation: Rotation.N,
            mcpModality: Modality.Text,
          });
        } else {
          console.log(`MCP action for ${mcpId} not triggered: originalUserId is undefined for noteId ${newNoteId}.`);
        }
      } catch (mcpError) {
        console.error(`Failed to trigger MCP comment for noteId ${newNoteId}:`, mcpError);
        // Do not let this error fail the main savePageNote operation
      }
      // --- END MCP Action Trigger ---

      return { success: true, newNoteId };
    }),

  logQdpiMove: t.procedure
    .input(
      z.object({
        action: z.nativeEnum(Action),
        context: z.nativeEnum(GlyphContext),
        state: z.nativeEnum(State),
        role: z.nativeEnum(Role),
        relation: z.nativeEnum(Relation),
        polarity: z.nativeEnum(Polarity),
        rotation: z.nativeEnum(Rotation),
        modality: z.nativeEnum(Modality).optional(),
        userId: z.string().optional(),
        operationDetails: z.string().optional(),
        contentPayload: z.object({
          text: z.string().min(1),
          actorId: z.string(),
        }).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => { 
      // Permission Check Logic
      const userRole = ctx.user?.role as RoleType | undefined;

      if (!userRole || !roleCapabilities[userRole]) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User role is invalid or not found.',
        });
      }

      const actionName = Action[input.action] as keyof typeof Action; // Action is already imported
      const requiredCapability = qdpiActionCapabilities[actionName];

      if (requiredCapability) {
        const userCapabilities = roleCapabilities[userRole]; // userRole is validated above
        if (!userCapabilities.includes(requiredCapability)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Your role ('${userRole}') does not have the required capability ('${requiredCapability}') to perform the action '${actionName}'.`,
          });
        }
      }
      // If requiredCapability is undefined, the action is allowed by default.

      let operationDetailsString = input.operationDetails ?? "";

      if (input.contentPayload) {
        const newVaultEntryResult = await db.insert(vaultEntries).values({
          action: Action[input.action] as string,
          context: GlyphContext[input.context] as string,
          state: State[input.state] as string,
          role: Role[input.role] as string,
          relation: Relation[input.relation] as string,
          polarity: Polarity[input.polarity] as string,
          rotation: Rotation[input.rotation] as string,
          content: input.contentPayload.text,
          actorId: input.contentPayload.actorId,
          createdAt: Date.now(),
        }).returning({ insertedId: vaultEntries.id });

        const newVaultEntryId = newVaultEntryResult[0].insertedId;
        const vaultEntryReference = `Associated vault_entry_id: ${newVaultEntryId}. `;
        operationDetailsString = operationDetailsString 
          ? `${operationDetailsString} ${vaultEntryReference}` 
          : vaultEntryReference;
      }

      // Existing logic to construct glyphData and insert into qdpi_moves
      const modality = input.modality ?? Modality.Text;
      const glyphData: Glyph = {
        action: input.action,
        context: input.context,
        state: input.state,
        role: input.role,
        relation: input.relation,
        polarity: input.polarity,
        rotation: input.rotation,
        modality: modality,
      };
      const numericGlyph = encodeGlyphNumeric(glyphData);

      const result = await db.insert(qdpiMoves).values({
        numericGlyph,
        action: input.action,
        context: input.context,
        state: input.state,
        role: input.role,
        relation: input.relation,
        polarity: input.polarity,
        rotation: input.rotation,
        modality: modality,
        userId: input.userId,
        operationDetails: operationDetailsString, // Use the potentially updated string
      }).returning({ insertedId: qdpiMoves.id });

      return { success: true, moveId: result[0].insertedId };
    }),

  // The classic Vault logDream endpoint, for backward compatibility and for UI logging.
  logDream: t.procedure
    .input(
      z.object({
        action: z.string(),
        context: z.string(),
        state: z.string(),
        role: z.string(),
        relation: z.string(),
        polarity: z.string(),
        rotation: z.string(),
        content: z.string(),
        actorId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db.insert(vaultEntries).values({
        action: input.action,
        context: input.context,
        state: input.state,
        role: input.role,
        relation: input.relation,
        polarity: input.polarity,
        rotation: input.rotation,
        content: input.content,
        actorId: input.actorId,
        createdAt: Date.now(),
      });
      return { success: true };
    }),

  getPageById: t.procedure
    .input(z.object({ section: z.number(), index: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .select(pageSelect)
        .from(pages)
        .where(and(eq(pages.section, input.section), eq(pages.pageNumber, input.index)));
      if (!result[0]) return null;
      const sectionColor = colorMap[result[0].sectionName] ?? '#00FF00';
      return { ...result[0], color: sectionColor };
    }),

  getPagesBySection: t.procedure
    .input(z.object({ section: z.number() }))
    .query(async ({ input }) => {
      const res = await db
        .select(pageSelect)
        .from(pages)
        .where(eq(pages.section, input.section));
      return res.map(p => ({
        ...p,
        color: colorMap[p.sectionName] ?? '#00FF00'
      }));
    }),

  searchPages: t.procedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const res = await db
        .select(pageSelect)
        .from(pages)
        .where(like(pages.text, `%${input.query}%`));
      return res.map(p => ({
        ...p,
        color: colorMap[p.sectionName] ?? '#00FF00'
      }));
    }),

  getPagesBySymbol: t.procedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      const res = await db
        .select(pageSelect)
        .from(pages)
        .where(eq(pages.corpusSymbol, input.symbol));
      return res.map(p => ({
        ...p,
        color: colorMap[p.sectionName] ?? '#00FF00'
      }));
    }),

  getSections: t.procedure.query(async () => {
    const secs = await db.select().from(sections);
    return secs.map(s => ({
      ...s,
      color: colorMap[s.sectionName] ?? '#00FF00'
    }));
  }),

  getSymbols: t.procedure.query(async () => {
    if (symbolMetadata && Array.isArray(symbolMetadata) && symbolMetadata.length > 0) {
      return symbolMetadata;
    }
    // Fallback: read from directory
    const dir = join(__dirname, '../../../the-corpus/symbols');
    const files = readdirSync(dir);
    return files.filter((f) => f.endsWith('.svg'));
  }),

  getCorpusMetadata: t.procedure.query(async () => {
    return { colors: colorMap };
  }),

  getQdpiMoveById: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(qdpiMoves)
        .where(eq(qdpiMoves.id, input.id));
      return result[0] || null;
    }),

  getQdpiMovesByNumericGlyph: t.procedure
    .input(z.object({ numericGlyph: z.number() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(qdpiMoves)
        .where(eq(qdpiMoves.numericGlyph, input.numericGlyph))
        .orderBy(desc(qdpiMoves.timestamp));
    }),

  getQdpiMoves: t.procedure
    .input(
      z.object({
        filter: z
          .object({
            action: z.nativeEnum(Action).optional(),
            context: z.nativeEnum(GlyphContext).optional(),
            state: z.nativeEnum(State).optional(),
            role: z.nativeEnum(Role).optional(),
            relation: z.nativeEnum(Relation).optional(),
            polarity: z.nativeEnum(Polarity).optional(),
            rotation: z.nativeEnum(Rotation).optional(),
            modality: z.nativeEnum(Modality).optional(),
            userId: z.string().optional(),
            startDate: z.number().int().positive().optional(),
            endDate: z.number().int().positive().optional(),
          })
          .optional(),
        limit: z.number().int().positive().optional().default(50),
        offset: z.number().int().nonnegative().optional().default(0),
      })
    )
    .query(async ({ input }) => {
      const conditions = [];
      if (input.filter) {
        if (input.filter.action !== undefined) {
          conditions.push(eq(qdpiMoves.action, input.filter.action));
        }
        if (input.filter.context !== undefined) {
          conditions.push(eq(qdpiMoves.context, input.filter.context));
        }
        if (input.filter.state !== undefined) {
          conditions.push(eq(qdpiMoves.state, input.filter.state));
        }
        if (input.filter.role !== undefined) {
          conditions.push(eq(qdpiMoves.role, input.filter.role));
        }
        if (input.filter.relation !== undefined) {
          conditions.push(eq(qdpiMoves.relation, input.filter.relation));
        }
        if (input.filter.polarity !== undefined) {
          conditions.push(eq(qdpiMoves.polarity, input.filter.polarity));
        }
        if (input.filter.rotation !== undefined) {
          conditions.push(eq(qdpiMoves.rotation, input.filter.rotation));
        }
        if (input.filter.modality !== undefined) {
          conditions.push(eq(qdpiMoves.modality, input.filter.modality));
        }
        if (input.filter.userId !== undefined) {
          conditions.push(eq(qdpiMoves.userId, input.filter.userId));
        }
        if (input.filter.startDate !== undefined) {
          conditions.push(gte(qdpiMoves.timestamp, new Date(input.filter.startDate)));
        }
        if (input.filter.endDate !== undefined) {
          conditions.push(lte(qdpiMoves.timestamp, new Date(input.filter.endDate)));
        }
      }

      const query = db
        .select()
        .from(qdpiMoves)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(qdpiMoves.timestamp))
        .limit(input.limit)
        .offset(input.offset);

      return query;
    }),

  mergeEntries: t.procedure
    .use(requireRole(['MythicGuardian']))
    .input(
      z.object({
        sourceEntryId: z.number(),
        targetEntryId: z.number(),
        mergedContent: z.string(),
        userId: z.string(),
        context: z.nativeEnum(GlyphContext),
        state: z.nativeEnum(State),
        polarity: z.nativeEnum(Polarity),
        rotation: z.nativeEnum(Rotation),
        modality: z.nativeEnum(Modality).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Permission check is handled by requireRole middleware

      // 2. Fetch and validate entries
      if (input.sourceEntryId === input.targetEntryId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Source and target entry IDs cannot be the same.',
        });
      }

      const sourceEntry = await db
        .select()
        .from(vaultEntries)
        .where(eq(vaultEntries.id, input.sourceEntryId))
        .get(); // .get() is for Bun/SQLite, adjust if using another driver

      if (!sourceEntry) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Source vault entry with ID ${input.sourceEntryId} not found.`,
        });
      }

      const targetEntry = await db
        .select()
        .from(vaultEntries)
        .where(eq(vaultEntries.id, input.targetEntryId))
        .get();

      if (!targetEntry) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Target vault entry with ID ${input.targetEntryId} not found.`,
        });
      }

      // 3. Log the QDPI Merge action
      const modality = input.modality ?? Modality.Text;
      const glyphData: Glyph = {
        action: Action.Merge,
        context: input.context,
        state: input.state,
        role: Role.MythicGuardian, // As per requirement
        relation: Relation.S2O, // As per requirement, consider making configurable later
        polarity: input.polarity,
        rotation: input.rotation,
        modality: modality,
      };
      const numericGlyph = encodeGlyphNumeric(glyphData);

      const initialOperationDetails = `Merging entries ${input.sourceEntryId} and ${input.targetEntryId}`;
      const qdpiMoveResult = await db
        .insert(qdpiMoves)
        .values({
          numericGlyph,
          action: glyphData.action,
          context: glyphData.context,
          state: glyphData.state,
          role: glyphData.role,
          relation: glyphData.relation,
          polarity: glyphData.polarity,
          rotation: glyphData.rotation,
          modality: modality,
          userId: input.userId,
          operationDetails: initialOperationDetails,
        })
        .returning({ insertedId: qdpiMoves.id });

      const qdpiMoveId = qdpiMoveResult[0].insertedId;

      // 4. Create the new merged vault_entry
      // Using the same QDPI axis values from the Merge glyph for the new vault_entry
      const newVaultEntryResult = await db
        .insert(vaultEntries)
        .values({
          action: Action[glyphData.action], // Store as string name like logDream
          context: GlyphContext[glyphData.context],
          state: State[glyphData.state],
          role: Role[glyphData.role],
          relation: Relation[glyphData.relation],
          polarity: Polarity[glyphData.polarity],
          rotation: Rotation[glyphData.rotation],
          // Modality is not directly in vaultEntries schema based on logDream, content implies it
          content: input.mergedContent,
          actorId: input.userId,
          createdAt: Date.now(), // Ensure this matches schema (timestamp or Date)
        })
        .returning({ insertedId: vaultEntries.id });

      const newVaultEntryId = newVaultEntryResult[0].insertedId;

      // 5. Update the previously logged QDPI move with newVaultEntryId
      const finalOperationDetails = `Merged entries ${input.sourceEntryId} and ${input.targetEntryId} into new entry ${newVaultEntryId}`;
      await db
        .update(qdpiMoves)
        .set({ operationDetails: finalOperationDetails })
        .where(eq(qdpiMoves.id, qdpiMoveId));

      // 6. Return success
      return { success: true, newVaultEntryId, moveId: qdpiMoveId };
    }),

  createPageLink: t.procedure
    .input(
      z.object({
        sourcePageId: z.number(),
        targetPageId: z.number(),
        userId: z.string().optional(),
        context: z.nativeEnum(GlyphContext),
        state: z.nativeEnum(State),
        polarity: z.nativeEnum(Polarity),
        rotation: z.nativeEnum(Rotation),
        modality: z.nativeEnum(Modality).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Permission Check
      const userRole = ctx.user?.role as RoleType | undefined;
      if (!userRole || !roleCapabilities[userRole]) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User role is invalid or not found.',
        });
      }

      const requiredCapability = qdpiActionCapabilities.Link;
      if (!roleCapabilities[userRole].includes(requiredCapability)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Your role ('${userRole}') does not have the required capability ('${requiredCapability}') to perform the action 'Link'.`,
        });
      }

      // Validate page IDs
      if (input.sourcePageId === input.targetPageId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Source and target page IDs cannot be the same.',
        });
      }

      // Log QDPI move
      const modality = input.modality ?? Modality.Text;
      const glyphData: Glyph = {
        action: Action.Link,
        context: input.context,
        state: input.state,
        role: Role.Human, // Assuming Human role for now, adjust if necessary
        relation: Relation.S2O, 
        polarity: input.polarity,
        rotation: input.rotation,
        modality: modality,
      };
      const numericGlyph = encodeGlyphNumeric(glyphData);

      const qdpiMoveResult = await db.insert(qdpiMoves).values({
        numericGlyph,
        action: glyphData.action,
        context: glyphData.context,
        state: glyphData.state,
        role: glyphData.role,
        relation: glyphData.relation,
        polarity: glyphData.polarity,
        rotation: glyphData.rotation,
        modality: modality,
        userId: input.userId,
        operationDetails: `Created link from page ${input.sourcePageId} to page ${input.targetPageId}`,
      }).returning({ insertedId: qdpiMoves.id });

      const moveId = qdpiMoveResult[0].insertedId;

      // Insert page link
      const pageLinkResult = await db.insert(pageLinks).values({
        source_page_id: input.sourcePageId,
        target_page_id: input.targetPageId,
        qdpi_move_id: moveId,
      }).returning({ insertedId: pageLinks.id });

      const linkId = pageLinkResult[0].insertedId;

      return { success: true, linkId, moveId };
    }),

  forgetVaultEntry: t.procedure
    .use(requireRole(['MythicGuardian']))
    .input(
      z.object({
        entryId: z.number(),
        userId: z.string(),
        context: z.nativeEnum(GlyphContext),
        state: z.nativeEnum(State),
        polarity: z.nativeEnum(Polarity),
        rotation: z.nativeEnum(Rotation),
        modality: z.nativeEnum(Modality).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Permission check is handled by requireRole middleware

      // 2. Fetch the vault_entry
      const entry = await db
        .select()
        .from(vaultEntries)
        .where(eq(vaultEntries.id, input.entryId))
        .get();

      if (!entry) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Vault entry with ID ${input.entryId} not found.`,
        });
      }

      // If entry is already forgotten, we can choose to do nothing or proceed.
      // For idempotency, proceeding to mark it again (which has no effect if already true)
      // and logging the action is acceptable.

      // 3. Update the vault_entry to mark as forgotten
      await db
        .update(vaultEntries)
        .set({ is_forgotten: true })
        .where(eq(vaultEntries.id, input.entryId));

      // 4. Log the QDPI Forget action
      const modality = input.modality ?? Modality.Text;
      const glyphData: Glyph = {
        action: Action.Forget,
        context: input.context,
        state: input.state,
        role: Role.MythicGuardian, // Role is enforced by middleware
        relation: Relation.S2O, // Defaulting as per instructions
        polarity: input.polarity,
        rotation: input.rotation,
        modality: modality,
      };
      const numericGlyph = encodeGlyphNumeric(glyphData);

      const qdpiMoveResult = await db
        .insert(qdpiMoves)
        .values({
          numericGlyph,
          action: glyphData.action,
          context: glyphData.context,
          state: glyphData.state,
          role: glyphData.role,
          relation: glyphData.relation,
          polarity: glyphData.polarity,
          rotation: glyphData.rotation,
          modality: modality,
          userId: input.userId,
          operationDetails: `Forgot vault entry with ID: ${input.entryId}`,
        })
        .returning({ insertedId: qdpiMoves.id });

      const qdpiMoveId = qdpiMoveResult[0].insertedId;

      // 5. Return success
      return { success: true, moveId: qdpiMoveId };
    }),

  invokeDreamRIA: t.procedure
    .use(requireRole(['Scribe'])) // General protection for the endpoint
    .input(
      z.object({
        promptText: z.string().min(1),
        userId: z.string(),
        userAction: z.nativeEnum(Action),
        userContext: z.nativeEnum(GlyphContext),
        userState: z.nativeEnum(State),
        userPolarity: z.nativeEnum(Polarity),
        userRotation: z.nativeEnum(Rotation),
        userModality: z.nativeEnum(Modality).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Permission Check for user's action is implicitly covered by logQdpiMove's internal checks
      //    and the general 'Scribe' role protection on this endpoint.

      // 2. Log User's Triggering QDPI Move
      const userModality = input.userModality ?? Modality.Text;
      const userMoveResult = await ctx.router.logQdpiMove({ // Changed to call router procedure
        action: input.userAction,
        context: input.userContext,
        state: input.userState,
        role: Role.Human, // Assuming the user is Human for this action
        relation: Relation.S2O,
        polarity: input.userPolarity,
        rotation: input.userRotation,
        modality: userModality,
        userId: input.userId,
        contentPayload: { text: input.promptText, actorId: input.userId },
        operationDetails: "User action triggering DreamRIA.",
      });
      const userMoveId = userMoveResult.moveId;

      // Extract user's vault entry ID from operationDetails (if logQdpiMove was called directly)
      // Since we are calling the procedure, we need to fetch the move to get its details.
      const userQdpiMove = await db.select().from(qdpiMoves).where(eq(qdpiMoves.id, userMoveId)).get();
      let userVaultEntryId = null;
      if (userQdpiMove?.operationDetails) {
        const match = userQdpiMove.operationDetails.match(/Associated vault_entry_id: (\d+)\./);
        if (match && match[1]) {
          userVaultEntryId = parseInt(match[1], 10);
        }
      }
      
      // 3. Call DreamRIA Service
      const DREAMRIA_SERVICE_URL = 'http://localhost:12345/generate'; // Placeholder URL
      const DREAMRIA_ACTOR_ID = 'dreamria-agent'; // Confirming actor ID
      let dreamRIAContent: string;

      try {
        const response = await fetch(DREAMRIA_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: input.promptText }),
        });

        if (!response.ok) {
          // Attempt to get more details from the response body if possible, but don't let it fail the error reporting
          let errorBody = '';
          try {
            errorBody = await response.text();
          } catch (e) {
            // Ignore if reading body fails
          }
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `DreamRIA service request failed with status: ${response.status}. Response: ${errorBody}`,
          });
        }

        const responseData = await response.json();

        if (typeof responseData.dreamContent !== 'string' || responseData.dreamContent.length === 0) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Invalid or empty dreamContent in response from DreamRIA service.',
          });
        }
        dreamRIAContent = responseData.dreamContent;

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error; // Re-throw TRPCError
        }
        // Log the original error for server-side inspection
        console.error("DreamRIA fetch error:", error); 
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          // It's good to provide a more generic message to the client for unexpected errors
          message: 'Failed to communicate with DreamRIA service. Please check server logs for details.',
        });
      }

      // 4. Log DreamRIA's Generative QDPI Move
      const dreamRIAMoveResult = await ctx.router.logQdpiMove({ // Changed to call router procedure
        action: Action.Write,
        context: GlyphContext.Generation,
        state: State.Public, 
        role: Role.AICharacter,
        relation: Relation.O2S,
        polarity: Polarity.External,
        rotation: Rotation.N,
        modality: Modality.Text,
        userId: input.userId, // For traceability, role ensures AICharacter capability check
        contentPayload: { text: dreamRIAContent, actorId: DREAMRIA_ACTOR_ID },
        operationDetails: `DreamRIA generated content in response to userMoveId: ${userMoveId}.`, // Vault ID will be added by logQdpiMove
      });
      const dreamRIAMoveId = dreamRIAMoveResult.moveId;

      // Extract DreamRIA's vault entry ID
      const dreamRIAQdpiMove = await db.select().from(qdpiMoves).where(eq(qdpiMoves.id, dreamRIAMoveId)).get();
      let dreamVaultEntryId = null;
      if (dreamRIAQdpiMove?.operationDetails) {
        const match = dreamRIAQdpiMove.operationDetails.match(/Associated vault_entry_id: (\d+)\./);
        if (match && match[1]) {
          dreamVaultEntryId = parseInt(match[1], 10);
        }
      }

      if (dreamVaultEntryId === null) {
          throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Could not extract dreamVaultEntryId from DreamRIA move operationDetails.',
          });
      }

      // 5. Return Value
      return {
        success: true,
        userMoveId,
        userVaultEntryId, // Added for completeness
        dreamRIAMoveId,
        dreamVaultEntryId,
      };
    }),

  invokeMcpAction: t.procedure
    .use(requireRole(['Scribe']))
    .input(
      z.object({
        mcpId: z.string(),
        mcpActionType: z.nativeEnum(Action),
        targetEntityId: z.string().optional(),
        promptText: z.string().optional(),
        userId: z.string(),
        mcpContext: z.nativeEnum(GlyphContext),
        mcpState: z.nativeEnum(State),
        mcpPolarity: z.nativeEnum(Polarity),
        mcpRotation: z.nativeEnum(Rotation),
        mcpModality: z.nativeEnum(Modality).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Middleware is applied.

      // 2. Validate mcpId
      const mcpMetadata = symbolMetadata.find(m => m.character === input.mcpId);
      if (!mcpMetadata) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Invalid mcpId: ${input.mcpId}. Not found in symbolMetadata.`,
        });
      }
      const stubbedActorId = input.mcpId; // Use validated mcpId as actorId

      // 3. MCP Logic (Stubbed - Generate Content)
      let stubbedContent = "";
      if (input.mcpActionType === Action.Write) {
        stubbedContent = `Comment from ${stubbedActorId}: "${input.promptText || 'I have thoughts on ' + (input.targetEntityId || 'this')}"`;
      } else if (input.mcpActionType === Action.React) {
        stubbedContent = `${stubbedActorId} reacts symbolically to ${input.targetEntityId || input.promptText || 'the situation'}.`;
      } else {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Unsupported mcpActionType for stub: ${Action[input.mcpActionType]}`,
        });
      }

      // 4. Log MCP's QDPI Move
      const mcpModality = input.mcpModality ?? Modality.Text;
      const operationDetails = `MCP ${stubbedActorId} performed ${Action[input.mcpActionType]}. Target: ${input.targetEntityId || 'N/A'}. Prompt: "${input.promptText || 'N/A'}".`;
      
      const mcpMoveResult = await ctx.router.logQdpiMove({
        action: input.mcpActionType,
        context: input.mcpContext,
        state: input.mcpState,
        role: Role.AICharacter,
        relation: Relation.S2O, 
        polarity: input.mcpPolarity,
        rotation: input.mcpRotation,
        modality: mcpModality,
        userId: input.userId, // User ID for traceability
        contentPayload: { text: stubbedContent, actorId: stubbedActorId },
        operationDetails: operationDetails,
      });
      const mcpMoveId = mcpMoveResult.moveId;

      // 5. Extract mcpVaultEntryId
      const mcpQdpiMove = await db.select().from(qdpiMoves).where(eq(qdpiMoves.id, mcpMoveId)).get();
      let mcpVaultEntryId = null;
      if (mcpQdpiMove?.operationDetails) {
        const match = mcpQdpiMove.operationDetails.match(/Associated vault_entry_id: (\d+)\./);
        if (match && match[1]) {
          mcpVaultEntryId = parseInt(match[1], 10);
        }
      }

      if (mcpVaultEntryId === null) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to confirm MCP content storage or extract mcpVaultEntryId.',
        });
      }

      // 6. Return Value
      return {
        success: true,
        mcpMoveId,
        mcpVaultEntryId,
      };
    }),
});

export type AppRouter = typeof appRouter;

export const app = new Hono<AppContext>();

app.use('/trpc/*', authMiddleware);
// @ts-expect-error Hono type inference issue (documented upstream)
app.use('/trpc/*', trpcServer({ router: appRouter }));