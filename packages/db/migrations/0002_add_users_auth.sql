-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL UNIQUE,
  `password_hash` text NOT NULL,
  `created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);

-- Add user_id to vault_entries and create foreign key
ALTER TABLE `vault_entries` RENAME TO `vault_entries_old`;

CREATE TABLE `vault_entries` (
  `id` integer PRIMARY KEY,
  `action` text NOT NULL CHECK(action IN ('read', 'write', 'think', 'orchestrate', 'mcp')),
  `context` text NOT NULL CHECK(context IN ('origin', 'reaction', 'musing', 'daemon')),
  `state` text NOT NULL CHECK(state IN ('private', 'limited', 'collective', 'public')),
  `role` text NOT NULL CHECK(role IN ('Human', 'AICharacter', 'Guest', 'MythicGuardian', 'WholeSystem', 'PartSystem')),
  `relation` text NOT NULL CHECK(relation IN ('1to1', 's2o', 'o2s', 's2s')),
  `polarity` text NOT NULL CHECK(polarity IN ('neutral', 'aligned', 'opposed', 'internal')),
  `rotation` text NOT NULL CHECK(rotation IN ('static', 'dynamic', 'oscillating', 'evolving')),
  `content` text NOT NULL,
  `user_id` text NOT NULL,
  `created_at` integer NOT NULL,
  `is_forgotten` integer DEFAULT 0 NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Copy data from old table (set user_id to 'system' for existing entries)
INSERT INTO `vault_entries` 
SELECT id, action, context, state, role, relation, polarity, rotation, content, 
       'system' as user_id, created_at, 0 as is_forgotten
FROM `vault_entries_old`;

DROP TABLE `vault_entries_old`;

-- Add indexes
CREATE INDEX IF NOT EXISTS `idx_vault_entries_user_id` ON `vault_entries`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_vault_entries_created_at` ON `vault_entries`(`created_at`);
CREATE INDEX IF NOT EXISTS `idx_vault_entries_role` ON `vault_entries`(`role`);
CREATE INDEX IF NOT EXISTS `idx_vault_entries_user_created` ON `vault_entries`(`user_id`, `created_at`);

-- Update page_notes to add user foreign key
ALTER TABLE `page_notes` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;

-- Add user_id to qdpi_moves
ALTER TABLE `qdpi_moves` ADD COLUMN `game_id` integer;
ALTER TABLE `qdpi_moves` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL;

-- Add indexes to qdpi_moves
CREATE INDEX IF NOT EXISTS `idx_qdpi_moves_user_id` ON `qdpi_moves`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_qdpi_moves_game_id` ON `qdpi_moves`(`game_id`);
CREATE INDEX IF NOT EXISTS `idx_qdpi_moves_timestamp` ON `qdpi_moves`(`timestamp`);

-- Add indexes to page_notes
CREATE INDEX IF NOT EXISTS `idx_page_notes_page_id` ON `page_notes`(`page_id`);
CREATE INDEX IF NOT EXISTS `idx_page_notes_user_id` ON `page_notes`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_page_notes_created_at` ON `page_notes`(`timestamp`);