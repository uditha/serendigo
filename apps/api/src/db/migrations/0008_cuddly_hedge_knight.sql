CREATE TABLE "chapter_featured_partners" (
	"chapter_id" text NOT NULL,
	"partner_id" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "chapter_featured_partners_chapter_id_partner_id_pk" PRIMARY KEY("chapter_id","partner_id")
);
--> statement-breakpoint
CREATE TABLE "flash_deals" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"discount_text" text NOT NULL,
	"claim_code" text NOT NULL,
	"starts_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL,
	"radius_meters" integer DEFAULT 1500 NOT NULL,
	"min_coins" integer DEFAULT 200 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"body" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "one_review_per_user" UNIQUE("partner_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"tagline" text NOT NULL,
	"description" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"address" text,
	"district" text,
	"province" text NOT NULL,
	"phone" text,
	"whatsapp" text,
	"website" text,
	"tier" text DEFAULT 'listed' NOT NULL,
	"photos" text[] DEFAULT '{}' NOT NULL,
	"opening_hours" jsonb,
	"price_min" integer,
	"price_max" integer,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chapter_featured_partners" ADD CONSTRAINT "chapter_featured_partners_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapter_featured_partners" ADD CONSTRAINT "chapter_featured_partners_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flash_deals" ADD CONSTRAINT "flash_deals_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_reviews" ADD CONSTRAINT "partner_reviews_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_reviews" ADD CONSTRAINT "partner_reviews_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;