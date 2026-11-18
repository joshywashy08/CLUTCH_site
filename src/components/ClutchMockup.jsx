import { useRef, useState } from 'react';
import './ClutchMockup.css';

// 3D model of the pouch. Drag to turn it, or use the arrow keys. It only shows the pouch:
// what's inside is listed beside it on the page, with a drawing of each item.

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
  const [color, setColor] = useState(COLORS[0]);
  const [rot, setRot] = useState(REST);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const drag = useRef(null);

  // Drag to rotate. Mouse turns both ways; touch turns sideways only, so the page still scrolls.
  const onPointerDown = (e) => {
    if (e.button > 0) return;
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
    if (!step) return;
    e.preventDefault();
    setTouched(true);
    setRot((r) => ({ x: clampX(r.x + step[0]), y: r.y + step[1] }));
  };

  const edgeOn = Math.abs(Math.cos((rot.y * Math.PI) / 180)) < 0.3;

  return (
    <div className="clutch-mockup" style={{ '--c': color.value }}>
      <div
        className={'stage' + (dragging ? ' dragging' : '') + (touched ? ' touched' : '')}
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
                  {l.k === STEPS && <span className="zip" aria-hidden="true"><span className="teeth" /><span className="pull" /></span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="drag-hint" aria-hidden="true"><span>⟲</span> Drag to turn</p>
        <p className="dims" aria-hidden="true">4.5 × 3 in.</p>
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
      <p className="notes">Concept model rendered with CSS at 4.5 × 3 in.</p>
    </div>
  );
}
