"use client"

import Image from "next/image"
import { LeaderStats } from "@/lib/types"
import { LEADER_IMAGES } from "@/lib/leaders"
import { shortenName } from "@/lib/store"

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
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {stats.map((leader, i) => {
        const isTop = i === 0
        const winPct = Math.round(leader.winRate * 100)
        const imgSrc = LEADER_IMAGES[leader.name]
        const playerEntries = Object.entries(leader.players).sort(
          (a, b) => b[1].wins - a[1].wins || b[1].games - a[1].games
        )

        return (
          <div
            key={leader.name}
            className="flex flex-col border border-border rounded-sm overflow-hidden"
          >
            {/* Portrait */}
            <div className="relative w-full aspect-[3/2] bg-card overflow-hidden">
              {imgSrc ? (
                <Image
                  src={imgSrc}
                  alt={leader.name}
                  fill
                  draggable={false}
                  className="object-cover select-none"
                  style={{ objectPosition: "center 20%" }}
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xs font-mono">
                  ?
                </div>
              )}
              {/* TOP badge — top right */}
              {isTop && (
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-primary text-primary-foreground">
                  TOP
                </div>
              )}
            </div>

            {/* Info */}
            <div className="px-2.5 pt-2 pb-2.5 space-y-2">
              {/* Leader name */}
              <div className={`font-mono text-xs font-semibold leading-tight ${isTop ? "text-primary" : "text-foreground"}`}>
                {leader.name}
              </div>

              {/* GP / W / Win% row */}
              <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                <span><span className="text-foreground font-semibold">{leader.wins}</span>W</span>
                <span><span className="text-foreground font-semibold">{leader.gamesPlayed}</span>GP</span>
                <span className={`ml-auto font-semibold ${isTop ? "text-primary" : "text-foreground"}`}>{winPct}%</span>
              </div>

              {/* Per-player breakdown */}
              {playerEntries.length > 0 && (
                <div className="space-y-0.5 border-t border-border pt-2">
                  {playerEntries.map(([name, record]) => (
                    <div key={name} className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-muted-foreground truncate">{shortenName(name)}</span>
                      <span className={record.wins > 0 ? "text-primary font-semibold" : "text-muted-foreground/50"}>
                        {record.wins}W {record.games - record.wins}L
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
