import { NextResponse } from 'next/server'
import sql, { initDb } from '@/lib/db'

export async function GET() {
  try {
    await initDb()
    const result = await sql`SELECT names FROM players WHERE id = 1`
    // Filter out potential null row or empty result issue
    let names: string[] = []
    if (result.length > 0 && Array.isArray(result[0].names)) {
      names = result[0].names
    }
    return NextResponse.json(names)
  } catch (error) {
    console.error('Failed to get players:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await initDb()
    const names: string[] = await req.json()
    await sql`
      UPDATE players
      SET names = ${sql.json(names)}
      WHERE id = 1
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update players:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
