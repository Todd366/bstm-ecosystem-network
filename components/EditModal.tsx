'use client'
import { useState, useEffect } from 'react'
import { supabase, type EcoNode, type NodeType, type NodeStatus } from '../lib/supabase'

const TYPES: NodeType[]    = ['sovereign','trust','foundation','org','company','dept','room']
const STATUSES: NodeStatus[] = ['green','yellow','red']
const SC: Record<string,string> = { green:'#22c55e', yellow:'#eab308', red:'#ef4444' }

export default function EditModal({
  node, onClose, onSaved,
}: { node: EcoNode|null; onClose: ()=>void; onSaved: (n: EcoNode)=>void }) {
  const [f, setF]       = useState<Partial<EcoNode>>({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]   = useState<{ t:'ok'|'err'; v:string }|null>(null)

  useEffect(() => { if (node) { setF({ ...node }); setMsg(null) } }, [node])
  if (!node) return null

  const set = (k: keyof EcoNode, v: unknown) => setF(p => ({ ...p, [k]: v }))

  const save = async () => {
    setSaving(true); setMsg(null)
    const payload = {
      name:        f.name,
      type:        f.type,
      parent_name: f.parent_name || null,
      status:      f.status,
      users:       Number(f.users)   || 0,
      revenue:     Number(f.revenue) || 0,
      thb_burn:    Number(f.thb_burn)|| 0,
      url:         f.url   || null,
      notes:       f.notes || null,
      last_update: new Date().toISOString(),
    }
    if (node.id.startsWith('seed-')) {
      setMsg({ t:'ok', v:'Offline preview — reconnect Supabase to persist' })
      onSaved({ ...node, ...payload } as EcoNode)
      setSaving(false); return
    }
    const { data, error } = await supabase
      .from('ecosystem_map').update(payload).eq('id', node.id).select().single()
    if (error) { setMsg({ t:'err', v: error.message }); setSaving(false); return }
    setMsg({ t:'ok', v:'✓ Saved to Supabase' })
    setTimeout(() => { onSaved(data as EcoNode); onClose() }, 700)
    setSaving(false)
  }

  const I: React.CSSProperties = {
    width:'100%', background:'#090912', border:'1px solid #1e1e38',
    borderRadius:6, color:'#e0e0e0', padding:'8px 10px',
    fontFamily:'monospace', fontSize:12, boxSizing:'border-box',
  }
  const L: React.CSSProperties = {
    fontSize:9, color:'#555', letterSpacing:'0.12em',
    textTransform:'uppercase', marginBottom:4,
    display:'block', fontFamily:'monospace',
  }

  return (
    <>
      <div onClick={onClose} style={{
        position:'fixed', inset:0, background:'#000c', zIndex:800, backdropFilter:'blur(4px)',
      }}/>
      <div style={{
        position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        zIndex:900, background:'#06060f', border:'1.5px solid #252540',
        boxShadow:'0 0 80px #000', borderRadius:14,
        width:420, maxHeight:'88vh', overflowY:'auto',
        padding:24, fontFamily:'monospace',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div>
            <div style={{ fontSize:8, color:'#555', letterSpacing:'0.15em' }}>EDIT NODE · SUPABASE LIVE</div>
            <div style={{ fontSize:15, fontWeight:900, color:'#e0e0e0', marginTop:3 }}>{node.name}</div>
          </div>
          <button onClick={onClose} style={{
            background:'none', border:'1px solid #252540', borderRadius:6,
            color:'#555', fontSize:16, cursor:'pointer', padding:'4px 10px',
          }}>✕</button>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={L}>Name</label>
          <input style={I} value={f.name||''} onChange={e=>set('name',e.target.value)}/>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
          <div>
            <label style={L}>Type</label>
            <select style={{ ...I, cursor:'pointer' }} value={f.type||'room'} onChange={e=>set('type',e.target.value)}>
              {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={L}>Status</label>
            <select style={{ ...I, cursor:'pointer', color:SC[f.status||'green'] }} value={f.status||'green'} onChange={e=>set('status',e.target.value)}>
              {STATUSES.map(s=>(
                <option key={s} value={s} style={{ color:SC[s] }}>
                  {s==='green'?'🟢':s==='yellow'?'🟡':'🔴'} {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={L}>Parent Node</label>
          <input style={I} value={f.parent_name||''} onChange={e=>set('parent_name',e.target.value)} placeholder="e.g. BSTM Holdings"/>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
          {([['Users','users'],['Revenue (P)','revenue'],['THB Burn','thb_burn']] as const).map(([l,k])=>(
            <div key={k}>
              <label style={L}>{l}</label>
              <input style={I} type="number" min="0" value={(f as any)[k]||0} onChange={e=>set(k,e.target.value)}/>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={L}>URL</label>
          <input style={I} value={f.url||''} onChange={e=>set('url',e.target.value)} placeholder="https://..."/>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={L}>Notes</label>
          <textarea style={{ ...I, height:64, resize:'vertical' }} value={f.notes||''} onChange={e=>set('notes',e.target.value)}/>
        </div>

        {msg && (
          <div style={{
            background: msg.t==='ok'?'#0a1a0a':'#1a0a0a',
            border:`1px solid ${msg.t==='ok'?'#22c55e44':'#ef444444'}`,
            borderRadius:6, padding:'8px 12px', marginBottom:12,
            fontSize:11, color:msg.t==='ok'?'#22c55e':'#ef4444',
          }}>{msg.v}</div>
        )}

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{
            flex:1, background:'none', border:'1px solid #252540', borderRadius:7,
            color:'#666', padding:'10px 0', cursor:'pointer', fontFamily:'monospace', fontSize:11,
          }}>CANCEL</button>
          <button onClick={save} disabled={saving} style={{
            flex:2, background:'#0a1a0a', border:'1px solid #22c55e88', borderRadius:7,
            color:'#22c55e', padding:'10px 0', cursor:saving?'wait':'pointer',
            fontFamily:'monospace', fontSize:11, fontWeight:900, letterSpacing:'0.1em',
            boxShadow:'0 0 14px #22c55e22',
          }}>{saving?'SAVING...':'✓ SAVE TO SUPABASE'}</button>
        </div>
        <div style={{ marginTop:10, fontSize:8, color:'#2a2a3a', textAlign:'center' }}>
          ID: {node.id} · {new Date(node.last_update||0).toLocaleString()}
        </div>
      </div>
    </>
  )
}
