'use client';
import { useEffect, useRef, useState } from 'react';
import './ClutchMockup.css';

const COLORS = [
  { name: 'Fuchsia', hex: '#D9327E' },
  { name: 'Lemon', hex: '#F2D12E' },
  { name: 'Lime', hex: '#8FD14F' },
];

// c = position when closed [x, y]; o = position when open [x, y, rotateZ]
const ITEMS = [
  { id: 'card', cls: 'i-card', w: 245, h: 140, z: -24, c: [0, 8], o: [-255, -385, -6],
    body: (<><b>CLUTCH</b><span>How to use your test</span><small>Who to call · what to watch for</small></>),
    name: 'Insert card', qty: '1 card',
    text: 'Shows how to use the drink test, the signs that someone may have been drugged, and who to call. It also says plainly that a negative test is not a guarantee.' },
  { id: 'bag', cls: 'i-bag', w: 266, h: 77, z: -17, c: [0, 52], o: [285, -390, 6],
    body: (<><span>Vomit bag</span><small>folded flat</small></>),
    name: 'Vomit bag', qty: '1 bag, folded flat',
    text: 'For the friend who needs it. Saves an Uber, a dorm room or a formal dress.' },
  { id: 'electro', cls: 'i-electro', w: 224, h: 98, z: -10, c: [0, -34], o: [20, -400, 2],
    body: (<><span>ELECTROLYTE MIX</span><small>1 stick · folds in half to fit</small></>),
    name: 'Electrolyte stick', qty: '1 stick',
    text: 'A sodium-and-glucose drink mix, the same idea as medical oral rehydration solution. Mix it with water as the packet directs, before bed or the morning after. It helps you rehydrate. We make no hangover claims.' },
  { id: 'condom1', pair: 'condom', cls: 'i-condom', w: 140, h: 140, z: -3, c: [-78, 22], o: [-335, -215, -8],
    body: <span>Condom</span>, name: 'Condoms', qty: '2 condoms', text: 'Be prepared. Two per kit.' },
  { id: 'condom2', pair: 'condom', cls: 'i-condom', w: 140, h: 140, z: 4, c: [78, 22], o: [-180, -225, 5],
    body: <span>Condom</span>, name: 'Condoms', qty: '2 condoms', text: 'Be prepared. Two per kit.' },
  { id: 'test1', pair: 'test', cls: 'i-test', w: 182, h: 66, z: 11, c: [-52, -44], o: [25, -270, -3],
    body: (<><span>DRINK TEST</span><small>single use</small></>),
    name: 'Drink-spike tests', qty: '2 tests',
    text: 'Check a drink if something feels off. Two per kit, so there is one for a refill or a friend. A negative result is not a guarantee.' },
  { id: 'test2', pair: 'test', cls: 'i-test', w: 182, h: 66, z: 17, c: [52, 44], o: [40, -190, 3],
    body: (<><span>DRINK TEST</span><small>single use</small></>),
    name: 'Drink-spike tests', qty: '2 tests',
    text: 'Check a drink if something feels off. Two per kit, so there is one for a refill or a friend. A negative result is not a guarantee.' },
  { id: 'gum', cls: 'i-gum', w: 196, h: 56, z: 23, c: [0, 0], o: [285, -250, 5],
    body: <span>GUM · 5 sticks</span>, name: 'Gum', qty: '1 pack of 5 sticks', text: 'Fresh breath all night.' },
  { id: 'slot', cls: 'i-slot', w: 160, h: 60, z: 27, c: [60, -70], o: [290, -160, -4],
    body: (<><span>Your item</span><small>empty slot</small></>),
    name: 'Empty slot', qty: 'Room for one small item',
    text: 'Space left for your own lip gloss, travel cologne or a hair tie.' },
];

const keyOf = (it) => it.pair || it.id;
const CHIP_ITEMS = ITEMS.filter((it, i) => ITEMS.findIndex((x) => keyOf(x) === keyOf(it)) === i);

export default function ClutchMockup({ showHeader = true, showNotes = true }) {
  const [open, setOpenState] = useState(false);
  const [rot, setRot] = useState({ rx: -16, ry: -30 });
  const [selKey, setSelKey] = useState(null);
  const [color, setColor] = useState(COLORS[0].hex);
  const [flipped, setFlipped] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [scale, setScale] = useState(1);

  const stageRef = useRef(null);
  const drag = useRef(null);
  const moved = useRef(false);
  const rotRef = useRef(rot);
  useEffect(() => { rotRef.current = rot; }, [rot]);

  const setOpen = (v) => {
    setOpenState(v);
    setFlipped(false);
    if (v) setRot({ rx: -8, ry: -12 });
    else { setRot({ rx: -16, ry: -30 }); setSelKey(null); }
  };

  const select = (it) => {
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
    drag.current = { x: e.clientX, y: e.clientY, rx: rotRef.current.rx, ry: rotRef.current.ry };
    moved.current = false;
  };

  const selected = ITEMS.find((it) => keyOf(it) === selKey);

  return (
    <div className="clutch-mockup" style={{ '--c': color }}>
      {showHeader && (
        <header>
          <div>
            <h1>CLUTCH</h1>
            <p className="tag">Came in clutch. The going-out kit that fits in a purse.</p>
          </div>
          <p className="hint">Drag to turn · tap an item to see what it&apos;s for</p>
        </header>
      )}

      <div
        ref={stageRef}
        className={'stage' + (open ? ' open' : '') + (dragging ? ' dragging' : '')}
        style={{ height: Math.round(680 * scale) }}
        aria-label="3D model of the Clutch kit"
        onPointerDown={onPointerDown}
      >
        <div className="scaler" style={{ transform: `scale(${scale})` }}>
          <div className="lift">
            <div className="shadow" />
            <div className="rig" style={{ transform: `rotateX(${rot.rx}deg) rotateY(${rot.ry}deg)` }}>
              <div className="face back"><div className="edge" /><div className="tagline">came in clutch.</div><div className="band plain" /></div>
              <div className="face side left"><div className="band plain" /></div>
              <div className="face side right"><div className="band plain" /></div>
              <div className="face bottom" />
              <div className="items">
                {ITEMS.map((it) => {
                  const p = open ? it.o : it.c;
                  const z = open ? it.z * 1.6 : it.z;
                  const r = open ? p[2] || 0 : 0;
                  return (
                    <button
                      key={it.id}
                      type="button"
                      className={`item ${it.cls}${selKey && keyOf(it) === selKey ? ' sel' : ''}`}
                      style={{
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
              <div className="hinge"><div className="flap"><div className="teeth" /><div className="pull" /></div></div>
              <div className="face front">
                <div className="edge" />
                <div className="logo">CLUTCH</div>
                <div className="band">CLUTCH · ADMIT ONE · CLUTCH · ADMIT ONE</div>
                <div className="stitch" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="controls">
        <div className="group">
          <button className="btn primary" type="button" onClick={() => setOpen(!open)}>
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
              key={c.hex}
              className="sw"
              type="button"
              aria-label={c.name}
              aria-pressed={color === c.hex}
              style={{ background: c.hex }}
              onClick={() => setColor(c.hex)}
            />
          ))}
        </div>
      </div>

      <div className="panel" aria-live="polite">
        <h2>{selected ? selected.name : "What's inside"}</h2>
        <p>
          {selected ? (
            <><span className="q">{selected.qty}.</span> {selected.text}</>
          ) : (
            'Open the kit, then tap any item. Everything packs into a 4.5 × 3 in pouch.'
          )}
        </p>
        <div className="chips">
          {CHIP_ITEMS.map((it) => (
            <button
              key={keyOf(it)}
              type="button"
              className="chip"
              aria-pressed={keyOf(it) === selKey}
              onClick={() => select(it)}
            >
              {it.name}
            </button>
          ))}
        </div>
      </div>

      {showNotes && (
        <div className="notes">
          <p>Drawn to scale at 70 px = 1 in. The pouch is 4.5 × 3 in; its packed depth of about 0.9 in and the item sizes are estimates until a physical sample is packed.</p>
          <p>A drink test helps you check a drink. A negative result is not a guarantee. If you or a friend feel wrong, get help and call 911.</p>
          <p>Concept mockup. Contents, colors and price may change after the pilot.</p>
        </div>
      )}
    </div>
  );
}
