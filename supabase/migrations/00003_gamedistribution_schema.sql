-- Migration 00003: GameDistribution Integration & Poki Arcade Schema
-- Adds GameDistribution game hash, thumbnail assets, embed specifications, and sync metadata.

ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS gd_game_hash TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS instructions TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS thumbnail_large_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS embed_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS aspect_ratio TEXT DEFAULT '16/9',
ADD COLUMN IF NOT EXISTS supports_mobile BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS supports_desktop BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_multiplayer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS developer_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'gamedistribution',
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ DEFAULT now();

-- Update status check constraint if present
DO $$
BEGIN
    ALTER TABLE public.games DROP CONSTRAINT IF EXISTS games_status_check;
    ALTER TABLE public.games ADD CONSTRAINT games_status_check 
        CHECK (status IN ('active', 'published', 'unavailable', 'quarantined', 'hidden', 'pending_review', 'takedown'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Performance indexes for Poki-style dense grid queries
CREATE INDEX IF NOT EXISTS idx_games_gd_hash ON public.games(gd_game_hash);
CREATE INDEX IF NOT EXISTS idx_games_category ON public.games(category);
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_games_play_count ON public.games(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_games_featured ON public.games(featured);
CREATE INDEX IF NOT EXISTS idx_games_rating ON public.games(rating_score DESC);

-- Full-text / Trigram search index for search bar
CREATE INDEX IF NOT EXISTS idx_games_title_trgm ON public.games USING gin (to_tsvector('english', title || ' ' || description || ' ' || category));

-- Ensure RLS policies are enforced
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active games" ON public.games;
CREATE POLICY "Public can view active games" ON public.games
    FOR SELECT USING (status IN ('active', 'published'));

DROP POLICY IF EXISTS "Admins can manage all games" ON public.games;
CREATE POLICY "Admins can manage all games" ON public.games
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND (profiles.is_admin = true OR profiles.is_moderator = true)
        )
    );
