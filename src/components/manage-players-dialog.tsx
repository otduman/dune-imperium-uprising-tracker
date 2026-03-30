"use client"

import { useState } from "react"
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

interface ManagePlayersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  players: string[]
  onPlayersChange: (players: string[]) => void
}

export function ManagePlayersDialog({
  open,
  onOpenChange,
  players,
  onPlayersChange,
}: ManagePlayersDialogProps) {
  const [newName, setNewName] = useState("")

  const handleAdd = () => {
    const trimmed = newName.trim()
    if (!trimmed || players.includes(trimmed)) return
    onPlayersChange([...players, trimmed])
    setNewName("")
  }

  const handleRemove = (name: string) => {
    onPlayersChange(players.filter((p) => p !== name))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg">
            Manage Players
          </DialogTitle>
          <DialogDescription>
            Add or remove players from the league.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new player */}
          <div className="space-y-1.5">
            <Label className="text-sm">New Player</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="font-mono bg-background border-input flex-1"
              />
              <Button onClick={handleAdd} disabled={!newName.trim()}>
                Add
              </Button>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Player list */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono font-semibold tracking-widest text-muted-foreground uppercase">
              Current Players
            </span>
            <div className="space-y-2">
              {players.map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between px-3 py-2.5 rounded border border-border"
                >
                  <span className="font-mono text-sm">{name}</span>
                  <button
                    onClick={() => handleRemove(name)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {players.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No players added yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
