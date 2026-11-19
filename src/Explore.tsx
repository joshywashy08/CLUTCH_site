import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import bandageImg from './assets/item-bandage.webp'
import cardImg from './assets/item-card.webp'
import condomImg from './assets/item-condom.webp'
import mintImg from './assets/item-mint.webp'
import testImg from './assets/item-test.webp'
import './Explore.css'
import { FRAMES, FRAME_H, FRAME_W, loadSheet, paintFrame } from './zip'

// Everything on this page is measured in inches and drawn at one scale, so the pouch and the items compare truly.
// The pouch and the items are Blender renders. Item sizes are working assumptions until samples arrive.
const POUCH_W = 2.802   // the pouch image, a hair wider than the 2.75 in pouch
const POUCH_H = 4.287
const GAP_X = 0.872     // where the zipper opening sits across the pouch image (0 left, 1 right)
const LAST = FRAMES - 1

type Thing = { id: string; name: string; src: string; w: number; h: number; slot: [number, number]; tall?: boolean; dark?: boolean; low?: boolean }

// `slot` is where a thing lands when it is taken out with a click, measured from the corner of the laid-out area.
const THINGS: Thing[] = [
  { id: 'card', name: 'Instruction card', src: cardImg, w: 2, h: 3.5, slot: [0, 0], low: true },
  { id: 'condom-1', name: 'Condom', src: condomImg, w: 2, h: 2, slot: [2.3, 0], dark: true },
  { id: 'condom-2', name: 'Condom', src: condomImg, w: 2, h: 2, slot: [2.3, 2.2], dark: true },
  { id: 'test', name: 'Drink test', src: testImg, w: 1, h: 3, slot: [0, 3.8], tall: true },
  { id: 'bandages', name: '2 Bandages', src: bandageImg, w: 0.765, h: 3, slot: [1.2, 3.8], tall: true },
  { id: 'mint-1', name: 'Mint', src: mintImg, w: 1.8, h: 1, slot: [2.4, 4.5] },
  { id: 'mint-2', name: 'Mint', src: mintImg, w: 1.8, h: 1, slot: [2.4, 5.7] },
]

// Two layouts, in inches: side by side on a wide screen, stacked on a narrow one.
const WIDE = { w: 9.5, h: 7.6, pouch: [0.85, 1.65] as const, slots: [4.75, 0.4] as const }
const NARROW = { w: 5.3, h: 13.5, pouch: [0.7, 1.4] as const, slots: [0.5, 6.4] as const }

// Zipper frame for a pointer height on the pouch (0 top, 1 bottom). Frames 1 to 3 are the pull tab flipping over;
// frames 4 to 15 are the slider travelling down, eased, so the frame is found by matching the slider's place.
function frameAt(p: number) {
  const s = Math.min(1, Math.max(0, (p - 0.185) / 0.64))
  if (s <= 0.02) return 0
  let best = 1
  for (let k = 1; k <= 12; k++) {
    const q = k / 12
    if (Math.abs(q * q * (3 - 2 * q) - s) < Math.abs((best / 12) ** 2 * (3 - (2 * best) / 12) - s)) best = k
  }
  return 3 + best
}

type Drag = { id: string; x: number; y: number; fromInside: boolean }

function Explore() {
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const sheet = useRef<HTMLImageElement | null>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [frame, setFrame] = useState(0)
  const [target, setTarget] = useState(0)
  const [inside, setInside] = useState<string[]>(THINGS.map((t) => t.id).reverse()) // last one comes out first
  const [out, setOut] = useState<Record<string, [number, number]>>({})              // id -> top-left, in inches
  const [order, setOrder] = useState<string[]>([])                                  // stacking, last on top
  const [drag, setDrag] = useState<Drag | null>(null)
  const grip = useRef({ px: 0, py: 0, x: 0, y: 0, moved: false })
  const zipGrip = useRef({ moved: false, y: 0 })

  // Measure the stage and pick the layout and the scale (u = pixels per inch).
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
  const wide = box.w >= 760
  const L = wide ? WIDE : NARROW
  const u = box.w ? (wide ? Math.min(box.w / L.w, Math.max(box.h, 520) / L.h) : box.w / L.w) : 0
  const [px, py] = L.pouch
  const gapX = px + GAP_X * POUCH_W
  const open = frame === LAST

  // Zipper: paint the current frame, and walk one frame at a time toward wherever it was last sent.
  useEffect(() => {
    loadSheet().then((img) => {
      sheet.current = img
      paintFrame(canvas.current, img, 0)
    }, () => {})
  }, [])
  useEffect(() => {
    paintFrame(canvas.current, sheet.current, frame)
    if (frame === target) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const id = requestAnimationFrame(() => setFrame(still ? target : frame + Math.sign(target - frame)))
    return () => cancelAnimationFrame(id)
  }, [frame, target])

  function zipDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    zipGrip.current = { moved: false, y: e.clientY }
  }
  function zipMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    if (Math.abs(e.clientY - zipGrip.current.y) > 4) zipGrip.current.moved = true
    if (!zipGrip.current.moved) return
    const r = e.currentTarget.getBoundingClientRect()
    setTarget(frameAt((e.clientY - r.top) / r.height))
  }
  function zipUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (!zipGrip.current.moved) setTarget(target > LAST / 2 ? 0 : LAST) // a plain click runs it all the way
  }
  function zipKey(e: ReactKeyboardEvent<HTMLDivElement>) {
    const to = { ArrowDown: target + 1, ArrowRight: target + 1, ArrowUp: target - 1, ArrowLeft: target - 1, Home: 0, End: LAST, Enter: target > LAST / 2 ? 0 : LAST, ' ': target > LAST / 2 ? 0 : LAST }[e.key]
    if (to === undefined) return
    e.preventDefault()
    setTarget(Math.min(LAST, Math.max(0, to)))
  }

  // Things. The top one inside shows at the opening once the zipper is all the way down.
  const top = inside[inside.length - 1]
  const peek = (t: Thing): [number, number] => [gapX - 0.8 * t.w, py + POUCH_H * 0.49 - t.h / 2]
  const clampTo = (t: Thing, x: number, y: number): [number, number] => [Math.min(L.w - t.w, Math.max(0, x)), Math.min(L.h - t.h, Math.max(0, y))]
  const takeOut = (id: string, at: [number, number]) => {
    setInside((list) => list.filter((i) => i !== id))
    setOut((o) => ({ ...o, [id]: at }))
  }
  const putBack = (id: string) => {
    setOut((o) => Object.fromEntries(Object.entries(o).filter(([i]) => i !== id)))
    setInside((list) => [...list.filter((i) => i !== id), id])
  }

  function thingDown(e: ReactPointerEvent<HTMLButtonElement>, t: Thing) {
    e.currentTarget.setPointerCapture(e.pointerId)
    const [x, y] = out[t.id] ?? peek(t)
    grip.current = { px: e.clientX, py: e.clientY, x, y, moved: false }
    setOrder((o) => [...o.filter((i) => i !== t.id), t.id])
    setDrag({ id: t.id, x, y, fromInside: !(t.id in out) })
  }
  function thingMove(e: ReactPointerEvent<HTMLButtonElement>, t: Thing) {
    if (!drag || drag.id !== t.id || !u) return
    const g = grip.current
    if (Math.hypot(e.clientX - g.px, e.clientY - g.py) > 4) g.moved = true
    const [x, y] = clampTo(t, g.x + (e.clientX - g.px) / u, g.y + (e.clientY - g.py) / u)
    setDrag({ ...drag, x, y })
  }
  function thingUp(_e: ReactPointerEvent<HTMLButtonElement>, t: Thing) {
    if (!drag || drag.id !== t.id) return
    const moved = grip.current.moved
    setDrag(null)
    if (!moved) return // a plain click is handled by onClick
    const mostlyOut = drag.x + t.w / 2 > gapX
    if (drag.fromInside) {
      if (mostlyOut) takeOut(t.id, [Math.max(drag.x, gapX + 0.12), drag.y])
    } else if (open && !mostlyOut) putBack(t.id)
    else setOut((o) => ({ ...o, [t.id]: [drag.x, drag.y] }))
  }
  // Click or Enter: out to its place in the layout, or back in.
  function thingClick(t: Thing) {
    if (grip.current.moved) {
      grip.current.moved = false
      return
    }
    if (t.id in out) {
      if (open) putBack(t.id)
    } else takeOut(t.id, [L.slots[0] + t.slot[0], L.slots[1] + t.slot[1]])
  }

  const shown = THINGS.filter((t) => t.id in out || (open && t.id === top) || drag?.id === t.id)
  const z = (id: string) => 10 + (order.indexOf(id) < 0 ? 0 : order.indexOf(id) + 1)
  const ox = (box.w - L.w * u) / 2
  const stageStyle: CSSProperties = wide ? { height: Math.max(box.h, 520) } : { height: L.h * u }
  const inner: CSSProperties = { left: ox, top: wide ? (Math.max(box.h, 520) - L.h * u) / 2 : 0, width: L.w * u, height: L.h * u, fontSize: u }

  return (
    <main className="explore" ref={stage} style={stageStyle}>
      <a className="logo" href="/">CLUTCH</a>
      {u > 0 && (
        <div className="bench" style={inner}>
          {/* Pouch dimensions */}
          <div className="dim dim-w" style={{ left: `${px + 0.026}em`, top: `${py - 0.34}em`, width: '2.75em' }}><span>2.75 in</span></div>
          <div className="dim dim-h" style={{ left: `${px - 0.34}em`, top: `${py + 0.018}em`, height: '4.25em' }}><span>4.25 in</span></div>

          <div className="pouch-x" style={{ left: `${px}em`, top: `${py}em`, width: `${POUCH_W}em`, height: `${POUCH_H}em` }}>
            <canvas ref={canvas} width={FRAME_W} height={FRAME_H} role="img" aria-label="Slate pouch with a zipper down the right side and a black band reading CLUTCH in white." />
            <div
              className="zipper"
              role="slider"
              tabIndex={0}
              aria-label="Zipper"
              aria-orientation="vertical"
              aria-valuemin={0}
              aria-valuemax={LAST}
              aria-valuenow={target}
              aria-valuetext={target === LAST ? 'Open' : target === 0 ? 'Closed' : 'Part open'}
              onPointerDown={zipDown}
              onPointerMove={zipMove}
              onPointerUp={zipUp}
              onPointerCancel={zipUp}
              onKeyDown={zipKey}
            />
          </div>

          {shown.map((t) => {
            const dragging = drag?.id === t.id
            const [x, y] = dragging ? [drag.x, drag.y] : (out[t.id] ?? peek(t))
            // Whatever is left of the opening is still inside the pouch, so it is hidden.
            const goingIn = t.id in out ? dragging && open : true
            const hidden = goingIn ? Math.max(0, gapX - x) : 0
            return (
              <button
                key={t.id}
                type="button"
                className={'thing' + (t.tall ? ' is-tall' : '') + (t.dark ? ' is-dark' : '') + (t.low ? ' is-low' : '') + (dragging ? ' is-held' : '')}
                style={{ left: `${x}em`, top: `${y}em`, width: `${t.w}em`, height: `${t.h}em`, zIndex: z(t.id) + (dragging ? 100 : 0), clipPath: hidden ? `inset(-1em -1em -1em ${hidden}em)` : undefined }}
                aria-label={t.id in out ? `${t.name}, out of the pouch` : `${t.name}, in the pouch`}
                onPointerDown={(e) => thingDown(e, t)}
                onPointerMove={(e) => thingMove(e, t)}
                onPointerUp={(e) => thingUp(e, t)}
                onPointerCancel={() => setDrag(null)}
                onClick={() => thingClick(t)}
              >
                <img src={t.src} alt="" draggable={false} />
                <span>{t.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default Explore
