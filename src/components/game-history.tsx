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
}

function PlayerCard({ playerName, score, leader, isWinner }: PlayerCardProps) {
  const imgSrc = leader ? LEADER_IMAGES[leader] : undefined

  return (
    <div className={[
      "relative flex flex-col overflow-hidden border",
      isWinner ? "border-primary/60" : "border-border/60",
    ].join(" ")}>
      {/* Full portrait — object-contain so no cropping */}
      <div className="relative w-full aspect-[2/3] bg-black/40 overflow-hidden">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={leader}
            fill
            draggable={false}
            className="object-contain select-none"
            sizes="20vw"
          />
        ) : (
          /* No leader: show initials placeholder */
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-card/60">
            <span className="font-mono text-lg font-bold text-muted-foreground/30">
              {playerName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </span>
            <span className="font-mono text-[9px] text-muted-foreground/20 uppercase tracking-widest">
              no leader
            </span>
          </div>
        )}

        {/* Winner tint */}
        {isWinner && (
          <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
        )}

        {/* Score badge */}
        <div className={[
          "absolute bottom-1 right-1 flex items-center gap-0.5 px-1.5 py-0.5",
          isWinner ? "bg-primary text-primary-foreground" : "bg-black/70 text-white/80",
        ].join(" ")}>
          <span className="font-mono text-[11px] font-bold tabular-nums">{score}</span>
          {isWinner && (
            <div className="relative w-2.5 h-2.5 shrink-0">
              <Image src="/images/victorypoint.png" alt="VP" fill className="object-contain" sizes="10px" />
            </div>
          )}
        </div>
      </div>

      {/* Name bar */}
      <div className={[
        "px-1.5 py-1 text-[9px] font-mono font-semibold truncate text-center",
        isWinner ? "text-primary bg-primary/8" : "text-muted-foreground/60 bg-card/40",
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
    <div className="space-y-2">
      {games.map((game) => {
        const winners = getWinners(game)
        const isTB = hasTiebreaker(game)
        const sorted = [...game.scores]
          .filter((s) => s.score > 0)
          .sort((a, b) => b.score - a.score)
        const count = sorted.length
        const gridCols =
          count === 2 ? "grid-cols-2" :
          count === 3 ? "grid-cols-3" :
          "grid-cols-4"

        return (
          <button
            key={game.id}
            onClick={() => onSelectGame(game)}
            className="w-full text-left block border border-border/80 bg-card/20 transition-colors active:bg-secondary"
          >
            {/* Match header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60 bg-card/40">
              <span className="font-mono text-[10px] text-muted-foreground/50">
                {formatDate(game.date)}
              </span>
              <span className="font-mono text-[10px] font-semibold text-primary/80">
                {winners.map(shortenName).join(" & ")}
              </span>
              {isTB && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-corrino/20 text-corrino rounded-full">
                  TB
                </span>
              )}
              <span className="ml-auto text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest">
                details →
              </span>
            </div>

            {/* Player cards — gap-px gives a "panel seam" look vs leader meta's gap-3 */}
            <div className={`grid ${gridCols} gap-px bg-border/30`}>
              {sorted.map((s) => (
                <PlayerCard
                  key={s.playerName}
                  playerName={s.playerName}
                  score={s.score}
                  leader={s.leader}
                  isWinner={winners.includes(s.playerName)}
                />
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )
}
