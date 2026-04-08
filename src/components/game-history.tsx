"use client"

import Image from "next/image"
import { Game } from "@/lib/types"
import { getWinners, hasTiebreaker, shortenName } from "@/lib/store"
import { LEADER_IMAGES } from "@/lib/leaders"

interface GameHistoryProps {
  games: Game[]
  onSelectGame: (game: Game) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

interface PlayerCardProps {
  playerName: string
  score: number
  leader: string
  isWinner: boolean
  playerCount: number
}

function PlayerCard({ playerName, score, leader, isWinner, playerCount }: PlayerCardProps) {
  const imgSrc = leader ? LEADER_IMAGES[leader] : undefined
  // portrait for 2-player, landscape for 3-4
  const aspect = playerCount === 2 ? "aspect-[2/3]" : "aspect-[3/2]"

  return (
    <div className={[
      "relative flex flex-col overflow-hidden rounded-sm border",
      isWinner ? "border-primary/50" : "border-border",
    ].join(" ")}>
      {/* Portrait */}
      <div className={`relative w-full ${aspect} bg-card overflow-hidden`}>
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={leader}
            fill
            draggable={false}
            className="object-cover select-none"
            style={{ objectPosition: "center 20%" }}
            sizes="25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20">
            <span className="font-mono text-[10px] text-muted-foreground/30 uppercase tracking-widest">
              {leader || "?"}
            </span>
          </div>
        )}

        {/* Winner glow overlay */}
        {isWinner && (
          <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
        )}

        {/* Score + VP badge */}
        <div className={[
          "absolute bottom-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5",
          isWinner ? "bg-primary text-primary-foreground" : "bg-black/70 text-white",
        ].join(" ")}>
          <span className="font-mono text-[11px] font-bold tabular-nums">{score}</span>
          {isWinner && (
            <div className="relative w-3 h-3 shrink-0">
              <Image src="/images/victorypoint.png" alt="VP" fill className="object-contain" sizes="12px" />
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <div className={[
        "px-1.5 py-1 text-[10px] font-mono font-semibold truncate",
        isWinner ? "text-primary bg-primary/5" : "text-muted-foreground",
      ].join(" ")}>
        {shortenName(playerName)}
      </div>
    </div>
  )
}

export function GameHistory({ games, onSelectGame }: GameHistoryProps) {
  if (games.length === 0) {
    return (
      <div className="border border-border py-10 text-center text-sm text-muted-foreground font-mono">
        No games yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {games.map((game) => {
        const winners = getWinners(game)
        const isTB = hasTiebreaker(game)
        const activePlayers = game.scores.filter((s) => s.score > 0)
        const sorted = [...activePlayers].sort((a, b) => b.score - a.score)
        const count = sorted.length

        // grid: 2 players → 2 cols, 3 → 3 cols, 4 → 2x2
        const gridClass =
          count === 2 ? "grid-cols-2" :
          count === 3 ? "grid-cols-3" :
          "grid-cols-2"

        return (
          <button
            key={game.id}
            onClick={() => onSelectGame(game)}
            className="w-full text-left border border-border p-3 space-y-2.5 transition-colors active:bg-secondary block"
          >
            {/* Header row */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-muted-foreground/60">
                {formatDate(game.date)}
              </span>
              {isTB && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-corrino/20 text-corrino">
                  TB
                </span>
              )}
              <span className="ml-auto text-[10px] font-mono text-muted-foreground/40">
                tap for details
              </span>
            </div>

            {/* Player cards grid */}
            <div className={`grid ${gridClass} gap-1.5`}>
              {sorted.map((s) => (
                <PlayerCard
                  key={s.playerName}
                  playerName={s.playerName}
                  score={s.score}
                  leader={s.leader}
                  isWinner={winners.includes(s.playerName)}
                  playerCount={count}
                />
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )
}
