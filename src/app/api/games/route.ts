import { NextResponse } from 'next/server'
import sql, { initDb } from '@/lib/db'
import { Game } from '@/lib/types'

export async function GET() {
  try {
    await initDb()
    const result = await sql`SELECT data FROM games ORDER BY created_at DESC, id DESC`
    const games = result.map((row) => row.data as Game)
    return NextResponse.json(games)
  } catch (error) {
    console.error('Failed to get games:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await initDb()
    const game: Game = await req.json()
    await sql`
      INSERT INTO games (id, data)
      VALUES (${game.id}, ${sql.json(game as any)})
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to insert game:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
