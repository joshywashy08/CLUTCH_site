import { useEffect, useState } from 'react'
import colorPouches from './assets/clutch-colors.jpg'
import './App.css'
import ClutchMockup from './components/ClutchMockup'

const questions = [
  ['When can I get one?', 'We’re planning a spring 2027 pilot at Emory’s Oxford College. The target price is $20, and pre-orders are still in the works.'],
  ['Can my club or chapter get a box?', 'The pilot is designed for Oxford students and clubs. We’re also planning boxes of 25 kits with bonus refills for fraternities and sororities.'],
  ['What can the drink tests tell me?', 'We’re still choosing a supplier. The included card will explain how to use the selected test and what it can detect. A negative result can miss substances.'],
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

function App() {
  return (
    <>
      <SectionLink className="skip-link" to="main">Skip to content</SectionLink>
      <div className="announcement" id="top" tabIndex={-1}>
        <span className="announcement-dot" aria-hidden="true" />
        <span>OXFORD COLLEGE PILOT</span><span aria-hidden="true">/</span><span>SPRING 2027</span>
      </div>
      <header className="site-header">
        <div className="shell nav-layout">
          <SectionLink className="wordmark" to="top" aria-label="Clutch home">CLUTCH<span>.</span></SectionLink>
          <nav aria-label="Main navigation">
            <SectionLink to="kit">The kit</SectionLink>
            <SectionLink className="nav-faq" to="faq">FAQ</SectionLink>
            <SectionLink className="nav-pilot" to="pilot">Pilot details <span aria-hidden="true">↗</span></SectionLink>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="hero shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span aria-hidden="true">✦</span> The going-out kit</p>
            <h1 id="hero-title">CAME IN<br /><em>CLUTCH.</em></h1>
            <p className="hero-description">The stuff you end up looking for at 1 a.m., packed in one pocket-sized pouch.</p>
            <div className="hero-actions">
              <SectionLink className="button button-dark" to="kit-title">See what’s inside <span aria-hidden="true">↘</span></SectionLink>
              <div className="price"><strong>$20</strong><span>Target price</span></div>
            </div>
          </div>
          <figure className="hero-figure">
            <img src="/clutch-pouch-preview.jpg" alt="Glossy fuchsia CLUTCH pouch with a black top zipper and horizontal Admit One band" width="1200" height="1200" fetchPriority="high" />
            <div className="size-sticker"><strong>4.5 × 3</strong><span>INCHES</span></div>
            <figcaption>Product concept · Fuchsia</figcaption>
          </figure>
        </section>

        <div className="product-strip">
          <div className="shell strip-inner">
            <span>REUSABLE VINYL POUCH</span><span className="strip-star" aria-hidden="true">✦</span>
            <span>TWO LAUNCH COLORS</span><span className="strip-star" aria-hidden="true">✦</span>
            <span>ROOM FOR ONE EXTRA</span>
          </div>
        </div>

        <section className="kit" id="kit" tabIndex={-1} aria-labelledby="kit-title">
          <div className="shell">
            <h2 id="kit-title" tabIndex={-1}>WHAT’S INSIDE.</h2>
            <p className="kit-hint">Drag to turn the pouch, or select an item to see it in 3D.</p>
            <ClutchMockup />
          </div>
        </section>

        <section className="colors" aria-labelledby="colors-title">
          <div className="shell color-layout">
            <figure className="color-figure">
              <img src={colorPouches} alt="Fuchsia pink and lemon yellow CLUTCH pouches on a lavender backdrop" width="1350" height="900" loading="lazy" />
              <figcaption>Product concepts</figcaption>
            </figure>
            <div className="color-copy">
              <h2 id="colors-title">TWO <br />COLORWAYS.</h2>
              <ul className="swatches" aria-label="Launch colors">
                <li><span className="swatch fuchsia" aria-hidden="true" />Fuchsia pink</li>
                <li><span className="swatch lemon" aria-hidden="true" />Lemon yellow</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="pilot shell" id="pilot" tabIndex={-1} aria-labelledby="pilot-title">
          <div className="pilot-ticket">
            <div className="pilot-copy">
              <p className="eyebrow"><span aria-hidden="true">✦</span> The first drop</p>
              <h2 id="pilot-title">OXFORD<br />GOES FIRST.</h2>
              <p>We’re three Emory students planning our first run for students and clubs at Oxford College. Pre-orders are in the works.</p>
            </div>
            <div className="pilot-stub">
              <span>PLANNED PILOT</span>
              <strong>SPRING <br />2027</strong>
              <SectionLink className="text-link" to="faq">Pilot FAQ <span aria-hidden="true">↘</span></SectionLink>
            </div>
          </div>
        </section>

        <section className="faq shell" id="faq" tabIndex={-1} aria-labelledby="faq-title">
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
          <p>Created by Emory students.</p>
          <SectionLink className="text-link" to="top">Back to top <span aria-hidden="true">↑</span></SectionLink>
        </div>
      </footer>
    </>
  )
}

export default App
