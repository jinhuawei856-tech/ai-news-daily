import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /unsubscribe?token=xxx (page) or DELETE /api/unsubscribe
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.redirect(new URL('/?unsub=invalid', req.url))

  const db = supabaseAdmin()
  await db
    .from('subscribers')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .eq('token', token)

  return NextResponse.redirect(new URL('/?unsub=done', req.url))
}
