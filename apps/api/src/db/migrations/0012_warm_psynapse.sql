CREATE TABLE "arc_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"title" text NOT NULL,
	"tagline" text,
	"world_type" text NOT NULL,
	"province" text NOT NULL,
	"narrative_hook" text,
	"cover_image" text,
	"chapters" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"admin_feedback" text,
	"published_arc_id" text,
	"submitted_at" timestamp,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creators" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"slug" text NOT NULL,
	"bio" text,
	"photo" text,
	"province" text,
	"instagram" text,
	"website" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"application_note" text,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	CONSTRAINT "creators_email_unique" UNIQUE("email"),
	CONSTRAINT "creators_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "arcs" ADD COLUMN "creator_id" text;--> statement-breakpoint
ALTER TABLE "arc_submissions" ADD CONSTRAINT "arc_submissions_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;