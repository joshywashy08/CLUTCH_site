# CLUTCH Website

React + TypeScript (Vite) site for CLUTCH, a going-out kit in a pocket-size slate pouch. 

[cameinclutch.com](https://cameinclutch.com) · runs on Cloudflare Workers.

- **Words:** every sentence on the page is in `src/copy.ts`. Write them by hand.
- **Explore page:** `/explore` (`explore/index.html`, `src/Explore.tsx`). Drag the zipper down the pouch, then pull things out of the opening or click them; drop them back on the opening to put them away. The pouch and items are Blender renders at one scale; item sizes are working assumptions. The button to it is `EXPLORE_LABEL` in `src/copy.ts`.
- **Price and preorder:** `RETAIL_PRICE` (shown crossed out) and `PREORDER_PRICE` are in `src/copy.ts`. The Preorder button is a placeholder and does nothing yet. `CONTACT_EMAIL` in `src/config.ts` is no longer shown on the page.
- **Brand:** slate `#2A2B30` and ivory `#EDE6DC` on the page (fuchsia `#D9327E` is in the palette but not used here); black `#121318` for the logo and the pouch band. Space Grotesk throughout: bold in the logo, medium in the page text. Color tokens are in `src/index.css`; the page follows the device's light or dark setting.
- **Images:** `src/assets/pocket-slate-*.webp` is a 3D concept render, and the "inside" view is a drawing. Replace both with photos once a sample exists.
