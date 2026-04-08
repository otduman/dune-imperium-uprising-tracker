"use client"

import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Game, TIEBREAKER_ORDER } from "@/lib/types"
import { getWinners, hasTiebreaker, shortenName } from "@/lib/store"
import { ResourceIcon } from "@/components/ui/resource-icon"
import { LEADER_IMAGES } from "@/lib/leaders"
import { Pencil, Trash2 } from "lucide-react"

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

  const winners = getWinners(game)
  const isTB = hasTiebreaker(game)
  const sortedScores = [...game.scores]
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)

  const maxScore = sortedScores[0]?.score ?? 0
  const tiedOnScore = sortedScores.filter((s) => s.score === maxScore)
  const isTiedGame = isTB && tiedOnScore.length > 1
  const tiedPlayers = isTiedGame ? tiedOnScore : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="bg-background border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 pr-1">
            <div className="flex-1 min-w-0">
              <DialogTitle className="font-mono text-base">
                {new Date(game.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs mt-0.5">
                {sortedScores.length} players · Season 01
              </DialogDescription>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              {isTB && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-warning text-warning-foreground rounded-full mr-1">
                  TB
                </span>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => { onOpenChange(false); onEdit(game) }}
                title="Edit game"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                onClick={() => { onDelete(game.id); onOpenChange(false) }}
                title="Delete game"
              >
                <Trash2 className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
                title="Close"
              >
                <span className="text-base leading-none text-muted-foreground">×</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Score rows */}
          <div className="space-y-2">
            {sortedScores.map((s) => {
              const isWinner = winners.includes(s.playerName)
              const isTiedLoser = isTiedGame && tiedOnScore.some(t => t.playerName === s.playerName) && !isWinner
              const imgSrc = s.leader ? LEADER_IMAGES[s.leader] : undefined

              let borderClass = "border-border"
              let bgClass = ""
              let nameClass = "text-foreground"
              let scoreClass = "text-muted-foreground/60"
              if (isWinner) {
                borderClass = "border-primary/40"
                bgClass = "bg-primary/5"
                nameClass = "text-primary"
                scoreClass = "text-primary"
              } else if (isTiedLoser) {
                borderClass = "border-warning/40"
                bgClass = "bg-warning/5"
                nameClass = "text-warning-foreground/80"
                scoreClass = "text-warning-foreground/60"
              }

              return (
                <div
                  key={s.playerName}
                  className={`flex items-center border ${borderClass} ${bgClass} overflow-hidden`}
                >
                  {/* Leader portrait — fixed px, padded to match text column */}
                  <div className="pl-4 py-3 shrink-0">
                    {imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt={s.leader}
                        width={48}
                        height={72}
                        draggable={false}
                        className="select-none object-cover"
                      />
                    ) : (
                      <div className="w-12 h-[72px] flex items-center justify-center bg-black/20">
                        <span className="font-mono text-[10px] text-muted-foreground/20">{s.playerName[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Name + leader */}
                  <div className="flex-1 flex flex-col justify-center px-4 py-3 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`font-mono text-sm font-semibold truncate ${nameClass}`}>
                        {shortenName(s.playerName)}
                      </span>
                      {isWinner && (
                        <div className="relative w-3.5 h-3.5 shrink-0">
                          <Image src="/images/victorypoint.png" alt="VP" fill className="object-contain" sizes="14px" />
                        </div>
                      )}
                    </div>
                    {s.leader && (
                      <span className="font-mono text-[10px] text-muted-foreground/50 truncate mt-0.5">
                        {s.leader}
                      </span>
                    )}
                    {isTiedLoser && (
                      <span className="font-mono text-[9px] text-warning/50 mt-0.5">tied · lost TB</span>
                    )}
                  </div>

                  {/* Score only */}
                  <div className="flex items-center px-4">
                    <span className={`font-mono text-xl font-bold tabular-nums ${scoreClass}`}>
                      {s.score}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tiebreaker breakdown */}
          {isTiedGame && tiedPlayers.length > 0 && (
            <>
              <div className="h-px bg-border" />
              <div className="space-y-3">
                <div className="font-mono text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase">
                  Tiebreaker
                </div>

                <div className="flex items-center gap-2 px-2">
                  <div className="flex-1 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Player</div>
                  {TIEBREAKER_ORDER.map((r) => (
                    <div key={r} className="w-12 flex justify-center">
                      <ResourceIcon type={r} size="sm" />
                    </div>
                  ))}
                </div>

                {tiedPlayers.map((s) => {
                  const isWinner = winners.includes(s.playerName)
                  return (
                    <div
                      key={s.playerName}
                      className={`flex items-center gap-2 px-2 py-2.5 border ${
                        isWinner ? "bg-primary/5 border-primary/20" : "bg-warning/5 border-warning/20"
                      }`}
                    >
                      <div className={`flex-1 font-mono text-xs font-semibold truncate ${isWinner ? "text-primary" : "text-warning-foreground/80"}`}>
                        {shortenName(s.playerName)}
                      </div>
                      {TIEBREAKER_ORDER.map((r) => {
                        const val = s.tiebreaker?.[r]
                        const isDeciding = game.tiebreakerResolved?.resource === r
                        const isThisWinner = isDeciding && s.playerName === game.tiebreakerResolved?.winnerName
                        return (
                          <div
                            key={r}
                            className={`w-12 text-center font-mono text-sm tabular-nums ${
                              isThisWinner ? "text-primary font-bold"
                              : val !== undefined ? "text-foreground/70"
                              : "text-muted-foreground/20"
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
                  <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground/60">
                    <span>Winner by</span>
                    <ResourceIcon type={game.tiebreakerResolved.resource} size="sm" />
                    <span className="text-muted-foreground/30">–</span>
                    <span className="font-semibold text-foreground/80">
                      {shortenName(game.tiebreakerResolved.winnerName)}
                    </span>
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
                <div className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
                  Notes
                </div>
                <div className="text-sm font-mono text-muted-foreground/70 bg-card/40 border border-border p-3 leading-relaxed">
                  {game.notes}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
