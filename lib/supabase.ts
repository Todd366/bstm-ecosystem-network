import { createClient } from '@supabase/supabase-js'

const SUPA_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? 'https://jeyneeetujvudwyovdzd.supabase.co'
const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpleW5lZWV0dWp2dWR3eW92ZHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjc4OTQsImV4cCI6MjA4ODg0Mzg5NH0.THSZCPRmx-4TVDAyuqerWWNwtk7mniKuv9dQtpkFoM8'

export const supabase = createClient(SUPA_URL, SUPA_ANON)

export type NodeStatus = 'green' | 'yellow' | 'red'
export type NodeType   = 'sovereign'|'trust'|'foundation'|'org'|'company'|'dept'|'room'

export interface EcoNode {
  id:          string
  name:        string
  type:        NodeType
  parent_name: string | null
  status:      NodeStatus
  users:       number
  revenue:     number
  thb_burn:    number
  url:         string | null
  notes:       string | null
  last_update: string
}
