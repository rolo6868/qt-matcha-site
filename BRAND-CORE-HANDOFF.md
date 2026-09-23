> **September 23, 2026 — Current prelaunch behavior:** The homepage keeps its shopping layout, but Add to bag and the header Bag open the first-batch signup dialog. No preview cart is loaded. The `.news-form` uses the existing Klaviyo site `TULcea` and list `U5ccR9`; the source property includes `first-batch` and the selected flavor. Stock announcements must be sent through Klaviyo when the batch is available; this is list signup, not a Shopify inventory-triggered back-in-stock flow. Prior cart migration notes below describe future commerce work. The old timed discount popup remains disabled on this homepage. Local tests mock provider acceptance/failure; no test subscriber or email campaign was created.

# QT Brand Core homepage — September 2026

Source: [08 / QT IN REAL LIFE / Brand Core palette](https://www.figma.com/design/giGs9v9H4t9P1YwRADXeHI/?node-id=510-303).

The homepage remains static HTML/CSS/JS, matching the existing project. No build step or dependency installation is needed.

## Run locally

From this folder:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. The Higgsfield preview URL is https://qtmatcha.higgsfield.app. Deployment uses a separate hosting repository, with static assets under `app/public/`; see `shopify/README.md` for the workflow.

## Current implementation

- `index.html`: new homepage. Section order and layout follow the selected Figma frame, with copy adapted to the new brand positioning.
- `css/brand-core.css`: Figma palette and typography (Bricolage Grotesque / Figtree), responsive layout, media frames, reduced-motion fallback.
- `js/brand-core.js`: mobile menu, keyboard-accessible ingredient tabs, native accordions, flavor/gallery selection, quantity and purchase-type controls, session-persistent preview bag, scroll-linked packet reveal, draggable looping lifestyle carousel with pause and directional controls.
- `js/main.js`: reused existing email provider integration. A `data-disable-popup` opt-out prevents the old discount promotion on this page. Signup errors have an accessible status role. Existing pages keep their previous behavior.
- `images/brand-core/`: original exported assets from the selected Figma frame plus responsive WebP derivatives. These are temporary art direction, not newly generated media. `design-assets.json` records their source mapping; the downloaded local files do not rely on expiring URLs.

Palette: forest #2E4B21, rose #F5B1CB, hot pink #F26FA8, lime #C5E748, pale lime #E9F3BE, cream #F9F8F1.

## Replace media as assets are developed

1. Hero: replace the image inside `[data-asset-slot="hero"]` with a video and poster or interactive component. The containing frame already handles responsive cropping. If video autoplays, use muted/playsinline, provide a pause control, and honor reduced motion.
2. Scroll reveal: `.reveal-packet` currently rotates/scales with native scroll while ingredient labels enter. Replace the exported packet or use the calculated progress for a future frame sequence. Reduced motion displays the complete composition without a long pinned scroll.
3. Products: update the `flavors` map in `js/brand-core.js`, the four flavor cards, and the gallery's initial HTML together.
4. Lifestyle: replace the five original figures inside `.carousel-track`; JavaScript creates inaccessible duplicates solely for seamless looping.
5. Figma wave contours and ingredient badges are downloaded SVGs, reused as-is.

## Copy and launch boundaries

The story is “your daily QT / matcha that loves you back”: real matcha, fruit-forward, mixes into water, fits class/work/gym/travel. No latte positioning, milk-mixing recommendation, old vanilla/coconut flavor lineup, specific efficacy promises, or unverified dosage claims are in the new homepage.

Confirmed product direction: QT is iron-infused and contains iron, vitamin C, and collagen. Use this messaging consistently. Ingredient forms, amounts, caffeine, nutrition and allergens will be supplied later. Current packaging imagery is the Figma reference; final art and detailed claims remain to be reviewed.

Prices are omitted; the shop is marked “Coming soon.” Subscription choices are hidden until terms are confirmed. The bag is a local session-storage preview; it never creates an order or charges a customer. Connect approved prices, SKUs, subscription terms, and checkout before launch. Refresh preserves selections within the same tab. The preview provider is isolated in `js/preview-cart.js`. See [the Shopify handoff](shopify/README.md) for the exact migration boundaries.

Newsletter reuses the existing Klaviyo configuration. No email was submitted during this pass; the live provider connection was not reverified. New signup copy does not promise a discount.

The previous multi-page site remains in the repository. The new homepage uses internal section links so its journey does not send visitors into the outdated pages. Updating/retiring those pages, legal/contact/social links, final media, and production commerce are future launch work.

## Validation completed

- JavaScript syntax checks passed for both scripts.
- All homepage anchor targets and local image/script files resolve; no duplicate IDs.
- Browser checked at 1440×1000 and 390×844: no page-level horizontal overflow, no broken loaded images, and no console errors.
- Verified menu, ingredient tabs (including arrow-key navigation), flavor-to-gallery updates, quantity controls, adding/removing items in the preview bag, and carousel directional/pause controls.
- Scroll-linked motion and static reduced-motion CSS are implemented; final creative animation awaits its assets.

## Mobile polish pass

Removed the oversized footer wordmark; tightened newsletter/navigation/legal spacing. Added branded native-dialog navigation and bag drawers with Escape dismissal and focus containment. Shortened mobile hero and scroll story; ritual cards use native horizontal scroll with a next-card peek. Mobile lifestyle carousel starts paused.

Original PNG set: 13,051,436 bytes. Equivalent 960px WebP set: 828,138 bytes (93.7% smaller); 480px set: 363,750 bytes. These are asset-set measurements, not a Lighthouse score or total transfer measurement. HTML uses responsive sources; original PNGs remain only as editable source art. Regenerate derivatives with `python3 scripts/optimize_images.py` (Pillow required).

Checked viewport widths 320, 375, 390, 430, 768 and 1440 for page overflow and broken loaded images. Browser verified preview-bag persistence across reload, remove, navigation drawer links, product selection, and purchase controls. Preview-cart unit tests cover merging, purchase-type separation, corrupt/blocked storage and quantity clamping. No live checkout or newsletter submission was performed.

## Shopping clarity pass

Hero copy identifies iron, vitamin C and collagen immediately. Flavor descriptions emphasize matcha taste; the Variety Pack is highlighted for first-time shoppers. Confirmed mixing directions are one packet in 8–12 oz of water. Nutrient amounts, collagen details, packet counts, prices, shipping, subscription and return terms remain unset.

Flavor links select the corresponding option and go directly to the purchase controls. A mobile quick-shop bar appears away from the hero, purchase controls and footer; open dialogs hide it. The bag remains a preview only.

## Favicon

Uses the original “01 / LIME QT” artwork from Figma, node `552:315` in file `giGs9v9H4t9P1YwRADXeHI` (Website → FAVICONS / QT brand / six directions). `favicon.svg` uses the Figma vector mark with its lime background extended to all four corners (the rounded export left white corners in raster formats). PNG, multi-size ICO and Apple touch icon derivatives accompany it; the original PNG is retained in `images/brand-core/favicon-lime-qt.png`. All existing site pages reference this set with a cache-busting version.

## Published preview — 2026-09-22

Deployed to https://qtmatcha.higgsfield.app using Higgsfield hosting commit `75484c1`. Production build/typecheck and preview-cart tests passed. The public page was verified for the refreshed homepage, Lime QT favicon, arrow-free starter seal, functioning bag dialog, and mobile overflow/broken-image checks. Shopify checkout remains unconnected.

Favicon corner fix: SVG uses a full square lime background; PNG sizes were rendered from that vector, and the multi-size ICO regenerated. All page references use `v=lime-qt-square` to invalidate cached icons.

## Packet lighting correction — September 22, 2026

Figma packet image fills have neutral image adjustments and no darkening effects; the bottom-heavy shadows are baked into the flattened renders. The website applies the `packet-shadow-lift` SVG gamma filter (0.78, sRGB, alpha preserved) only to the four standalone packet assets, including dynamic gallery and bag images. Keep the inline SVG definitions and corresponding CSS together when migrating to Shopify. Original assets and lifestyle photos remain unchanged. Verified desktop comparison and 390px mobile flavor cards.

Signup polish: quantity stepper now sits below its label. The stock dialog uses flavor-specific packet artwork and colors, with a dedicated success template after Klaviyo accepts submission. Desktop/mobile visual QA used a temporary local mocked provider page (removed); no test contact was sent to Klaviyo.

## Approved packet scroll integration
The homepage now loads `css/packet-motion.css` and `js/packet-motion.js`. Styles are scoped to #packet; the previous packet animation in brand-core.js is removed. Uses the existing strawberry asset, native SVG ribbon, QT ingredient badges, existing wave boundaries, sticky-header clearance, and reduced-motion static fallback. Mobile quick-shop hides while the packet sequence is active. No Blender runtime or heavy video is loaded.

## Approved lifestyle photography — September 23, 2026
Uses all 17 green-tagged source photos: 02, 04, 06, 08, 09, 11, 13, 14, 15, 16, 17, 18, 29, 30, 32, 33, 34. Responsive WebP derivatives and their alt-text manifest are in images/lifestyle/. Source originals remain untouched. Photo 30 is the hero with a centered drink/packet crop; photo 17 illustrates mixing; five new photos replace the previous lifestyle carousel. Existing flavor-and-fruit still lifes remain.

Product galleries group every approved photo by the packet flavor, with thumbnail scrolling, previous/next controls, keyboard arrows and mobile swipes. Strawberry: 30/06/09/15/18/33; White Peach: 17/02/11/13/29/34; Lemon Yuzu: 14/04/08/16/32. Variety includes a mixed selection. In Shopify, map these to the corresponding product media. Hero loads eagerly; other lifestyle images and thumbnails load lazily. All responsive derivatives total approximately 3.1 MB, with only the sizes selected by the browser loaded.

Lifestyle follow-up: “A little more inside” now uses approved photo 14 (Lemon Yuzu with matcha bottle), and “Meet your new daily plus-one” uses photo 15 (Strawberry and iced matcha). Dedicated responsive crops fill the existing rounded frames. Verified desktop and mobile closing composition; deployment commit ab892bc.
