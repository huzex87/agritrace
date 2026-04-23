import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = request.nextUrl
  const commodity = searchParams.get('commodity')
  const days = parseInt(searchParams.get('days') ?? '7')

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  let query = supabase
    .from('market_prices')
    .select('*')
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: false })

  if (commodity) query = query.eq('commodity', commodity)

  const { data, error } = await query.limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data: aggregator } = await supabase.from('aggregators').select('id').eq('user_id', user.id).single()

  const { data, error } = await supabase.from('market_prices').insert({
    ...body,
    submitted_by: aggregator?.id,
    source: 'crowdsourced',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
