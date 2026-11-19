import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import bandageImg from './assets/item-bandage.webp'
import cardImg from './assets/item-card.webp'
import condomImg from './assets/item-condom.webp'
import mintImg from './assets/item-mint.webp'
import testImg from './assets/item-test.webp'
import { HINT_CLOSE, HINT_OPEN, HINT_ROTATE } from './copy'
import './Explore.css'
import { OPEN_YAW, VIEW_H, VIEW_W, createPouch3D, hasWebGL } from './pouch3d'
import type { Pose, Pouch3D } from './pouch3d'
import { ZIP, loadSheet, paintFrame } from './zip'

// Everything here is measured in inches and drawn at one scale (1em = 1 inch inside .bench).
// The pouch is a live 3D model; the items are Blender renders. Item sizes are working assumptions until samples arrive.
const TURN_MS = 800          // unzip, turn and move aside, all at once
const HOME_MS = 300          // turning back to the opening before the items go in
const EACH_MS = 150          // gap between one item setting off and the next
const ITEM_MS = 420          // one item's trip out of the pouch, or back into it
const DRAG = 0.01            // radians of turn per pixel dragged
const MAX_PITCH = 1.35       // how far it tips toward or away from us
const LIFE = 96              // pixels per inch at life size (one CSS inch). Nothing is ever drawn larger than this.
const EDGE = 32              // clear space kept at each side of a wide screen, in pixels

type Thing = { id: string; name: string; src: string; w: number; h: number; row: [number, number]; stack: [number, number] }

// `row`: where it lands on a wide screen, measured from the left end of the row and from the pouch's middle line.
// `stack`: where it lands on a narrow screen, measured from the corner of the area under the pouch.
const THINGS: Thing[] = [
  { id: 'card', name: 'Instruction card', src: cardImg, w: 2, h: 3.5, row: [0, -1.75], stack: [0, 0] },
  { id: 'test', name: 'Drink test', src: testImg, w: 1, h: 3, row: [2.3, -1.5], stack: [0, 3.8] },
  { id: 'bandages', name: 'Bandages', src: bandageImg, w: 0.765, h: 3, row: [3.6, -1.5], stack: [1.2, 3.8] },
  { id: 'condom-1', name: 'Condom', src: condomImg, w: 2, h: 2, row: [4.67, -2.1], stack: [2.3, 0] },
  { id: 'condom-2', name: 'Condom', src: condomImg, w: 2, h: 2, row: [4.67, 0.1], stack: [2.3, 2.2] },
  { id: 'mint-1', name: 'Mint', src: mintImg, w: 1.8, h: 1, row: [6.97, -1.12], stack: [2.4, 4.5] },
  { id: 'mint-2', name: 'Mint', src: mintImg, w: 1.8, h: 1, row: [6.97, 0.12], stack: [2.4, 5.7] },
]

const smooth = (q: number) => q * q * (3 - 2 * q)
// The same angle, written as the one nearest to `near` (so a turn never goes the long way round).
const nearest = (angle: number, near: number) => angle + Math.round((near - angle) / (2 * Math.PI)) * 2 * Math.PI

function Explore() {
  const stage = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const model = useRef<Pouch3D | null>(null)
  const flat = useRef<HTMLImageElement | null>(null)   // the frame sheet, only when 3D is not available
  const pose = useRef<Pose>({ open: 0, yaw: 0, pitch: 0 })
  const grip = useRef({ x: 0, y: 0, yaw: 0, pitch: 0, moved: false, on: false })
  const raf = useRef(0)
  const timer = useRef(0)
  const [live] = useState(hasWebGL)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [open, setOpen] = useState(false)   // the pouch: unzipped, turned and moved aside
  const [out, setOut] = useState(false)     // the items: laid out
  const [want, setWant] = useState(false)   // what the last click asked for; the line under the pouch follows it
  const [busy, setBusy] = useState(false)

  useLayoutEffect(() => {
    const el = stage.current
    if (!el) return
    const measure = () => setBox({ w: el.clientWidth, h: window.innerHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  // Layout, in inches. Wide: pouch on the left, items in a row to its right. Narrow: pouch on top, items under it.
  const wide = box.w >= 900
  const W = wide ? 12.5 : 5.3
  const viewH = Math.max(box.h, 480)
  // The scale: as large as the screen allows, but never larger than life size.
  const u = box.w ? Math.min(wide ? Math.min((box.w - 2 * EDGE) / W, viewH / 6.4) : box.w / W, LIFE) : 0
  const Hclosed = u ? viewH / u : 0
  const H = wide ? Hclosed : open ? Math.max(Hclosed, 14.3) : Hclosed
  const closedAt: [number, number] = [(W - VIEW_W) / 2, (Hclosed - VIEW_H) / 2 - 0.3]
  const openAt: [number, number] = wide ? [-0.1, closedAt[1]] : [0, 1.1]
  const [px, py] = open ? openAt : closedAt
  const rowAt: [number, number] = [openAt[0] + VIEW_W + 0.05, openAt[1] + VIEW_H / 2]
  const stackAt: [number, number] = [0.5, openAt[1] + VIEW_H + 1.1]
  // The zipper's gap on the turned pouch: where the items come out and go back in.
  const mouth: [number, number] = [openAt[0] + VIEW_W * 0.5, openAt[1] + VIEW_H * 0.5]

  const draw = () => {
    if (model.current) model.current.set(pose.current)
    else paintFrame(canvas.current, flat.current, ZIP, Math.round(pose.current.open * (ZIP.frames - 1)))
  }

  // Start the model once the canvas exists, and keep it sized to the layout.
  useEffect(() => {
    const el = canvas.current
    if (!el || !u) return
    if (live) {
      if (!model.current) {
        try {
          model.current = createPouch3D(el)
        } catch {
          return
        }
      }
      model.current.resize(Math.round(VIEW_W * u), Math.round(VIEW_H * u))
      model.current.set(pose.current)
    } else if (!flat.current) {
      loadSheet(ZIP).then((img) => {
        flat.current = img
        draw()
      }, () => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [u, live])
  useEffect(() => () => {
    cancelAnimationFrame(raf.current)
    window.clearTimeout(timer.current)
    model.current?.dispose()
    model.current = null
  }, [])

  const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Move the pouch from the pose it is in to `to` over `ms`, then call `done`.
  function glide(to: Pose, ms: number, done: () => void) {
    const from = { ...pose.current }
    const time = still() ? 0 : ms
    let start = 0
    const step = (now: number) => {
      start ||= now
      const t = time === 0 ? 1 : Math.min(1, (now - start) / time)
      const e = smooth(t)
      pose.current = { open: from.open + (to.open - from.open) * t, yaw: from.yaw + (to.yaw - from.yaw) * e, pitch: from.pitch + (to.pitch - from.pitch) * e }
      draw()
      if (t < 1) raf.current = requestAnimationFrame(step)
      else done()
    }
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(step)
  }

  // Drag anywhere on the pouch to turn it: sideways spins it, up and down tips it.
  function down(e: ReactPointerEvent<HTMLButtonElement>) {
    grip.current = { x: e.clientX, y: e.clientY, yaw: pose.current.yaw, pitch: pose.current.pitch, moved: false, on: !busy && !!model.current }
  }
  function move(e: ReactPointerEvent<HTMLButtonElement>) {
    const g = grip.current
    if (!g.on || busy || (e.pointerType === 'mouse' && e.buttons === 0)) return
    const dx = e.clientX - g.x, dy = e.clientY - g.y
    if (!g.moved && Math.hypot(dx, dy) < 6) return
    if (!g.moved) {
      g.moved = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    pose.current = { ...pose.current, yaw: g.yaw + dx * DRAG, pitch: Math.max(-MAX_PITCH, Math.min(MAX_PITCH, g.pitch + dy * DRAG)) }
    draw()
  }
  function up() {
    grip.current.on = false
  }

  function click() {
    if (grip.current.moved) {
      grip.current.moved = false // that was a drag, not a click
      return
    }
    if (busy) return
    setBusy(true)
    const items = still() ? 0 : EACH_MS * (THINGS.length - 1) + ITEM_MS
    const yaw = pose.current.yaw
    if (!open) {
      // Open: the zipper comes down as the pouch turns to show the opening and moves aside, then the items come out one by one.
      setWant(true)
      setOpen(true)
      glide({ open: 1, yaw: nearest(OPEN_YAW, yaw), pitch: 0 }, TURN_MS, () => {
        setOut(true)
        timer.current = window.setTimeout(() => setBusy(false), items)
      })
    } else {
      // Close: turn back to the opening if it was moved, the items go in one by one, then it zips up and faces front.
      setWant(false)
      const home = { open: 1, yaw: nearest(OPEN_YAW, yaw), pitch: 0 }
      const moved = Math.abs(home.yaw - yaw) > 0.01 || Math.abs(pose.current.pitch) > 0.01
      glide(home, moved ? HOME_MS : 0, () => {
        setOut(false)
        timer.current = window.setTimeout(() => {
          setOpen(false)
          glide({ open: 0, yaw: nearest(0, pose.current.yaw), pitch: 0 }, TURN_MS, () => setBusy(false))
        }, items)
      })
    }
  }

  const stageStyle: CSSProperties = { height: u ? H * u : undefined }
  const bench: CSSProperties = { left: (box.w - W * u) / 2, width: W * u, height: H * u, fontSize: u }

  return (
    <main className="explore" ref={stage} style={stageStyle}>
      <a className="logo" href="/">CLUTCH</a>
      {u > 0 && (
        <div className="bench" style={bench}>
          {THINGS.map((t, i) => {
            const [x, y] = wide ? [rowAt[0] + t.row[0], rowAt[1] + t.row[1]] : [stackAt[0] + t.stack[0], stackAt[1] + t.stack[1]]
            const back = `${mouth[0] - (x + t.w / 2)}em, ${mouth[1] - (y + t.h / 2)}em`
            const delay = i * EACH_MS
            // In the pouch, an item sits at the gap, squeezed thin as if edge-on, and unseen.
            // It never fades: it is solid from the moment it leaves the gap until the moment it is back in.
            const style: CSSProperties = {
              left: `${x}em`,
              top: `${y}em`,
              width: `${t.w}em`,
              height: `${t.h}em`,
              transform: out ? 'none' : `translate(${back}) scale(.06, .55)`,
              opacity: out ? 1 : 0,
              transition: !open
                ? 'none'
                : out
                  ? `transform ${ITEM_MS}ms cubic-bezier(.2, .7, .2, 1) ${delay}ms, opacity 0ms linear ${delay}ms`
                  : `transform ${ITEM_MS}ms ease-in ${delay}ms, opacity 0ms linear ${delay + ITEM_MS}ms`,
            }
            return <img key={t.id} className="thing" src={t.src} alt={t.name} draggable={false} style={style} />
          })}

          <button
            type="button"
            className="pouch-x"
            aria-expanded={open}
            onClick={click}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            style={{ left: `${px}em`, top: `${py}em`, width: `${VIEW_W}em`, height: `${VIEW_H}em`, transitionDuration: `${TURN_MS}ms` }}
          >
            <canvas
              ref={canvas}
              width={live ? undefined : ZIP.w}
              height={live ? undefined : ZIP.h}
              className={live ? undefined : 'is-flat'}
              role="img"
              aria-label="Slate pouch with a zipper down the right side and a black band reading CLUTCH in white."
            />
            <span className="hint">
              {want ? HINT_CLOSE : HINT_OPEN}
              {live && <br />}
              {live && HINT_ROTATE}
            </span>
          </button>
        </div>
      )}
    </main>
  )
}

export default Explore
