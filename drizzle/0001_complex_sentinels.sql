CREATE TABLE `village_contact` (
	`id` text PRIMARY KEY NOT NULL,
	`officeName` text NOT NULL,
	`address` text NOT NULL,
	`openingHours` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`whatsapp` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`mapEmbedUrl` text DEFAULT '' NOT NULL,
	`mapLink` text DEFAULT '' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `info` ADD `imageUrl` text;--> statement-breakpoint
ALTER TABLE `info` ADD `description` text;