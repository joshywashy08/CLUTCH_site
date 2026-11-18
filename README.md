# CLUTCH Website

React (Vite) site for CLUTCH, a going-out kit. $12 preorder, $15 retail.

[cameinclutch.com](https://cameinclutch.com) · runs on Cloudflare Workers.

## Before preorders go live

- **Stripe:** paste the Stripe Payment Link into `STRIPE_PREORDER_URL` in `src/config.js`. Until then every Preorder button reads "Preorders open soon".
- **Prices** live in `src/config.js` and in the meta tags in `index.html`. Change both together.
- **Brand:** fuchsia `#D9327E`, bone `#EDE6DC`, black `#121318`. Launch colorways are fuchsia and bone. Space Grotesk for headings, Inter for body. Color tokens are in `src/index.css`.
- **Hero images** (`src/assets/pouch-*.webp`) are 3D concept renders, not photos. Replace them with real photos once a sample exists.
