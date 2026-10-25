-- ====================================================================
-- PLAYVERSE DATABASE MIGRATION: 00002_playverse_schema.sql
-- Production Schema: Game Feeds, Ratings, Categories, Submissions,
-- Takedowns, Import Logs, and Audit Trail with Row Level Security
-- ====================================================================

-- 1. GAME SOURCES TABLE (GameDistribution, GameMonetize, GitHub, In-House)
CREATE TABLE IF NOT EXISTS public.game_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    feed_url TEXT,
    documentation_url TEXT,
    revenue_share_terms TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    icon_name TEXT DEFAULT 'Gamepad2',
    color TEXT DEFAULT '#00f0ff',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- 3. TAGS & GAME_TAGS TABLES
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.game_tags (
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, tag_id)
);

-- 4. DEVELOPERS TABLE
CREATE TABLE IF NOT EXISTS public.developers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    website_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GAME RATINGS TABLE (Real likes/dislikes from users and guests)
CREATE TABLE IF NOT EXISTS public.game_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guest_id TEXT,
    is_like BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ratings_game ON public.game_ratings(game_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user ON public.game_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_guest ON public.game_ratings(guest_id);

-- 6. GAME PLAYS & TELEMETRY EVENTS
CREATE TABLE IF NOT EXISTS public.game_plays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guest_id TEXT,
    playtime_seconds INT DEFAULT 0,
    score INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_plays_game ON public.game_plays(game_id, created_at DESC);

-- 7. GAME COLLECTIONS & CURATED LISTS
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    banner_url TEXT DEFAULT '',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collection_games (
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    display_order INT DEFAULT 0,
    PRIMARY KEY (collection_id, game_id)
);

-- 8. DEVELOPER SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    developer_name TEXT NOT NULL,
    developer_email TEXT NOT NULL,
    developer_url TEXT DEFAULT '',
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    description TEXT NOT NULL,
    instructions TEXT DEFAULT '',
    launch_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    license TEXT NOT NULL,
    license_accepted BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewer_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

-- 9. DMCA & COPYRIGHT TAKEDOWNS TABLE
CREATE TABLE IF NOT EXISTS public.takedowns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
    claimant_name TEXT NOT NULL,
    claimant_email TEXT NOT NULL,
    copyright_owner TEXT NOT NULL,
    infringing_url TEXT NOT NULL,
    description TEXT NOT NULL,
    good_faith_confirmed BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'actioned', 'rejected')),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_takedowns_status ON public.takedowns(status);

-- 10. IMPORT RUNS & IMPORT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.import_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_slug TEXT NOT NULL,
    games_scanned INT DEFAULT 0,
    games_imported INT DEFAULT 0,
    games_quarantined INT DEFAULT 0,
    status TEXT DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.import_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID REFERENCES public.import_runs(id) ON DELETE CASCADE,
    game_slug TEXT NOT NULL,
    status TEXT NOT NULL,
    details TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ADMIN AUDIT LOG
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- RLS POLICIES FOR NEW TABLES
-- ====================================================================

ALTER TABLE public.game_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takedowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Public read for catalog structures
CREATE POLICY "Public sources read" ON public.game_sources FOR SELECT USING (true);
CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public tags read" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public game_tags read" ON public.game_tags FOR SELECT USING (true);
CREATE POLICY "Public developers read" ON public.developers FOR SELECT USING (true);
CREATE POLICY "Public collections read" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Public collection_games read" ON public.collection_games FOR SELECT USING (true);

-- Ratings: Anyone (including anonymous) can read and insert
CREATE POLICY "Public ratings read" ON public.game_ratings FOR SELECT USING (true);
CREATE POLICY "Anyone can rate games" ON public.game_ratings FOR INSERT WITH CHECK (true);

-- Plays: Anyone can record play events
CREATE POLICY "Anyone can record play events" ON public.game_plays FOR INSERT WITH CHECK (true);

-- Submissions: Anyone can submit a game; admins can view and update
CREATE POLICY "Anyone can submit a game" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view submissions" ON public.submissions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (profiles.is_admin = TRUE OR profiles.is_moderator = TRUE))
);

-- Takedowns: Anyone can submit DMCA; admins can view and manage
CREATE POLICY "Anyone can submit DMCA takedown" ON public.takedowns FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view takedowns" ON public.takedowns FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

-- Audit log: Admins only
CREATE POLICY "Admins view audit log" ON public.admin_audit_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);
