import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TIER_LIMITS } from '@/lib/utils'
import type { SubscriptionTier } from '@/types'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')
  const crop = searchParams.get('crop')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20

  let query = supabase
    .from('harvest_batches')
    .select('*, farmer:farmers(full_name, state, lga, whatsapp_number)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (status) query = query.eq('status', status)
  if (crop) query = query.eq('crop_type', crop)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ batches: data, total: count, page, limit })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: aggregator } = await supabase
    .from('aggregators')
    .select('id, subscription_tier, monthly_batch_count')
    .eq('user_id', user.id)
    .single()

  if (!aggregator) return NextResponse.json({ error: 'Aggregator not found' }, { status: 404 })

  const limit = TIER_LIMITS[aggregator.subscription_tier as SubscriptionTier]
  if (aggregator.monthly_batch_count >= limit) {
    return NextResponse.json({
      error: 'Monthly batch limit reached. Please upgrade your subscription.',
      code: 'TIER_LIMIT_EXCEEDED',
    }, { status: 402 })
  }

  const body = await request.json()
  const { data, error } = await supabase.from('harvest_batches').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Increment monthly counter
  await supabase.from('aggregators')
    .update({ monthly_batch_count: aggregator.monthly_batch_count + 1 })
    .eq('id', aggregator.id)

  return NextResponse.json(data, { status: 201 })
}
