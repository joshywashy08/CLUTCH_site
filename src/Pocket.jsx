import { useState } from 'react'
import ivory800 from './assets/pocket-ivory-800.webp'
import slate800 from './assets/pocket-slate-800.webp'
import sizes1400 from './assets/sizes-1400.webp'
import sizes800 from './assets/sizes-800.webp'
import './App.css'
import './Pocket.css'

// CLUTCH Pocket: concept page. Not linked from the homepage.
// Every detail here is tentative. Keep it that way in the copy until samples and pricing are decided.

const COLORS = {
  slate: { name: 'Slate', src: slate800 },
  ivory: { name: 'Ivory', src: ivory800 },
}

const ELEMENTS = [
  { count: '1', name: 'Drink-spike test', note: 'Check a drink if something feels off. A negative result is not a guarantee.' },
  { count: '1', name: 'Condom', note: 'Individually wrapped.' },
  { count: '1', name: 'Bandage', note: 'For the blister your shoes give you by midnight.' },
  { count: '2', name: 'Mints', note: 'Individually wrapped.' },
  { count: '1', name: 'Instruction card', note: 'How to use the test and who to call.' },
]

const SPECS = [
  ['Dimensions', 'About 2.75 × 4.25 in., about 0.75 in. thick packed'],
  ['Orientation', 'Vertical'],
  ['Zipper', 'Down the right side of the front'],
  ['Band', 'One black band across the pouch, CLUTCH in white'],
  ['Colors', 'Slate or ivory'],
  ['Material', 'Matte vinyl'],
  ['Fits', 'A jeans or jacket pocket'],
  ['Price', 'Around $10 (not set)'],
]

const COMPARE = [
  ['', 'Clutch', 'Pocket'],
  ['Size', '4.5 × 3 in.', 'About 2.75 × 4.25 in.'],
  ['Shape', 'Horizontal', 'Vertical'],
  ['Zipper', 'Top of the front', 'Right side of the front'],
  ['Inside', '9 items + your slot', '6 items'],
  ['Colors', 'Fuchsia or ivory', 'Slate or ivory'],
  ['Vomit bag', 'Yes', 'No: there isn’t room'],
  ['Price', '$12 preorder, $15 at launch', 'Around $10, not set'],
]

export default function Pocket() {
  const [color, setColor] = useState('slate')
  const other = color === 'slate' ? 'ivory' : 'slate'

  return (
    <>
      <header className="site-header">
        <div className="shell nav-layout">
          <a className="wordmark" href="/" aria-label="Clutch home">CLUTCH</a>
          <nav aria-label="Main navigation">
            <a href="/">Back to Clutch</a>
          </nav>
        </div>
      </header>

      <main className="pocket-page">
        <section className="shell pocket-hero" aria-labelledby="pocket-title">
          <div className="pocket-copy">
            <p className="concept-flag">Concept · Not for sale</p>
            <h1 id="pocket-title"><span className="h1-line">Clutch</span> <span className="h1-band">Pocket.</span></h1>
            <p className="hero-description">A smaller, vertical Clutch for anyone who goes out with just their pockets. It keeps the black band, drops to the essentials and fits a jeans or jacket pocket.</p>
            <p className="pocket-note">Everything on this page is tentative. Size, contents and price will change once we have samples.</p>
          </div>
          <figure className="pocket-figure">
            {/* Clicking the render switches colorway, same as the swatches. */}
            <button type="button" className="pocket-render" onClick={() => setColor(other)} aria-label={`Show the ${COLORS[other].name.toLowerCase()} Pocket`}>
              {Object.entries(COLORS).map(([key, c]) => (
                <img key={key} src={c.src} alt={key === color ? `${c.name} Pocket pouch, vertical, with a zipper down the right side and a black band reading CLUTCH in white.` : ''} width="800" height="1000" className={key === color ? 'is-shown' : ''} draggable="false" />
              ))}
            </button>
            <figcaption>
              <span className="swatches" role="group" aria-label="Pocket colorway">
                {Object.entries(COLORS).map(([key, c]) => (
                  <button key={key} type="button" className={`swatch swatch-${key}`} aria-pressed={color === key} onClick={() => setColor(key)}>
                    <i aria-hidden="true" />{c.name}
                  </button>
                ))}
              </span>
              <span className="caption-note">Concept rendered in Blender</span>
            </figcaption>
          </figure>
        </section>

        <section className="shell pocket-section" aria-labelledby="specs-title">
          <h2 id="specs-title">The details.</h2>
          <p className="section-sub">Tentative.</p>
          <dl className="spec-grid">
            {SPECS.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="shell pocket-section" aria-labelledby="inside-title">
          <h2 id="inside-title">What’s inside.</h2>
          <p className="section-sub">Six items. No vomit bag and no empty slot: there isn’t room.</p>
          <ul className="element-list">
            {ELEMENTS.map((e) => (
              <li key={e.name}>
                <b aria-hidden="true">{e.count}</b>
                <span><strong>{e.name}</strong>{e.note}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="shell pocket-section" aria-labelledby="scale-title">
          <h2 id="scale-title">Next to the Clutch.</h2>
          <figure className="scale-figure">
            <img src={sizes1400} srcSet={`${sizes800} 800w, ${sizes1400} 1400w`} sizes="(max-width: 900px) 92vw, 1180px" alt="The horizontal fuchsia Clutch pouch next to the smaller vertical slate Pocket pouch, shown at the same scale." width="1400" height="700" loading="lazy" />
            <figcaption>Concept renders at the same scale.</figcaption>
          </figure>
          <div className="compare-wrap">
            <table className="compare">
              <thead>
                <tr>{COMPARE[0].map((h, i) => <th key={i} scope="col">{h}</th>)}</tr>
              </thead>
              <tbody>
                {COMPARE.slice(1).map((row) => (
                  <tr key={row[0]}>
                    <th scope="row">{row[0]}</th>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="pocket-fine">A negative drink test is not a guarantee. If you or a friend feel wrong, get help and call 911.</p>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-layout">
          <a className="wordmark" href="/" aria-label="Clutch home">CLUTCH</a>
          <p>Pocket is a concept. Nothing here is for sale.</p>
          <a className="text-link" href="/">Back to Clutch <span aria-hidden="true">→</span></a>
        </div>
      </footer>
    </>
  )
}
