# Dune: Imperium Uprising — League Tracker

A private web app for tracking board game sessions of **Dune: Imperium Uprising** across a 4-player friend group. Built with a cinematic, desert-punk aesthetic inspired by the board game's visual design.

---

## Features

### Leaderboard / Standings
- Ranked table sorted by wins, with average score and total points as secondary stats
- Rank trend indicators (up/down/same) using in-game resource icons between sessions
- Victory Point icon replaces the number "1" for the current leader
- VP icon shown inline next to the Pts column header and each row's score
- Click any player row to open their full profile

### Game History
- Split-panel layout per game: winner on the left, losers on the right
- Tiebreaker badge (`TB`) shown on games resolved by tiebreak
- Tied losers (who matched the winner's score but lost the tiebreak) highlighted in amber
- Tap any game card to open the full game detail dialog

### Game Detail Dialog
- Leader portrait images (72×108px) anchored to the left of each player row — image sets the row height for visual consistency
- Fallback placeholder for players without a leader selected
- Winner row highlighted in primary color; tied-loser row in amber with "tied · lost TB" label
- VP icon next to the winner's name
- Tiebreaker breakdown section: resource columns (Spice, Solari, Water, Garrison) with the deciding resource and winner highlighted
- "Winner by [resource icon] – [name]" summary line
- Edit and Delete buttons in the dialog header (no footer)
- Custom close button — native dialog X suppressed

### Add / Edit Game Dialog
- Date picker, per-player score entry, and leader selection
- Duplicate leader prevention: once a leader is chosen by one player, it is greyed out and disabled for all others
- Enter key on a score field moves focus to that player's leader select, then continues down
- Full state reset on each new game (no stale values carried over from previous session)

### Player Profile Dialog
- Stats grid: Wins, Win %, Current Streak, Total Points, Avg Score, Best Streak
- Two-column leader card section: Most Played leader and Best Performer leader (by win rate, min 2 games)
- Score history bar chart for the last 12 games (wins highlighted in primary color)
- Head-to-head record table against each opponent (correctly counts wins only when that opponent actually won, not third-party games)

### Leader Meta
- Card grid (2 columns mobile, 3 on desktop) sorted by win rate
- Leader portrait as card header with `object-cover` crop centered at 20% vertical
- `TOP` badge for top 3 leaders (gold for #1, muted for #2 and #3)
- `FAV` badge for any leader tied for most games played
- Per-leader stats: Wins, Games Played, Win %, and W/L breakdown per player

### Admin Auth
- All routes protected by cookie-based session check (`admin_session`)
- `/login` page with password form, posts to `/api/auth/login`
- Password configured via `ADMIN_PASSWORD` environment variable
- Session cookie is httpOnly, 30-day maxAge
- Logout button in the app header

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React + Tailwind CSS |
| Icons | Lucide React |
| Images | Next.js `<Image>` with local assets |
| Database | PostgreSQL (via `pg`) |
| Auth | Cookie session (httpOnly) |
| Route protection | `proxy.ts` (Next.js middleware equivalent) |

---

## Project Structure

```
src/
  app/
    page.tsx              # Main app shell (leaderboard, history, leader meta)
    layout.tsx
    globals.css
    login/page.tsx        # Admin login page
    api/
      auth/login/         # POST /api/auth/login
      games/              # GET, POST, DELETE /api/games
      players/            # GET, POST, DELETE /api/players
  components/
    standings-table.tsx
    game-history.tsx
    game-detail-dialog.tsx
    add-game-dialog.tsx
    leader-meta.tsx
    player-profile-dialog.tsx
    manage-players-dialog.tsx
    ui/                   # shadcn/ui primitives + resource-icon
  lib/
    types.ts              # Game, PlayerStats, LeaderStats, tiebreaker types
    store.ts              # Pure stat computation (getWinners, getPlayerStats, etc.)
    leaders.ts            # LEADER_IMAGES map: name → /images/cards/*.webp
    db.ts                 # PostgreSQL client
    api.ts                # Client-side fetch wrappers
    utils.ts
  proxy.ts                # Auth middleware (replaces deprecated middleware.ts)
```

---

## Running Locally

Requires Node.js and a PostgreSQL instance.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/dune_tracker
   ADMIN_PASSWORD=your_password_here
   ```

3. Run database migrations (create `games` and `players` tables as needed).

4. Start the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login` on first visit.

---

## Design Notes

- **Dune theme colors**: custom CSS variables in `globals.css` — `--corrino`, `--warning` (near-black background tint), `--warning-foreground` (orange `#FF8400` used for amber highlights)
- **Warning color gotcha**: `bg-warning` is a near-black tint; visible amber always uses `warning-foreground`
- **Font**: monospace throughout for a terminal / data-readout aesthetic
- **Images**: leader card `.webp` files sourced from Dune Cards Hub, stored in `public/images/cards/`; resource token `.png` files in `public/images/`
- **No `middleware.ts`**: Next.js 16 renamed the middleware entry point — auth logic lives in `proxy.ts` with the `proxy` named export

---

Enjoy tracking your games on Arrakis.
