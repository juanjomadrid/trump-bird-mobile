import { createClient } from '@supabase/supabase-js';
import { LeaderboardRecord } from '../types/game';

// Environment variables with fallback to project Supabase instance
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://oqspeunnvirndrkpsped.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_tYnU6GHgz4lrvsBWtFFxDg_uHyURBwz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
  },
});

/**
 * Fetches the Top 20 global leaderboard scores.
 */
export const fetchTopLeaderboard = async (): Promise<{ data: LeaderboardRecord[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('id, player_name, score, created_at')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(20);

    if (error) {
      console.warn('Supabase fetchLeaderboard error:', error.message);
      return { data: null, error: error.message };
    }

    return { data: (data as LeaderboardRecord[]) || [], error: null };
  } catch (err: any) {
    console.warn('Supabase network error:', err);
    return { data: null, error: err.message || 'Network error connecting to Supabase' };
  }
};

/**
 * Submits a new score to the Supabase global leaderboard.
 */
export const submitScore = async (
  playerName: string,
  score: number
): Promise<{ success: boolean; rank?: number; error?: string }> => {
  if (!playerName || playerName.trim() === '') {
    playerName = 'Don The Great';
  }

  const cleanName = playerName.trim().substring(0, 25);

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([{ player_name: cleanName, score }])
      .select();

    if (error) {
      console.warn('Supabase submitScore error:', error.message);
      return { success: false, error: error.message };
    }

    // Determine rank in global table
    const { count } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true })
      .gt('score', score);

    const rank = (count !== null && count !== undefined) ? count + 1 : undefined;

    return { success: true, rank };
  } catch (err: any) {
    console.warn('Supabase submitScore network error:', err);
    return { success: false, error: err.message || 'Failed to submit score' };
  }
};
