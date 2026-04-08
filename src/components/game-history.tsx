"use client"

import Image from "next/image"
import { Game } from "@/lib/types"
import { getWinners, hasTiebreaker, shortenName } from "@/lib/store"

interface GameHistoryProps {
  games: Game[]
  onSelectGame: (game: Game) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
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
      {games.map((game, gameIdx) => {
        const winners = getWinners(game)
        const isTB = hasTiebreaker(game)
        // tiebreaker resolves to exactly one winner — take first
        const winner = isTB && game.tiebreakerResolved
          ? game.tiebreakerResolved.winnerName
          : winners[0]

        const sorted = [...game.scores]
          .filter((s) => s.score > 0)
          .sort((a, b) => b.score - a.score)

        const winnerScore = sorted.find((s) => s.playerName === winner)
        const losers = sorted.filter((s) => s.playerName !== winner)
        const tiedScore = isTB ? (sorted.find(s => s.playerName === winner)?.score ?? null) : null
        const tiedLosers = tiedScore !== null ? new Set(losers.filter(s => s.score === tiedScore).map(s => s.playerName)) : new Set<string>()

        return (
          <button
            key={game.id}
            onClick={() => onSelectGame(game)}
            className={[
              "w-full text-left block transition-colors active:bg-secondary",
              gameIdx < games.length - 1 ? "border-b border-border" : "",
            ].join(" ")}
          >
            {/* Date row */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
              <span className="font-mono text-[11px] text-muted-foreground/50 tabular-nums">
                {formatDate(game.date)}
              </span>
              {isTB && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-corrino/20 text-corrino rounded-full">
                  TB
                </span>
              )}
              <span className="ml-auto font-mono text-[9px] text-muted-foreground/25 uppercase tracking-widest">
                details →
              </span>
            </div>

            {/* Split panel */}
            <div className="flex items-stretch min-h-[64px]">
              {/* Left — winner */}
              <div className="w-2/5 border-r border-border/60 bg-primary/5 flex flex-col items-center justify-center px-3 py-3 gap-0.5">
                <span className="font-mono text-sm font-bold text-primary leading-tight text-center">
                  {shortenName(winner)}
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-base font-bold text-primary tabular-nums">
                    {winnerScore?.score ?? 0}
                  </span>
                  <div className="relative w-4 h-4 shrink-0">
                    <Image src="/images/victorypoint.png" alt="VP" fill className="object-contain" sizes="16px" />
                  </div>
                </div>
              </div>

              {/* Right — losers */}
              <div className="flex-1 flex flex-col justify-center px-3 py-3 gap-1">
                {losers.map((s) => {
                  const wasTied = tiedLosers.has(s.playerName)
                  return (
                    <div key={s.playerName} className="flex items-center justify-between gap-2">
                      <span className={`font-mono text-sm truncate ${wasTied ? "text-warning-foreground/70 font-semibold" : "text-muted-foreground/60"}`}>
                        {shortenName(s.playerName)}
                      </span>
                      <span className={`font-mono text-sm tabular-nums shrink-0 ${wasTied ? "text-warning-foreground/60" : "text-muted-foreground/50"}`}>
                        {s.score}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
