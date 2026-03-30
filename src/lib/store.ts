"use client"

import { Game, PlayerStats, DEFAULT_PLAYERS } from "./types"

const STORAGE_KEY = "dune-uprising-tracker"
const PLAYERS_KEY = "dune-uprising-players"


export function loadGames(): Game[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveGames(games: Game[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
}

export function loadPlayers(): string[] {
  if (typeof window === "undefined") return DEFAULT_PLAYERS
  try {
    const data = localStorage.getItem(PLAYERS_KEY)
    return data ? JSON.parse(data) : DEFAULT_PLAYERS
  } catch {
    return DEFAULT_PLAYERS
  }
}

export function savePlayers(players: string[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players))
}

export function addGame(games: Game[], game: Game): Game[] {
  const updated = [game, ...games]
  saveGames(updated)
  return updated
}

export function deleteGame(games: Game[], gameId: string): Game[] {
  const updated = games.filter((g) => g.id !== gameId)
  saveGames(updated)
  return updated
}

export function updateGame(games: Game[], game: Game): Game[] {
  const updated = games.map((g) => (g.id === game.id ? game : g))
  saveGames(updated)
  return updated
}

export function getPlayerStats(
  games: Game[],
  players: string[]
): PlayerStats[] {
  return players
    .map((name) => {
      const playerGames = games.filter((g) =>
        g.scores.some((s) => s.playerName === name)
      )
      const scores = playerGames
        .map((g) => g.scores.find((s) => s.playerName === name)!)
        .filter(Boolean)

      const wins = games.filter((g) => {
        if (g.tiebreakerResolved?.winnerName === name) return true
        const sorted = [...g.scores].sort((a, b) => b.score - a.score)
        if (
          sorted[0]?.playerName === name &&
          !g.tiebreakerResolved
        )
          return true
        return false
      }).length

      const totalScore = scores.reduce((sum, s) => sum + s.score, 0)
      const leaders = scores.map((s) => s.leader).filter(Boolean)
      const leaderCounts = leaders.reduce(
        (acc, l) => {
          acc[l] = (acc[l] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )
      const mostPlayedLeader =
        Object.entries(leaderCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        "—"

      return {
        name,
        gamesPlayed: playerGames.length,
        totalScore,
        avgScore: playerGames.length > 0 ? totalScore / playerGames.length : 0,
        bestScore:
          scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : 0,
        wins,
        mostPlayedLeader,
      }
    })
    .sort((a, b) => b.totalScore - a.totalScore)
}

export function shortenName(name: string): string {
  const parts = name.split(" ")
  if (parts.length <= 1) return name
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`
}

export function getWinner(game: Game): string {
  if (game.tiebreakerResolved) return game.tiebreakerResolved.winnerName
  const sorted = [...game.scores].sort((a, b) => b.score - a.score)
  return sorted[0]?.playerName || ""
}

export function hasTiebreaker(game: Game): boolean {
  return !!game.tiebreakerResolved
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}
