import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './index.css'

// Rutas ilustrativas sobre Madrid. Los datos ambientales son ficticios.
const BASE = [
  { n: 'Retiro · Paseo de Coches', short: 'Retiro', sh: 88, air: 80, db: 54, c: '#2E7D5B',
    why: 'Atraviesa el corazón arbolado del Retiro, con copas frondosas casi todo el trayecto.',
    pts: [[40.4115, -3.689], [40.4165, -3.689], [40.4215, -3.684], [40.421, -3.677], [40.415, -3.6745], [40.41, -3.68], [40.4115, -3.689]] },
  { n: 'Madrid Río · Puente del Rey', short: 'Madrid Río', sh: 52, air: 72, db: 46, c: '#3A7CA5',
    why: 'Sigue la ribera del Manzanares, lejos del tráfico y con el ruido más bajo de las tres.',
    pts: [[40.421, -3.719], [40.4135, -3.7215], [40.4075, -3.7185], [40.402, -3.711], [40.395, -3.704], [40.3925, -3.6985]] },
  { n: 'Parque del Oeste · Rosaleda', short: 'Parque del Oeste', sh: 70, air: 90, db: 50, c: '#D98E32',
    why: 'Jardines amplios alejados de grandes avenidas, con la mejor calidad del aire.',
    pts: [[40.4285, -3.7215], [40.433, -3.7235], [40.4385, -3.7215], [40.438, -3.7165], [40.4325, -3.715], [40.4285, -3.7215]] },
]
const W = { 'Más sombra': [0.6, 0.2, 0.2], 'Mejor aire': [0.2, 0.6, 0.2], 'Menos ruido': [0.2, 0.2, 0.6], 'Equilibrado': [0.34, 0.33, 0.33] }
const PRIOS = Object.keys(W)
const ALL = BASE.flatMap((b) => b.pts)
const clamp = (n) => Math.max(0, Math.min(100, n))

function calc(s) {
  const km = s.custom ? s.cdist : s.dist
  const w = W[s.prio]
  const off = (i) => ((s.variant * 7 + i * 5) % 9) - 4
  return BASE.map((b, i) => {
    const sh = clamp(b.sh + off(i)), air = clamp(b.air + off(i + 1)), db = b.db + off(i + 2)
    const quiet = clamp(Math.round((75 - db) * 2.5))
    const dist = (km * [1, 0.97, 1.04][i]).toFixed(1)
    return { ...b, i, sh, air, db, quiet, dist,
      mins: Math.round(dist * (s.mode === 'Correr' ? 6 : 12)),
      score: Math.round(sh * w[0] + air * w[1] + quiet * w[2]),
      airL: air >= 85 ? 'muy buena' : air >= 70 ? 'buena' : 'moderada',
      noiseL: quiet >= 70 ? 'bajo' : quiet >= 55 ? 'medio' : 'alto' }
  })
}

function part(pts, f) {
  const n = pts.length - 1, x = f * n, k = Math.min(n, Math.floor(x)), t = x - k
  const out = pts.slice(0, k + 1)
  if (k < n) out.push([pts[k][0] + (pts[k + 1][0] - pts[k][0]) * t, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * t])
  return out
}

function Fit({ pts }) {
  const map = useMap()
  useEffect(() => { map.fitBounds(pts, { padding: [24, 24] }) }, [map, pts])
  return null
}

export default function App() {
  const [s, setS] = useState({ screen: 'home', mode: 'Correr', dist: 5, custom: false, cdist: 7, prio: 'Más sombra',
    variant: 0, sel: null, prog: 0, running: false, done: false, demo: false, dstep: 0 })
  const set = (o) => setS((p) => ({ ...p, ...o }))
  const t = useRef(), dt = useRef([])

  const stopDemo = () => { dt.current.forEach(clearTimeout); dt.current = [] }
  const exitDemo = () => { stopDemo(); setS((p) => (p.demo ? { ...p, demo: false } : p)) }
  const stopSim = () => clearInterval(t.current)
  const startSim = () => {
    stopSim(); set({ prog: 0, running: true, done: false })
    t.current = setInterval(() => setS((p) => {
      if (p.prog >= 98) { clearInterval(t.current); return { ...p, prog: 100, running: false, done: true } }
      return { ...p, prog: p.prog + 2 }
    }), 250)
  }
  useEffect(() => () => { clearInterval(t.current); stopDemo() }, [])

  const startDemo = () => {
    stopDemo(); stopSim()
    set({ demo: true, dstep: 0, screen: 'home', mode: 'Correr', dist: 5, custom: false, prio: 'Más sombra', variant: 0, sel: null, prog: 0, running: false, done: false })
    const go = (ms, f) => dt.current.push(setTimeout(f, ms))
    go(4000, () => set({ screen: 'results', dstep: 1 }))
    go(8500, () => set({ screen: 'detail', dstep: 2 }))
    go(12500, () => { set({ dstep: 3 }); startSim() })
  }
  const surprise = () => {
    exitDemo(); stopSim()
    set({ screen: 'results', sel: null, custom: false, prio: PRIOS[Math.floor(Math.random() * 4)], dist: [3, 5, 10][Math.floor(Math.random() * 3)], variant: (s.variant % 3) + 1 })
  }
  const back = () => { exitDemo(); stopSim(); set(s.screen === 'detail' ? { screen: 'results', running: false, done: false, prog: 0 } : { screen: 'home' }) }

  const routes = calc(s)
  const best = routes.reduce((a, r) => (r.score > routes[a].score ? r.i : a), 0)
  const cur = routes[s.sel ?? best]
  const why = (cur.i === best ? `Recomendada para tu prioridad «${s.prio}». ` : `Alternativa a tu prioridad «${s.prio}». `) + cur.why
  const detail = s.screen === 'detail'
  const msgs = ['Calentando: empiezas por una zona tranquila.', cur.sh >= 70 ? 'Tramo arbolado: la sombra te acompaña.' : 'Poca sombra aquí, aprovecha la brisa.',
    `El aire es ${cur.airL} en esta zona.`, `El ruido del tráfico es ${cur.noiseL} en este tramo.`, 'Último tramo, ¡ya casi llegas!']
  const dmsgs = ['Juan, 20 años, siempre corre junto a una carretera con mucho tráfico (unos 72 dB). Hoy busca 5 km con más sombra y menos ruido.',
    'SHADE compara tres rutas de Madrid y marca la mejor para su prioridad.',
    `Elige ${cur.n}: ${cur.sh}% de sombra y ${cur.db} dB, frente a los 72 dB de su recorrido habitual.`,
    'Juan sale a correr: sombra, aire limpio y menos ruido desde el primer kilómetro.',
    'Resultado: 5 km más frescos, silenciosos y saludables. Así descubre SHADE nuevos recorridos.']
  const chip = (on) => 'chip' + (on ? ' on' : '')

  return (
    <div className="app">
      {s.demo && (
        <div className="demo"><p>{dmsgs[s.done ? 4 : s.dstep]}</p><button onClick={exitDemo}>Salir de la demo</button></div>
      )}

      {s.screen === 'home' && (
        <div className="home">
          <header>
            <h1>SHADE</h1>
            <p>Disfruta del camino, no solo del destino</p>
          </header>
          <div className="card">
            <h3>¿Qué te apetece hoy?</h3>
            <div className="row">{['Correr', 'Caminar'].map((m) => <button key={m} className={chip(s.mode === m)} onClick={() => set({ mode: m })}>{m}</button>)}</div>
            <h3>Distancia</h3>
            <div className="row wrap">
              {[3, 5, 10].map((d) => <button key={d} className={chip(!s.custom && s.dist === d)} onClick={() => set({ custom: false, dist: d })}>{d} km</button>)}
              <button className={chip(s.custom)} onClick={() => set({ custom: true })}>Otra</button>
            </div>
            {s.custom && (
              <div className="stepper">
                <button aria-label="Menos distancia" onClick={() => set({ cdist: Math.max(1, s.cdist - 1) })}>−</button>
                <b>{s.cdist} km</b>
                <button aria-label="Más distancia" onClick={() => set({ cdist: Math.min(42, s.cdist + 1) })}>+</button>
              </div>
            )}
            <h3>¿Qué quieres priorizar?</h3>
            <div className="grid">{PRIOS.map((p) => <button key={p} className={chip(s.prio === p)} onClick={() => set({ prio: p })}>{p}</button>)}</div>
            <button className="primary" onClick={() => { exitDemo(); set({ screen: 'results', sel: null }) }}>Encontrar mis rutas</button>
            <button className="outline" onClick={surprise}>Sorpréndeme</button>
            <button className="soft" onClick={startDemo}>Ver demo de Juan (25 s)</button>
          </div>
        </div>
      )}

      {s.screen !== 'home' && (
        <div className="main">
          <div className="top">
            <button className="back" onClick={back}>← Volver</button>
            <b className="logo">SHADE</b>
            <span>{s.mode} · {s.custom ? s.cdist : s.dist} km · {s.prio}</span>
          </div>
          <div className="cols">
            <div className="panel mapbox">
              <MapContainer center={[40.416, -3.703]} zoom={13} className="map" scrollWheelZoom={false}>
                <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Fit pts={detail ? cur.pts : ALL} />
                {routes.map((r) => <Polyline key={r.i} positions={r.pts} pathOptions={{ color: r.c, weight: r.i === cur.i ? 6 : 4, opacity: detail && r.i !== cur.i ? 0.3 : 1 }} />)}
                {detail && (s.running || s.done) && <Polyline positions={part(cur.pts, s.prog / 100)} pathOptions={{ color: '#12372A', weight: 8 }} />}
              </MapContainer>
              <div className="legend">{routes.map((r) => <span key={r.i}><i style={{ background: r.c }} />{r.short}</span>)}</div>
            </div>

            <div className="side">
              {!detail && (<>
                <h2>Tus 3 rutas en Madrid</h2>
                {routes.map((r) => (
                  <button key={r.i} className={'route' + (r.i === best ? ' best' : '')} onClick={() => { exitDemo(); set({ sel: r.i, screen: 'detail', prog: 0, running: false, done: false }) }}>
                    <div className="rhead"><i style={{ background: r.c }} /><b>{r.n}</b><strong>{r.score}</strong></div>
                    {r.i === best && <em>Mejor para ti</em>}
                    <small>{r.dist} km · {r.mins} min · Sombra {r.sh}% · Aire {r.airL} · Ruido {r.noiseL} ({r.db} dB)</small>
                  </button>
                ))}
              </>)}
              {detail && (
                <div className="panel detail">
                  <div className="rhead"><b className="big">{cur.n}</b><div className="score"><strong>{cur.score}</strong><small>puntuación saludable</small></div></div>
                  <small>{cur.dist} km · {cur.mins} min estimados</small>
                  {[['Sombra', cur.sh + '%', cur.sh], ['Calidad del aire', cur.airL, cur.air], ['Silencio', `${cur.noiseL} · ${cur.db} dB`, cur.quiet]].map(([l, tx, w]) => (
                    <div key={l}><div className="bl"><b>{l}</b><span>{tx}</span></div><div className="bar"><div style={{ width: w + '%' }} /></div></div>
                  ))}
                  <p className="why">{why}</p>
                  {!s.running && !s.done && <button className="primary" onClick={() => { exitDemo(); startSim() }}>Comenzar ruta</button>}
                  {s.running && (<div>
                    <div className="bar big"><div style={{ width: s.prog + '%' }} /></div>
                    <h3>{((s.prog / 100) * cur.dist).toFixed(1)} / {cur.dist} km</h3>
                    <p className="msg">{msgs[Math.min(4, Math.floor(s.prog / 20))]}</p>
                  </div>)}
                  {s.done && (<div className="center">
                    <h2>¡Enhorabuena! Ruta completada</h2>
                    <p>Has recorrido {cur.dist} km respirando mejor y con menos ruido. Tu cuerpo te lo agradece.</p>
                    <button className="primary" onClick={() => { exitDemo(); stopSim(); set({ screen: 'home', running: false, done: false, prog: 0, sel: null }) }}>Buscar otra ruta</button>
                  </div>)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
