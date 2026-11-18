import { useEffect, useRef, useState } from 'react'
import bone1200 from './assets/pouch-bone-1200.webp'
import bone640 from './assets/pouch-bone-640.webp'
import fuchsia1200 from './assets/pouch-fuchsia-1200.webp'
import fuchsia640 from './assets/pouch-fuchsia-640.webp'
import './App.css'
import ClutchMockup from './components/ClutchMockup'
import { FEEDBACK, PREORDER_PRICE, RETAIL_PRICE, STRIPE_PREORDER_URL } from './config'

const questions = [
  ['Why buy this when condoms and gum are cheap or free?', 'You can grab those yourself. Clutch is for having everything packed in one pouch before you leave, including the two things most people don’t carry: drink tests and a vomit bag.'],
  ['How much is it?', `$${PREORDER_PRICE} if you preorder. $${RETAIL_PRICE} once the kit launches.`],
  ['What colors does it come in?', 'Two at launch: fuchsia and bone. Both have the black band.'],
  ['When and where do I get one?', 'The first batch is for Emory University in spring 2027. Preorders are picked up on campus.'],
  ['Can my club or chapter get a box?', 'That’s the plan. We’re designing boxes of 25 kits with bonus refills for fraternities, sororities and clubs.'],
  ['What can the drink tests tell me?', 'We’re still choosing a supplier. The card in the kit explains how to use the test and what it detects. A negative result can miss substances.'],
]

const POUCHES = {
  fuchsia: { name: 'Fuchsia', src: fuchsia1200, small: fuchsia640, alt: 'Fuchsia Clutch pouch with a zipper along the top and a black band reading CLUTCH in white.' },
  bone: { name: 'Bone', src: bone1200, small: bone640, alt: 'Bone Clutch pouch with a zipper along the top and a black band reading CLUTCH in white.' },
}

function SectionLink({ to, children, ...props }) {
  function navigate(event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const section = document.getElementById(to)
    if (!section) return
    event.preventDefault()
    section.focus({ preventScroll: true })
    section.scrollIntoView()
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

const BAND = ['CLUTCH', 'Fuchsia or bone', 'CLUTCH', 'Fits a purse', 'CLUTCH', 'One slot left for you']

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

// The two launch colorways. They float, lean toward the pointer, and swap places when you pick one.
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
        {Object.entries(POUCHES).map(([key, pouch]) => (
          <div key={key} className={`pouch pouch-${key}${front === key ? ' is-front' : ''}`}>
            <div className="pouch-float">
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
            </div>
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
        <span className="caption-note">Concept rendered in Blender · 4.5 × 3 in</span>
      </figcaption>
    </figure>
  )
}

function App() {
  useScrollReveal()
  return (
    <>
      <SectionLink className="skip-link" to="main">Skip to content</SectionLink>
      <header className="site-header" id="top" tabIndex={-1}>
        <div className="shell nav-layout">
          <SectionLink className="wordmark" to="top" aria-label="Clutch home">CLUTCH</SectionLink>
          <nav aria-label="Main navigation">
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
            <p className="eyebrow">The going-out kit</p>
            <h1 id="hero-title">Came in <em>clutch.</em></h1>
            <p className="hero-description">Two drink tests, two condoms, a vomit bag and gum in a 4.5 × 3 in. pouch that fits a purse, with one empty slot for your own item.</p>
            <div className="hero-actions">
              <PreorderButton />
              <p className="price"><strong>${PREORDER_PRICE}</strong> preorder · ${RETAIL_PRICE} at launch</p>
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
                {[...BAND, ...BAND].map((text, i) => <span key={i} aria-hidden={i >= BAND.length || (text === 'CLUTCH' && i > 0) ? 'true' : undefined}>{text}</span>)}
              </p>
            ))}
          </div>
        </div>

        <ul className="facts shell" aria-label="Key facts">
          <li data-reveal><span>Price</span><strong>${PREORDER_PRICE}</strong><small>preorder · ${RETAIL_PRICE} at launch</small></li>
          <li data-reveal><span>Size</span><strong>4.5 × 3 in. </strong><small>smaller than an index card · about 0.9 in. thick packed (estimate)</small></li>
          <li data-reveal><span>Inside</span><strong>7 items</strong><small>plus one empty slot for your own</small></li>
          <li data-reveal><span>First batch</span><strong>Spring 2027</strong><small>Emory University · campus pickup</small></li>
        </ul>

        <section className="kit shell" id="kit" tabIndex={-1} aria-labelledby="kit-title" data-reveal>
          <h2 id="kit-title" tabIndex={-1}>What’s inside</h2>
          <p className="kit-hint">Drag to turn this CSS-animated mockup. Tap an item to see it.</p>
          <ClutchMockup />
        </section>

        {FEEDBACK.length > 0 && (
          <section className="feedback shell" aria-labelledby="feedback-title" data-reveal>
            <h2 id="feedback-title">Early feedback</h2>
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
              <h2 id="preorder-title">Preorder for ${PREORDER_PRICE}</h2>
              <p>The first batch goes to Emory University in spring 2027. Lock in ${PREORDER_PRICE} now; it’s ${RETAIL_PRICE} at launch.</p>
            </div>
            <PreorderButton />
          </div>
        </section>

        <section className="faq shell" id="faq" tabIndex={-1} aria-labelledby="faq-title" data-reveal>
          <h2 id="faq-title">FAQ</h2>
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
          <SectionLink className="wordmark" to="top" aria-label="Clutch home">CLUTCH</SectionLink>
          <p>Made by Emory students.</p>
          <SectionLink className="text-link" to="top">Back to top <span aria-hidden="true">↑</span></SectionLink>
        </div>
      </footer>
    </>
  )
}

export default App
