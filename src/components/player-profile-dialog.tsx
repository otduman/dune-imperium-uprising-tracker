"use client"

import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Game, PlayerStats } from "@/lib/types"
import { getWinners, getHeadToHead, shortenName } from "@/lib/store"
import { LEADER_IMAGES } from "@/lib/leaders"

const BAR_MAX_PX = 64

interface PlayerProfileDialogProps {
  player: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  stats: PlayerStats | null
  games: Game[]
  players: string[]
}

function StatBox({
  label,
  value,
  accent,
  sub,
}: {
  label: string
  value: string | number
  accent?: boolean
  sub?: string
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-3 px-2 border border-border">
      <span
        className={`font-mono text-lg font-bold tabular-nums leading-none ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[9px] font-mono text-muted-foreground/50 tabular-nums">
          {sub}
        </span>
      )}
      <span className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase mt-0.5">
        {label}
      </span>
    </div>
  )
}

export function PlayerProfileDialog({
  player,
  open,
  onOpenChange,
  stats,
  games,
  players,
}: PlayerProfileDialogProps) {
  if (!player || !stats) return null

  // Chart: player's games oldest→newest (games array is newest-first)
  const playerGames = games
    .filter((g) => g.scores.some((s) => s.playerName === player && s.score > 0))
    .slice(0, 12)
    .reverse()

  const chartData = playerGames.map((g) => ({
    date: g.date,
    score: g.scores.find((s) => s.playerName === player)?.score || 0,
    won: getWinners(g).includes(player),
  }))

  const maxChartScore = Math.max(...chartData.map((d) => d.score), 1)
  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.wins / stats.gamesPlayed) * 100)
      : 0

  const h2h = getHeadToHead(games, player, players)
  const opponents = players.filter((p) => p !== player && h2h[p]?.games > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl">{player}</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Season 01 · {stats.gamesPlayed} games played
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Stats grid — 3×2 */}
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="Wins" value={stats.wins} accent />
            <StatBox label="Win %" value={`${winRate}%`} />
            <StatBox
              label="Streak"
              value={stats.currentStreak > 0 ? `${stats.currentStreak}W` : stats.currentStreak === 0 && stats.gamesPlayed > 0 ? "—" : "—"}
              accent={stats.currentStreak > 0}
            />
            <StatBox label="Total" value={stats.totalScore} />
            <StatBox label="Avg" value={stats.gamesPlayed > 0 ? stats.avgScore.toFixed(1) : "—"} />
            <StatBox
              label="Best Run"
              value={stats.longestStreak > 0 ? `${stats.longestStreak}W` : "—"}
            />
          </div>

          {/* Fav leader */}
          {stats.mostPlayedLeader !== "—" && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
                Fav Leader
              </span>
              <div className="border border-border overflow-hidden">
                {LEADER_IMAGES[stats.mostPlayedLeader] ? (
                  <div className="relative w-full aspect-[3/2] overflow-hidden">
                    <Image
                      src={LEADER_IMAGES[stats.mostPlayedLeader]!}
                      alt={stats.mostPlayedLeader}
                      fill
                      draggable={false}
                      className="object-cover object-top select-none"
                      sizes="448px"
                    />
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="font-mono text-sm font-semibold text-white">
                        {stats.mostPlayedLeader}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 font-mono text-sm text-foreground">
                    {stats.mostPlayedLeader}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Score history chart */}
          {chartData.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
                Score History
              </span>
              <div className="border border-border p-4 space-y-2">
                {/* Bars */}
                <div
                  className="flex items-end gap-1"
                  style={{ height: `${BAR_MAX_PX + 18}px` }}
                >
                  {chartData.map((d, i) => {
                    const barPx = Math.max(
                      Math.round((d.score / maxChartScore) * BAR_MAX_PX),
                      3
                    )
                    return (
                      <div
                        key={i}
                        className="relative flex-1 flex items-end justify-center h-full"
                      >
                        <span className="absolute top-0 left-0 right-0 text-center text-[9px] font-mono tabular-nums text-muted-foreground/60">
                          {d.score}
                        </span>
                        <div
                          className={`w-full ${
                            d.won ? "bg-primary" : "bg-muted-foreground/25"
                          }`}
                          style={{ height: `${barPx}px` }}
                        />
                      </div>
                    )
                  })}
                </div>
                {/* Date labels */}
                <div className="flex gap-1">
                  {chartData.map((d, i) => (
                    <div key={i} className="flex-1 text-center">
                      <span className="text-[8px] font-mono text-muted-foreground/40 leading-none">
                        {new Date(d.date).toLocaleDateString("en-US", {
                          month: "numeric",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-primary" />
                    <span className="text-[10px] font-mono text-muted-foreground/60">Win</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-muted-foreground/25" />
                    <span className="text-[10px] font-mono text-muted-foreground/60">Loss</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Head-to-head */}
          {opponents.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
                Head to Head
              </span>
              <div className="border border-border overflow-hidden">
                {/* Header */}
                <div className="flex items-center border-b border-border bg-card/60 px-4 py-2">
                  <div className="flex-1 text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
                    Opponent
                  </div>
                  <div className="w-8 text-center text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
                    GP
                  </div>
                  <div className="w-8 text-center text-[10px] font-mono font-semibold tracking-widest text-primary/60 uppercase">
                    W
                  </div>
                  <div className="w-8 text-center text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
                    L
                  </div>
                </div>
                {opponents.map((opp) => {
                  const record = h2h[opp]
                  const isWinning = record.wins > record.losses
                  return (
                    <div
                      key={opp}
                      className="flex items-center border-b border-border last:border-b-0 px-4 py-3"
                    >
                      <div className="flex-1 font-mono text-sm text-foreground">
                        {shortenName(opp)}
                      </div>
                      <div className="w-8 text-center font-mono text-sm tabular-nums text-muted-foreground">
                        {record.games}
                      </div>
                      <div
                        className={`w-8 text-center font-mono text-sm tabular-nums font-semibold ${
                          isWinning ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {record.wins}
                      </div>
                      <div className="w-8 text-center font-mono text-sm tabular-nums text-muted-foreground">
                        {record.losses}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
