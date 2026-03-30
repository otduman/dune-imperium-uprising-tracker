export interface TiebreakerResources {
  spice?: number
  solari?: number
  water?: number
  troops?: number
}

export interface PlayerScore {
  playerName: string
  score: number
  leader: string
  tiebreaker?: TiebreakerResources
}

export interface Game {
  id: string
  date: string
  scores: PlayerScore[]
  notes?: string
  tiebreakerResolved?: {
    resource: "spice" | "solari" | "water" | "troops"
    winnerName: string
  }
}

export interface PlayerStats {
  name: string
  gamesPlayed: number
  totalScore: number
  avgScore: number
  bestScore: number
  wins: number
  mostPlayedLeader: string
  currentStreak: number
  longestStreak: number
}

export interface LeaderStats {
  name: string
  gamesPlayed: number
  wins: number
  winRate: number
}

export const DEFAULT_PLAYERS = [
  "Duman",
  "Timur Kerimbayev",
  "Timur Muzhikbayev",
  "Yernar",
]

export const LEADERS = [
  // Uprising (base game)
  "Muad'Dib",
  "Feyd-Rautha Harkonnen",
  "Lady Margot Fenring",
  "Lady Amber Metulli",
  "Gurney Halleck",
  "Lady Jessica",
  "Princess Irulan",
  "Staban Tuek",
  "Shaddam Corrino IV",
  // Bloodlines expansion
  "Count Hasimir Fenring",
  "Gaius Helen Mohiam",
  "Kota Odax of Ix",
  "Liet Kynes",
  "Steersman Y'rkoon",
  "Esmar Tuek",
  "Piter De Vries",
  "Chani",
  "Duncan Idaho",
] as const

export const TIEBREAKER_ORDER = ["spice", "solari", "water", "troops"] as const
export type TiebreakerResource = (typeof TIEBREAKER_ORDER)[number]
