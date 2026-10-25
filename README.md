# 👾 PIXELVERSE — Poki-Style Arcade + GameMonetize Live Embeds

> The ultimate social gaming universe combining a **Poki-style** massive browser-game arcade powered by live **GameMonetize** embeds with Discord-style communities, WebRTC voice rooms, friendships, and real-time messaging.

---

## 🌟 Key Features

### 1. Poki-Style Browser-Game Arcade
- **Dense Thumbnail-First Grid**: Irregular mosaic arrangement (`1x1` standard, `2x2` featured, `wide` double-width) with rounded corners, glowing neon borders, and hover zoom.
- **Real Game Photos & Thumbnails**: Every game tile and detail page displays authentic photos/thumbnails hosted by GameMonetize (`img.gamemonetize.com`).
- **Category Chips & Prominent Search**: Horizontal category pills (Action, Adventure, Arcade, Puzzle, Strategy, Racing, Sports, Casual, Multiplayer) with live game counts, plus real-time debounced search.
- **Poki-Grade Game Player (`/game/[slug]` and `/games/[slug]`)**:
  - **Play Overlay**: Large thumbnail hero, title, and big Play button — iframe loads only after clicking Play to conserve bandwidth.
  - **Live HTML5 Embeds**: Sandboxed iframes using the embed URLs from the GameMonetize feed (`https://html5.gamemonetize.co/{id}/`).
  - **Fullscreen & Controls**: Native Fullscreen API, "Fit to Screen", audio mute, and keyboard-focus handling that prevents arrow keys and spacebar from scrolling the page.
  - **Ratings & Favorites**: Like/dislike ratio calculations, guest favorites, and play history.
  - **Party Rooms Integration**: "Create Party" button to launch any game inside a shared room with voice and text chat!

### 2. GameMonetize Catalog (5,000+ games)
- **Official feed**: the whole catalog comes from the GameMonetize JSON feed
  `https://rss.gamemonetize.com/rssfeed.php?format=json&category=All&type=html5&popularity=newest&company=All&amount=All`
- **One command to refresh (`npm run sync:feed`)**: `scripts/sync-games/gamemonetize-feed.js` downloads the feed (or reads a JSON file you pass in), cleans the text (HTML entities, promo links) and rewrites `src/lib/games/registry.json`. Redeploy afterwards.
- **Built for a big catalog**: lists render in chunks with infinite scroll, search is deferred, and pickers show at most 60 matches.
- **Honest numbers**: the feed has no play counts or ratings, so those start at zero and grow from real plays and votes on your site.

### 3. Full Social Layer
- **WebRTC Voice Rooms (`/rooms/[id]`)**: Hardware device selection, microphone activity meters, glowing green speaking rings, mute/deafen controls, and embedded in-room party games.
- **Discord-Style Messaging (`/messages`)**: 1-on-1 direct messages, group chats, emoji reactions, arcade stickers, and game share cards.
- **Communities (`/community`)**: Topic-based text and voice channels with member lists.
- **Gaming Identities (`/u/[username]`)**: Customizable banners, avatars, levels, XP progression, and favorited/recently played games.
- **Friends Graph (`/friends`, `/players`)**: Search by username, send/accept/cancel requests, online presence, and user blocking.
- **Administration & Moderation (`/admin`)**: Submissions queue, DMCA takedown quarantine actions, catalog audit, and feed health monitoring.

---

## 📋 GameMonetize Publisher Notes

1. Keep your GameMonetize publisher account in good standing and make sure your live domain is the one registered/approved with them.
2. Embed games only through the URLs in the feed and do not strip or block the ads inside the games.
3. Set `GAMEMONETIZE_FEED_URL` in `.env.local` (see `.env.example`) if you want `npm run sync:feed` to use a custom feed URL.

---

## 🚀 Quick Start

### 1. Install & Sync Catalog
```bash
# Rebuild the catalog from the GameMonetize feed
npm run sync:feed

# Run automated test suite 
npm test
```

### 2. Local Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🗄️ Database Architecture

- `supabase/migrations/00001_initial_schema.sql`: 26 normalized tables for profiles, preferences, friendships, conversations, messages, rooms, and moderation.
- `supabase/migrations/00002_playverse_schema.sql`: 11 portal tables for categories, tags, ratings, plays, developer submissions, and DMCA takedowns.
- `supabase/migrations/00003_gamedistribution_schema.sql`: legacy game-metadata tables (the live catalog is read from `src/lib/games/registry.json`).
