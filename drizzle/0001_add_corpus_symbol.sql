ALTER TABLE sections ADD COLUMN corpus_symbol text NOT NULL DEFAULT '';
ALTER TABLE pages ADD COLUMN corpus_symbol text NOT NULL DEFAULT '';
