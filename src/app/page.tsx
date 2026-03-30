"use client"

import { useState, useEffect, useCallback } from "react"
import { ShaderAnimation } from "@/components/ui/shader-animation"
import { Button } from "@/components/ui/button"
import { StandingsTable } from "@/components/standings-table"
import { GameHistory } from "@/components/game-history"
import { AddGameDialog } from "@/components/add-game-dialog"
import { GameDetailDialog } from "@/components/game-detail-dialog"
import { ManagePlayersDialog } from "@/components/manage-players-dialog"
import { PlayerProfileDialog } from "@/components/player-profile-dialog"
import { Game } from "@/lib/types"
import {
  loadGames,
  loadPlayers,
  savePlayers,
  addGame,
  deleteGame,
  updateGame,
  getPlayerStats,
} from "@/lib/store"
import { Plus, Users } from "lucide-react"

export default function Home() {
  const [games, setGames] = useState<Game[]>([])
  const [players, setPlayers] = useState<string[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [playersOpen, setPlayersOpen] = useState(false)
  const [detailGame, setDetailGame] = useState<Game | null>(null)
  const [editGame, setEditGame] = useState<Game | null>(null)
  const [profilePlayer, setProfilePlayer] = useState<string | null>(null)

  useEffect(() => {
    setGames(loadGames())
    setPlayers(loadPlayers())
  }, [])

  const stats = getPlayerStats(games, players)

  const handlePlayersChange = useCallback((newPlayers: string[]) => {
    setPlayers(newPlayers)
    savePlayers(newPlayers)
  }, [])

  const handleSaveGame = useCallback(
    (game: Game) => {
      setGames((prev) =>
        editGame ? updateGame(prev, game) : addGame(prev, game)
      )
      setEditGame(null)
    },
    [editGame]
  )

  const handleDeleteGame = useCallback((gameId: string) => {
    setGames((prev) => deleteGame(prev, gameId))
  }, [])

  const handleEditFromDetail = useCallback((game: Game) => {
    setEditGame(game)
    setAddOpen(true)
  }, [])

  return (
    <main className="relative min-h-screen flex flex-col">
      <ShaderAnimation />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
            {/* Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-mono text-[13px] font-semibold tracking-wide text-foreground whitespace-nowrap">
                DUNE: IMPERIUM
              </span>
              <span className="text-border text-sm">·</span>
              <span className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase">
                S01
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPlayersOpen(true)}
                title="Manage players"
              >
                <Users className="size-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditGame(null)
                  setAddOpen(true)
                }}
              >
                <Plus className="size-4" />
                New Game
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-8 pb-16">

          {/* Standings */}
          <section className="space-y-3">
            <h2 className="text-[10px] font-mono font-semibold tracking-[0.2em] text-muted-foreground/60 uppercase">
              Standings
            </h2>
            <StandingsTable stats={stats} onSelectPlayer={setProfilePlayer} />
          </section>

          {/* History */}
          <section className="space-y-3">
            <h2 className="text-[10px] font-mono font-semibold tracking-[0.2em] text-muted-foreground/60 uppercase">
              Game History
            </h2>
            <GameHistory
              games={games}
              onSelectGame={setDetailGame}
            />
          </section>
        </div>
      </div>

      {/* Dialogs */}
      <AddGameDialog
        key={editGame?.id ?? "new"}
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) setEditGame(null)
        }}
        onSave={handleSaveGame}
        editGame={editGame}
        players={players}
      />

      <GameDetailDialog
        game={detailGame}
        open={!!detailGame}
        onOpenChange={(open) => { if (!open) setDetailGame(null) }}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteGame}
      />

      <ManagePlayersDialog
        open={playersOpen}
        onOpenChange={setPlayersOpen}
        players={players}
        onPlayersChange={handlePlayersChange}
      />

      <PlayerProfileDialog
        player={profilePlayer}
        open={!!profilePlayer}
        onOpenChange={(open) => { if (!open) setProfilePlayer(null) }}
        stats={stats.find((s) => s.name === profilePlayer) ?? null}
        games={games}
      />
    </main>
  )
}
