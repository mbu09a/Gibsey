CREATE TABLE `pages` (
	`id` integer PRIMARY KEY NOT NULL,
	`section` integer NOT NULL,
	`section_name` text NOT NULL,
	`corpus_symbol` text NOT NULL,
	`page_number` integer NOT NULL,
	`global_index` integer NOT NULL,
	`text` text NOT NULL,
	FOREIGN KEY (`section`) REFERENCES `sections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pages_global_index_unique` ON `pages` (`global_index`);--> statement-breakpoint
CREATE TABLE `qdpi_moves` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`numeric_glyph` integer NOT NULL,
	`action` integer NOT NULL,
	`context` integer NOT NULL,
	`state` integer NOT NULL,
	`role` integer NOT NULL,
	`relation` integer NOT NULL,
	`polarity` integer NOT NULL,
	`rotation` integer NOT NULL,
	`modality` integer NOT NULL,
	`user_id` text,
	`operation_details` text
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`id` integer PRIMARY KEY NOT NULL,
	`section_name` text NOT NULL,
	`corpus_symbol` text NOT NULL
);
