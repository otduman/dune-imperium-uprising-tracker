"use client"

import Image from "next/image"
import { LeaderStats } from "@/lib/types"
import { LEADER_IMAGES } from "@/lib/leaders"

interface LeaderMetaProps {
  stats: LeaderStats[]
}

export function LeaderMeta({ stats }: LeaderMetaProps) {
  if (stats.length === 0) {
    return (
      <div className="border border-border py-10 text-center text-sm text-muted-foreground font-mono">
        No games yet — play some games to see leader stats.
      </div>
    )
  }

  return (
    <div className="border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center border-b border-border bg-card/60 px-1">
        <div className="flex-1 py-2.5 px-3 text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
          Leader
        </div>
        <div className="w-10 py-2.5 text-center text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
          GP
        </div>
        <div className="w-10 py-2.5 text-center text-[10px] font-mono font-semibold tracking-widest text-primary/60 uppercase">
          W
        </div>
        <div className="w-16 py-2.5 pr-4 text-right text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
          Win%
        </div>
      </div>

      {/* Rows */}
      {stats.map((leader, i) => {
        const isFirst = i === 0
        const winPct = Math.round(leader.winRate * 100)
        return (
          <div
            key={leader.name}
            className={[
              "flex items-center border-b border-border last:border-b-0 px-1 transition-colors",
              isFirst
                ? "border-l-2 border-l-primary bg-primary/5"
                : "border-l-2 border-l-transparent",
            ].join(" ")}
          >
            <div className="flex-1 py-3 px-2 flex items-center gap-2 min-w-0">
              {LEADER_IMAGES[leader.name] && (
                <div className="relative w-8 h-8 rounded shrink-0 overflow-hidden">
                  <Image
                    src={LEADER_IMAGES[leader.name]!}
                    alt=""
                    fill
                    className="object-cover object-top"
                    sizes="32px"
                  />
                </div>
              )}
              <span className={`font-mono text-sm truncate ${isFirst ? "text-primary font-semibold" : "text-foreground"}`}>
                {leader.name}
              </span>
            </div>
            <div className="w-10 py-3 text-center font-mono text-sm tabular-nums text-muted-foreground">
              {leader.gamesPlayed}
            </div>
            <div
              className={`w-10 py-3 text-center font-mono text-sm tabular-nums font-semibold ${
                isFirst ? "text-primary" : "text-foreground"
              }`}
            >
              {leader.wins}
            </div>
            <div
              className={`w-16 py-3 pr-4 text-right font-mono tabular-nums font-bold ${
                isFirst ? "text-primary" : "text-foreground"
              }`}
            >
              {winPct}%
            </div>
          </div>
        )
      })}
    </div>
  )
}
