import { useEffect, useRef, useState } from 'react';
import './ClutchMockup.css';

// 3D model of the pouch. Drag to turn it. Click the zipper (or "Unzip") and the contents
// open in an overlay on top of the model, with a close button.

const COLORS = [
  { key: 'fuchsia', name: 'Fuchsia', value: '#d9327e' },
  { key: 'ivory', name: 'Ivory', value: '#ede6dc' },
];

// What each item is for. Keep it true: no safety promises, no accuracy numbers.
// art: how the item is drawn (CSS class, size in px, how many, stacked or side by side).
const CONTENTS = [
  { key: 'test', name: 'Drink-spike test', count: '1', text: 'Check a drink if something feels off. A negative result is not a guarantee.',
    art: { cls: 'i-test', w: 112, h: 40, n: 1, body: <span>DRINK TEST</span> } },
  { key: 'condom', name: 'Condoms', count: '2', text: 'Individually wrapped. Two, because plans change.',
    art: { cls: 'i-condom', w: 50, h: 50, n: 2, body: null } },
  { key: 'bandage', name: 'Bandages', count: '2', text: 'For the blister your shoes give you by midnight, or a scrape on the walk home.',
    art: { cls: 'i-bandage', w: 110, h: 24, n: 2, stack: true, body: null } },
  { key: 'bag', name: 'Vomit bag', count: '1', text: 'Folded flat. Saves an Uber, a dorm room or a formal dress.',
    art: { cls: 'i-bag', w: 120, h: 40, n: 1, body: <span>Vomit bag</span> } },
  { key: 'mint', name: 'Mints', count: '2', text: 'Individually wrapped. One for you, one for whoever needs it.',
    art: { cls: 'i-mint', w: 44, h: 30, n: 2, body: null } },
  { key: 'card', name: 'Instruction card', count: '1', text: 'How to use the drink test, signs someone may have been drugged, and who to call. It says plainly that a negative test is not a guarantee.',
    art: { cls: 'i-card', w: 104, h: 60, n: 1, body: <b>CLUTCH</b> } },
  { key: 'slot', name: 'Your slot', count: '+', text: 'Left empty on purpose, and it’s part of the kit. Lip gloss, travel cologne, earplugs, a hair tie: whatever you’d turn around for.',
    art: { cls: 'i-slot', w: 104, h: 40, n: 1, body: <span>Your item</span> } },
];

const REST = { x: -16, y: -24 };
const clampX = (v) => Math.max(-70, Math.min(40, v));

export default function ClutchMockup() {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState('test');
  const [color, setColor] = useState(COLORS[0]);
  const [rot, setRot] = useState(REST);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);

  const drag = useRef(null);
  const closeRef = useRef(null);
  const openRef = useRef(null);
  const wasOpen = useRef(false);

  // Focus the close button when the overlay opens, and return focus when it closes.
  useEffect(() => {
    if (open) closeRef.current?.focus();
    else if (wasOpen.current) openRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Drag to rotate. Mouse turns both ways; touch turns sideways only, so the page still scrolls.
  const onPointerDown = (e) => {
    if (open || e.button > 0 || e.target.closest('button')) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, start: rot, moved: false, touch: e.pointerType !== 'mouse' };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    if (!d.moved) { d.moved = true; setDragging(true); setTouched(true); }
    setRot({ x: d.touch ? d.start.x : clampX(d.start.x - dy * 0.4), y: d.start.y + dx * 0.5 });
  };
  const endDrag = (e) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
  };

  // Keyboard: arrow keys turn the model when the stage has focus.
  const onKeyDown = (e) => {
    const step = { ArrowLeft: [0, -15], ArrowRight: [0, 15], ArrowUp: [10, 0], ArrowDown: [-10, 0] }[e.key];
    if (!step || open) return;
    e.preventDefault();
    setTouched(true);
    setRot((r) => ({ x: clampX(r.x + step[0]), y: r.y + step[1] }));
  };

  const doOpen = () => { setTouched(true); setOpen(true); };
  const current = CONTENTS.find((c) => c.key === sel);

  return (
    <div className="clutch-mockup" style={{ '--c': color.value }}>
      <div
        className={'stage' + (open ? ' open' : '') + (dragging ? ' dragging' : '') + (touched ? ' touched' : '')}
        tabIndex={0}
        role="group"
        aria-label="3D model of the Clutch pouch. Drag or use the arrow keys to turn it."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <div className="scene">
          <div className="sway">
            <div className="rig" style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}>
              <div className="face back"><div className="band" /></div>
              <div className="face side left"><div className="band" /></div>
              <div className="face side right"><div className="band" /></div>
              <div className="face top" />
              <div className="face bottom" />
              <div className="face front">
                {/* The zipper is a real button on the front face, so it turns with the pouch. */}
                <button type="button" className="zip" tabIndex={-1} aria-hidden="true" onClick={doOpen}>
                  <span className="teeth" /><span className="pull" />
                </button>
                <div className="band"><span>CLUTCH</span></div>
              </div>
            </div>
          </div>
        </div>

        {!open && <p className="drag-hint" aria-hidden="true"><span>⟲</span> Drag to turn</p>}
        {!open && (
          <button type="button" ref={openRef} className="unzip" aria-expanded={open} aria-controls="kit-contents" onClick={doOpen}>
            Unzip <span aria-hidden="true">↗</span>
          </button>
        )}
        <p className="dims" aria-hidden="true">4.5 × 3 in.</p>

        {/* Contents overlay: sits on top of the model, inside the same box. */}
        {open && (
          <div className="contents-overlay" id="kit-contents" role="dialog" aria-modal="false" aria-labelledby="kit-contents-title">
            <div className="overlay-head">
              <h3 id="kit-contents-title">What’s inside</h3>
              <button type="button" ref={closeRef} className="overlay-close" onClick={() => setOpen(false)}>
                <span aria-hidden="true">✕</span> Close
              </button>
            </div>
            <ul className="tiles">
              {CONTENTS.map((item, i) => (
                <li key={item.key} style={{ '--i': i }}>
                  <button type="button" className={item.key === 'slot' ? 'is-slot' : undefined} aria-pressed={sel === item.key} onClick={() => setSel(item.key)}>
                    <span className={'art' + (item.art.stack ? ' stack' : '')} aria-hidden="true">
                      {Array.from({ length: item.art.n }, (_, k) => (
                        <span key={k} className={`item ${item.art.cls}`} style={{ width: item.art.w, height: item.art.h }}>{item.art.body}</span>
                      ))}
                    </span>
                    <span className="tile-name"><b>{item.count}</b>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="tile-detail" aria-live="polite"><strong>{current.name}.</strong> {current.text}</p>
          </div>
        )}
      </div>

      <div className="bar">
        <div className="colors" role="group" aria-label="Pouch color">
          {COLORS.map((c) => (
            <button key={c.key} type="button" className="color" aria-pressed={color.key === c.key} onClick={() => setColor(c)}>
              <i style={{ background: c.value }} aria-hidden="true" />{c.name}
            </button>
          ))}
        </div>
        <button type="button" className="reset" onClick={() => { setRot(REST); setTouched(true); }}>Reset view</button>
      </div>
      <p className="notes">Concept model at 4.5 × 3 in. Item sizes are estimates until a sample is packed. A negative drink test is not a guarantee.</p>
    </div>
  );
}
