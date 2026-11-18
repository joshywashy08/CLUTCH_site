import { useEffect, useRef, useState } from 'react';
import './ClutchMockup.css';

// Compact 3D model of the pouch. Click the zipper (or the button below) and the contents open in an overlay.

const COLORS = [
  { key: 'fuchsia', name: 'Fuchsia', value: '#d9327e' },
  { key: 'bone', name: 'Bone', value: '#ede6dc' },
];

// What each item is for. Keep it true: no safety promises, no accuracy numbers.
// art: how the item is drawn in the overlay (CSS class, size in px, how many).
const CONTENTS = [
  { key: 'test', name: 'Drink-spike test', count: '1', text: 'Check a drink if something feels off. A negative result is not a guarantee.',
    art: { cls: 'i-test', w: 150, h: 54, n: 1, body: (<><span>DRINK TEST</span><small>single use</small></>) } },
  { key: 'condom', name: 'Condoms', count: '2', text: 'Individually wrapped. Two, because plans change.',
    art: { cls: 'i-condom', w: 76, h: 76, n: 2, body: <span>Condom</span> } },
  { key: 'bandage', name: 'Bandages', count: '2', text: 'For the blister your shoes give you by midnight, or a scrape on the walk home.',
    art: { cls: 'i-bandage', w: 150, h: 36, n: 2, stack: true, body: <span>Bandage</span> } },
  { key: 'bag', name: 'Vomit bag', count: '1', text: 'Folded flat. Saves an Uber, a dorm room or a formal dress.',
    art: { cls: 'i-bag', w: 170, h: 54, n: 1, body: (<><span>Vomit bag</span><small>folded flat</small></>) } },
  { key: 'mint', name: 'Mints', count: '2', text: 'Individually wrapped. One for you, one for whoever needs it.',
    art: { cls: 'i-mint', w: 64, h: 42, n: 2, body: <span>MINT</span> } },
  { key: 'card', name: 'Instruction card', count: '1', text: 'How to use the drink test, signs someone may have been drugged, and who to call. It says plainly that a negative test is not a guarantee.',
    art: { cls: 'i-card', w: 150, h: 86, n: 1, body: (<><b>CLUTCH</b><small>Read before you go out</small></>) } },
  { key: 'slot', name: 'Your slot', count: '+', text: 'Left empty on purpose, and it’s part of the kit. Lip gloss, travel cologne, earplugs, a hair tie: whatever you’d turn around for.',
    art: { cls: 'i-slot', w: 150, h: 50, n: 1, body: (<><span>Your item</span><small>empty slot</small></>) } },
];

export default function ClutchMockup() {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const dialogRef = useRef(null);
  const still = useRef(false);

  useEffect(() => {
    still.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Keep React state and the native dialog in step. showModal() gives focus trapping and Esc for free.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // The pouch leans toward the mouse. No dragging, so it can't end up upside down.
  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse' || still.current) return;
    const box = e.currentTarget.getBoundingClientRect();
    setTilt({ x: (e.clientX - box.left) / box.width - 0.5, y: (e.clientY - box.top) / box.height - 0.5 });
  };

  const rx = -16 - tilt.y * 14;
  const ry = -20 + tilt.x * 24;

  return (
    <div className="clutch-mockup" style={{ '--c': color.value }}>
      {/* Instructions sit right above the model. */}
      <ol className="how" aria-label="How to use the model">
        <li><b>1</b>Click the zipper</li>
        <li><b>2</b>See what’s inside</li>
        <li><b>3</b>Esc or ✕ to close</li>
      </ol>

      <div
        className={'stage' + (open ? ' open' : '')}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <div className="scene" aria-hidden="true">
          <div className="sway">
            <div className="rig" style={{ transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }}>
              <div className="face back"><div className="band" /></div>
              <div className="face side left"><div className="band" /></div>
              <div className="face side right"><div className="band" /></div>
              <div className="face top" />
              <div className="face bottom" />
              <div className="face front">
                <div className="zip"><div className="teeth" /><div className="pull" /></div>
                <div className="band"><span>CLUTCH</span></div>
              </div>
            </div>
          </div>
        </div>
        {/* Flat hit target over the zipper. It sits outside the 3D scene, so clicks always land. */}
        <button type="button" className="zip-hit" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
          <span className="zip-cue">Click the zipper</span>
        </button>
        <p className="dims" aria-hidden="true">4.5 × 3 in.</p>
      </div>

      <div className="bar">
        <button type="button" className="kit-toggle" aria-haspopup="dialog" onClick={() => setOpen(true)}>Open the kit</button>
        <div className="colors" role="group" aria-label="Pouch color">
          {COLORS.map((c) => (
            <button key={c.key} type="button" className="color" aria-pressed={color.key === c.key} onClick={() => setColor(c)}>
              <i style={{ background: c.value }} aria-hidden="true" />{c.name}
            </button>
          ))}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="kit-overlay"
        aria-labelledby="kit-overlay-title"
        onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      >
        <div className="overlay-panel">
          <header>
            <h3 id="kit-overlay-title"><span>What’s inside</span> 9 items + your slot</h3>
            <button type="button" className="overlay-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </header>
          <ul className="contents">
            {CONTENTS.map((item, i) => (
              <li key={item.key} className={item.key === 'slot' ? 'is-slot' : undefined} style={{ '--i': i }}>
                <div className={'art' + (item.art.stack ? ' stack' : '')} aria-hidden="true">
                  {Array.from({ length: item.art.n }, (_, k) => (
                    <div key={k} className={`item ${item.art.cls}`} style={{ width: item.art.w, height: item.art.h }}>{item.art.body}</div>
                  ))}
                </div>
                <h4><b>{item.count}</b>{item.name}</h4>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
          <footer>
            <p>A negative drink test is not a guarantee. If you or a friend feel wrong, get help and call 911. Item sizes are estimates until a sample is packed.</p>
            <button type="button" className="kit-toggle" onClick={() => setOpen(false)}>Pack it up</button>
          </footer>
        </div>
      </dialog>
    </div>
  );
}
