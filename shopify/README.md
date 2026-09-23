> **September 23, 2026 — Current prelaunch behavior:** The homepage keeps its shopping layout, but Add to bag and the header Bag open the first-batch signup dialog. No preview cart is loaded. The `.news-form` uses the existing Klaviyo site `TULcea` and list `U5ccR9`; the source property includes `first-batch` and the selected flavor. Stock announcements must be sent through Klaviyo when the batch is available; this is list signup, not a Shopify inventory-triggered back-in-stock flow. Prior cart migration notes below describe future commerce work. The old timed discount popup remains disabled on this homepage. Local tests mock provider acceptance/failure; no test subscriber or email campaign was created.

# Shopify handoff — QT Matcha

This repository is the approved storefront prototype, **not an uploadable Shopify theme yet**. Keep the design and mobile behavior; integrate them into the store's chosen Online Store 2.0 theme. No Shopify credentials or paid apps are needed to review it locally.

## Start here

- `index.html`: homepage markup and current copy.
- `css/brand-core.css`: responsive styles, design tokens, native modal drawers, motion fallbacks.
- `js/brand-core.js`: presentation interactions, flavor photo galleries and first-batch signup dialog.
- `js/preview-cart.js`: disposable local preview provider. **Do not load this in production.** Its session storage is not a Shopify cart.
- `js/main.js`: legacy email integration. Preserve the intended list/consent behavior, or replace with the merchant's Shopify/Klaviyo form. Do not carry over its old discount popup.
- `images/brand-core/*-480.webp` and `*-960.webp`: optimized responsive assets. SVG files contain the exact Figma waves and badges. Original PNGs are source art only, not storefront downloads.

There is no framework or bundler to migrate. Share the entire repository or a GitHub branch, not `index.html` alone: the page requires its CSS, scripts and assets.

## Theme section mapping

| Prototype location                       | Shopify destination         | Merchant-editable content                             |
| ---------------------------------------- | --------------------------- | ----------------------------------------------------- |
| `.announcement`, `.site-header`, `#menu` | Header section group        | Announcement, navigation menu, featured product       |
| `.hero`                                  | Hero section                | Headline, description, CTA, image/video poster        |
| `#flavors`                               | Product collection section  | Product/collection picker; no hard-coded variant IDs  |
| `#ritual`                                | Ritual cards section        | Three image/title/body blocks                         |
| `#packet`                                | Scroll story section        | Packet, fruit, short ingredient labels                |
| `#ingredients`                           | Ingredient explorer section | Tab content and ingredient disclosures                |
| `#shop`                                  | Featured product section    | Product, variants, selling plans, native product form |
| `.variety`                               | Featured bundle section     | Actual bundle product and product media               |
| `#life`                                  | Lifestyle gallery section   | Media blocks, captions                                |
| `.closing`                               | Final CTA section           | Product reference and copy                            |
| `#club`, `.footer-bottom`                | Footer section group        | Newsletter, navigation, actual policy links           |

Use JSON templates to compose these sections. Use `section.id` in instance-specific IDs and query within each section instead of carrying over the prototype's global selectors. Support `shopify:section:load` and `shopify:section:unload` by initializing/destroying listeners, observers and animation frames. The prototype's one-page initializer is not a theme-editor lifecycle manager.

Scope or rename the prototype's generic CSS selectors (`.btn`, `.hero`, `h2`, etc.) during theme integration so they do not override the rest of the chosen theme. Keep the existing theme's header/footer/cart if that is the integration strategy; do not render duplicate headers or drawers.

## Products, purchase controls and the bag

1. Configure actual products for Strawberry, White Peach, Lemon Yuzu, and Variety Pack. Whether singles are variants or separate products is a store/catalog decision; do not infer product IDs from the names.
2. Replace `flavors` in `brand-core.js` with data rendered from Liquid product settings. Render media URLs through Shopify image filters; do not construct relative `images/` paths in the theme.
3. Add Liquid-formatted variant prices once confirmed. Update prices, availability and the form's `name="id"` variant input when the selected flavor changes. Disable purchase for unavailable variants.
4. Use `{% form 'product', product %}` and a submit button for add-to-cart. Include `name="quantity"` and the selected variant ID. A real selling plan ID is required for subscription purchases; only render subscription choices when supported by that variant's selling-plan allocations. Never infer a subscription from the string `subscribe`.
5. Remove `preview-cart.js` and replace the prelaunch signup purchase handlers in `brand-core.js` with the theme's native cart implementation. Render bag count, items, totals, discounts and availability from Shopify. If using Ajax, use locale-aware `window.Shopify.routes.root` with `cart.js`, `cart/add.js`, and `cart/change.js`. Use line-item keys when changing/removing items. Handle sold-out/quantity/network errors and prevent double submits.
6. After mutations, use the theme's bundled section rendering to refresh its cart and count. The local preview adapter has synchronous methods and prototype-shaped rows; it is **not** a drop-in Ajax adapter.
7. Link checkout to the store's real checkout via the native cart flow. Test with Shopify test payments in an unpublished theme before launch.

The native dialog UX is reusable: Escape/backdrop dismissal, focus containment/restoration, page scroll lock, empty state and 44px touch targets. Current purchase buttons open first-batch signup instead of checkout.

## Mobile/performance decisions to preserve

- 480/960 WebP sources, responsive `srcset` and `sizes`; hero loads eagerly, below-fold media lazily, explicit image dimensions.
- Shopify: use `image_url` / `image_tag` with appropriate widths/sizes for CDN-generated responsive media. Use the theme's font settings or hosted WOFF2 rather than duplicate Google Fonts requests.
- Sticky compact header; cards with visible horizontal peeking and native scroll snap on mobile.
- No carousel autoplay by default on mobile/coarse pointers. Offscreen/paused carousel stops requesting animation frames.
- Reduced-motion fallback and short mobile scroll scene. Keep future video optional, muted if autoplaying, with a pause control and static reduced-motion poster; do not preload a large video on cellular merely to decorate the hero.
- No automatic discount popup or fake urgency. No third-party animation framework.

## Content still required before selling

Final formula/nutrition/allergens/caffeine, actual product prices and sizes, approved subscription terms, shipping/returns/privacy/terms/contact links, final creatives and social destinations. Existing Figma pack photography is reference art and may contain unapproved printed claims. The homepage copy is water-first and avoids the old vanilla/coconut/latte positioning.

## Official references checked for this handoff

- [Theme architecture](https://shopify.dev/docs/storefronts/themes/architecture)
- [JSON templates and sections](https://shopify.dev/docs/storefronts/themes/architecture/templates)
- [Ajax Cart API and locale-aware URLs](https://shopify.dev/docs/api/ajax/reference/cart)
- [Native cart form](https://shopify.dev/docs/storefronts/themes/architecture/templates/cart)

These notes prepare the migration; live Shopify integration, theme-editor validation and checkout testing remain for the store implementation.

Confirmed preparation: one packet in 8–12 oz of water. The current homepage omits subscription choices and prices pending approval. Preserve the mobile quick-shop behavior when converting sections; flavor links target `#choose-flavor` and preselect the requested flavor.

## Higgsfield preview hosting

The existing website project is `7f2e947f-a8ab-469a-9e3b-48ddee5fa9e9`, with public URL `https://qtmatcha.higgsfield.app`. Higgsfield stores its deployment in a separate Git repository; static website files live under `app/public/`. Keep the static source here as the Shopify handoff.

To deploy updates, use a current Higgsfield CLI with website commands, request scoped `website repo-access`, clone the returned repository, and copy the website HTML/CSS/JS/images/favicon files into `app/public/`. Do not copy local documentation, credentials or `.git` there. Run `bun install --frozen-lockfile` and `bun run build` in `app/`, commit and push the public files to its `main` branch, then run `higgsfield website deploy 7f2e947f-a8ab-469a-9e3b-48ddee5fa9e9`. The `website publish` command is a separate community-feed listing and is not needed to deploy. Never save the scoped repository token in Git.

## Photography included in GitHub

`source-assets/lifestyle/` contains all 17 approved original WebP files. `images/lifestyle/` contains the 240/480/960px derivatives plus a 1440px hero and the approved photo/alt-text manifest. Use originals for Shopify product media and let Shopify generate responsive sizes. See the root README and brand handoff for the photo-to-section and flavor mapping.
