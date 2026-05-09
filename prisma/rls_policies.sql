-- SUPABASE RLS POLICIES FOR ERTOBA ANALYTICS

-- 1. Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Assessment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SurveyCompletion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RewardItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;

-- 2. "User" Table Policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON "User"
FOR SELECT USING (auth.uid()::text = id);

-- 3. "Assessment" Table Policies
-- Everyone can view available assessments
CREATE POLICY "Assessments are viewable by everyone" ON "Assessment"
FOR SELECT USING (true);

-- 4. "SurveyCompletion" Table Policies
-- Users can view their own completions
CREATE POLICY "Users can view own completions" ON "SurveyCompletion"
FOR SELECT USING (auth.uid()::text = "userId");

-- 5. "RewardItem" Table Policies
-- Everyone can view items in the market
CREATE POLICY "Rewards are viewable by everyone" ON "RewardItem"
FOR SELECT USING (true);

-- 6. "Transaction" Table Policies
-- Users can view their own transaction history
CREATE POLICY "Users can view own transactions" ON "Transaction"
FOR SELECT USING (auth.uid()::text = "userId");

-- IMPORTANT: Prisma (using direct DATABASE_URL) usually connects as 'postgres' role
-- which bypasses RLS. To enforce RLS with Prisma, you must use a restricted role
-- or ensure your Server Action logic always filters by 'auth.uid()'.
