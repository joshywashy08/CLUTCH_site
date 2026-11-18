// The kit's contents, shared by the hero, the "What's inside" list and the 3D model's overlay.
// What each item is for. Keep it true: no safety promises, no accuracy numbers.
// art: how the item is drawn (CSS class, size in px, how many, stacked or side by side).
export const CONTENTS = [
  { key: 'test', short: 'Drink test', name: 'Drink-spike test', count: '1', text: 'Check a drink if something feels off. A negative result is not a guarantee.',
    art: { cls: 'i-test', w: 112, h: 40, n: 1, body: <span>DRINK TEST</span> } },
  { key: 'condom', short: 'Condoms', name: 'Condoms', count: '2', text: 'Individually wrapped. Two, because plans change.',
    art: { cls: 'i-condom', w: 50, h: 50, n: 2, body: null } },
  { key: 'bandage', short: 'Bandages', name: 'Bandages', count: '2', text: 'For the blister your shoes give you by midnight, or a scrape on the walk home.',
    art: { cls: 'i-bandage', w: 110, h: 24, n: 2, stack: true, body: null } },
  { key: 'bag', short: 'Vomit bag', name: 'Vomit bag', count: '1', text: 'Folded flat. Saves an Uber, a dorm room or a formal dress.',
    art: { cls: 'i-bag', w: 120, h: 40, n: 1, body: <span>Vomit bag</span> } },
  { key: 'mint', short: 'Mints', name: 'Mints', count: '2', text: 'Individually wrapped. One for you, one for whoever needs it.',
    art: { cls: 'i-mint', w: 44, h: 30, n: 2, body: null } },
  { key: 'card', short: 'Card', name: 'Instruction card', count: '1', text: 'How to use the drink test, signs someone may have been drugged, and who to call. It says plainly that a negative test is not a guarantee.',
    art: { cls: 'i-card', w: 104, h: 60, n: 1, body: <b>CLUTCH</b> } },
  { key: 'slot', short: 'Your slot', name: 'Your slot', count: '+', text: 'Left empty on purpose, and it’s part of the kit. Lip gloss, travel cologne, earplugs, a hair tie: whatever you’d turn around for.',
    art: { cls: 'i-slot', w: 104, h: 40, n: 1, body: <span>Your item</span> } },
];

