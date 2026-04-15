-- Enable RLS on all SerendiGO public tables (Supabase Advisor: rls_disabled_in_public,
-- sensitive_columns_exposed). Data access stays via Bun API + DATABASE_URL (Postgres role
-- bypasses RLS). PostgREST with anon key can no longer read/write these tables unless you
-- add explicit policies for anon/authenticated later.

ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "arcs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chapters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "captures" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "districts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "provinces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_arcs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "badges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_badges" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "capture_likes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "partners" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chapter_featured_partners" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "flash_deals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "partner_reviews" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "coin_offers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coin_redemptions" ENABLE ROW LEVEL SECURITY;
