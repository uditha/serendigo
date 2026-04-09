ALTER TABLE "arcs" DROP CONSTRAINT IF EXISTS "arcs_author_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "captures" DROP CONSTRAINT IF EXISTS "captures_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_arcs" DROP CONSTRAINT IF EXISTS "user_arcs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "arcs" DROP CONSTRAINT IF EXISTS "arcs_author_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "captures" DROP CONSTRAINT IF EXISTS "captures_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_arcs" DROP CONSTRAINT IF EXISTS "user_arcs_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "arcs" ADD CONSTRAINT "arcs_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "captures" ADD CONSTRAINT "captures_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_arcs" ADD CONSTRAINT "user_arcs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
