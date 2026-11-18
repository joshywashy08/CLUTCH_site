import { useEffect, useState } from 'react'
import colors1350 from './assets/clutch-colors-1350.webp'
import colors800 from './assets/clutch-colors-800.webp'
import './App.css'
import ClutchMockup from './components/ClutchMockup'
import { FEEDBACK, PREORDER_PRICE, RETAIL_PRICE, STRIPE_PREORDER_URL } from './config'

const questions = [
  ['Why buy this when condoms and gum are cheap or free?', 'You can grab those yourself. Clutch is for having everything packed in one pouch before you leave, including the two things most people don’t carry: drink tests and a vomit bag.'],
  ['How much is it?', `$${PREORDER_PRICE} if you preorder. $${RETAIL_PRICE} once the kit launches.`],
  ['When and where do I get one?', 'The first batch is for Emory’s Oxford College in spring 2027. Preorders are picked up on campus.'],
  ['Can my club or chapter get a box?', 'That’s the plan. We’re designing boxes of 25 kits with bonus refills for fraternities, sororities and clubs.'],
  ['What can the drink tests tell me?', 'We’re still choosing a supplier. The card in the kit explains how to use the test and what it detects. A negative result can miss substances.'],
]

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

const BAND = ['CAME IN CLUTCH', 'Reusable vinyl pouch', 'Fuchsia or lemon', 'Empty slot for your own item']

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

function App() {
  useScrollReveal()
  return (
    <>
      <SectionLink className="skip-link" to="main">Skip to content</SectionLink>
      <header className="site-header" id="top" tabIndex={-1}>
        <div className="shell nav-layout">
          <SectionLink className="wordmark" to="top" aria-label="Clutch home">CLUTCH<span>.</span></SectionLink>
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
            <p className="eyebrow"><span aria-hidden="true">✦</span> The going-out kit</p>
            <h1 id="hero-title">CAME IN<br /><em>CLUTCH.</em></h1>
            <p className="hero-description">Two drink tests, two condoms, a vomit bag and gum in a 4.5 × 3 in pouch that fits a purse, with one empty slot for your own item.</p>
            <div className="hero-actions">
              <PreorderButton />
              <p className="price"><strong>${PREORDER_PRICE}</strong><span>Preorder<br />${RETAIL_PRICE} at launch</span></p>
            </div>
            <p className="hero-meta">
              <SectionLink className="text-link" to="kit-title">See what’s inside <span aria-hidden="true">↘</span></SectionLink>
            </p>
          </div>
          <figure className="hero-figure">
            <img
              src={colors1350}
              srcSet={`${colors800} 800w, ${colors1350} 1350w`}
              sizes="(max-width: 700px) 100vw, 52vw"
              alt="Fuchsia pink and lemon yellow CLUTCH pouches with black zippers and black printed bands"
              width="1350"
              height="900"
              fetchPriority="high"
            />
            <div className="size-sticker" aria-hidden="true"><strong>4.5 × 3</strong><span>INCHES</span></div>
            <figcaption>Product concept</figcaption>
          </figure>
        </section>

        <ul className="facts shell" aria-label="Key facts">
          <li data-reveal><span>Price</span><strong>${PREORDER_PRICE}</strong><small>preorder · ${RETAIL_PRICE} at launch</small></li>
          <li data-reveal><span>Size</span><strong>4.5 × 3 in</strong><small>smaller than an index card · about 0.9 in thick packed (estimate)</small></li>
          <li data-reveal><span>Inside</span><strong>7 items</strong><small>plus one empty slot for your own</small></li>
          <li data-reveal><span>First batch</span><strong>Spring 2027</strong><small>Oxford College · campus pickup</small></li>
        </ul>

        <div className="wristband">
          <div className="wristband-track">
            {[0, 1].map((copy) => (
              <p key={copy} aria-hidden={copy === 1 ? 'true' : undefined}>
                {[...BAND, ...BAND].map((text, i) => <span key={i} aria-hidden={i >= BAND.length ? 'true' : undefined}>{text}</span>)}
              </p>
            ))}
          </div>
        </div>

        <section className="kit shell" id="kit" tabIndex={-1} aria-labelledby="kit-title" data-reveal>
          <h2 id="kit-title" tabIndex={-1}>WHAT’S INSIDE.</h2>
          <p className="kit-hint">Drag to turn it. Tap an item to see it.</p>
          <ClutchMockup />
        </section>

        {FEEDBACK.length > 0 && (
          <section className="feedback shell" aria-labelledby="feedback-title" data-reveal>
            <h2 id="feedback-title">EARLY FEEDBACK.</h2>
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
          <div className="ticket" data-reveal>
            <div className="ticket-copy">
              <p className="eyebrow"><span aria-hidden="true">✦</span> Oxford goes first</p>
              <h2 id="preorder-title">PREORDER<br />{' '}FOR ${PREORDER_PRICE}.</h2>
              <p>The first batch goes to Oxford College in spring 2027. Lock in ${PREORDER_PRICE} now; it’s ${RETAIL_PRICE} at launch.</p>
            </div>
            <div className="ticket-stub">
              <span>CAME IN CLUTCH</span>
              <strong>${PREORDER_PRICE}</strong>
              <PreorderButton />
            </div>
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
          <SectionLink className="wordmark" to="top" aria-label="Clutch home">CLUTCH<span>.</span></SectionLink>
          <p>Made by Emory students.</p>
          <SectionLink className="text-link" to="top">Back to top <span aria-hidden="true">↑</span></SectionLink>
        </div>
      </footer>
    </>
  )
}

export default App
