CREATE TABLE IF NOT EXISTS vault_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id TEXT NOT NULL,
  state TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vault_actor ON vault_entries(actor_id);
CREATE INDEX IF NOT EXISTS idx_vault_created ON vault_entries(created_at);
