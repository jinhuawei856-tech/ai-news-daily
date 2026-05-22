import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/subscribe/confirm?token=xxx
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.redirect(new URL('/?sub=invalid', req.url))

  const db = supabaseAdmin()
  const { error } = await db
    .from('subscribers')
    .update({ status: 'active', subscribed_at: new Date().toISOString() })
    .eq('token', token)
    .eq('status', 'pending')

  if (error) return NextResponse.redirect(new URL('/?sub=error', req.url))
  return NextResponse.redirect(new URL('/?sub=confirmed', req.url))
}
