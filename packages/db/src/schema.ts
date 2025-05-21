import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

export const sections = sqliteTable('sections', {
  id: integer('id').primaryKey(),
  sectionName: text('section_name').notNull(),
  corpusSymbol: text('corpus_symbol').notNull(),
});

export const pages = sqliteTable('pages', {
  id: integer('id').primaryKey(),
  section: integer('section').references(() => sections.id).notNull(),
  sectionName: text('section_name').notNull(),
  corpusSymbol: text('corpus_symbol').notNull(),
  pageNumber: integer('page_number').notNull(),
  globalIndex: integer('global_index').notNull().unique(),
  text: text('text').notNull(),
});

export const sectionRelations = relations(sections, ({ many }) => ({
  pages: many(pages),
}));

// Original pageRelations is removed here, and redefined later with notes.

export const qdpiMoves = sqliteTable('qdpi_moves', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp', { mode: 'timestamp_ms' }).notNull().default(sql`(strftime('%s', 'now') * 1000)`),
  numericGlyph: integer('numeric_glyph').notNull(),
  action: integer('action').notNull(),
  context: integer('context').notNull(),
  state: integer('state').notNull(),
  role: integer('role').notNull(),
  relation: integer('relation').notNull(),
  polarity: integer('polarity').notNull(),
  rotation: integer('rotation').notNull(),
  modality: integer('modality').notNull(),
  userId: text('user_id'),
  operationDetails: text('operation_details'),
});

export const pageNotes = sqliteTable('page_notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pageId: integer('page_id').references(() => pages.id).notNull(),
  userId: text('user_id'),
  noteText: text('note_text').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp_ms' }).notNull().default(sql`(strftime('%s', 'now') * 1000)`),
});

export const pageNotesRelations = relations(pageNotes, ({ one }) => ({
  page: one(pages, {
    fields: [pageNotes.pageId],
    references: [pages.id],
  }),
}));

// Also update pageRelations to include notes
// Remove the old pageRelations definition - it's being redefined below with notes
// export const pageRelations = relations(pages, ({ one }) => ({
//   section: one(sections, {
//     fields: [pages.section],
//     references: [sections.id],
//   }),
// }));

export const pageRelations = relations(pages, ({ one, many }) => ({
  section: one(sections, {
    fields: [pages.section],
    references: [sections.id],
  }),
  notes: many(pageNotes),
}));