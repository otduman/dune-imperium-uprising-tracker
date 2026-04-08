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

  // Players who tied on score (whether they won TB or not)
  const tiedOnScore = sortedScores.filter((s) => s.score === maxScore)
  const isTiedGame = isTB && tiedOnScore.length > 1

  // For tiebreaker breakdown
  const tiedPlayers = isTiedGame ? tiedOnScore : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="font-mono text-base">
              {new Date(game.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </DialogTitle>
            <div className="flex items-center gap-1.5 shrink-0">
              {isTB && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-warning text-warning-foreground rounded-full">
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
            </div>
          </div>
          <DialogDescription className="font-mono text-xs">
            {sortedScores.length} players · Season 01
          </DialogDescription>
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
              if (isWinner) {
                borderClass = "border-primary/40"
                bgClass = "bg-primary/5"
                nameClass = "text-primary"
              } else if (isTiedLoser) {
                borderClass = "border-warning/40"
                bgClass = "bg-warning/5"
                nameClass = "text-warning-foreground"
              }

              return (
                <div
                  key={s.playerName}
                  className={`flex items-stretch border ${borderClass} ${bgClass} overflow-hidden`}
                >
                  {/* Leader portrait — uncropped */}
                  <div className="w-12 shrink-0 bg-black/30 overflow-hidden">
                    {imgSrc ? (
                      <div className="relative w-full h-full min-h-[64px]">
                        <Image
                          src={imgSrc}
                          alt={s.leader}
                          fill
                          draggable={false}
                          className="object-contain object-top select-none"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="w-full min-h-[64px] flex items-center justify-center">
                        <span className="font-mono text-[10px] text-muted-foreground/20">
                          {s.playerName[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name + leader */}
                  <div className="flex-1 flex flex-col justify-center px-3 py-3 min-w-0">
                    <span className={`font-mono text-sm font-semibold truncate ${nameClass}`}>
                      {shortenName(s.playerName)}
                    </span>
                    {s.leader ? (
                      <span className="font-mono text-[10px] text-muted-foreground/60 truncate mt-0.5">
                        {s.leader}
                      </span>
                    ) : null}
                    {isTiedLoser && (
                      <span className="font-mono text-[9px] text-warning/60 mt-0.5">tied · lost TB</span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="flex items-center px-4">
                    <span className={`font-mono text-xl font-bold tabular-nums ${isWinner ? "text-primary" : isTiedLoser ? "text-warning-foreground/70" : "text-muted-foreground/60"}`}>
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

                {/* Column headers */}
                <div className="flex items-center gap-2 px-2">
                  <div className="flex-1 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Player</div>
                  {TIEBREAKER_ORDER.map((r) => (
                    <div key={r} className="w-12 flex justify-center">
                      <ResourceIcon type={r} size="sm" />
                    </div>
                  ))}
                </div>

                {/* Tied player rows */}
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
                        const isDecidingResource = game.tiebreakerResolved?.resource === r
                        const isThisWinner = isDecidingResource && s.playerName === game.tiebreakerResolved?.winnerName
                        return (
                          <div
                            key={r}
                            className={`w-12 text-center font-mono text-sm tabular-nums ${
                              isThisWinner
                                ? "text-primary font-bold"
                                : val !== undefined
                                  ? "text-foreground/70"
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

                {/* Winner by line */}
                {game.tiebreakerResolved && (
                  <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground/60">
                    <span>Winner by</span>
                    <ResourceIcon type={game.tiebreakerResolved.resource} size="sm" />
                    <span className="text-muted-foreground/40">–</span>
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
