"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Game, PlayerStats } from "@/lib/types"
import { getWinner } from "@/lib/store"

interface PlayerProfileDialogProps {
  player: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  stats: PlayerStats | null
  games: Game[]
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-3 px-2 border border-border rounded">
      <span
        className={`font-mono text-lg font-bold tabular-nums ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </span>
      <span className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
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
}: PlayerProfileDialogProps) {
  if (!player || !stats) return null

  // Get this player's games in chronological order (newest-first in array → reverse for chart)
  const playerGames = games
    .filter((g) => g.scores.some((s) => s.playerName === player && s.score > 0))
    .slice(0, 12)
    .reverse()

  const chartData = playerGames.map((g) => ({
    date: g.date,
    score: g.scores.find((s) => s.playerName === player)?.score || 0,
    won: getWinner(g) === player,
  }))

  const maxChartScore = Math.max(...chartData.map((d) => d.score), 1)
  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.wins / stats.gamesPlayed) * 100)
      : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl">{player}</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Season 01 · {stats.gamesPlayed} games played
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="Wins" value={stats.wins} accent />
            <StatBox label="Win %" value={`${winRate}%`} />
            <StatBox label="Avg" value={stats.gamesPlayed > 0 ? stats.avgScore.toFixed(1) : "—"} />
            <StatBox label="Total" value={stats.totalScore} />
            <StatBox label="Best" value={stats.bestScore > 0 ? stats.bestScore : "—"} />
            <StatBox label="GP" value={stats.gamesPlayed} />
          </div>

          {/* Most played leader */}
          {stats.mostPlayedLeader !== "—" && (
            <div className="flex items-center gap-3 px-4 py-3 border border-border rounded">
              <span className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
                Fav Leader
              </span>
              <span className="font-mono text-sm text-foreground flex-1 text-right">
                {stats.mostPlayedLeader}
              </span>
            </div>
          )}

          {/* Score history chart */}
          {chartData.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
                Score History
              </span>
              <div className="border border-border rounded p-4">
                <div className="flex items-end gap-1.5 h-24">
                  {chartData.map((d, i) => {
                    const heightPct = (d.score / maxChartScore) * 100
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1 group"
                      >
                        <span className="text-[9px] font-mono tabular-nums text-muted-foreground/60 group-hover:text-foreground transition-colors">
                          {d.score}
                        </span>
                        <div
                          className={`w-full rounded-sm transition-colors ${
                            d.won ? "bg-primary" : "bg-muted-foreground/30"
                          }`}
                          style={{ height: `${Math.max(heightPct, 8)}%` }}
                        />
                      </div>
                    )
                  })}
                </div>
                {/* Date labels */}
                <div className="flex gap-1.5 mt-2">
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
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
                    <span className="text-[10px] font-mono text-muted-foreground/60">Win</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-muted-foreground/30" />
                    <span className="text-[10px] font-mono text-muted-foreground/60">Loss</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
