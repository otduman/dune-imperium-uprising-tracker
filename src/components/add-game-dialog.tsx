"use client"

import { useState, useMemo, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Game,
  PlayerScore,
  LEADERS,
  TIEBREAKER_ORDER,
  TiebreakerResources,
  TiebreakerResource,
} from "@/lib/types"
import { generateId, shortenName } from "@/lib/store"
import { cn } from "@/lib/utils"
import { ResourceIcon } from "@/components/ui/resource-icon"

interface AddGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (game: Game) => void
  editGame?: Game | null
  players: string[]
}

export function AddGameDialog({
  open,
  onOpenChange,
  onSave,
  editGame,
  players,
}: AddGameDialogProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(() => {
    if (editGame) return new Set(editGame.scores.map((s) => s.playerName))
    return new Set(players)
  })

  const [date, setDate] = useState(
    editGame?.date || new Date().toISOString().split("T")[0]
  )

  const [scores, setScores] = useState<
    Record<string, { score: string; leader: string }>
  >(() => {
    const initial: Record<string, { score: string; leader: string }> = {}
    players.forEach((p) => {
      const existing = editGame?.scores.find((s) => s.playerName === p)
      initial[p] = {
        score: existing ? String(existing.score) : "",
        leader: existing?.leader || "",
      }
    })
    return initial
  })

  const [notes, setNotes] = useState(editGame?.notes || "")

  const [tbValues, setTbValues] = useState<Record<string, TiebreakerResources>>(
    () => {
      const initial: Record<string, TiebreakerResources> = {}
      if (editGame) {
        editGame.scores.forEach((s) => {
          if (s.tiebreaker) initial[s.playerName] = { ...s.tiebreaker }
        })
      }
      return initial
    }
  )

  const formRef = useRef<HTMLDivElement>(null)

  const activePlayers = useMemo(
    () => players.filter((p) => selectedPlayers.has(p)),
    [players, selectedPlayers]
  )

  const togglePlayer = (player: string) => {
    setSelectedPlayers((prev) => {
      const next = new Set(prev)
      if (next.has(player)) next.delete(player)
      else next.add(player)
      return next
    })
  }

  // Advance focus to the next input or select trigger in the form
  const advanceFocus = (currentEl: HTMLElement) => {
    if (!formRef.current) return
    const focusable = Array.from(
      formRef.current.querySelectorAll<HTMLElement>(
        'input[data-slot="input"], button[data-slot="select-trigger"]'
      )
    )
    const idx = focusable.indexOf(currentEl)
    if (idx >= 0 && idx < focusable.length - 1) {
      focusable[idx + 1].focus()
    }
  }

  const tiedPlayers = useMemo(() => {
    const parsed = activePlayers
      .map((p) => ({ name: p, score: parseInt(scores[p]?.score) || 0 }))
      .filter((p) => p.score > 0)
    if (parsed.length < 2) return []
    const maxScore = Math.max(...parsed.map((p) => p.score))
    const tied = parsed.filter((p) => p.score === maxScore)
    return tied.length >= 2 ? tied : []
  }, [scores, activePlayers])

  const tbWinner = useMemo((): {
    resource: TiebreakerResource
    winnerName: string
  } | null => {
    if (tiedPlayers.length === 0) return null
    for (const resource of TIEBREAKER_ORDER) {
      const entries = tiedPlayers.map((p) => ({
        name: p.name,
        value: tbValues[p.name]?.[resource],
      }))
      const allFilled = entries.every((e) => e.value !== undefined)
      if (!allFilled) return null
      const maxVal = Math.max(...entries.map((e) => e.value!))
      const winners = entries.filter((e) => e.value === maxVal)
      if (winners.length === 1) return { resource, winnerName: winners[0].name }
    }
    return null
  }, [tiedPlayers, tbValues])

  const shownResources = useMemo((): TiebreakerResource[] => {
    if (tiedPlayers.length === 0) return []
    const result: TiebreakerResource[] = []
    for (const resource of TIEBREAKER_ORDER) {
      result.push(resource)
      const entries = tiedPlayers.map((p) => ({
        value: tbValues[p.name]?.[resource],
      }))
      const allFilled = entries.every((e) => e.value !== undefined)
      if (!allFilled) break
      const maxVal = Math.max(...entries.map((e) => e.value!))
      const winners = entries.filter((e) => e.value === maxVal)
      if (winners.length === 1) break
    }
    return result
  }, [tiedPlayers, tbValues])

  const handleSave = () => {
    const playerScores: PlayerScore[] = activePlayers.map((p) => ({
      playerName: p,
      score: parseInt(scores[p]?.score) || 0,
      leader: scores[p]?.leader || "",
      tiebreaker: tbValues[p] || undefined,
    }))

    const game: Game = {
      id: editGame?.id || generateId(),
      date,
      scores: playerScores,
      notes: notes || undefined,
      tiebreakerResolved: tbWinner || undefined,
    }

    onSave(game)
    onOpenChange(false)
  }

  const updateTbValue = (
    player: string,
    resource: TiebreakerResource,
    value: string
  ) => {
    setTbValues((prev) => ({
      ...prev,
      [player]: {
        ...prev[player],
        [resource]: value === "" ? undefined : parseInt(value) || 0,
      },
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg">
            {editGame ? "Edit Game" : "Add New Game"}
          </DialogTitle>
          <DialogDescription>
            Record a game session with scores and leaders.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5" ref={formRef}>
          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-sm font-mono">Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="font-mono bg-background border-input"
            />
          </div>

          <div className="h-px bg-border" />

          {/* Player selection */}
          <div className="space-y-2">
            <Label className="text-xs font-mono text-muted-foreground">
              Who played?
            </Label>
            <div className="flex flex-wrap gap-2">
              {players.map((player) => (
                <button
                  key={player}
                  type="button"
                  onClick={() => togglePlayer(player)}
                  className={cn(
                    "px-3 py-1 text-xs font-mono rounded-full border transition-colors",
                    selectedPlayers.has(player)
                      ? "bg-primary/10 text-primary border-primary/40"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {shortenName(player)}
                </button>
              ))}
            </div>
          </div>

          {activePlayers.length > 0 && <div className="h-px bg-border" />}

          {/* Score rows */}
          {activePlayers.map((player) => (
            <div key={player} className="space-y-2.5">
              <span className="text-sm font-mono font-semibold">{player}</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-mono">
                    Score
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    value={scores[player]?.score || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "")
                      setScores((prev) => ({
                        ...prev,
                        [player]: { ...prev[player], score: val },
                      }))
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        advanceFocus(e.currentTarget)
                      }
                    }}
                    className="font-mono bg-background border-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-mono">
                    Leader
                  </Label>
                  <Select
                    value={scores[player]?.leader || ""}
                    onValueChange={(val) => {
                      setScores((prev) => ({
                        ...prev,
                        [player]: { ...prev[player], leader: val ?? "" },
                      }))
                      // advance to next player's score input
                      setTimeout(() => {
                        const trigger = formRef.current?.querySelector(
                          `button[data-player-trigger="${player}"]`
                        ) as HTMLElement | null
                        if (trigger) advanceFocus(trigger)
                      }, 50)
                    }}
                  >
                    <SelectTrigger
                      className="w-full"
                      data-player-trigger={player}
                    >
                      <SelectValue placeholder="Leader" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEADERS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          {/* Tiebreaker */}
          {tiedPlayers.length >= 2 && (
            <>
              <div className="h-px bg-border" />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-warning text-warning-foreground">
                    TIEBREAKER
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {tiedPlayers.map((p) => p.name.split(" ")[0]).join(" & ")}{" "}
                    tied at {tiedPlayers[0].score}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground/70 font-mono">
                  Enter resources in order until tie is broken.
                </p>

                {shownResources.map((resource) => {
                  const entries = tiedPlayers.map((p) => ({
                    name: p.name,
                    value: tbValues[p.name]?.[resource],
                  }))
                  const allFilled = entries.every((e) => e.value !== undefined)
                  const isResolved =
                    allFilled &&
                    (() => {
                      const maxVal = Math.max(...entries.map((e) => e.value!))
                      return (
                        entries.filter((e) => e.value === maxVal).length === 1
                      )
                    })()
                  const resolvedWinner = isResolved
                    ? entries.reduce((a, b) =>
                        (a.value ?? 0) > (b.value ?? 0) ? a : b
                      ).name
                    : null

                  return (
                    <div key={resource} className="space-y-2">
                      <div className="flex items-center mb-1">
                        <ResourceIcon 
                          type={resource} 
                          size="sm" 
                          label={`${TIEBREAKER_ORDER.indexOf(resource) + 1}. ${resource}`} 
                          className="text-warning-foreground capitalize" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {tiedPlayers.map((p) => {
                          const isWinner = resolvedWinner === p.name
                          return (
                            <div key={p.name} className="space-y-1">
                              <span className="text-[11px] text-muted-foreground font-mono">
                                {p.name.split(" ")[0]}
                              </span>
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="0"
                                value={tbValues[p.name]?.[resource] ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "")
                                  updateTbValue(p.name, resource, val)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    advanceFocus(e.currentTarget)
                                  }
                                }}
                                className={cn(
                                  "font-mono h-9 bg-background",
                                  isWinner
                                    ? "border-primary text-primary font-semibold"
                                    : "border-input"
                                )}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {tbWinner ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-atreides/60 text-emerald-300">
                      Resolved
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {tbWinner.winnerName.split(" ")[0]} wins (
                      {tbWinner.resource})
                    </span>
                  </div>
                ) : shownResources.length === 4 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-fremen/20 text-fremen">
                      Shared Victory
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      Unbreakable tie
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-sm font-mono">Notes (optional)</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add game notes..."
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={activePlayers.length === 0}>
            {editGame ? "Update" : "Save Game"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
