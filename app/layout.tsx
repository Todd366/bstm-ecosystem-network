import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BSTM Network v3 — Live',
  description: '127 nodes · full CRUD · Supabase realtime',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#04040d', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}
