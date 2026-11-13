import pouch from './assets/clutch-pouch.jpg'
import colorPouches from './assets/clutch-colors.jpg'
import './App.css'
import ClutchMockup from './components/ClutchMockup'

const contents = [
  ['2', 'Drink-spike tests', 'One for you and a spare.'],
  ['2', 'Condoms', 'Individually wrapped.'],
  ['1', 'Vomit bag', 'For when the night takes a wrong (?) turn.'],
  ['1', 'Electrolyte stick', 'Mix it with water when you get home.'],
  ['1', 'Pack of gum', 'Easy to share.'],
  ['1', 'Instruction card', 'Test directions and who to call.'],
  ['+', 'Room for your own thing', 'Lip gloss, cologne, whatever you always bring.'],
]

const questions = [
  ['When can I get one?', 'We’re planning a spring 2027 pilot at Emory’s Oxford College and Atlanta campus. The target price is $20, and pre-orders are still in the works.'],
  ['Can my club or chapter get a box?', 'The pilot is designed for Oxford students and clubs. We’re also planning boxes of 25 kits with bonus refills for fraternities and sororities.'],
  ['What can the drink tests tell me?', 'We’re still choosing a supplier. The included card will explain how to use the selected test and what it can detect. A negative result can miss substances.'],
]

function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="announcement" id="top">
        <span className="announcement-dot" aria-hidden="true" />
        <span>OXFORD COLLEGE PILOT</span><span aria-hidden="true">/</span><span>SPRING 2027</span>
      </div>
      <header className="site-header">
        <div className="shell nav-layout">
          <a className="wordmark" href="#top" aria-label="Clutch home">CLUTCH<span>.</span></a>
          <nav aria-label="Main navigation">
            <a href="#kit">The kit</a>
            <a className="nav-faq" href="#faq">FAQ</a>
            <a className="nav-pilot" href="#pilot">Pilot details <span aria-hidden="true">↗</span></a>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="hero shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span aria-hidden="true">✦</span> The going-out kit</p>
            <h1 id="hero-title">CAME IN<br /><em>CLUTCH.</em></h1>
            <p className="hero-description">The stuff you end up looking for at 1 a.m., packed in one pocket-sized pouch.</p>
            <div className="hero-actions">
              <a className="button button-dark" href="#kit">See what’s inside <span aria-hidden="true">↘</span></a>
              <div className="price"><strong>$20</strong><span>Target price</span></div>
            </div>
          </div>
          <figure className="hero-figure">
            <img src={pouch} alt="Fuchsia vinyl zipper pouch with a black CLUTCH Admit One band" width="1254" height="1254" fetchPriority="high" />
            <span className="hero-spark" aria-hidden="true">✦</span>
            <div className="size-sticker"><strong>4.5 × 3</strong><span>INCHES</span></div>
            <figcaption>Product concept · Fuchsia</figcaption>
          </figure>
        </section>

        <div className="product-strip">
          <div className="shell strip-inner">
            <span>REUSABLE VINYL POUCH</span><span className="strip-star" aria-hidden="true">✦</span>
            <span>THREE PLANNED COLORS</span><span className="strip-star" aria-hidden="true">✦</span>
            <span>ROOM FOR ONE EXTRA</span>
          </div>
        </div>

        <section className="kit shell" id="kit" aria-labelledby="kit-title">
          <div className="kit-intro">
            <p className="eyebrow"><span aria-hidden="true">✦</span> The kit</p>
            <h2 id="kit-title">WHAT’S<br />INSIDE.</h2>
            <p>Zip it into your going-out bag or slip it into a pocket. Refill the pouch whenever you need to.</p>
            <a className="text-link" href="#model">Explore it in 3D <span aria-hidden="true">↘</span></a>
          </div>
          <ul className="contents">
            {contents.map(([quantity, name, description]) => (
              <li key={name}>
                <span className="quantity" aria-hidden={quantity === '+' ? true : undefined}>{quantity}</span>
                <div><h3>{name}</h3><p>{description}</p></div>
              </li>
            ))}
          </ul>
        </section>

        <section className="model" id="model" aria-labelledby="model-title">
          <div className="shell model-layout">
            <div className="model-intro">
              <p className="eyebrow"><span aria-hidden="true">✦</span> 3D concept</p>
              <h2 id="model-title">TURN IT<br />OVER.</h2>
              <p>Drag to spin the pouch, open it up and tap anything inside to see what it’s for.</p>
            </div>
            <ClutchMockup showHeader={false} />
          </div>
        </section>

        <section className="colors" aria-labelledby="colors-title">
          <div className="shell color-layout">
            <figure className="color-figure">
              <img src={colorPouches} alt="Fuchsia, lemon and lime concept pouches stacked together" width="1350" height="900" loading="lazy" />
              <figcaption>Product concepts</figcaption>
            </figure>
            <div className="color-copy">
              <h2 id="colors-title">THREE <br />COLORWAYS.</h2>
              <ul className="swatches" aria-label="Planned colors">
                <li><span className="swatch fuchsia" aria-hidden="true" />Fuchsia</li>
                <li><span className="swatch lemon" aria-hidden="true" />Lemon</li>
                <li><span className="swatch lime" aria-hidden="true" />Lime</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="pilot shell" id="pilot" aria-labelledby="pilot-title">
          <div className="pilot-ticket">
            <div className="pilot-copy">
              <p className="eyebrow"><span aria-hidden="true">✦</span> The first drop</p>
              <h2 id="pilot-title">OXFORD<br />GOES FIRST.</h2>
              <p>We’re three Emory students planning our first run for students and clubs at Oxford College. Pre-orders are in the works.</p>
            </div>
            <div className="pilot-stub">
              <span>PLANNED PILOT</span>
              <strong>SPRING <br />2027</strong>
              <a className="text-link" href="#faq">Pilot FAQ <span aria-hidden="true">↘</span></a>
            </div>
          </div>
        </section>

        <section className="faq shell" id="faq" aria-labelledby="faq-title">
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
          <a className="wordmark" href="#top" aria-label="Clutch home">CLUTCH<span>.</span></a>
          <p>Created by Emory students.</p>
          <a className="text-link" href="#top">Back to top <span aria-hidden="true">↑</span></a>
        </div>
      </footer>
    </>
  )
}

export default App
