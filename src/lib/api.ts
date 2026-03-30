import { Game } from "./types"

export async function fetchGamesApi(): Promise<Game[]> {
  const res = await fetch("/api/games")
  if (!res.ok) throw new Error("Failed to fetch games")
  return res.json()
}

export async function createGameApi(game: Game): Promise<void> {
  const res = await fetch("/api/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game),
  })
  if (!res.ok) throw new Error("Failed to create game")
}

export async function updateGameApi(game: Game): Promise<void> {
  const res = await fetch(`/api/games/${game.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game),
  })
  if (!res.ok) throw new Error("Failed to update game")
}

export async function deleteGameApi(id: string): Promise<void> {
  const res = await fetch(`/api/games/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete game")
}

export async function fetchPlayersApi(): Promise<string[]> {
  const res = await fetch("/api/players")
  if (!res.ok) throw new Error("Failed to fetch players")
  return res.json()
}

export async function updatePlayersApi(names: string[]): Promise<void> {
  const res = await fetch("/api/players", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(names),
  })
  if (!res.ok) throw new Error("Failed to update players")
}
