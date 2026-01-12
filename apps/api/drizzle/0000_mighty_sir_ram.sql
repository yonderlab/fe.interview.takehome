CREATE TABLE `estimate_blocker` (
	`id` text PRIMARY KEY NOT NULL,
	`estimate_id` text NOT NULL,
	`reason` text NOT NULL,
	FOREIGN KEY (`estimate_id`) REFERENCES `event_estimate`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_estimate` (
	`id` text PRIMARY KEY NOT NULL,
	`employer_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`status` text NOT NULL,
	`selections` text NOT NULL,
	`pricing` text NOT NULL,
	`submitted_at` integer,
	`finalised_at` integer,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `event_plan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_plan` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`base_price_cents` integer NOT NULL,
	`currency` text NOT NULL,
	`approval_type` text NOT NULL,
	`min_participants` integer NOT NULL,
	`lead_time_days` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `event_provider`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_provider` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`logo_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plan_addon` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`name` text NOT NULL,
	`price_cents` integer NOT NULL,
	`currency` text NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `event_plan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plan_option_group` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`code` text NOT NULL,
	`description` text,
	`required` integer NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `event_plan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plan_option_value` (
	`id` text PRIMARY KEY NOT NULL,
	`option_group_id` text NOT NULL,
	`value` text NOT NULL,
	`price_cents` integer,
	`currency` text,
	FOREIGN KEY (`option_group_id`) REFERENCES `plan_option_group`(`id`) ON UPDATE no action ON DELETE no action
);
