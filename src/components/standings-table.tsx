"use client"

import { PlayerStats } from "@/lib/types"

interface StandingsTableProps {
  stats: PlayerStats[]
  onSelectPlayer?: (name: string) => void
}

function shortFirst(name: string) {
  const parts = name.split(" ")
  if (parts.length === 1) return name
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`
}

export function StandingsTable({ stats, onSelectPlayer }: StandingsTableProps) {
  if (stats.length === 0) {
    return (
      <div className="border border-border py-10 text-center text-sm text-muted-foreground font-mono">
        No players yet — add players to start tracking.
      </div>
    )
  }

  return (
    <div className="border border-border overflow-hidden">
      {/* Column headers */}
      <div className="flex items-center border-b border-border bg-card/60 px-1">
        <div className="w-9 shrink-0 py-2.5 pl-3 text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
          #
        </div>
        <div className="flex-1 py-2.5 px-2 text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
          Player
        </div>
        <div className="hidden sm:block w-10 py-2.5 text-center text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
          GP
        </div>
        <div className="hidden sm:block w-12 py-2.5 text-center text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
          Avg
        </div>
        <div className="w-10 py-2.5 text-center text-[10px] font-mono font-semibold tracking-widest text-primary/60 uppercase">
          W
        </div>
        <div className="w-14 py-2.5 pr-4 text-right text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
          Pts
        </div>
      </div>

      {/* Rows */}
      {stats.map((player, i) => {
        const isFirst = i === 0
        return (
          <div
            key={player.name}
            onClick={() => onSelectPlayer?.(player.name)}
            className={[
              "flex items-center border-b border-border last:border-b-0 px-1 transition-colors",
              isFirst
                ? "border-l-2 border-l-primary bg-primary/5"
                : "border-l-2 border-l-transparent",
              onSelectPlayer ? "cursor-pointer active:bg-secondary" : "",
            ].join(" ")}
          >
            {/* rank */}
            <div
              className={[
                "w-9 shrink-0 py-4 pl-2 font-mono text-sm font-bold tabular-nums",
                isFirst ? "text-primary" : "text-muted-foreground/50",
              ].join(" ")}
            >
              {i + 1}
            </div>

            {/* name */}
            <div className="flex-1 py-4 px-2 min-w-0">
              <div
                className={[
                  "font-mono text-sm font-semibold truncate leading-tight",
                  isFirst ? "text-primary" : "text-foreground",
                ].join(" ")}
              >
                {shortFirst(player.name)}
              </div>
            </div>

            {/* GP desktop */}
            <div className="hidden sm:block w-10 py-4 text-center text-sm font-mono tabular-nums text-muted-foreground">
              {player.gamesPlayed}
            </div>

            {/* Avg desktop */}
            <div className="hidden sm:block w-12 py-4 text-center text-sm font-mono tabular-nums text-muted-foreground">
              {player.gamesPlayed > 0 ? player.avgScore.toFixed(1) : "—"}
            </div>

            {/* W */}
            <div
              className={[
                "w-10 py-4 text-center text-sm font-mono tabular-nums font-semibold",
                isFirst ? "text-primary" : "text-foreground",
              ].join(" ")}
            >
              {player.wins}
            </div>

            {/* Total */}
            <div className="w-14 py-4 pr-4 text-right font-mono tabular-nums text-muted-foreground text-sm">
              {player.totalScore}
            </div>
          </div>
        )
      })}
    </div>
  )
}
