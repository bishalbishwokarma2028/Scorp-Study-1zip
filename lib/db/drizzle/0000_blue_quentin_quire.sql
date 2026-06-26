CREATE TABLE "daily_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"ai_queries" integer DEFAULT 0 NOT NULL,
	"images_generated" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcard_sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"topic" text NOT NULL,
	"cards" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"prompt" text NOT NULL,
	"enhanced_prompt" text,
	"image_url" text NOT NULL,
	"style" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mindmaps" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"topic" text NOT NULL,
	"map_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"topic" text,
	"score" integer NOT NULL,
	"total" integer NOT NULL,
	"percentage" real NOT NULL,
	"difficulty" text,
	"question_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"source_type" text,
	"original_text" text,
	"summary" text NOT NULL,
	"key_points" text[] DEFAULT '{}' NOT NULL,
	"exam_questions" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"original_text" text NOT NULL,
	"translated_text" text NOT NULL,
	"source_language" text,
	"target_language" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
