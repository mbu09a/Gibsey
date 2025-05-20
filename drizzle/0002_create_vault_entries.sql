CREATE TABLE IF NOT EXISTS vault_entries (
  id INTEGER PRIMARY KEY,
  action TEXT NOT NULL,
  context TEXT NOT NULL,
  state TEXT NOT NULL,
  role TEXT NOT NULL,
  relation TEXT NOT NULL,
  polarity TEXT NOT NULL,
  rotation TEXT NOT NULL,
  content TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);