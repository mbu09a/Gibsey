import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { appRouter } from '../../../apps/api/src/router';
import {
  Action,
  Context as GlyphContext,
  State,
  Role,
  Relation,
  Polarity,
  Rotation,
  Modality,
  encodeGlyphNumeric,
  Glyph,
} from '../../../packages/utils/glyphCodec';
import type { LogQdpiMoveInputType } from '../../../packages/qdpi';
import type { RoleType } from '../../../packages/types/roles'; // Import RoleType

// Mock the db instance from router.ts
const mockDbClient = {
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn(),
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  all: vi.fn(), // For direct execution if needed by some Drizzle paths
  get: vi.fn(), // For direct execution if needed by some Drizzle paths
};

vi.mock('../../../apps/api/src/router', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../../apps/api/src/router')>();
  return {
    ...original,
    db: mockDbClient, // Mock the db object
  };
});


// Helper to reset mocks and in-memory store
let qdpiMovesStore: any[] = [];
let nextId = 1;

beforeEach(() => {
  vi.clearAllMocks(); // Clears mock call history etc.

  qdpiMovesStore = [];
  nextId = 1;

  // Mock implementations
  mockDbClient.insert.mockImplementation(() => mockDbClient);
  mockDbClient.values.mockImplementation((dataToInsert: any) => {
    const newId = nextId++;
    const timestamp = new Date(); // Simulate default timestamp
    const newMove = { id: newId, timestamp, ...dataToInsert };
    qdpiMovesStore.push(newMove);
    // Ensure `returning` gets the id for procedures that expect it
    mockDbClient.returning.mockReturnValueOnce([{ insertedId: newId, id: newId }]);
    return mockDbClient;
  });
  mockDbClient.returning.mockImplementation((fields) => {
     // Default behavior if not the specific logQdpiMove case above
    if (qdpiMovesStore.length > 0) {
      const lastItem = qdpiMovesStore[qdpiMovesStore.length - 1];
      if (fields && fields.insertedId) return [{ insertedId: lastItem.id }];
      return [lastItem];
    }
    return [];
  });

  mockDbClient.select.mockImplementation(() => mockDbClient);
  mockDbClient.from.mockImplementation(()_table => mockDbClient);
  mockDbClient.orderBy.mockImplementation(() => mockDbClient);
  mockDbClient.limit.mockImplementation((_limitArg: number) => mockDbClient);
  mockDbClient.offset.mockImplementation((_offsetArg: number) => mockDbClient);

  // .where needs to actually filter the in-memory store for subsequent chained calls
  mockDbClient.where.mockImplementation((condition: any) => {
    // This is a simplified mock. A real Drizzle `eq` or `and` condition is an object.
    // We'll simulate based on common patterns found in the procedures.
    let filtered = [...qdpiMovesStore];
    if (condition && condition.lhs && condition.rhs) { // Simple eq(column, value)
        const field = condition.lhs.name;
        const value = condition.rhs.value;
        filtered = qdpiMovesStore.filter(move => move[field] === value);
    } else if (condition && condition.expressions) { // and(...)
        // Rudimentary 'and' support - assumes all are eq conditions
        filtered = qdpiMovesStore.filter(move => {
            return condition.expressions.every((exp: any) => {
                if (exp.lhs && exp.rhs) {
                    const field = exp.lhs.name;
                    const value = exp.rhs.value;
                    return move[field] === value;
                }
                return true;
            });
        });
    }
    // The actual query execution in Drizzle happens at the end (e.g. .all(), .get(), or when awaited)
    // We'll make `where` return a promise-like object that resolves to the filtered data
    // or make other chained methods like orderBy, limit, offset operate on this filtered data.
    // For simplicity here, let's assume the final call (e.g. .get(), .all() or await) will use this filtered data.
    // We will make the `then` part of awaitable query use this.
    // This requires a more complex chaining simulation than initially set up.
    // For now, the tests will directly manipulate qdpiMovesStore or assert based on mock calls.
    // A more robust mock would involve passing the current query state through the chain.

    // For getQdpiMoveById (expects single or null)
    mockDbClient.get.mockReturnValueOnce(filtered[0] || null);
    // For getQdpiMovesByNumericGlyph and getQdpiMoves (expects array)
    mockDbClient.all.mockReturnValueOnce(filtered); // Drizzle typically uses .all() or just awaits the chain

    // When the query is awaited directly (most common in the router)
    // it should resolve to the filtered data.
    // We'll sort here for orderBy as it's the last step before returning data.
    const then = (callback: (result: any) => void) => {
        // Simulate Drizzle's internal ordering, limiting, offsetting
        let result = [...filtered]; // Use the currently filtered data

        // Simulate orderBy (desc(qdpiMoves.timestamp))
        result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        // Simulate offset and limit if they were called
        // This part is tricky because limit/offset args are not stored directly on mockDbClient in this simple mock
        // For the purpose of these tests, we'll assume they are applied correctly by Drizzle
        // and the tests will verify the *final* returned data based on input args to procedures.

        return callback(result);
    };
    return { ...mockDbClient, then, get: () => filtered[0] || null, all: () => filtered };
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Create tRPC caller
const caller = appRouter.createCaller({ user: null, db: mockDbClient as any } as any);
const userCaller = appRouter.createCaller({ user: { id: 'testUser123' }, db: mockDbClient as any } as any);

// Helper function to create a caller with a specific role
const createCallerWithRole = (role: RoleType | null | undefined) => {
  return appRouter.createCaller({
    user: role ? { id: `test-user-${role || 'anon'}`, role: role } : null,
    db: mockDbClient as any, // Pass the mock DB client in the context
  } as any);
};


describe('QDPI tRPC Procedures', () => {
  describe('logQdpiMove', () => {
    // Existing tests for logQdpiMove can remain here or be moved/adjusted as needed.
    // For this task, we are adding a new describe block for permissions.
    it('correctly inserts a record and calculates numericGlyph (when permissions allow)', async () => {
      // This test now implicitly tests the default caller (null role) if it were to pass.
      // However, with new permissions, a null role likely won't pass most actions.
      // We'll use a permissive role for this specific functionality test.
      const permissiveCaller = createCallerWithRole('MythicGuardian'); // MythicGuardian can do most things
      const input: LogQdpiMoveInputType = {
        action: Action.Link,
        context: GlyphContext.Page,
        state: State.Public,
        role: Role.Guest,
        relation: Relation.S2O,
        polarity: Polarity.Internal,
        rotation: Rotation.E,
        modality: Modality.Video,
        userId: 'user1',
        operationDetails: 'Linked page A to B',
      };
      const expectedGlyph: Glyph = { ...input, modality: input.modality ?? Modality.Text };
      const expectedNumericGlyph = encodeGlyphNumeric(expectedGlyph);

      const result = await permissiveCaller.logQdpiMove(input);

      expect(mockDbClient.insert).toHaveBeenCalled(); // Changed from toHaveBeenCalledTimes(1) due to multiple tests
      expect(mockDbClient.values).toHaveBeenCalledWith(
        expect.objectContaining({
          numericGlyph: expectedNumericGlyph,
          action: input.action,
          context: input.context,
          state: input.state,
          role: input.role,
          relation: input.relation,
          polarity: input.polarity,
          rotation: input.rotation,
          modality: input.modality,
          userId: input.userId,
          operationDetails: input.operationDetails,
        })
      );
      expect(mockDbClient.returning).toHaveBeenCalledWith({ insertedId: expect.any(Number) });
      expect(result.success).toBe(true);
      expect(result.moveId).toEqual(expect.any(Number)); // nextId = 1 at start
    });

    it('defaults modality to Modality.Text when omitted', async () => {
      const input = {
        action: Action.Read,
        context: GlyphContext.Prompt,
        state: State.Private,
        role: Role.Human,
        relation: Relation.O2S,
        polarity: Polarity.External,
        rotation: Rotation.S,
        // modality omitted
        userId: 'user2',
      };
      const expectedGlyph: Glyph = { ...input, modality: Modality.Text };
      const expectedNumericGlyph = encodeGlyphNumeric(expectedGlyph);
      const permissiveCaller = createCallerWithRole('MythicGuardian');

      await permissiveCaller.logQdpiMove(input);

      expect(mockDbClient.values).toHaveBeenCalledWith(
        expect.objectContaining({
          numericGlyph: expectedNumericGlyph,
          modality: Modality.Text,
        })
      );
    });
  });

  describe('getQdpiMoveById', () => {
    it('retrieves a move by its ID', async () => {
      const moveInput: LogQdpiMoveInputType = {
        action: Action.Write,
        context: GlyphContext.Reaction,
        state: State.Gift,
        role: Role.AICharacter,
        relation: Relation.S2O,
        polarity: Polarity.Internal,
        rotation: Rotation.N,
        modality: Modality.AR,
      };
      // Log a move first (simulates it being in the DB)
      const loggedMove = { id: nextId, timestamp: new Date(), ...moveInput, numericGlyph: encodeGlyphNumeric(moveInput as Glyph) };
      qdpiMovesStore.push(loggedMove);
      nextId++;


      mockDbClient.where.mockImplementation((condition: any) => {
        const field = condition.lhs.name;
        const value = condition.rhs.value;
        const found = qdpiMovesStore.find(m => m[field] === value);
        // Simulate Drizzle's .get() behavior for findOne-type queries
        return { 
          then: (callback: (result: any) => void) => callback(found || null) 
        };
      });
      
      const result = await caller.getQdpiMoveById({ id: loggedMove.id });

      expect(mockDbClient.select).toHaveBeenCalled();
      expect(mockDbClient.from).toHaveBeenCalled();
      expect(mockDbClient.where).toHaveBeenCalledWith(expect.objectContaining({
        lhs: expect.objectContaining({ name: "id" }),
        rhs: expect.objectContaining({ value: loggedMove.id })
      }));
      expect(result).toEqual(expect.objectContaining(loggedMove));
    });

    it('returns null for a non-existent ID', async () => {
       mockDbClient.where.mockImplementation((condition: any) => {
        const field = condition.lhs.name;
        const value = condition.rhs.value;
        const found = qdpiMovesStore.find(m => m[field] === value);
         return { 
          then: (callback: (result: any) => void) => callback(found || null) 
        };
      });
      const result = await caller.getQdpiMoveById({ id: 999 });
      expect(result).toBeNull();
    });
  });

  describe('getQdpiMovesByNumericGlyph', () => {
    it('retrieves moves by numericGlyph, ordered by timestamp descending', async () => {
      const targetNumericGlyph = 12345;
      const otherNumericGlyph = 67890;

      const move1Raw = { numericGlyph: targetNumericGlyph, timestamp: new Date(Date.now() - 2000), action: Action.Read, role: Role.Human };
      const move2Raw = { numericGlyph: otherNumericGlyph, timestamp: new Date(Date.now() - 1500), action: Action.Write, role: Role.AICharacter };
      const move3Raw = { numericGlyph: targetNumericGlyph, timestamp: new Date(Date.now() - 1000), action: Action.Link, role: Role.Guest }; // newer
      const move4Raw = { numericGlyph: targetNumericGlyph, timestamp: new Date(Date.now() - 3000), action: Action.Dream, role: Role.MythicGuardian }; // older
      
      // Simulate logging these moves to populate IDs correctly
      const loggedMoves = [];
      for (const moveData of [move1Raw, move2Raw, move3Raw, move4Raw]) {
        const newId = nextId++;
        const newMove = { id: newId, ...moveData };
        qdpiMovesStore.push(newMove);
        loggedMoves.push(newMove);
      }
      const [move1, , move3, move4] = loggedMoves;


      mockDbClient.where.mockImplementation((condition: any) => {
        const field = condition.lhs.name;
        const value = condition.rhs.value;
        let filtered = qdpiMovesStore.filter(m => m[field] === value);
        
        const chain = {
          orderBy: vi.fn().mockImplementation(() => {
            filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            return chain;
          }),
          then: (callback: (result: any) => void) => callback(filtered)
        };
        return chain;
      });

      const result = await caller.getQdpiMovesByNumericGlyph({ numericGlyph: targetNumericGlyph });
      
      expect(mockDbClient.select).toHaveBeenCalled();
      expect(mockDbClient.from).toHaveBeenCalled();
      expect(mockDbClient.where).toHaveBeenCalledWith(expect.objectContaining({
         lhs: expect.objectContaining({ name: "numericGlyph" }),
         rhs: expect.objectContaining({ value: targetNumericGlyph })
      }));
      expect(mockDbClient.orderBy).toHaveBeenCalled();
      expect(result.length).toBe(3);
      expect(result[0].id).toBe(move3.id); // newest
      expect(result[1].id).toBe(move1.id);
      expect(result[2].id).toBe(move4.id); // oldest
      expect(result.every(m => m.numericGlyph === targetNumericGlyph)).toBe(true);
    });
  });

  describe('getQdpiMoves (Generic Filter)', () => {
    const commonGlyphPart = {
        context: GlyphContext.Page,
        state: State.Public,
        relation: Relation.S2O,
        polarity: Polarity.External,
        rotation: Rotation.N,
        modality: Modality.Text,
    };
    const baseTimestamp = 1700000000000; // A fixed point in time for predictable tests
    const commonGlyphPart = {
        context: GlyphContext.Page,
        state: State.Public,
        relation: Relation.S2O,
        polarity: Polarity.External,
        rotation: Rotation.N,
        modality: Modality.Text,
    };
    const movesForFiltering = [
        { id: 1, ...commonGlyphPart, action: Action.Read, role: Role.Human, userId: 'userA', timestamp: new Date(baseTimestamp) }, // 1700000000000
        { id: 2, ...commonGlyphPart, action: Action.Write, role: Role.AICharacter, userId: 'userB', timestamp: new Date(baseTimestamp + 10000) }, // 1700000010000
        { id: 3, ...commonGlyphPart, action: Action.Read, role: Role.Guest, userId: 'userA', timestamp: new Date(baseTimestamp + 20000) }, // 1700000020000
        { id: 4, ...commonGlyphPart, action: Action.Link, role: Role.Human, userId: 'userC', timestamp: new Date(baseTimestamp + 30000) }, // 1700000030000
        { id: 5, ...commonGlyphPart, action: Action.Write, role: Role.Human, userId: 'userB', timestamp: new Date(baseTimestamp + 40000) }, // 1700000040000
        { id: 6, ...commonGlyphPart, action: Action.Read, role: Role.AICharacter, userId: 'userA', timestamp: new Date(baseTimestamp + 50000) }, // 1700000050000
    ];
    // Add numericGlyph to each
    movesForFiltering.forEach(m => (m as any).numericGlyph = encodeGlyphNumeric(m as any));


    beforeEach(() => {
        // Deep copy and restore Date objects, ensuring timestamps are numbers for filtering logic in mock
        qdpiMovesStore = JSON.parse(JSON.stringify(movesForFiltering)).map(m => ({...m, timestamp: new Date(m.timestamp)}));
        nextId = qdpiMovesStore.length + 1;

        // More flexible mock for .where that can be chained for .orderBy, .limit, .offset
        mockDbClient.where.mockImplementation((condition: any) => {
            let currentResults = [...qdpiMovesStore];
            if (condition && condition.expressions) { // and(...)
                 currentResults = qdpiMovesStore.filter(move => {
                    return condition.expressions.every((exp: any) => {
                        if (exp.lhs && exp.rhs && exp.operator) { // For gte/lte/eq
                            const field = exp.lhs.name;
                            const value = exp.rhs.value;
                            const moveValue = field === 'timestamp' ? new Date(move[field]).getTime() : move[field];
                            const filterValue = field === 'timestamp' ? new Date(value).getTime() : value;

                            if (exp.operator === 'gte') return moveValue >= filterValue;
                            if (exp.operator === 'lte') return moveValue <= filterValue;
                            if (exp.operator === 'eq') return moveValue === filterValue;
                        }
                        return true;
                    });
                });
            } else if (condition && condition.lhs && condition.rhs && condition.operator) { // single eq/gte/lte
                const field = condition.lhs.name;
                const value = condition.rhs.value;
                const moveValue = field === 'timestamp' ? new Date(move[field]).getTime() : move[field];
                const filterValue = field === 'timestamp' ? new Date(value).getTime() : value;

                if (condition.operator === 'gte') currentResults = qdpiMovesStore.filter(move => (new Date(move[field]).getTime()) >= filterValue);
                else if (condition.operator === 'lte') currentResults = qdpiMovesStore.filter(move => (new Date(move[field]).getTime()) <= filterValue);
                else if (condition.operator === 'eq') currentResults = qdpiMovesStore.filter(move => move[field] === filterValue);

            } else if (condition === undefined) { // No where clause
                // currentResults remains all qdpiMovesStore
            }


            // Simulate Drizzle's chaining and final execution
            const chain = {
                orderBy: vi.fn().mockImplementation(() => {
                    currentResults.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
                    return chain;
                }),
                limit: vi.fn().mockImplementation((l: number) => {
                    // This is applied after offset in Drizzle, but order of execution matters.
                    // For now, assume orderBy is called first.
                    // We'll store them and apply at the end.
                    (chain as any)._limit = l;
                    return chain;
                }),
                offset: vi.fn().mockImplementation((o: number) => {
                    (chain as any)._offset = o;
                    return chain;
                }),
                // This makes the chain awaitable
                then: (resolve: (value: any[] | PromiseLike<any[]>) => void) => {
                    let finalResults = [...currentResults];
                    // Apply order (always timestamp desc in router)
                    finalResults.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                    
                    const offsetVal = (chain as any)._offset || 0;
                    const limitVal = (chain as any)._limit; // Can be undefined

                    if (offsetVal > 0) {
                        finalResults = finalResults.slice(offsetVal);
                    }
                    if (limitVal !== undefined) {
                        finalResults = finalResults.slice(0, limitVal);
                    }
                    resolve(finalResults);
                }
            };
            return chain;
        });
    });

    it('filters by a single axis (action: Read)', async () => {
      const result = await caller.getQdpiMoves({ filter: { action: Action.Read } });
      expect(result.length).toBe(3);
      expect(result.every(m => m.action === Action.Read)).toBe(true);
    });

    it('filters by another single axis (role: AICharacter)', async () => {
      const result = await caller.getQdpiMoves({ filter: { role: Role.AICharacter } });
      expect(result.length).toBe(2);
      expect(result.every(m => m.role === Role.AICharacter)).toBe(true);
    });

    it('filters by userId', async () => {
      const result = await caller.getQdpiMoves({ filter: { userId: 'userA' } });
      expect(result.length).toBe(3);
      expect(result.every(m => m.userId === 'userA')).toBe(true);
    });

    it('filters by a combination of two axes (action: Write, role: Human)', async () => {
      const result = await caller.getQdpiMoves({ filter: { action: Action.Write, role: Role.Human } });
      expect(result.length).toBe(1);
      expect(result[0].action).toBe(Action.Write);
      expect(result[0].role).toBe(Role.Human);
      expect(result[0].id).toBe(5);
    });

    it('handles pagination (limit and offset)', async () => {
      // Total 6 moves, ordered by time desc (ids: 6, 5, 4, 3, 2, 1)
      const resultLimit2 = await caller.getQdpiMoves({ limit: 2 });
      expect(resultLimit2.length).toBe(2);
      expect(resultLimit2[0].id).toBe(6); // newest
      expect(resultLimit2[1].id).toBe(5);

      const resultLimitOffset = await caller.getQdpiMoves({ limit: 2, offset: 1 });
      expect(resultLimitOffset.length).toBe(2);
      expect(resultLimitOffset[0].id).toBe(5); // Skip 6
      expect(resultLimitOffset[1].id).toBe(4);
    });
    
    it('returns all (respecting default limit) with no filter, ordered by timestamp desc', async () => {
        // Default limit is 50. We have 6 moves.
        const result = await caller.getQdpiMoves({}); // Or .getQdpiMoves({ filter: undefined })
        expect(result.length).toBe(6); // All moves since less than default limit
        expect(result[0].id).toBe(6); // newest due to default ordering
        expect(result[5].id).toBe(1); // oldest
    });

    it('returns empty array with a filter that matches no moves', async () => {
      const result = await caller.getQdpiMoves({ filter: { action: Action.Dream } }); // No Dream actions logged
      expect(result.length).toBe(0);
    });

    // Date filter tests
    it('filters by startDate only', async () => {
      // startDate: baseTimestamp + 25000 (exclusive for items before, inclusive for items after)
      // Should return moves with id 4, 5, 6 (timestamps base + 30k, 40k, 50k)
      const result = await caller.getQdpiMoves({ filter: { startDate: baseTimestamp + 25000 } });
      expect(result.map(r => r.id).sort()).toEqual([4, 5, 6]);
      expect(result.length).toBe(3);
    });

    it('filters by endDate only', async () => {
      // endDate: baseTimestamp + 25000 (inclusive for items before, exclusive for items after)
      // Should return moves with id 1, 2, 3 (timestamps base + 0, 10k, 20k)
      const result = await caller.getQdpiMoves({ filter: { endDate: baseTimestamp + 25000 } });
      expect(result.map(r => r.id).sort()).toEqual([1, 2, 3]);
      expect(result.length).toBe(3);
    });

    it('filters by both startDate and endDate', async () => {
      // Range: [baseTimestamp + 10000, baseTimestamp + 30000]
      // Should return moves with id 2, 3, 4
      const result = await caller.getQdpiMoves({
        filter: { startDate: baseTimestamp + 10000, endDate: baseTimestamp + 30000 },
      });
      expect(result.map(r => r.id).sort()).toEqual([2, 3, 4]);
      expect(result.length).toBe(3);
    });
    
    it('filters by a very specific startDate and endDate matching one item', async () => {
      // Range: [baseTimestamp + 10000, baseTimestamp + 10000]
      // Should return move with id 2
      const result = await caller.getQdpiMoves({
        filter: { startDate: baseTimestamp + 10000, endDate: baseTimestamp + 10000 },
      });
      expect(result.map(r => r.id).sort()).toEqual([2]);
      expect(result.length).toBe(1);
    });

    it('returns empty array with a date range that matches no moves', async () => {
      const result = await caller.getQdpiMoves({
        filter: { startDate: baseTimestamp + 60000, endDate: baseTimestamp + 70000 },
      });
      expect(result.length).toBe(0);
    });
    
    it('combines date filters with other filters (e.g., action)', async () => {
      // Action.Read within range [baseTimestamp, baseTimestamp + 20000]
      // Moves with Action.Read: id 1 (ts 0), 3 (ts 20k), 6 (ts 50k)
      // Expected: id 1, 3
      const result = await caller.getQdpiMoves({
        filter: {
          action: Action.Read,
          startDate: baseTimestamp,
          endDate: baseTimestamp + 20000,
        },
      });
      expect(result.map(r => r.id).sort()).toEqual([1, 3]);
      expect(result.length).toBe(2);
      expect(result.every(m => m.action === Action.Read)).toBe(true);
    });

    it('combines date filters with userId filter', async () => {
      // userId: 'userA' within range [baseTimestamp + 25000, baseTimestamp + 50000]
      // Moves for userA: id 1 (ts 0), 3 (ts 20k), 6 (ts 50k)
      // Expected: id 6
       const result = await caller.getQdpiMoves({
        filter: {
          userId: 'userA',
          startDate: baseTimestamp + 25000, // includes 30k, 40k, 50k
          endDate: baseTimestamp + 50000,   // includes 0, 10k, 20k, 30k, 40k, 50k
        },
      });
      expect(result.map(r => r.id).sort()).toEqual([6]);
      expect(result.length).toBe(1);
      expect(result.every(m => m.userId === 'userA')).toBe(true);
    });
  });

  describe('Permissions for logQdpiMove', () => {
    const baseInput: Omit<LogQdpiMoveInputType, 'action' | 'role'> = {
      context: GlyphContext.Page,
      state: State.Public,
      relation: Relation.S2O,
      polarity: Polarity.External,
      rotation: Rotation.N,
      modality: Modality.Text,
      userId: 'perm-test-user',
    };

    it('Guest attempts Action.Write (FORBIDDEN)', async () => {
      const guestCaller = createCallerWithRole('Guest');
      const input: LogQdpiMoveInputType = {
        ...baseInput,
        action: Action.Write,
        role: Role.Guest, // Role in payload, distinct from caller's role for context
      };
      await expect(guestCaller.logQdpiMove(input)).rejects.toThrowError(/FORBIDDEN/);
      await expect(guestCaller.logQdpiMove(input)).rejects.toThrowError(
        "Your role ('Guest') does not have the required capability ('draft') to perform the action 'Write'."
      );
    });

    it('Guest attempts Action.React (SUCCESS)', async () => {
      const guestCaller = createCallerWithRole('Guest');
      const input: LogQdpiMoveInputType = {
        ...baseInput,
        action: Action.React,
        role: Role.Guest,
      };
      await guestCaller.logQdpiMove(input);
      expect(mockDbClient.values).toHaveBeenCalled();
    });

    it('Human attempts Action.Merge (FORBIDDEN)', async () => {
      const humanCaller = createCallerWithRole('Human');
      const input: LogQdpiMoveInputType = {
        ...baseInput,
        action: Action.Merge,
        role: Role.Human,
      };
      await expect(humanCaller.logQdpiMove(input)).rejects.toThrowError(/FORBIDDEN/);
      await expect(humanCaller.logQdpiMove(input)).rejects.toThrowError(
         "Your role ('Human') does not have the required capability ('approve') to perform the action 'Merge'."
      );
    });

    it('Human attempts Action.Write (SUCCESS)', async () => {
      const humanCaller = createCallerWithRole('Human');
      const input: LogQdpiMoveInputType = {
        ...baseInput,
        action: Action.Write,
        role: Role.Human,
      };
      await humanCaller.logQdpiMove(input);
      expect(mockDbClient.values).toHaveBeenCalled();
    });
    
    it('MythicGuardian attempts Action.Merge (SUCCESS)', async () => {
      const mgCaller = createCallerWithRole('MythicGuardian');
      const input: LogQdpiMoveInputType = {
        ...baseInput,
        action: Action.Merge,
        role: Role.MythicGuardian,
      };
      await mgCaller.logQdpiMove(input);
      expect(mockDbClient.values).toHaveBeenCalled();
    });

    it('MythicGuardian attempts Action.Forget (SUCCESS)', async () => {
      const mgCaller = createCallerWithRole('MythicGuardian');
      const input: LogQdpiMoveInputType = {
        ...baseInput,
        action: Action.Forget,
        role: Role.MythicGuardian,
      };
      await mgCaller.logQdpiMove(input);
      expect(mockDbClient.values).toHaveBeenCalled();
    });
    
    it('Invalid role string attempts Action.Read (UNAUTHORIZED)', async () => {
      const invalidRoleCaller = createCallerWithRole('NonExistentRole' as RoleType);
      const input: LogQdpiMoveInputType = {
        ...baseInput,
        action: Action.Read,
        role: Role.Human, // Role in payload doesn't matter here, caller context is key
      };
      await expect(invalidRoleCaller.logQdpiMove(input)).rejects.toThrowError(/UNAUTHORIZED/);
      await expect(invalidRoleCaller.logQdpiMove(input)).rejects.toThrowError(
        'User role is invalid or not found.'
      );
    });

    it('Null role (user not authenticated) attempts Action.Read (UNAUTHORIZED)', async () => {
      const nullRoleCaller = createCallerWithRole(null);
      const input: LogQdpiMoveInputType = {
        ...baseInput,
        action: Action.Read,
        role: Role.Guest, // Role in payload doesn't matter
      };
      await expect(nullRoleCaller.logQdpiMove(input)).rejects.toThrowError(/UNAUTHORIZED/);
       await expect(nullRoleCaller.logQdpiMove(input)).rejects.toThrowError(
        'User role is invalid or not found.'
      );
    });
  });
});
