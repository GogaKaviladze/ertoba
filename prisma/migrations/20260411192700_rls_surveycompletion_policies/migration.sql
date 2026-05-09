-- ============================================================
-- MIGRATION: Row Level Security (RLS) for all tables
-- Issue #64: Prevent users from accessing other users' data
-- Idempotent: safe to run multiple times (DROP IF EXISTS before CREATE)
-- ============================================================

-- SurveyCompletion
ALTER TABLE "SurveyCompletion" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_own_completions ON "SurveyCompletion";
DROP POLICY IF EXISTS insert_own_completions ON "SurveyCompletion";
DROP POLICY IF EXISTS no_update_completions ON "SurveyCompletion";
DROP POLICY IF EXISTS no_delete_completions ON "SurveyCompletion";
CREATE POLICY select_own_completions ON "SurveyCompletion" FOR SELECT USING (auth.uid()::uuid = "userId");
CREATE POLICY insert_own_completions ON "SurveyCompletion" FOR INSERT WITH CHECK (auth.uid()::uuid = "userId");
CREATE POLICY no_update_completions ON "SurveyCompletion" FOR UPDATE USING (FALSE);
CREATE POLICY no_delete_completions ON "SurveyCompletion" FOR DELETE USING (FALSE);

-- Transaction
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_own_transactions ON "Transaction";
DROP POLICY IF EXISTS insert_own_transactions ON "Transaction";
DROP POLICY IF EXISTS no_update_transactions ON "Transaction";
DROP POLICY IF EXISTS no_delete_transactions ON "Transaction";
CREATE POLICY select_own_transactions ON "Transaction" FOR SELECT USING (auth.uid()::uuid = "userId");
CREATE POLICY insert_own_transactions ON "Transaction" FOR INSERT WITH CHECK (auth.uid()::uuid = "userId");
CREATE POLICY no_update_transactions ON "Transaction" FOR UPDATE USING (FALSE);
CREATE POLICY no_delete_transactions ON "Transaction" FOR DELETE USING (FALSE);

-- User
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_own_user ON "User";
DROP POLICY IF EXISTS update_own_user ON "User";
DROP POLICY IF EXISTS no_insert_user ON "User";
DROP POLICY IF EXISTS no_delete_user ON "User";
CREATE POLICY select_own_user ON "User" FOR SELECT USING (auth.uid()::uuid = "id");
CREATE POLICY update_own_user ON "User" FOR UPDATE USING (auth.uid()::uuid = "id") WITH CHECK (auth.uid()::uuid = "id");
CREATE POLICY no_insert_user ON "User" FOR INSERT WITH CHECK (FALSE);
CREATE POLICY no_delete_user ON "User" FOR DELETE USING (FALSE);

-- RewardItem (public catalog)
ALTER TABLE "RewardItem" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_all_rewards ON "RewardItem";
CREATE POLICY select_all_rewards ON "RewardItem" FOR SELECT USING (TRUE);

-- Assessment (public catalog)
ALTER TABLE "Assessment" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_all_assessments ON "Assessment";
CREATE POLICY select_all_assessments ON "Assessment" FOR SELECT USING (TRUE);

-- PropagandaArticle (public analytics)
ALTER TABLE "PropagandaArticle" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_all_articles ON "PropagandaArticle";
CREATE POLICY select_all_articles ON "PropagandaArticle" FOR SELECT USING (TRUE);

-- DailyPulse (public analytics)
ALTER TABLE "DailyPulse" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_all_pulse ON "DailyPulse";
CREATE POLICY select_all_pulse ON "DailyPulse" FOR SELECT USING (TRUE);
