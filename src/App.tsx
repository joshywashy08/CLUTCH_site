import { useEffect, useRef, useState } from 'react'
import './App.css'
import { EXPLORE_LABEL, FAQ, HEADLINE, HEADLINE_MARK, PREORDER_LABEL, PREORDER_PRICE, RETAIL_PRICE } from './copy'
import { ZIP, loadSheet, paintFrame } from './zip'

// What is in the pouch. Names and counts only.
const CONTENTS: [number, string][] = [
  [1, 'Drink test'],
  [2, 'Condoms'],
  [2, 'Bandages'],
  [2, 'Mints'],
  [1, 'Instruction card'],
]

// The headline, with one phrase underlined.
function Headline() {
  const at = HEADLINE_MARK ? HEADLINE.indexOf(HEADLINE_MARK) : -1
  if (at < 0) return <>{HEADLINE}</>
  return <>{HEADLINE.slice(0, at)}<mark>{HEADLINE_MARK}</mark>{HEADLINE.slice(at + HEADLINE_MARK.length)}</>
}

const ZIP_MS = 260 // how long the zipper takes, top to bottom

// The product. Click the pouch: the zipper slides down and the pouch moves aside, then everything inside is laid
// out next to it. Click again and it zips back up. The laid-out items are drawings for now (about 150 units to the inch), each with its name on it.
function Product() {
  const [open, setOpen] = useState(false)    // where the zipper is heading
  const [shown, setShown] = useState(false)  // contents are laid out (only once the zipper is fully down)
  const canvas = useRef<HTMLCanvasElement>(null)
  const sheet = useRef<HTMLImageElement | null>(null)
  const frame = useRef(0)
  const raf = useRef(0)

  const paint = () => paintFrame(canvas.current, sheet.current, ZIP, frame.current)

  useEffect(() => {
    loadSheet(ZIP).then((img) => {
      sheet.current = img
      paint()
    }, () => {})
    return () => cancelAnimationFrame(raf.current)
  }, [])

  function toggle() {
    const next = !open
    const target = next ? ZIP.frames - 1 : 0
    const from = frame.current
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ms = (ZIP_MS * Math.abs(target - from)) / (ZIP.frames - 1)
    setOpen(next)
    if (!next) setShown(false)
    cancelAnimationFrame(raf.current)
    let start = 0
    const step = (now: number) => {
      start ||= now
      const t = still || ms === 0 ? 1 : Math.min(1, (now - start) / ms)
      frame.current = Math.round(from + (target - from) * t)
      paint()
      if (t < 1) raf.current = requestAnimationFrame(step)
      else if (next) setShown(true)
    }
    raf.current = requestAnimationFrame(step)
  }

  return (
    <div className="panel">
      <span className="logo">CLUTCH</span>
      <div className={'stack' + (open ? ' is-open' : '')}>
        <button type="button" className="pouch" aria-expanded={open} aria-controls="inside" onClick={toggle}>
          <canvas
            ref={canvas}
            className="zip"
            width={ZIP.w}
            height={ZIP.h}
            role="img"
            aria-label="Slate pouch standing upright, with a zipper down the right side and a black band reading CLUTCH in white."
          />
          <span className="cue">{open ? 'Close' : 'Open'}</span>
        </button>
        {shown && (
          <svg id="inside" className="inside" viewBox="0 0 730 1110" role="img" aria-label="What comes out of the pouch: an instruction card, two condoms, a drink test, two bandages and two mints.">
            <rect className="in-light" x="40" y="30" width="300" height="525" rx="10" />
            <rect className="in-ink" x="85" y="252" width="210" height="58" />
            <text className="in-logo" x="194" y="291" textAnchor="middle">CLUTCH</text>
            <rect className="in-dark" x="390" y="30" width="300" height="300" rx="8" />
            <circle className="in-ring" cx="540" cy="180" r="98" />
            <rect className="in-dark" x="390" y="350" width="300" height="300" rx="8" />
            <circle className="in-ring" cx="540" cy="500" r="98" />
            <rect className="in-light" x="40" y="600" width="150" height="450" rx="8" />
            <rect className="in-window" x="85" y="660" width="60" height="150" rx="6" />
            <line className="in-mark" x1="95" y1="705" x2="135" y2="705" />
            <line className="in-mark" x1="95" y1="760" x2="135" y2="760" />
            <rect className="in-light" x="225" y="600" width="115" height="450" rx="57" />
            <rect className="in-window" x="240" y="715" width="85" height="220" rx="6" />
            <rect className="in-light" x="405" y="700" width="270" height="150" rx="40" />
            <rect className="in-light" x="405" y="880" width="270" height="150" rx="40" />
            <text className="in-name" x="190" y="405" textAnchor="middle">Instruction</text>
            <text className="in-name" x="190" y="445" textAnchor="middle">card</text>
            <text className="in-name is-light" x="540" y="192" textAnchor="middle">Condom</text>
            <text className="in-name is-light" x="540" y="512" textAnchor="middle">Condom</text>
            <text className="in-name" transform="translate(127 930) rotate(-90)" textAnchor="middle">Drink test</text>
            <text className="in-name" transform="translate(294 825) rotate(-90)" textAnchor="middle">2 Bandages</text>
            <text className="in-name" x="540" y="787" textAnchor="middle">Mint</text>
            <text className="in-name" x="540" y="967" textAnchor="middle">Mint</text>
          </svg>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <main>
      <section className="hero" aria-labelledby="headline">
        <Product />

        <div className="pitch">
          <h1 id="headline"><Headline /></h1>
          <ul className="contents" aria-label="What's inside">
            {CONTENTS.map(([count, name]) => (
              <li key={name}><b>{count}</b>{name}</li>
            ))}
          </ul>
          <p className="price">
            <s>{RETAIL_PRICE} retail</s>
            <strong>{PREORDER_PRICE} preorder</strong>
          </p>
          <div className="actions">
            {/* Placeholder: preorders are not open yet, so this button does nothing. */}
            <button type="button" className="button is-hot">{PREORDER_LABEL}</button>
            {EXPLORE_LABEL && <a className="button is-line" href="/explore">{EXPLORE_LABEL}</a>}
          </div>
        </div>
      </section>

      {/* The pouch at true scale between a phone and a bank card. 100 units = 1 inch. */}
      <section className="more">
        <div className="faq">
          <h2>FAQ</h2>
          {FAQ.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
        <div className="size">
        <svg viewBox="0 0 1100 690" role="img" aria-label="Size comparison at the same scale: a phone at 5.8 by 2.8 inches, the pouch at 4.25 by 2.75 inches, and a bank card at 3.4 by 2.1 inches.">
          <rect className="sc-line" x="110" y="19" width="282" height="581" rx="38" />
          <rect className="sc-line" x="221" y="36" width="60" height="16" rx="8" />
          <rect className="sc-pouch" x="462" y="175" width="275" height="425" rx="34" />
          <rect className="sc-band" x="462" y="420" width="275" height="62" />
          <text className="sc-word" x="599" y="462" textAnchor="middle">CLUTCH</text>
          <rect className="sc-line" x="807" y="263" width="213" height="337" rx="16" />
          <rect className="sc-line" x="835" y="300" width="42" height="56" rx="6" />
          <text className="sc-label" x="599" y="662" textAnchor="middle">2.75 × 4.25 in.</text>
        </svg>
        </div>
      </section>
    </main>
  )
}

export default App
