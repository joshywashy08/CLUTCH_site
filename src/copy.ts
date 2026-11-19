// Every sentence on the site lives here, so a person can write and change it in one place.

// Headline. From Josh's page sketch, Nov 18.
export const HEADLINE = 'Be the friend who came in clutch with this kit for going out.'
// The part of the headline that gets underlined. Must match the headline exactly, or leave it empty.
export const HEADLINE_MARK = 'came in clutch'

// Prices. The retail price shows crossed out next to the preorder price.
export const RETAIL_PRICE = '$10'
export const PREORDER_PRICE = '$8'

// The button that opens the page where you can work the zipper and take things out. Leave empty to hide the button.
export const EXPLORE_LABEL = 'Explore'

// FAQ: [question, answer]. The questions are from the Pocket mockup (Nov 18). The answers are blank until a person
// writes them. A question with a blank answer shows only in `npm run dev`, never on the built site.
export const FAQ: [string, string][] = [
  ["What's inside?", ''],
  ['Will it actually fit my pocket?', ''],
  ['Is the drink test a guarantee?', ''],
  ["What's it made of?", ''],
  ['No vomit bag?', ''],
  ['Is this final?', ''],
]
