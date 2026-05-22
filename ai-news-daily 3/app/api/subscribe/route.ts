import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendConfirmEmail } from '@/lib/email'

// POST /api/subscribe — submit email
export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: '请输入有效邮箱' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { data: existing } = await db
    .from('subscribers')
    .select('status, token')
    .eq('email', email)
    .single()

  if (existing?.status === 'active') {
    return NextResponse.json({ message: '该邮箱已在订阅列表中' })
  }

  // Upsert subscriber (reset to pending if previously unsubscribed)
  const { data, error } = await db
    .from('subscribers')
    .upsert({ email, status: 'pending' }, { onConflict: 'email' })
    .select('token')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: '订阅失败，请稍后重试' }, { status: 500 })
  }

  await sendConfirmEmail(email, data.token)
  return NextResponse.json({ message: '确认邮件已发送，请查收邮箱' })
}
