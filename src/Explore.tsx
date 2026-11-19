import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import bandageImg from './assets/item-bandage.webp'
import cardImg from './assets/item-card.webp'
import condomImg from './assets/item-condom.webp'
import mintImg from './assets/item-mint.webp'
import testImg from './assets/item-test.webp'
import { HINT_CLOSE, HINT_OPEN } from './copy'
import './Explore.css'
import { TURN, loadSheet, paintFrame } from './zip'

// Everything here is measured in inches and drawn at one scale (1em = 1 inch inside .bench).
// The pouch and the items are Blender renders. Item sizes are working assumptions until samples arrive.
const POUCH_W = 2.802        // the pouch image, a hair wider than the 2.75 in pouch
const POUCH_H = 4.404
const LAST = TURN.frames - 1
const TURN_MS = 800          // unzip, turn and move, all at once
const BACK_EACH_MS = 150     // gap between one item starting back and the next
const BACK_MS = 420          // one item's trip back into the pouch

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

function Explore() {
  const stage = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const sheet = useRef<HTMLImageElement | null>(null)
  const frame = useRef(0)
  const raf = useRef(0)
  const timer = useRef(0)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [open, setOpen] = useState(false)   // the pouch: unzipped, turned and moved aside
  const [out, setOut] = useState(false)     // the items: laid out
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

  useEffect(() => {
    loadSheet(TURN).then((img) => {
      sheet.current = img
      paintFrame(canvas.current, img, TURN, frame.current)
    }, () => {})
    return () => {
      cancelAnimationFrame(raf.current)
      window.clearTimeout(timer.current)
    }
  }, [])

  const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Play the pouch frames from where they are to `target`, then call `done`.
  function play(target: number, done: () => void) {
    const from = frame.current
    const ms = still() ? 0 : (TURN_MS * Math.abs(target - from)) / LAST
    let start = 0
    const step = (now: number) => {
      start ||= now
      const t = ms === 0 ? 1 : Math.min(1, (now - start) / ms)
      frame.current = Math.round(from + (target - from) * t)
      paintFrame(canvas.current, sheet.current, TURN, frame.current)
      if (t < 1) raf.current = requestAnimationFrame(step)
      else done()
    }
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(step)
  }

  function click() {
    if (busy) return
    setBusy(true)
    if (!open) {
      // Open: the zipper, the turn, the move and the items, all together.
      setOpen(true)
      setOut(true)
      play(LAST, () => setBusy(false))
    } else {
      // Close: the items go back one by one, then the pouch zips up and turns back.
      setOut(false)
      const wait = still() ? 0 : BACK_EACH_MS * (THINGS.length - 1) + BACK_MS
      timer.current = window.setTimeout(() => {
        setOpen(false)
        play(0, () => setBusy(false))
      }, wait)
    }
  }

  // Layout, in inches. Wide: pouch on the left, items in a row to its right. Narrow: pouch on top, items under it.
  const wide = box.w >= 900
  const W = wide ? 12.4 : 5.3
  const viewH = Math.max(box.h, 480)
  const u = box.w ? (wide ? Math.min(box.w / W, viewH / 6.2) : box.w / W) : 0
  const Hclosed = u ? viewH / u : 0
  const H = wide ? Hclosed : open ? Math.max(Hclosed, 14.1) : Hclosed
  const closedAt: [number, number] = [(W - POUCH_W) / 2, (Hclosed - POUCH_H) / 2 - 0.25]
  const openAt: [number, number] = wide ? [0.15, closedAt[1]] : [0.2, 1.35]
  const [px, py] = open ? openAt : closedAt
  const rowAt: [number, number] = [openAt[0] + POUCH_W + 0.25, openAt[1] + POUCH_H / 2]
  const stackAt: [number, number] = [0.5, openAt[1] + POUCH_H + 1.1]
  // Where the items come from and go back to: the zipper when closed, the opening (mid-pouch after the turn) when open.
  const mouth: [number, number] = open ? [openAt[0] + POUCH_W * 0.5, openAt[1] + POUCH_H * 0.5] : [closedAt[0] + POUCH_W * 0.87, closedAt[1] + POUCH_H * 0.5]

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
            const delay = i * BACK_EACH_MS
            const style: CSSProperties = {
              left: `${x}em`,
              top: `${y}em`,
              width: `${t.w}em`,
              height: `${t.h}em`,
              transform: out ? 'none' : `translate(${back}) scale(.5)`,
              opacity: out ? 1 : 0,
              transition: out
                ? `transform ${TURN_MS}ms cubic-bezier(.2, .7, .2, 1), opacity 260ms ease-out`
                : open
                  ? `transform ${BACK_MS}ms ease-in ${delay}ms, opacity 160ms ease-in ${delay + BACK_MS - 160}ms`
                  : 'none',
            }
            return <img key={t.id} className="thing" src={t.src} alt={t.name} draggable={false} style={style} />
          })}

          <button
            type="button"
            className="pouch-x"
            aria-expanded={open}
            onClick={click}
            style={{ left: `${px}em`, top: `${py}em`, width: `${POUCH_W}em`, height: `${POUCH_H}em`, transitionDuration: `${TURN_MS}ms` }}
          >
            <canvas ref={canvas} width={TURN.w} height={TURN.h} role="img" aria-label="Slate pouch with a zipper down the right side and a black band reading CLUTCH in white." />
            <span className="hint">{out ? HINT_CLOSE : HINT_OPEN}</span>
          </button>
        </div>
      )}
    </main>
  )
}

export default Explore
