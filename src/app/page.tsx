"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { ShaderAnimation } from "@/components/ui/shader-animation"
import { Button } from "@/components/ui/button"
import { StandingsTable } from "@/components/standings-table"
import { GameHistory } from "@/components/game-history"
import { LeaderMeta } from "@/components/leader-meta"
import { AddGameDialog } from "@/components/add-game-dialog"
import { GameDetailDialog } from "@/components/game-detail-dialog"
import { ManagePlayersDialog } from "@/components/manage-players-dialog"
import { PlayerProfileDialog } from "@/components/player-profile-dialog"
import { Game } from "@/lib/types"
import {
  addGame,
  deleteGame,
  updateGame,
  getPlayerStats,
  getLeaderStats,
} from "@/lib/store"
import {
  fetchGamesApi,
  fetchPlayersApi,
  createGameApi,
  updateGameApi,
  deleteGameApi,
  updatePlayersApi,
} from "@/lib/api"
import { Plus, Users, Loader2, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [games, setGames] = useState<Game[]>([])
  const [players, setPlayers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [playersOpen, setPlayersOpen] = useState(false)
  const [detailGame, setDetailGame] = useState<Game | null>(null)
  const [editGame, setEditGame] = useState<Game | null>(null)
  const [profilePlayer, setProfilePlayer] = useState<string | null>(null)
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedGames, fetchedPlayers] = await Promise.all([
          fetchGamesApi(),
          fetchPlayersApi()
        ])
        setGames(fetchedGames)
        if (fetchedPlayers && fetchedPlayers.length > 0) setPlayers(fetchedPlayers)
      } catch (err) {
        console.error("Failed to load data", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const stats = useMemo(() => getPlayerStats(games, players), [games, players])
  const previousStats = useMemo(() => {
    if (games.length < 1) return undefined
    return getPlayerStats(games.slice(1), players)
  }, [games, players])
  const leaderStats = useMemo(() => getLeaderStats(games), [games])

  const handlePlayersChange = useCallback((newPlayers: string[]) => {
    setPlayers(newPlayers)
    updatePlayersApi(newPlayers).catch(console.error)
  }, [])

  const handleSaveGame = useCallback(
    (game: Game) => {
      setGames((prev) =>
        editGame ? updateGame(prev, game) : addGame(prev, game)
      )

      const apiCall = editGame ? updateGameApi(game) : createGameApi(game)
      apiCall.catch(console.error)

      setEditGame(null)
    },
    [editGame]
  )

  const handleDeleteGame = useCallback((gameId: string) => {
    setGames((prev) => deleteGame(prev, gameId))
    deleteGameApi(gameId).catch(console.error)
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
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-mono text-[13px] font-semibold tracking-wide text-foreground whitespace-nowrap">
                DUNE: IMPERIUM - Uprising
              </span>
              <span className="text-border text-sm">·</span>
              <span className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase">
                S01
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="size-4" />
              </Button>
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
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <Loader2 className="size-6 animate-spin text-muted-foreground/60" />
          </div>
        ) : (
          <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-8 pb-16">

            <section className="space-y-3">
              <h2 className="text-[10px] font-mono font-semibold tracking-[0.2em] text-muted-foreground/60 uppercase">
                Standings
              </h2>
              <StandingsTable stats={stats} previousStats={previousStats} onSelectPlayer={setProfilePlayer} />
            </section>

            <section className="space-y-3">
              <h2 className="text-[10px] font-mono font-semibold tracking-[0.2em] text-muted-foreground/60 uppercase">
                Game History
              </h2>
              <GameHistory games={games} onSelectGame={setDetailGame} />
            </section>

            <section className="space-y-3">
              <h2 className="text-[10px] font-mono font-semibold tracking-[0.2em] text-muted-foreground/60 uppercase">
                Leader Meta
              </h2>
              <LeaderMeta stats={leaderStats} />
            </section>

          </div>
        )}
      </div>

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
        players={players}
      />
    </main>
  )
}
