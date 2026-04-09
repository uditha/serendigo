CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"name" text,
	"profile_image" text,
	"traveller_character" text,
	"taste_xp" integer DEFAULT 0 NOT NULL,
	"wild_xp" integer DEFAULT 0 NOT NULL,
	"move_xp" integer DEFAULT 0 NOT NULL,
	"roots_xp" integer DEFAULT 0 NOT NULL,
	"restore_xp" integer DEFAULT 0 NOT NULL,
	"serendipity_coins" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"google_id" text,
	"apple_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "arcs" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"world_type" text NOT NULL,
	"province" text NOT NULL,
	"narrator_name" text,
	"intro_text" text,
	"cover_image" text,
	"season_start" integer,
	"season_end" integer,
	"is_seasonal" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"author_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "arcs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" text PRIMARY KEY NOT NULL,
	"arc_id" text NOT NULL,
	"order" integer NOT NULL,
	"title" text NOT NULL,
	"lore_text" text,
	"before_you_go" jsonb,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"radius_meters" integer DEFAULT 200 NOT NULL,
	"coin_reward" integer DEFAULT 50 NOT NULL,
	"xp_category" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "captures" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"chapter_id" text NOT NULL,
	"photo_url" text NOT NULL,
	"note" text,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"coins_earned" integer NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"captured_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provinces" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"stamp_design_key" text,
	"fill_color" text,
	CONSTRAINT "provinces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "districts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"province" text NOT NULL,
	CONSTRAINT "districts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_arcs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"arc_id" text NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "user_arc_unique" UNIQUE("user_id","arc_id")
);
--> statement-breakpoint
ALTER TABLE "arcs" ADD CONSTRAINT "arcs_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_arc_id_arcs_id_fk" FOREIGN KEY ("arc_id") REFERENCES "public"."arcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "captures" ADD CONSTRAINT "captures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "captures" ADD CONSTRAINT "captures_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_arcs" ADD CONSTRAINT "user_arcs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_arcs" ADD CONSTRAINT "user_arcs_arc_id_arcs_id_fk" FOREIGN KEY ("arc_id") REFERENCES "public"."arcs"("id") ON DELETE cascade ON UPDATE no action;