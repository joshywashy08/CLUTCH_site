import { useEffect, useRef, useState } from 'react';
import { CONTENTS } from '../contents.jsx';
import './ClutchMockup.css';

// 3D model of the pouch. Drag to turn it. Click the zipper (or "Unzip") and the contents
// open in an overlay on top of the model, with a close button.

const COLORS = [
  { key: 'fuchsia', name: 'Fuchsia', value: '#d9327e' },
  { key: 'ivory', name: 'Ivory', value: '#ede6dc' },
];

// Pouch shape. A soft vinyl pouch is fattest in the middle and pinched flat at its seams, so the
// model is a stack of thin layers from back to front, each one a little smaller than the last
// (like contour lines), instead of the six flat sides of a box. 315 × 210 × 63 px = 4.5 × 3 × 0.9 in.
const W = 315, HT = 210, HALF = 31.5, STEPS = 14;
const PINCH = { side: 30, top: 16, bottom: 30 }; // how far the curve runs in from each seam; the zipper keeps the top stiffer
const BAND_TOP = 82;
const LAYERS = Array.from({ length: STEPS * 2 + 1 }, (_, i) => {
  const k = i - STEPS;
  const a = (Math.abs(k) / STEPS) * (Math.PI / 2);
  const g = 1 - Math.cos(a); // 0 at the seam, 1 on the front and back panels
  const seam = k === 0 ? 3 : 0; // the welded seam sticks out a little all round
  return {
    k,
    style: {
      left: -W / 2 + PINCH.side * g - seam,
      top: -HT / 2 + PINCH.top * g - seam,
      width: W - 2 * PINCH.side * g + 2 * seam,
      height: HT - (PINCH.top + PINCH.bottom) * g + 2 * seam,
      borderRadius: 10 + 28 * g,
      transform: `translateZ(${(Math.sign(k) * HALF * Math.sin(a)).toFixed(2)}px)`,
      '--shade': (0.24 * Math.cos(a) + (k < 0 ? 0.1 : 0) + (k === 0 ? 0.08 : 0)).toFixed(3),
      '--band-top': `${BAND_TOP - PINCH.top * g + seam}px`,
    },
  };
});
// Thickness of the pouch at a given distance in from a seam.
const thick = (edge, pinch) => HALF * (edge >= pinch ? 1 : Math.sqrt(1 - (1 - edge / pinch) ** 2));
// A few cross-sections fill the pouch in when it is seen close to edge-on, where the layers are only
// lines. They are drawn only then: left in all the time, they cut hairlines into the front panel.
const RIBS = [-152, -146, -138, -126, -110, -85, -45, 0, 45, 85, 110, 126, 138, 146, 152].map((x) => {
  const hz = thick(W / 2 - Math.abs(x), PINCH.side);
  return { left: -hz, top: -HT / 2, width: hz * 2, height: HT, transform: `translateX(${x}px) rotateY(90deg)`, borderRadius: `${hz}px / ${PINCH.top}px ${PINCH.top}px ${PINCH.bottom}px ${PINCH.bottom}px`, '--band-top': `${BAND_TOP}px` };
});

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
  const edgeOn = Math.abs(Math.cos((rot.y * Math.PI) / 180)) < 0.3;

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
          <div className="ground" aria-hidden="true" />
          <div className="sway">
            <div className="rig" style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}>
              {edgeOn && RIBS.map((style, i) => <div key={'x' + i} className="rib" style={style}><div className="band" /></div>)}
              {LAYERS.map((l) => (
                <div key={l.k} className={'layer' + (l.k === 0 ? ' seam' : '') + (l.k === STEPS ? ' front' : '')} style={l.style}>
                  <div className="band">{l.k === STEPS && <span>CLUTCH</span>}</div>
                  {/* The zipper is a real button on the front panel, so it turns with the pouch. */}
                  {l.k === STEPS && (
                    <button type="button" className="zip" tabIndex={-1} aria-hidden="true" onClick={doOpen}>
                      <span className="teeth" /><span className="pull" />
                    </button>
                  )}
                </div>
              ))}
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

      {/* The color and view controls only act on the model, so they hide while the contents overlay is open. */}
      {!open && (
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
      )}
      <p className="notes">Concept model rendered with CSS at 4.5 × 3 in. Item sizes are estimates until a sample is packed. A negative drink test is not a guarantee.</p>
    </div>
  );
}
