import { NextResponse } from 'next/server'
import sql, { initDb } from '@/lib/db'
import { Game } from '@/lib/types'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await initDb()
    const game: Game = await req.json()
    await sql`
      UPDATE games
      SET data = ${sql.json(game as any)}
      WHERE id = ${id}
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update game:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await initDb()
    await sql`
      DELETE FROM games WHERE id = ${id}
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete game:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
