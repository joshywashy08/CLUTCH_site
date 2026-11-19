# CLUTCH Website

React + TypeScript (Vite) site for CLUTCH, a going-out kit in a pocket-size slate pouch. 

[cameinclutch.com](https://cameinclutch.com) · runs on Cloudflare Workers.

- **Words:** every sentence on the page is in `src/copy.ts`. Write them by hand.
- **Explore page:** `/explore` (`explore/index.html`, `src/Explore.tsx`). The pouch is a live 3D model (`src/pouch3d.ts`, drawn with three.js), built from the same shape formulas as the Blender model behind the home page render. Drag to turn it on both axes. Click: the zipper comes down as the pouch turns 70 degrees to show its opening and moves left, then the items (Blender renders) come out of the gap one by one. Click again: the items go back one by one, then it zips up and faces front. Without WebGL the page falls back to the flat frames with no turning. The only words are the logo and `HINT_OPEN` / `HINT_CLOSE` / `HINT_ROTATE` in `src/copy.ts`; the button to the page is `EXPLORE_LABEL`. Run `npm install` after pulling: three.js is a new dependency.
- **Price and preorder:** `RETAIL_PRICE` (shown crossed out) and `PREORDER_PRICE` are in `src/copy.ts`. The Preorder button is a placeholder and does nothing yet. `CONTACT_EMAIL` in `src/config.ts` is no longer shown on the page.
- **Brand:** slate `#2A2B30` and ivory `#EDE6DC` on the page (fuchsia `#D9327E` is in the palette but not used here); black `#121318` for the logo and the pouch band. Space Grotesk throughout: bold in the logo, medium in the page text. Color tokens are in `src/index.css`; the page follows the device's light or dark setting.
- **Images:** `src/assets/pocket-slate-*.webp` is a 3D concept render, and the "inside" view is a drawing. Replace both with photos once a sample exists.
