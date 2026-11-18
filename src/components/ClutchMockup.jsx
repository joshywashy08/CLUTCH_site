'use client';
import { useEffect, useRef, useState } from 'react';
import './ClutchMockup.css';

const COLORS = [
  { name: 'Fuchsia', value: '#d9327e' },
  { name: 'Bone', value: '#ede6dc' },
];

// Scale: 70px = 1 inch (pouch face 315 × 210 = 4.5 × 3 in, packed depth 63 = 0.9 in).
// c = position packed inside the pouch [x, y]; o = position laid out when open [x, y, rotateZ].
// The open layout is a flat lay: insert card centered, protection on the left, extras on the right.
const ITEMS = [
  { id: 'card', cls: 'i-card', w: 245, h: 140, z: -24, c: [0, 8], o: [0, -400, 0],
    body: (<><b>CLUTCH</b><span>Read before you go out</span><small>How to test · who to call</small></>),
    name: 'Instruction card', count: 1, unit: 'card',
    text: 'How to use the drink test, the signs someone may have been drugged, and who to call. It says plainly that a negative test is not a guarantee.' },
  { id: 'condom1', pair: 'condom', cls: 'i-condom', w: 140, h: 140, z: -12, c: [-78, 18], o: [-368, -400, 0],
    body: <span>Condom</span>, name: 'Condoms', count: 2, unit: 'condoms', text: 'Individually wrapped.' },
  { id: 'condom2', pair: 'condom', cls: 'i-condom', w: 140, h: 140, z: -6, c: [78, 18], o: [-218, -400, 0],
    body: <span>Condom</span>, name: 'Condoms' },
  { id: 'test1', pair: 'test', cls: 'i-test', w: 182, h: 66, z: 4, c: [-52, -42], o: [-293, -285, 0],
    body: (<><span>DRINK TEST</span><small>single use</small></>),
    name: 'Drink-spike tests', count: 2, unit: 'tests',
    text: 'Check a drink if something feels off. Two per kit, so there is one for a refill or a friend. A negative result is not a guarantee.' },
  { id: 'test2', pair: 'test', cls: 'i-test', w: 182, h: 66, z: 10, c: [52, 42], o: [-293, -208, 0],
    body: (<><span>DRINK TEST</span><small>single use</small></>),
    name: 'Drink-spike tests' },
  { id: 'bag', cls: 'i-bag', w: 266, h: 77, z: -18, c: [0, 52], o: [290, -430, 0],
    body: (<><span>Vomit bag</span><small>folded flat</small></>),
    name: 'Vomit bag', count: 1, unit: 'bag, folded flat',
    text: 'For the friend who needs it. Saves an Uber, a dorm room or a formal dress.' },
  { id: 'gum', cls: 'i-gum', w: 196, h: 56, z: 16, c: [0, 0], o: [290, -352, 0],
    body: <span>GUM · 5 sticks</span>, name: 'Pack of gum', count: 1, unit: 'pack of 5 sticks', text: 'Fresh breath all night.' },
  { id: 'slot', cls: 'i-slot', w: 196, h: 60, z: 22, c: [60, -64], o: [290, -275, 0],
    body: (<><span>Your item</span><small>empty slot</small></>),
    name: 'Empty slot for your own item',
    text: 'The kit leaves one slot empty on purpose. Add your own lip gloss, travel cologne or a hair tie.' },
];

const keyOf = (it) => it.pair || it.id;
const CONTENTS = ['test', 'condom', 'bag', 'gum', 'card', 'slot']
  .map((key) => ITEMS.find((it) => keyOf(it) === key));

export default function ClutchMockup() {
  const [open, setOpenState] = useState(false);
  const [rot, setRot] = useState({ rx: -16, ry: -30 });
  const [selKey, setSelKey] = useState(null);
  const [color, setColor] = useState(COLORS[0]);
  const [flipped, setFlipped] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [idle, setIdle] = useState(true); // gentle sway until the visitor touches the model

  const stageRef = useRef(null);
  const drag = useRef(null);
  const moved = useRef(false);
  const rotRef = useRef(rot);
  const touched = useRef(false);
  useEffect(() => { rotRef.current = rot; }, [rot]);

  const setOpen = (v) => {
    setOpenState(v);
    setFlipped(false);
    if (v) setRot({ rx: -8, ry: -12 });
    else { setRot({ rx: -16, ry: -30 }); setSelKey(null); }
  };

  const select = (it) => {
    touched.current = true;
    setIdle(false);
    if (!open) setOpen(true);
    setSelKey(keyOf(it));
  };

  const flip = () => {
    const ry = rot.ry;
    const back = Math.abs((((ry % 360) + 360) % 360) - 180) < 60;
    setRot({ rx: -10, ry: back ? (open ? -12 : -30) : 180 });
    setFlipped(!back);
  };

  // Drag to rotate
  useEffect(() => {
    const onMove = (e) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!moved.current && Math.abs(dx) + Math.abs(dy) < 6) return;
      moved.current = true;
      setDragging(true);
      setRot({ ry: d.ry + dx * 0.5, rx: Math.max(-75, Math.min(75, d.rx - dy * 0.4)) });
    };
    const onEnd = () => {
      if (!drag.current) return;
      drag.current = null;
      setDragging(false);
      setTimeout(() => { moved.current = false; }, 0);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
    };
  }, []);

  // Open the kit by itself the first time it scrolls into view, unless the visitor already touched it.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      if (!touched.current) setOpen(true);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Scale the 880px scene down to fit narrow containers
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / 930));
    fit();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', fit);
      return () => window.removeEventListener('resize', fit);
    }
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onPointerDown = (e) => {
    touched.current = true;
    setIdle(false);
    drag.current = { x: e.clientX, y: e.clientY, rx: rotRef.current.rx, ry: rotRef.current.ry };
    moved.current = false;
  };

  const selected = ITEMS.find((it) => keyOf(it) === selKey);

  return (
    <div className="clutch-mockup" id="model" style={{ '--c': color.value }}>
      <div className="viewer">
        <div
          ref={stageRef}
          className={'stage' + (open ? ' open' : '') + (dragging ? ' dragging' : '') + (idle ? ' idle' : '')}
          style={{ height: Math.round(680 * scale) }}
          role="group"
          aria-label="3D model of the Clutch kit"
          onPointerDown={onPointerDown}
        >
          <p className="dims">4.5 × 3 in · about 0.9 in deep</p>
          <div className="scaler" style={{ transform: `scale(${scale})` }}>
            <div className="lift">
              <div className="shadow" />
              <div className="sway">
              <div className="rig" style={{ transform: `rotateX(${rot.rx}deg) rotateY(${rot.ry}deg)` }}>
                <div className="face back"><div className="band" /></div>
                <div className="face side left"><div className="band" /></div>
                <div className="face side right"><div className="band" /></div>
                <div className="face bottom" />
                <div className="items">
                  {ITEMS.map((it, i) => {
                    const p = open ? it.o : it.c;
                    const z = open ? it.z * 1.6 : it.z;
                    const r = open ? p[2] || 0 : 0;
                    return (
                      <button
                        key={it.id}
                        type="button"
                        className={`item ${it.cls}${selKey && keyOf(it) === selKey ? ' sel' : ''}`}
                        style={{
                          transitionDelay: open ? `${i * 45}ms` : '0ms',
                          width: it.w, height: it.h,
                          transform: `translate3d(${p[0] - it.w / 2}px, ${p[1] - it.h / 2}px, ${z}px) rotateZ(${r}deg)`,
                        }}
                        tabIndex={open ? 0 : -1}
                        aria-label={it.name}
                        onClick={() => { if (!moved.current) select(it); }}
                      >
                        {it.body}
                      </button>
                    );
                  })}
                </div>
                <div className="hinge"><div className="flap" /></div>
                {/* Front: zipper along the top edge, black band with the name in white. */}
                <div className="face front">
                  <div className="zip"><div className="teeth" /><div className="pull" /></div>
                  <div className="band"><span>CLUTCH</span></div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>

        <div className="controls">
          <div className="group">
            <button className="btn primary" type="button" onClick={() => { touched.current = true; setOpen(!open); }}>
              {open ? 'Close the kit' : 'Open the kit'}
            </button>
            <button className="btn" type="button" onClick={flip}>
              {flipped ? 'Flip to front' : 'Flip to back'}
            </button>
          </div>
          <div className="group">
            <span className="lbl">Color</span>
            {COLORS.map((c) => (
              <button
                key={c.value}
                className="sw"
                type="button"
                aria-label={c.name}
                aria-pressed={color === c}
                style={{ background: c.value }}
                onClick={() => setColor(c)}
                title={c.name}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="inventory">
        <ul className="contents" aria-label="Kit contents">
          {CONTENTS.map((it) => (
            <li key={keyOf(it)}>
              <button
                type="button"
                aria-pressed={keyOf(it) === selKey}
                onClick={() => select(it)}
              >
                <span className="quantity" aria-hidden={it.count ? undefined : true}>{it.count ?? '+'}</span>
                {it.name}
              </button>
            </li>
          ))}
        </ul>
        <div className="panel" aria-live="polite">
          {selected ? (
            <div key={selKey}>
              <h3>{selected.name}</h3>
              <p>
                {selected.count && <strong>{selected.count} {selected.unit}. </strong>}
                {selected.text}
              </p>
            </div>
          ) : (
            <p>Everything packs into a refillable 4.5 × 3 in pouch, in fuchsia or bone.</p>
          )}
        </div>
      </div>

      <div className="notes">
        <p>A negative drink test is not a guarantee. If you or a friend feel wrong, get help and call 911.</p>
        <p>Concept model, drawn to scale at 4.5 × 3 in. Packed depth (about 0.9 in) and item sizes are estimates until a sample is packed. The zipper runs along the top of the front. Contents may change after the pilot.</p>
      </div>
    </div>
  );
}
