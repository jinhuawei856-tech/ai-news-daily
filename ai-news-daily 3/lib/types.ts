export type Category = 'tool' | 'platform' | 'method' | 'copyright' | 'biz' | 'viral'
export type Impact = 'high' | 'medium' | 'low'

export interface NewsItem {
  title: string
  body: string
  category: Category
  impact: Impact
  source: string
  actionable: string
  tags: string[]
}

export interface DailyReport {
  id: string
  date: string
  items: NewsItem[]
  summary: string
  created_at: string
}

export interface Subscriber {
  id: string
  email: string
  status: 'pending' | 'active' | 'unsubscribed'
  token: string
  subscribed_at: string | null
  created_at: string
}

export const CATEGORY_CONFIG: Record<Category, { label: string; color: string; bg: string; border: string }> = {
  tool:      { label: '创作工具', color: '#0C447C', bg: '#E6F1FB', border: '#B5D4F4' },
  platform:  { label: '平台动态', color: '#085041', bg: '#E1F5EE', border: '#9FE1CB' },
  method:    { label: '创作方式', color: '#3C3489', bg: '#EEEDFE', border: '#CECBF6' },
  copyright: { label: '版权合规', color: '#712B13', bg: '#FAECE7', border: '#F5C4B3' },
  biz:       { label: '商业化', color: '#633806', bg: '#FAEEDA', border: '#FAC775' },
  viral:     { label: '全球爆款', color: '#3B6D11', bg: '#EAF3DE', border: '#C0DD97' },
}

export const IMPACT_CONFIG: Record<Impact, { label: string; color: string; bg: string }> = {
  high:   { label: '高影响', color: '#791F1F', bg: '#FCEBEB' },
  medium: { label: '中影响', color: '#633806', bg: '#FAEEDA' },
  low:    { label: '低影响', color: '#27500A', bg: '#EAF3DE' },
}
