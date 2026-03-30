"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Game, TIEBREAKER_ORDER } from "@/lib/types"
import { getWinner, hasTiebreaker, shortenName } from "@/lib/store"

interface GameDetailDialogProps {
  game: Game | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (game: Game) => void
  onDelete: (gameId: string) => void
}

export function GameDetailDialog({
  game,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: GameDetailDialogProps) {
  if (!game) return null

  const winner = getWinner(game)
  const isTB = hasTiebreaker(game)
  const sortedScores = [...game.scores].sort((a, b) => b.score - a.score)

  // For tiebreaker display, find the tied players
  const tiedPlayers = isTB
    ? (() => {
        const maxScore = sortedScores[0]?.score || 0
        return sortedScores.filter((s) => s.score === maxScore)
      })()
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle className="font-mono text-lg">
              Game —{" "}
              {new Date(game.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </DialogTitle>
            {isTB && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-warning text-warning-foreground">
                TIEBREAKER
              </span>
            )}
          </div>
          <DialogDescription>
            {game.scores.length} players · Season 01
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Scores label */}
          <span className="text-[11px] font-mono font-semibold tracking-widest text-muted-foreground uppercase">
            Scores
          </span>

          {/* Score rows */}
          <div className="space-y-2">
            {sortedScores.map((s) => {
              const isWinner = s.playerName === winner
              return (
                <div
                  key={s.playerName}
                  className={`flex items-center justify-between px-4 py-3 rounded-md ${
                    isWinner
                      ? "bg-accent border border-primary/20"
                      : "border border-border"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`font-mono text-sm font-semibold truncate ${
                        isWinner ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {shortenName(s.playerName)}
                    </span>
                    {s.leader && (
                      <span className="text-xs text-muted-foreground truncate">
                        · {s.leader}
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-mono text-lg font-bold ml-3 ${
                      isWinner ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {s.score}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Tiebreaker breakdown */}
          {isTB && tiedPlayers.length > 0 && (
            <>
              <div className="h-px bg-border" />
              <div className="space-y-3">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-warning text-warning-foreground">
                  TIEBREAKER BREAKDOWN
                </span>

                {/* Table header */}
                <div className="flex items-center gap-2 px-2 text-[11px] font-mono font-semibold tracking-wider text-muted-foreground uppercase">
                  <div className="flex-1">Player</div>
                  {TIEBREAKER_ORDER.map((r) => (
                    <div key={r} className="w-14 text-center capitalize">
                      {r.slice(0, 5)}
                    </div>
                  ))}
                </div>

                {/* Tied player rows */}
                {tiedPlayers.map((s) => {
                  const isWinner = s.playerName === winner
                  return (
                    <div
                      key={s.playerName}
                      className={`flex items-center gap-2 px-2 py-2 rounded ${
                        isWinner ? "bg-accent" : "border border-border"
                      }`}
                    >
                      <div
                        className={`flex-1 font-mono text-xs font-semibold truncate ${
                          isWinner ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {shortenName(s.playerName)}
                      </div>
                      {TIEBREAKER_ORDER.map((r) => {
                        const val = s.tiebreaker?.[r]
                        const isResolveResource =
                          game.tiebreakerResolved?.resource === r
                        const isThisWinner =
                          isResolveResource &&
                          s.playerName === game.tiebreakerResolved?.winnerName
                        return (
                          <div
                            key={r}
                            className={`w-14 text-center font-mono text-sm ${
                              isThisWinner
                                ? "text-primary font-bold"
                                : val !== undefined
                                  ? "text-foreground"
                                  : "text-muted-foreground/40"
                            }`}
                          >
                            {val !== undefined ? val : "—"}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}

                {game.tiebreakerResolved && (
                  <div className="text-xs text-warning-foreground opacity-90">
                    Winner by{" "}
                    {game.tiebreakerResolved.resource.charAt(0).toUpperCase() +
                      game.tiebreakerResolved.resource.slice(1)}
                    : {shortenName(game.tiebreakerResolved.winnerName)}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Notes */}
          {game.notes && (
            <>
              <div className="h-px bg-border" />
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-semibold tracking-widest text-muted-foreground uppercase">
                  Notes
                </span>
                <div className="text-sm text-muted-foreground bg-card border border-border rounded p-3 leading-relaxed">
                  {game.notes}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onDelete(game.id)
              onOpenChange(false)
            }}
          >
            Delete
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              onEdit(game)
            }}
          >
            Edit Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
