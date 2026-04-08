"use client"

import Image from "next/image"
import { PlayerStats } from "@/lib/types"

interface StandingsTableProps {
  stats: PlayerStats[]
  previousStats?: PlayerStats[]
  onSelectPlayer?: (name: string) => void
}

function shortFirst(name: string) {
  const parts = name.split(" ")
  if (parts.length === 1) return name
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`
}

function TrendIcon({ trend, hasPrev }: { trend: "up" | "down" | "same"; hasPrev: boolean }) {
  if (!hasPrev) return <div className="w-4 h-4 shrink-0" />
  if (trend === "up")
    return (
      <div className="relative w-4 h-4 shrink-0">
        <Image src="/images/influence_plus.png" alt="up" fill className="object-contain" sizes="16px" />
      </div>
    )
  if (trend === "down")
    return (
      <div className="relative w-4 h-4 shrink-0">
        <Image src="/images/influence_minus.png" alt="down" fill className="object-contain" sizes="16px" />
      </div>
    )
  return <span className="w-4 text-center font-mono text-[10px] text-muted-foreground/30 shrink-0 leading-none">–</span>
}

export function StandingsTable({ stats, previousStats, onSelectPlayer }: StandingsTableProps) {
  if (stats.length === 0) {
    return (
      <div className="border border-border py-10 text-center text-sm text-muted-foreground font-mono">
        No players yet — add players to start tracking.
      </div>
    )
  }

  const hasPrev = !!previousStats && previousStats.length > 0

  return (
    <div className="border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center border-b border-border bg-card/60 px-1">
        <div className="w-12 shrink-0 py-2.5 pl-3 text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
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
        <div className="w-10 py-2.5 text-center text-[10px] font-mono font-semibold tracking-widest text-primary/70 uppercase">
          W
        </div>
        {/* Pts header */}
        <div className="w-16 py-2.5 pr-4 flex items-center justify-end gap-1 text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
          <span>Pts</span>
          <div className="relative w-3.5 h-3.5 shrink-0 opacity-70">
            <Image src="/images/victorypoint.png" alt="VP" fill className="object-contain" sizes="14px" />
          </div>
        </div>
      </div>

      {/* Rows */}
      {stats.map((player, i) => {
        const isFirst = i === 0

        const prevIndex = previousStats?.findIndex((p) => p.name === player.name) ?? -1
        const trend: "up" | "down" | "same" =
          prevIndex === -1 ? "same"
          : prevIndex > i ? "up"
          : prevIndex < i ? "down"
          : "same"

        return (
          <div
            key={player.name}
            onClick={() => onSelectPlayer?.(player.name)}
            className={[
              "flex items-center border-b border-border last:border-b-0 px-1 transition-colors",
              isFirst ? "border-l-2 border-l-primary bg-primary/5" : "border-l-2 border-l-transparent",
              onSelectPlayer ? "cursor-pointer active:bg-secondary" : "",
            ].join(" ")}
          >
            {/* Rank + trend */}
            <div className="w-12 shrink-0 py-4 pl-2 flex items-center gap-1.5">
              {isFirst ? (
                <div className="relative w-4 h-4 shrink-0">
                  <Image src="/images/victorypoint.png" alt="1" fill className="object-contain" sizes="16px" />
                </div>
              ) : (
                <span className="font-mono text-sm font-bold tabular-nums w-4 text-center text-muted-foreground/50">
                  {i + 1}
                </span>
              )}
              <TrendIcon trend={trend} hasPrev={hasPrev} />
            </div>

            {/* Name */}
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

            {/* GP — desktop only */}
            <div className="hidden sm:block w-10 py-4 text-center text-sm font-mono tabular-nums text-muted-foreground">
              {player.gamesPlayed}
            </div>

            {/* Avg — desktop only */}
            <div className="hidden sm:block w-12 py-4 text-center text-sm font-mono tabular-nums text-muted-foreground">
              {player.gamesPlayed > 0 ? player.avgScore.toFixed(1) : "—"}
            </div>

            {/* Wins */}
            <div
              className={[
                "w-10 py-4 text-center text-sm font-mono tabular-nums font-semibold",
                isFirst ? "text-primary" : "text-foreground",
              ].join(" ")}
            >
              {player.wins}
            </div>

            {/* Pts with VP icon */}
            <div className="w-16 py-4 pr-4 flex items-center justify-end gap-1">
              <span className="font-mono tabular-nums text-muted-foreground text-sm">
                {player.totalScore}
              </span>
              <div className="relative w-3.5 h-3.5 shrink-0 opacity-50">
                <Image src="/images/victorypoint.png" alt="VP" fill className="object-contain" sizes="14px" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
