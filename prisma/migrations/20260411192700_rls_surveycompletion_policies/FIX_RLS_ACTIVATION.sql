-- ============================================================
-- RLS ACTIVATION FIX
-- Run this in Supabase SQL Editor if RLS is NOT enabled
-- ============================================================

-- Step 1: Enable RLS on all tables
ALTER TABLE "SurveyCompletion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RewardItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Assessment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PropagandaArticle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DailyPulse" ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist (ignore errors)
DROP POLICY IF EXISTS select_own_completions ON "SurveyCompletion";
DROP POLICY IF EXISTS insert_own_completions ON "SurveyCompletion";
DROP POLICY IF EXISTS no_update_completions ON "SurveyCompletion";
DROP POLICY IF EXISTS no_delete_completions ON "SurveyCompletion";

DROP POLICY IF EXISTS select_own_transactions ON "Transaction";
DROP POLICY IF EXISTS insert_own_transactions ON "Transaction";
DROP POLICY IF EXISTS no_update_transactions ON "Transaction";
DROP POLICY IF EXISTS no_delete_transactions ON "Transaction";

DROP POLICY IF EXISTS select_own_user ON "User";
DROP POLICY IF EXISTS update_own_user ON "User";
DROP POLICY IF EXISTS no_insert_user ON "User";
DROP POLICY IF EXISTS no_delete_user ON "User";

DROP POLICY IF EXISTS select_all_rewards ON "RewardItem";
DROP POLICY IF EXISTS select_all_assessments ON "Assessment";
DROP POLICY IF EXISTS select_all_articles ON "PropagandaArticle";
DROP POLICY IF EXISTS select_all_pulse ON "DailyPulse";

-- Step 3: Create RLS Policies for SurveyCompletion
CREATE POLICY select_own_completions ON "SurveyCompletion"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY insert_own_completions ON "SurveyCompletion"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY no_update_completions ON "SurveyCompletion"
  FOR UPDATE
  USING (FALSE);

CREATE POLICY no_delete_completions ON "SurveyCompletion"
  FOR DELETE
  USING (FALSE);

-- Step 4: Create RLS Policies for Transaction
CREATE POLICY select_own_transactions ON "Transaction"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY insert_own_transactions ON "Transaction"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY no_update_transactions ON "Transaction"
  FOR UPDATE
  USING (FALSE);

CREATE POLICY no_delete_transactions ON "Transaction"
  FOR DELETE
  USING (FALSE);

-- Step 5: Create RLS Policies for User
CREATE POLICY select_own_user ON "User"
  FOR SELECT
  USING (auth.uid()::text = "id");

CREATE POLICY update_own_user ON "User"
  FOR UPDATE
  USING (auth.uid()::text = "id")
  WITH CHECK (auth.uid()::text = "id");

CREATE POLICY no_insert_user ON "User"
  FOR INSERT
  WITH CHECK (FALSE);

CREATE POLICY no_delete_user ON "User"
  FOR DELETE
  USING (FALSE);

-- Step 6: Create RLS Policies for Public Tables
CREATE POLICY select_all_rewards ON "RewardItem"
  FOR SELECT
  USING (TRUE);

CREATE POLICY select_all_assessments ON "Assessment"
  FOR SELECT
  USING (TRUE);

CREATE POLICY select_all_articles ON "PropagandaArticle"
  FOR SELECT
  USING (TRUE);

CREATE POLICY select_all_pulse ON "DailyPulse"
  FOR SELECT
  USING (TRUE);

-- ============================================================
-- Verification Queries (run after to confirm)
-- ============================================================

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE tablename IN ('SurveyCompletion', 'Transaction', 'User', 'RewardItem', 'Assessment');

-- Check Policies created:
-- SELECT schemaname, tablename, policyname FROM pg_policies
-- WHERE schemaname = 'public';
