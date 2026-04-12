CREATE TABLE "coin_offers" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"label" text NOT NULL,
	"coins_required" integer NOT NULL,
	"discount_percent" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coin_redemptions" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"user_id" text NOT NULL,
	"offer_id" text NOT NULL,
	"coins_spent" integer NOT NULL,
	"discount_percent" integer NOT NULL,
	"confirmation_code" text NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "coin_balance" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "coin_offers" ADD CONSTRAINT "coin_offers_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coin_redemptions" ADD CONSTRAINT "coin_redemptions_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coin_redemptions" ADD CONSTRAINT "coin_redemptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coin_redemptions" ADD CONSTRAINT "coin_redemptions_offer_id_coin_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."coin_offers"("id") ON DELETE restrict ON UPDATE no action;