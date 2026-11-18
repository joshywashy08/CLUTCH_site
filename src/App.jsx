import { useEffect, useRef, useState } from 'react'
import ivory1200 from './assets/pouch-ivory-1200.webp'
import ivory640 from './assets/pouch-ivory-640.webp'
import fuchsia1200 from './assets/pouch-fuchsia-1200.webp'
import fuchsia640 from './assets/pouch-fuchsia-640.webp'
import './App.css'
import ClutchMockup from './components/ClutchMockup'
import { FEEDBACK, PREORDER_PRICE, RETAIL_PRICE, STRIPE_PREORDER_URL } from './config'

const KIT_LIST = [['1', 'Drink-spike test'], ['2', 'Condoms'], ['2', 'Bandages'], ['1', 'Vomit bag'], ['2', 'Mints'], ['1', 'Instruction card'], ['+', 'Your slot']]

// Keep every claim here true: no safety promises, no accuracy numbers.
const questions = [
  ['What’s the empty slot for?', 'Whatever you’d turn around for. Lip gloss, travel cologne, earplugs, a hair tie, a spare key. The slot is part of the kit: we leave it empty on purpose so the pouch is packed for your night, not a generic one.'],
  ['Why not just grab this stuff myself?', 'You could. Most people don’t, and you find out at 1 a.m. Nobody packs a drink test or a vomit bag on the way out the door. Clutch puts all of it in one pouch that lives in your bag, so it’s already there when someone needs it.'],
  ['What’s inside?', 'A drink-spike test, two condoms, two bandages, a vomit bag, two mints, an instruction card and one empty slot for your own item.'],
  ['Why one drink test?', 'One covers a night out, and it keeps the kit at a price students actually pay. We plan to sell extra tests separately for anyone who wants a second.'],
  ['Is it just for me?', 'Half the point is being the friend who has it. The bandage for someone’s heels, the mint before the photo, the bag at the end of the night.'],
  ['How much is it?', `$${PREORDER_PRICE} if you preorder. $${RETAIL_PRICE} once the kit launches. The pouch is reusable, so restock it from your own drawer and keep carrying it.`],
  ['What colors does it come in?', 'Fuchsia and ivory. Both have the black CLUTCH band.'],
  ['When and where do I get one?', 'The first batch is for Emory University in spring 2027. Preorders are picked up on campus.'],
  ['Can my club or chapter get a box?', 'That’s the plan. We’re designing boxes of 25 kits with bonus refills for fraternities, sororities and clubs.'],
  ['What can the drink tests tell me?', 'We’re still choosing a supplier. The card in the kit explains how to use the test and what it detects. A negative result can miss substances.'],
]

const POUCHES = {
  fuchsia: { name: 'Fuchsia', src: fuchsia1200, small: fuchsia640, alt: 'Fuchsia Clutch pouch with a zipper along the top and a black band reading CLUTCH in white.' },
  ivory: { name: 'Ivory', src: ivory1200, small: ivory640, alt: 'Ivory Clutch pouch with a zipper along the top and a black band reading CLUTCH in white.' },
}

// Things that fit the empty slot (about 2.8 × 0.9 in. in the model). Keep them small enough to be true.
const SLOT_IDEAS = ['Lip gloss', 'Travel cologne', 'Earplugs', 'A hair tie', 'Bobby pins', 'A folded $20', 'A spare key']

const BAND = ['The pouch is the point', 'Fits a purse', 'Fuchsia or ivory', 'One slot is yours', `$${PREORDER_PRICE} preorder`]

function SectionLink({ to, children, ...props }) {
  function navigate(event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const section = document.getElementById(to)
    if (!section) return
    event.preventDefault()
    section.focus({ preventScroll: true })
    // The header is sticky, so it is always "in view" and scrollIntoView does nothing. Scroll the page instead.
    if (to === 'top') window.scrollTo({ top: 0 })
    else section.scrollIntoView()
  }

  return <a {...props} href={`#${to}`} onClick={navigate}>{children}</a>
}

// The one checkout button. Goes straight to Stripe once STRIPE_PREORDER_URL is set (src/config.js).
function PreorderButton() {
  if (STRIPE_PREORDER_URL) {
    return <a className="button button-buy" href={STRIPE_PREORDER_URL}>Preorder · ${PREORDER_PRICE} <span aria-hidden="true">→</span></a>
  }
  return <span className="button button-buy is-soon" aria-disabled="true">Preorders open soon</span>
}

// Header shortcut: straight to Stripe when live, otherwise to the preorder section.
function PreorderShortcut() {
  const label = <>Preorder <span className="nav-price">${PREORDER_PRICE}</span></>
  if (STRIPE_PREORDER_URL) return <a className="nav-buy" href={STRIPE_PREORDER_URL}>{label}</a>
  return <SectionLink className="nav-buy" to="preorder">{label}</SectionLink>
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const theme = document.documentElement.dataset.theme
    return theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
    function syncSystemTheme() {
      if (!document.documentElement.dataset.theme) setIsDark(systemTheme.matches)
    }
    syncSystemTheme()
    systemTheme.addEventListener('change', syncSystemTheme)
    return () => systemTheme.removeEventListener('change', syncSystemTheme)
  }, [])

  function toggleTheme() {
    const theme = isDark ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    setIsDark(!isDark)
    try {
      localStorage.setItem('clutch-theme', theme)
    } catch {
      // The theme still applies to the current page.
    }
  }

  return (
    <button className="theme-toggle" type="button" aria-label="Dark mode" aria-pressed={isDark} onClick={toggleTheme}>
      <span aria-hidden="true">{isDark ? '☀' : '☾'}</span>
    </button>
  )
}

function Wordmark() {
  return <SectionLink className="wordmark" to="top" aria-label="Clutch, back to top">CLUTCH</SectionLink>
}

// Fades sections in as they scroll into view. Skipped when the visitor prefers reduced motion.
function useScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const root = document.documentElement
    root.classList.add('reveal-on')
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.12 })
    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))
    return () => { observer.disconnect(); root.classList.remove('reveal-on') }
  }, [])
}

// A round sticker whose text ring turns slowly.
function Sticker() {
  return (
    <div className="sticker" aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <defs>
          <path id="sticker-ring" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
        </defs>
        <circle cx="100" cy="100" r="98" className="sticker-disc" />
        <g className="sticker-ring">
          <text><textPath href="#sticker-ring" textLength="448" lengthAdjust="spacing">PREORDER · FITS A PURSE · ONE SLOT IS YOURS ·</textPath></text>
        </g>
      </svg>
      <strong>${PREORDER_PRICE}</strong>
    </div>
  )
}

// The two launch colorways. They float, lean toward the pointer, and swap places when you pick one.
// Any click on either pouch swaps which one is in front.
const other = (key) => (key === 'fuchsia' ? 'ivory' : 'fuchsia')

function HeroPouches() {
  const [front, setFront] = useState('fuchsia')
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    function onMove(event) {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = el.getBoundingClientRect()
        const x = (event.clientX - box.left) / box.width - 0.5
        const y = (event.clientY - box.top) / box.height - 0.5
        el.style.setProperty('--px', Math.max(-1, Math.min(1, x * 2)).toFixed(3))
        el.style.setProperty('--py', Math.max(-1, Math.min(1, y * 2)).toFixed(3))
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(frame) }
  }, [])

  return (
    <figure className="hero-figure" ref={ref}>
      <div className="pouches">
        <Sticker />
        {Object.entries(POUCHES).map(([key, pouch]) => (
          <div key={key} className={`pouch pouch-${key}${front === key ? ' is-front' : ''}`}>
            <button type="button" className="pouch-float" aria-label={front === key ? `Swap to the ${other(key)} pouch` : `Show the ${pouch.name.toLowerCase()} pouch in front`} onClick={() => setFront(front === key ? other(key) : key)}>
              <img
                src={pouch.src}
                srcSet={`${pouch.small} 640w, ${pouch.src} 1200w`}
                sizes="(max-width: 700px) 78vw, 36vw"
                alt={pouch.alt}
                width="1200"
                height="897"
                fetchPriority={key === 'fuchsia' ? 'high' : undefined}
                draggable="false"
              />
              {/* Only the pouch body takes clicks, not the transparent padding and shadow around it. */}
              <span className="pouch-hit" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <figcaption>
        <span className="swatches" role="group" aria-label="Colorway shown in front">
          {Object.entries(POUCHES).map(([key, pouch]) => (
            <button key={key} type="button" className={`swatch swatch-${key}`} aria-pressed={front === key} onClick={() => setFront(key)}>
              <i aria-hidden="true" />{pouch.name}
            </button>
          ))}
        </span>
        <span className="caption-note">Concept rendered in Blender · 4.5 × 3 in.</span>
      </figcaption>
    </figure>
  )
}

// The empty slot, cycling through things people might put in it.
function SlotIdeas() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setIndex((n) => (n + 1) % SLOT_IDEAS.length), 1800)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="slot-box">
      <span className="slot-tag">Your slot</span>
      <p className="slot-word" aria-hidden="true"><span key={index}>{SLOT_IDEAS[index]}</span></p>
      <p className="sr-only">For example: {SLOT_IDEAS.join(', ')}.</p>
    </div>
  )
}

// The pouch, explained: numbered markers on the render, matched to the list beside it.
const FEATURES = [
  { n: '1', title: 'The band', text: 'One black band all the way around, with CLUTCH in white. It’s the logo, and it’s what people notice first.', x: 50, y: 45 },
  { n: '2', title: 'The zipper', text: 'Runs along the top of the front, so nothing falls out until you open it.', x: 62, y: 21 },
  { n: '3', title: 'The size', text: '4.5 × 3 in. and about 0.9 in. thick packed. It fits a small purse or a clutch.', x: 84, y: 43 },
  { n: '4', title: 'It stays', text: 'Reusable vinyl in fuchsia or ivory. Restock it from your own drawer and keep carrying it.', x: 25, y: 66 },
]

function PouchSection() {
  const [active, setActive] = useState(null)
  return (
    <section className="pouch-section shell" id="pouch" tabIndex={-1} aria-labelledby="pouch-title" data-reveal>
      <div className="pouch-head">
        <p className="eyebrow">The product</p>
        <h2 id="pouch-title">The pouch is the point.</h2>
        <p>Everything inside the kit you could find at a pharmacy. The pouch you can’t. It’s what stays in your bag after the night, and it’s what we’re making.</p>
      </div>
      <div className="pouch-layout">
        <figure className={'pouch-diagram' + (active ? ' has-active' : '')}>
          <img src={fuchsia1200} srcSet={`${fuchsia640} 640w, ${fuchsia1200} 1200w`} sizes="(max-width: 900px) 92vw, 58vw" alt="Fuchsia Clutch pouch seen from above, with numbered markers on the band, the zipper and the edge." width="1200" height="897" loading="lazy" />
          <span className="dim dim-w" aria-hidden="true"><b>4.5 in.</b></span>
          <span className="dim dim-h" aria-hidden="true"><b>3 in.</b></span>
          {FEATURES.map((f) => (
            <span key={f.n} className={'marker' + (active === f.n ? ' is-active' : '')} style={{ left: `${f.x}%`, top: `${f.y}%` }} aria-hidden="true">{f.n}</span>
          ))}
        </figure>
        <ol className="feature-list">
          {FEATURES.map((f) => (
            <li key={f.n} onPointerEnter={() => setActive(f.n)} onPointerLeave={() => setActive(null)}>
              <button type="button" aria-pressed={active === f.n} onClick={() => setActive(active === f.n ? null : f.n)} onFocus={() => setActive(f.n)} onBlur={() => setActive(null)}>
                <span className="feature-n" aria-hidden="true">{f.n}</span>
                <span><strong>{f.title}</strong>{f.text}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function App() {
  useScrollReveal()
  return (
    <>
      <SectionLink className="skip-link" to="main">Skip to content</SectionLink>
      <header className="site-header" id="top" tabIndex={-1}>
        <div className="shell nav-layout">
          <Wordmark />
          <nav aria-label="Main navigation">
            <SectionLink to="pouch">Pouch</SectionLink>
            <SectionLink to="kit">Kit</SectionLink>
            <SectionLink to="faq">FAQ</SectionLink>
            <PreorderShortcut />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="hero shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">The pouch for going out</p>
            <h1 id="hero-title"><span className="h1-line">Came in</span> <span className="h1-band">Clutch.</span></h1>
            <p className="hero-description">A 4.5 × 3 in. vinyl pouch with one black band. It fits a purse, the zipper keeps everything in, and it comes packed for the night: a drink test, two condoms, two bandages, a vomit bag and mints. Plus one empty slot that’s yours to fill.</p>
            <div className="hero-actions">
              <PreorderButton />
              <p className="price"><strong>${PREORDER_PRICE}</strong><span>preorder<br />${RETAIL_PRICE} at launch</span></p>
            </div>
            <p className="hero-meta">
              <SectionLink className="text-link" to="kit-title">See what’s inside <span aria-hidden="true">↓</span></SectionLink>
            </p>
          </div>
          <HeroPouches />
        </section>

        <div className="wristband">
          <div className="wristband-track">
            {[0, 1].map((copy) => (
              <p key={copy} aria-hidden={copy === 1 ? 'true' : undefined}>
                {[...BAND, ...BAND].map((text, i) => <span key={i} aria-hidden={i >= BAND.length ? 'true' : undefined}>{text}</span>)}
              </p>
            ))}
          </div>
        </div>

        <PouchSection />

        <ul className="facts shell" aria-label="Key facts">
          <li data-reveal><span>Price</span><strong>${PREORDER_PRICE}</strong><small>preorder · ${RETAIL_PRICE} at launch</small></li>
          <li data-reveal><span>Size</span><strong>4.5 × 3 in.</strong><small>smaller than an index card · about 0.9 in. thick packed (estimate)</small></li>
          <li data-reveal><span>Inside</span><strong>9 items</strong><small>plus one slot that’s yours</small></li>
          <li data-reveal><span>First batch</span><strong>Spring 2027</strong><small>Emory University · campus pickup</small></li>
        </ul>

        <section className="kit shell" id="kit" tabIndex={-1} aria-labelledby="kit-title" data-reveal>
          <div className="kit-layout">
            <div className="kit-copy">
              <h2 id="kit-title" tabIndex={-1}>What’s inside.</h2>
              <p className="kit-hint">Nine essentials and one empty slot in a 4.5 × 3 in. pouch. Drag this CSS-animated model to turn it, then click the zipper or Unzip to see what each one is for.</p>
              <ul className="kit-list">
                {KIT_LIST.map(([n, name]) => <li key={name}><b>{n}</b>{name}</li>)}
              </ul>
            </div>
            <ClutchMockup />
          </div>
        </section>


        <section className="slot-section" aria-labelledby="slot-title" data-reveal>
          <div className="shell slot-layout">
            <div className="slot-copy">
              <p className="eyebrow">Built in, left empty</p>
              <h2 id="slot-title">One slot is yours.</h2>
              <p>Every kit comes with one space left empty on purpose. It’s part of the kit, not leftover room. Fill it with whatever you’d turn around for.</p>
            </div>
            <SlotIdeas />
          </div>
        </section>

        {FEEDBACK.length > 0 && (
          <section className="feedback shell" aria-labelledby="feedback-title" data-reveal>
            <h2 id="feedback-title">Early feedback.</h2>
            <p className="feedback-note">From people who have seen the concept. Kits aren’t on sale yet, so these aren’t buyer reviews.</p>
            <ul className="feedback-list">
              {FEEDBACK.map(({ quote, name, context }) => (
                <li key={name + quote}>
                  <blockquote>“{quote}”</blockquote>
                  <p><strong>{name}</strong><span>{context}</span></p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="preorder shell" id="preorder" tabIndex={-1} aria-labelledby="preorder-title">
          <div className="preorder-card" data-reveal>
            <div>
              <p className="eyebrow">Emory goes first</p>
              <h2 id="preorder-title">Preorder. <span>${PREORDER_PRICE}.</span></h2>
              <p>The first batch goes to Emory University in spring 2027. Lock in ${PREORDER_PRICE} now; it’s ${RETAIL_PRICE} at launch.</p>
            </div>
            <PreorderButton />
          </div>
        </section>

        <section className="faq shell" id="faq" tabIndex={-1} aria-labelledby="faq-title" data-reveal>
          <h2 id="faq-title">FAQ.</h2>
          <div className="faq-list">
            {questions.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}<span aria-hidden="true" /></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-layout">
          <Wordmark />
          <p>Made by Emory students.</p>
          <SectionLink className="text-link" to="top">Back to top <span aria-hidden="true">↑</span></SectionLink>
        </div>
      </footer>
    </>
  )
}

export default App
