-- ==============================================================================
-- TRUMP BIRD: IRON DEFENSE - DATABASE SCHEMA (SUPABASE)
-- ==============================================================================

-- 1. Create Leaderboard Table
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name TEXT NOT NULL CHECK (char_length(player_name) <= 25),
    score INTEGER NOT NULL CHECK (score >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Performance Index for Top Ranking Queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_score_desc 
ON public.leaderboard (score DESC, created_at ASC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Anyone can read the global top scores
CREATE POLICY "Public Read Leaderboard" 
ON public.leaderboard 
FOR SELECT 
USING (true);

-- 5. RLS Policy: Anyone can submit their scores
CREATE POLICY "Public Insert Leaderboard" 
ON public.leaderboard 
FOR INSERT 
WITH CHECK (true);

-- Optional: Clean up spam / keep top 5000 scores (run periodically or via cron)
-- DELETE FROM public.leaderboard WHERE id NOT IN (
--   SELECT id FROM public.leaderboard ORDER BY score DESC LIMIT 5000
-- );
