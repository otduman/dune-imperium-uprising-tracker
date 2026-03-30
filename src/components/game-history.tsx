"use client"

import { ChevronRight } from "lucide-react"
import { Game } from "@/lib/types"
import { getWinner, hasTiebreaker, shortenName } from "@/lib/store"

interface GameHistoryProps {
  games: Game[]
  onSelectGame: (game: Game) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function GameHistory({ games, onSelectGame }: GameHistoryProps) {
  if (games.length === 0) {
    return (
      <div className="border border-border py-10 text-center text-sm text-muted-foreground font-mono">
        No games yet.
      </div>
    )
  }

  return (
    <div className="border border-border overflow-hidden">
      {games.map((game, i) => {
        const winner = getWinner(game)
        const isTB = hasTiebreaker(game)
        const sorted = [...game.scores].sort((a, b) => b.score - a.score)
        const summary = sorted
          .filter((s) => s.score > 0)
          .map((s) => `${shortenName(s.playerName)} ${s.score}`)
          .join(" · ")

        return (
          <button
            key={game.id}
            onClick={() => onSelectGame(game)}
            className={[
              "w-full text-left flex items-center gap-3 px-4 py-5 transition-colors active:bg-secondary",
              i < games.length - 1 ? "border-b border-border" : "",
            ].join(" ")}
          >
            {/* Left: date + scores */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono text-muted-foreground/60">
                  {formatDate(game.date)}
                </span>
                {/* Winner badge */}
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-success/80 text-success-foreground">
                  {shortenName(winner)}
                </span>
                {/* Tiebreaker badge */}
                {isTB && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-warning text-warning-foreground">
                    TB
                  </span>
                )}
              </div>
              <div className="text-sm font-mono text-foreground/70 truncate">
                {summary}
              </div>
            </div>

            {/* Right: chevron */}
            <ChevronRight className="size-4 text-muted-foreground/40 shrink-0" />
          </button>
        )
      })}
    </div>
  )
}
