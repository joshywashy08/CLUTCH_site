// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  STRIPE PLACEHOLDER — NOT LIVE YET
// Paste the Stripe Payment Link for the $12 preorder between the quotes below,
// e.g. 'https://buy.stripe.com/XXXXXXXXXXXX'.
// While it is empty, every Preorder button on the site reads "Preorders open soon"
// and links nowhere. Nothing else needs to change when you add the link.
// ─────────────────────────────────────────────────────────────────────────────
export const STRIPE_PREORDER_URL = ''

// Prices in USD. Also hard-coded in index.html meta tags (HTML can't import JS).
export const PREORDER_PRICE = 12
export const RETAIL_PRICE = 15

// ─────────────────────────────────────────────────────────────────────────────
// EARLY FEEDBACK — real quotes only.
// The section stays hidden while this list is empty. Add a quote only if:
//   1. a real person said or wrote it,
//   2. they agreed to have it shown with their name, and
//   3. `context` says truthfully how they know Clutch.
// No star ratings, review counts or "verified buyer" marks until people have
// actually bought and reviewed a kit. Say so if the person is a friend or founder.
// Example:
//   { quote: 'What they said.', name: 'First name L.', context: 'Emory student, saw the concept site' },
// ─────────────────────────────────────────────────────────────────────────────
export type Feedback = { quote: string; name: string; context: string }
export const FEEDBACK: Feedback[] = []
