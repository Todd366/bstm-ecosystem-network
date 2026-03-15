'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, Handle, Position, MarkerType,
  type Node, type Edge, type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { supabase, type EcoNode, type NodeType } from '../lib/supabase'
import { SEED } from '../lib/seed'
import EditModal from './EditModal'

// ── theme ────────────────────────────────────────────────────────────────────
const TH: Record<NodeType, { b:string; bg:string; glow:string }> = {
  sovereign: { b:'#d4af37', bg:'#0f0900', glow:'#d4af3755' },
  trust:     { b:'#60a5fa', bg:'#000b1a', glow:'#60a5fa44' },
  foundation:{ b:'#34d399', bg:'#001610', glow:'#34d39944' },
  org:       { b:'#a78bfa', bg:'#0c0018', glow:'#a78bfa44' },
  company:   { b:'#fb923c', bg:'#150800', glow:'#fb923c44' },
  dept:      { b:'#38bdf8', bg:'#000f18', glow:'#38bdf844' },
  room:      { b:'#4b5563', bg:'#0c0c0c', glow:'#4b556322' },
}
const SC: Record<string,string> = { green:'#22c55e', yellow:'#eab308', red:'#ef4444' }
const LAYERS: NodeType[] = ['sovereign','trust','foundation','org','company','dept','room']
const YY = [0, 200, 375, 545, 715, 900, 1080]
const GG = [0, 300, 275, 240, 205, 188, 120]

// ── node card ─────────────────────────────────────────────────────────────────
function Card({ data }: NodeProps) {
  const t  = TH[data.type as NodeType] || TH.room
  const [hov, setHov] = useState(false)
  const isCab = data.name === 'CabLink PWA'
  const isTHB = data.name === 'THoBoCoin Ltd'
  return (
    <div
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={() => { const fn = data.onView as unknown as (n: EcoNode) => void; if (fn) fn(data as unknown as EcoNode) }}
      style={{
        background: t.bg,
        border:`1.5px solid ${hov ? t.b : t.b+'99'}`,
        boxShadow: hov
          ? `0 0 20px ${t.glow},0 0 40px ${t.glow}88`
          : `0 0 7px ${t.glow}`,
        borderRadius: 8,
        padding: data.type==='room' ? '6px 10px' : '9px 14px',
        minWidth: data.type==='room' ? 104 : 150,
        cursor: 'pointer',
        transform: hov ? 'scale(1.05) translateY(-2px)' : 'scale(1)',
        transition: 'all 0.2s ease',
        animation: data.type==='sovereign' || data.status==='red'
          ? 'pulseN 2.4s ease-in-out infinite' : undefined,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        background:'repeating-linear-gradient(0deg,transparent,transparent 3px,#ffffff05 3px,#ffffff05 4px)',
      }}/>
      <Handle type="target" position={Position.Top} style={{ opacity:0 }}/>
      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
        <div style={{
          width:6, height:6, borderRadius:'50%', flexShrink:0,
          background: SC[data.status] || SC.green,
          boxShadow: `0 0 5px ${SC[data.status]||SC.green}`,
          animation: (isCab||isTHB) ? 'pulseD 2s ease-in-out infinite' : undefined,
        }}/>
        <span style={{
          fontSize:8, color:t.b, fontFamily:'monospace',
          textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:700,
        }}>
          {isCab ? 'LIVE PWA' : isTHB ? '🔥 THB' : data.type}
        </span>
        <span style={{ marginLeft:'auto', fontSize:8, color:'#333', opacity:hov?1:0, transition:'opacity 0.2s' }}>✎</span>
      </div>
      <div style={{
        fontSize: data.type==='room' ? 10.5 : 12,
        fontWeight:700, color:'#e8e8e8', lineHeight:1.25,
        fontFamily:"'IBM Plex Mono',monospace",
      }}>
        {data.name}
      </div>
      {(data.users > 0 || data.revenue > 0) && (
        <div style={{ display:'flex', gap:8, marginTop:4 }}>
          {data.users > 0 && (
            <span style={{ fontSize:9, color:'#888', fontFamily:'monospace' }}>
              👥 {Number(data.users).toLocaleString()}
            </span>
          )}
          {data.revenue > 0 && (
            <span style={{ fontSize:9, color:'#22c55e', fontFamily:'monospace' }}>
              P{Number(data.revenue).toLocaleString()}
            </span>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ opacity:0 }}/>
    </div>
  )
}
const nodeTypes = { eco: Card }

// ── build graph ───────────────────────────────────────────────────────────────
function buildGraph(data: EcoNode[], onView:(n:EcoNode)=>void): { nodes:Node[]; edges:Edge[] } {
  const nameToId: Record<string,string> = {}
  data.forEach(n => { nameToId[n.name] = n.id })

  const byType = Object.fromEntries(LAYERS.map(t => [t, [] as EcoNode[]])) as Record<NodeType,EcoNode[]>
  data.forEach(n => { if (byType[n.type]) byType[n.type].push(n) })

  const nodes: Node[] = []
  const edges: Edge[] = []

  LAYERS.forEach((type, li) => {
    const items  = byType[type]
    const gap    = GG[li]
    const totalW = (items.length - 1) * gap
    items.forEach((n, i) => {
      nodes.push({
        id: n.id, type:'eco',
        position: { x: i * gap - totalW / 2, y: YY[li] },
        data: { ...n, onView },
        draggable: true,
      })
      if (n.parent_name && nameToId[n.parent_name]) {
        const th = TH[type]
        edges.push({
          id: `e-${n.id}`,
          source: nameToId[n.parent_name],
          target: n.id,
          type: 'smoothstep',
          animated: type==='company' || type==='dept',
          style: { stroke:`${th.b}66`, strokeWidth:1 },
          markerEnd: { type:MarkerType.ArrowClosed, color:`${th.b}88`, width:10, height:10 },
        })
      }
      // CabLink PWA extra edges
      if (n.name === 'CabLink PWA') {
        if (nameToId['THoBoCoin Ltd']) edges.push({
          id:'e-cablink-thb', source:nameToId['THoBoCoin Ltd'], target:n.id,
          type:'smoothstep', animated:true,
          style:{ stroke:'#fb923c88', strokeWidth:1.5, strokeDasharray:'5 3' },
          markerEnd:{ type:MarkerType.ArrowClosed, color:'#fb923c88', width:10, height:10 },
          label:'THB',
          labelStyle:{ fill:'#fb923c', fontSize:9, fontFamily:'monospace' },
          labelBgStyle:{ fill:'#0f0800' },
        })
        if (nameToId['BSTM Holdings']) edges.push({
          id:'e-cablink-hld', source:nameToId['BSTM Holdings'], target:n.id,
          type:'smoothstep', animated:false,
          style:{ stroke:'#a78bfa44', strokeWidth:1, strokeDasharray:'4 4' },
          markerEnd:{ type:MarkerType.ArrowClosed, color:'#a78bfa55', width:8, height:8 },
        })
      }
    })
  })
  return { nodes, edges }
}

// ── burn widget ───────────────────────────────────────────────────────────────
function BurnWidget({ burn }: { burn:number }) {
  return (
    <div style={{
      position:'absolute', bottom:20, left:20, zIndex:100,
      background:'#0f0500', border:'1.5px solid #fb923c77',
      boxShadow:'0 0 24px #fb923c33', borderRadius:10,
      padding:'12px 18px', fontFamily:'monospace',
    }}>
      <div style={{ fontSize:8, color:'#fb923c', letterSpacing:'0.18em', marginBottom:4 }}>🔥 THB BURNED</div>
      <div style={{ fontSize:24, fontWeight:900, color:'#fb923c' }}>{burn.toLocaleString()}</div>
      <div style={{ fontSize:8, color:'#555', marginTop:3 }}>2% trade · 5% unstake</div>
    </div>
  )
}

// ── stats bar ─────────────────────────────────────────────────────────────────
function StatsBar({ data, countdown, onRefresh }: {
  data:EcoNode[]; countdown:number; onRefresh:()=>void
}) {
  const users   = data.reduce((s,n) => s + (n.users||0), 0)
  const revenue = data.reduce((s,n) => s + Number(n.revenue||0), 0)
  const burn    = data.reduce((s,n) => s + Number(n.thb_burn||0), 0)
  const g = data.filter(n=>n.status==='green').length
  const y = data.filter(n=>n.status==='yellow').length
  const r = data.filter(n=>n.status==='red').length
  return (
    <div style={{
      position:'absolute', top:0, left:0, right:0, zIndex:200,
      background:'linear-gradient(180deg,#04040d 0%,#04040dee 100%)',
      backdropFilter:'blur(12px)', borderBottom:'1px solid #12122a',
      height:52, display:'flex', alignItems:'center', padding:'0 20px', gap:0,
    }}>
      <div style={{
        fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:900,
        color:'#d4af37', letterSpacing:'0.14em', marginRight:22,
        textShadow:'0 0 16px #d4af3755',
      }}>
        BSTM<span style={{ color:'#38bdf8' }}>NET</span>
        <span style={{ fontSize:8, color:'#333', fontWeight:400, marginLeft:6 }}>v3·LIVE</span>
      </div>
      <div style={{ width:1, height:28, background:'#12122a', marginRight:20 }}/>
      {[
        { l:'NODES',    v:data.length,              c:'#60a5fa' },
        { l:'CITIZENS', v:users.toLocaleString(),   c:'#a78bfa' },
        { l:'REVENUE',  v:`P${revenue.toLocaleString()}`, c:'#22c55e' },
        { l:'THB BURN', v:burn.toLocaleString(),    c:'#fb923c' },
      ].map(s => (
        <div key={s.l} style={{ marginRight:20 }}>
          <div style={{ fontSize:7, color:'#444', letterSpacing:'0.12em', fontFamily:'monospace' }}>{s.l}</div>
          <div style={{ fontSize:12, fontWeight:800, color:s.c, fontFamily:'monospace' }}>{s.v}</div>
        </div>
      ))}
      <div style={{ width:1, height:28, background:'#12122a', marginRight:16 }}/>
      {([[g,'#22c55e'],[y,'#eab308'],[r,'#ef4444']] as const).map(([v,c],i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:4, marginRight:10 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:c, boxShadow:`0 0 5px ${c}` }}/>
          <span style={{ fontSize:10, color:'#555', fontFamily:'monospace' }}>{v}</span>
        </div>
      ))}
      <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ fontSize:9, color:'#2a2a4a', fontFamily:'monospace' }}>SYNC {countdown}s</div>
        <button onClick={onRefresh} style={{
          background:'#0a0f1a', border:'1px solid #60a5fa33', borderRadius:5,
          color:'#60a5fa', fontSize:9, padding:'4px 10px', cursor:'pointer',
          fontFamily:'monospace', letterSpacing:'0.08em',
        }}>↺ REFRESH</button>
      </div>
    </div>
  )
}

// ── view panel ────────────────────────────────────────────────────────────────
function ViewPanel({ node, onEdit, onClose }: {
  node:EcoNode|null; onEdit:(n:EcoNode)=>void; onClose:()=>void
}) {
  if (!node) return null
  const t    = TH[node.type] || TH.room
  const isCab = node.name === 'CabLink PWA'
  return (
    <div style={{
      position:'absolute', top:62, right:16, zIndex:300,
      background:'#06060e', border:`1.5px solid ${t.b}`,
      boxShadow:`0 0 28px ${t.glow}`, borderRadius:12,
      padding:18, width:272, fontFamily:'monospace',
      animation:'slideIn 0.18s ease',
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
        <div>
          <div style={{ fontSize:8, color:t.b, letterSpacing:'0.15em', textTransform:'uppercase' }}>
            {isCab ? '🚕 LIVE PWA' : node.type}
          </div>
          <div style={{ fontSize:14, fontWeight:900, color:'#f0f0f0', marginTop:2, lineHeight:1.3 }}>{node.name}</div>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'#555', fontSize:16, cursor:'pointer', padding:0 }}>✕</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
        {[
          { l:'STATUS',   v:node.status.toUpperCase(), c:SC[node.status] },
          { l:'USERS',    v:(node.users||0).toLocaleString(), c:'#a78bfa' },
          { l:'REVENUE',  v:`P${(node.revenue||0).toLocaleString()}`, c:'#22c55e' },
          { l:'THB BURN', v:(node.thb_burn||0).toLocaleString(), c:'#fb923c' },
        ].map(m => (
          <div key={m.l} style={{ background:'#0d0d1a', borderRadius:6, padding:'7px 9px' }}>
            <div style={{ fontSize:7, color:'#444', letterSpacing:'0.1em' }}>{m.l}</div>
            <div style={{ fontSize:13, fontWeight:800, color:m.c, marginTop:2 }}>{m.v}</div>
          </div>
        ))}
      </div>
      {node.parent_name && (
        <div style={{ fontSize:9, color:'#555', marginBottom:6 }}>↑ {node.parent_name}</div>
      )}
      {node.url && (
        <a href={node.url} target="_blank" rel="noopener noreferrer" style={{
          display:'block', fontSize:9, color:t.b, wordBreak:'break-all',
          textDecoration:'none', marginBottom:8,
        }}>🔗 {node.url}</a>
      )}
      {node.notes && (
        <div style={{ fontSize:9, color:'#666', marginBottom:8, lineHeight:1.5 }}>📝 {node.notes}</div>
      )}
      {isCab && (
        <a href="https://todd366.github.io/CabLink-pwa/" target="_blank" rel="noopener noreferrer" style={{
          display:'block', textAlign:'center', background:'#00101a',
          border:'1px solid #38bdf8', borderRadius:7, color:'#38bdf8',
          fontSize:10, padding:'8px 0', textDecoration:'none', fontWeight:800,
          boxShadow:'0 0 16px #38bdf833', marginBottom:8, letterSpacing:'0.08em',
        }}>↗ OPEN CABLINK PWA</a>
      )}
      <button onClick={()=>onEdit(node)} style={{
        width:'100%', background:'#0a0f1a', border:`1px solid ${t.b}66`,
        borderRadius:7, color:t.b, padding:'9px 0', cursor:'pointer',
        fontFamily:'monospace', fontSize:11, fontWeight:800, letterSpacing:'0.1em',
        boxShadow:`0 0 10px ${t.glow}`,
      }}>✎ EDIT NODE</button>
    </div>
  )
}

// ── main ──────────────────────────────────────────────────────────────────────
export default function EcosystemGraph() {
  const [raw,    setRaw]    = useState<EcoNode[]>([])
  const [nodes,  setNodes,  onNodesChange] = useNodesState([])
  const [edges,  setEdges,  onEdgesChange] = useEdgesState([])
  const [viewing, setViewing] = useState<EcoNode|null>(null)
  const [editing, setEditing] = useState<EcoNode|null>(null)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(60)
  const countRef = useRef(60)

  const onView = useCallback((n:EcoNode) => { setEditing(null); setViewing(n) }, [])
  const onEdit = useCallback((n:EcoNode) => { setViewing(null); setEditing(n) }, [])

  const applyData = useCallback((data:EcoNode[]) => {
    setRaw(data)
    const { nodes:n, edges:e } = buildGraph(data, onView)
    setNodes(n); setEdges(e)
  }, [setNodes, setEdges, onView])

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('ecosystem_map').select('*').order('type')
    applyData((!error && data && data.length > 0) ? data as EcoNode[] : SEED)
    setLoading(false)
    countRef.current = 60
  }, [applyData])

  const onSaved = useCallback((updated:EcoNode) => {
    applyData(raw.map(n => n.id === updated.id ? updated : n))
    if (viewing?.id === updated.id) setViewing(updated)
  }, [raw, viewing, applyData])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const t = setInterval(() => {
      countRef.current -= 1
      setCountdown(countRef.current)
      if (countRef.current <= 0) load()
    }, 1000)
    return () => clearInterval(t)
  }, [load])

  useEffect(() => {
    const ch = supabase.channel('eco-rt')
      .on('postgres_changes', { event:'*', schema:'public', table:'ecosystem_map' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [load])

  const burn = raw.reduce((s,n) => s + Number(n.thb_burn||0), 0)

  if (loading) return (
    <div style={{
      width:'100vw', height:'100vh', background:'#04040d',
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', gap:14, fontFamily:'monospace',
    }}>
      <div style={{ fontSize:11, color:'#d4af37', letterSpacing:'0.4em' }}>BSTM NETWORK</div>
      <div style={{ width:180, height:2, background:'#0d0d1a', borderRadius:2, overflow:'hidden' }}>
        <div style={{ height:'100%', background:'linear-gradient(90deg,#d4af37,#38bdf8)', animation:'loadBar 1.5s ease-in-out infinite' }}/>
      </div>
      <div style={{ fontSize:9, color:'#333', letterSpacing:'0.15em' }}>CONNECTING TO SUPABASE...</div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700;900&display=swap');
        * { box-sizing:border-box } body { margin:0; background:#04040d }
        @keyframes pulseN {
          0%,100% { box-shadow:0 0 6px #d4af3730 }
          50%      { box-shadow:0 0 22px #d4af3777, 0 0 44px #d4af3744 }
        }
        @keyframes pulseD {
          0%,100% { box-shadow:0 0 4px #22c55e }
          50%     { box-shadow:0 0 12px #22c55e, 0 0 22px #22c55e88 }
        }
        @keyframes loadBar {
          0%   { width:0%;   margin-left:0 }
          50%  { width:65%;  margin-left:17% }
          100% { width:0%;   margin-left:100% }
        }
        @keyframes slideIn {
          from { opacity:0; transform:translateX(8px) }
          to   { opacity:1; transform:translateX(0) }
        }
        .react-flow__controls { background:#06060e!important; border:1px solid #12122a!important }
        .react-flow__controls-button {
          background:#06060e!important;
          border-bottom:1px solid #12122a!important;
          color:#555!important; fill:#555!important
        }
        .react-flow__minimap { background:#06060e!important; border:1px solid #12122a!important }
      `}</style>

      <div style={{ width:'100vw', height:'100vh', background:'#04040d', position:'relative' }}>
        <StatsBar data={raw} countdown={countdown} onRefresh={load}/>
        <div style={{ position:'absolute', inset:0, top:52 }}>
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView fitViewOptions={{ padding:0.08, maxZoom:0.55 }}
            minZoom={0.03} maxZoom={2}
            proOptions={{ hideAttribution:true }}
          >
            <Background color="#0d0d20" gap={28} size={0.7}/>
            <Controls showInteractive={false}/>
            <MiniMap
              nodeColor={n => TH[n.data?.type as NodeType]?.b || '#333'}
              maskColor="#04040dcc"
            />
          </ReactFlow>
        </div>
        <BurnWidget burn={burn}/>
        <ViewPanel node={viewing} onEdit={onEdit} onClose={()=>setViewing(null)}/>
        <EditModal node={editing} onClose={()=>setEditing(null)} onSaved={onSaved}/>
      </div>
    </>
  )
}
