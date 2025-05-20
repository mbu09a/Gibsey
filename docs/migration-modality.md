# Modality Field Migration

This document explains how to migrate existing data when introducing the new
`modality` column. All stored glyph records and annotation logs are presumed to
be textual unless they already specify a different modality.

## Default Assumption

When the new field is added, any row that lacks explicit modality metadata
should be treated as `Modality.Text`. This mirrors prior behaviour where the
system only handled text content. Records that already have modality information
(such as `image` or `audio`) remain unchanged.

## Backfilling Existing Data

A simple SQL script can populate the new column after the schema change:

```sql
UPDATE glyph_logs SET modality = 'Text' WHERE modality IS NULL;
```

For other tables storing glyphs, run a similar statement. If you use Drizzle
migrations, create a migration file with the `ALTER TABLE` statement and the
`UPDATE` above.

## Automating with a Script

If you prefer a programmatic approach, write a short script that iterates over
existing records and sets the default. Example using Bun + Drizzle:

```ts
import { db } from '../packages/db/src';
import { glyphLogs } from '../packages/db/src/schema';

await db.update(glyphLogs).set({ modality: 'Text' }).where(eq(glyphLogs.modality, null));
```

Run this script once after deploying the migration.
