# QT Matcha website

Current September 2026 storefront, matching [the live Higgsfield site](https://qtmatcha.higgsfield.app/). Plain HTML, CSS and JavaScript; no build step.

## Preview locally

Run `python3 -m http.server 4173` from this folder, then open http://localhost:4173/.

## Current website

- `index.html`: current homepage, Strawberry / White Peach / Lemon Yuzu / Variety Pack, flavor galleries and first-batch signup.
- `css/brand-core.css`, `js/brand-core.js`: responsive design and interactions.
- `css/packet-motion.css`, `js/packet-motion.js`: scroll-driven packet section.
- `js/main.js`: existing Klaviyo email capture. Purchase buttons open the signup dialog while inventory is unavailable; Shopify checkout is not connected.
- `images/brand-core/`: packet art, fruit still lifes, waves and brand graphics.
- `images/lifestyle/`: responsive approved photography and alt-text manifest.
- `source-assets/lifestyle/`: all 17 approved original WebP photos, retained for future crops and Shopify product media. These originals are not loaded by the homepage.
- `BRAND-CORE-HANDOFF.md`: design decisions and image placement notes.
- `shopify/README.md`: developer handoff. This is a storefront prototype, not an uploadable Shopify theme.

## Approved lifestyle collection

Photos 02, 04, 06, 08, 09, 11, 13, 14, 15, 16, 17, 18, 29, 30, 32, 33 and 34 were selected with green Finder tags. Photo 30 is the hero; photo 14 is “A little more inside”; photo 15 is “Meet your new daily plus-one.” All approved photos are included in flavor-specific galleries. Existing flavor-and-fruit still lifes are preserved.

## Verification

Run `node --test tests/email-capture.test.cjs` for the mocked email-provider checks. Tests do not create real subscribers.

## Hosting and migration

Higgsfield hosting uses a separate deployment repository with this storefront under `app/public/`. A GitHub push here does not itself redeploy Higgsfield. The current site can also be served by any static host from the repository root without a build command.

The other HTML pages, `css/style.css`, `frames/`, and `js/preview-cart.js` are retained legacy/reference material. They are not the approved new storefront; old copy, product details and purchase flows need review before reuse. `packet-concept.html` is an earlier animation preview. Use `index.html` and the Shopify handoff as the implementation source.

Confirmed current messaging: fruit-forward matcha made for water, infused with iron, vitamin C and collagen. Mix one packet into 8–12 oz of water. Dosages, prices, pack counts, subscriptions, shipping and returns remain unconfirmed.
