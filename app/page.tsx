import dynamic from 'next/dynamic'

const G = dynamic(() => import('../components/EcosystemGraph'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100vw', height: '100vh', background: '#04040d',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#d4af37', fontFamily: 'monospace', letterSpacing: '0.3em', fontSize: 13,
    }}>
      BSTM NETWORK — LOADING...
    </div>
  ),
})

export default function Page() { return <G /> }
