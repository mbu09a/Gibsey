import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

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

export const pageRelations = relations(pages, ({ one }) => ({
  section: one(sections, {
    fields: [pages.section],
    references: [sections.id],
  }),
}));
export const vaultEntries = sqliteTable('vault_entries', {
  id: integer('id').primaryKey(),
  messageId: text('message_id').notNull().unique(),
  context: text('context').notNull(),
  fromWorld: text('from_world').notNull(),
  toWorld: text('to_world').notNull(),
  payload: text('payload').notNull(),
  orientation: text('orientation').notNull(),
});
