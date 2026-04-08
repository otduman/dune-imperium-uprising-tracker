"use client"

import { Game, PlayerStats, LeaderStats } from "./types"

export function addGame(games: Game[], game: Game): Game[] {
  return [game, ...games]
}

export function deleteGame(games: Game[], gameId: string): Game[] {
  return games.filter((g) => g.id !== gameId)
}

export function updateGame(games: Game[], game: Game): Game[] {
  return games.map((g) => (g.id === game.id ? game : g))
}

export function getPlayerStats(
  games: Game[],
  players: string[]
): PlayerStats[] {
  return players
    .map((name) => {
      // games are newest-first
      const playerGames = games.filter((g) =>
        g.scores.some((s) => s.playerName === name && s.score > 0)
      )
      const scores = playerGames
        .map((g) => g.scores.find((s) => s.playerName === name)!)
        .filter(Boolean)

      const wins = playerGames.filter((g) => getWinners(g).includes(name)).length

      // Streak: playerGames is newest-first
      let currentStreak = 0
      for (const g of playerGames) {
        if (getWinners(g).includes(name)) currentStreak++
        else break
      }

      let longestStreak = 0
      let streak = 0
      for (const g of [...playerGames].reverse()) {
        if (getWinners(g).includes(name)) {
          streak++
          if (streak > longestStreak) longestStreak = streak
        } else {
          streak = 0
        }
      }

      const totalScore = scores.reduce((sum, s) => sum + s.score, 0)
      const leaders = scores.map((s) => s.leader).filter(Boolean)
      const leaderCounts = leaders.reduce(
        (acc, l) => { acc[l] = (acc[l] || 0) + 1; return acc },
        {} as Record<string, number>
      )
      const mostPlayedLeader =
        Object.entries(leaderCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "—"

      return {
        name,
        gamesPlayed: playerGames.length,
        totalScore,
        avgScore: playerGames.length > 0 ? totalScore / playerGames.length : 0,
        bestScore: scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : 0,
        wins,
        mostPlayedLeader,
        currentStreak,
        longestStreak,
      }
    })
    // Olympic sort: wins first, then avg, then total score
    .sort((a, b) => b.wins - a.wins || b.avgScore - a.avgScore || b.totalScore - a.totalScore)
}

export function getLeaderStats(games: Game[]): LeaderStats[] {
  const stats: Record<string, { gamesPlayed: number; wins: number }> = {}

  for (const game of games) {
    const winners = getWinners(game)
    for (const score of game.scores) {
      if (!score.leader || score.score === 0) continue
      if (!stats[score.leader]) stats[score.leader] = { gamesPlayed: 0, wins: 0 }
      stats[score.leader].gamesPlayed++
      if (winners.includes(score.playerName)) stats[score.leader].wins++
    }
  }

  return Object.entries(stats)
    .map(([name, s]) => ({
      name,
      gamesPlayed: s.gamesPlayed,
      wins: s.wins,
      winRate: s.gamesPlayed > 0 ? s.wins / s.gamesPlayed : 0,
    }))
    .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins || b.gamesPlayed - a.gamesPlayed)
}

export function getHeadToHead(
  games: Game[],
  playerA: string,
  allPlayers: string[]
): Record<string, { wins: number; losses: number; games: number }> {
  const result: Record<string, { wins: number; losses: number; games: number }> = {}

  for (const opponent of allPlayers) {
    if (opponent !== playerA) result[opponent] = { wins: 0, losses: 0, games: 0 }
  }

  for (const game of games) {
    const active = new Set(
      game.scores.filter((s) => s.score > 0).map((s) => s.playerName)
    )
    if (!active.has(playerA)) continue

    const winners = getWinners(game)

    for (const opponent of allPlayers) {
      if (opponent === playerA || !active.has(opponent)) continue
      result[opponent].games++
      if (winners.includes(playerA)) result[opponent].wins++
      else result[opponent].losses++
    }
  }

  return result
}

export function shortenName(name: string): string {
  const parts = name.split(" ")
  if (parts.length <= 1) return name
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`
}

export function getWinners(game: Game): string[] {
  if (game.tiebreakerResolved) return [game.tiebreakerResolved.winnerName]
  const maxScore = Math.max(...game.scores.map(s => s.score))
  return game.scores.filter(s => s.score === maxScore).map(s => s.playerName)
}

export function hasTiebreaker(game: Game): boolean {
  return !!game.tiebreakerResolved
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}
