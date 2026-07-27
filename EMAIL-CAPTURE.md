# Email / waitlist capture — setup (10 minutes)

The site's signup forms (homepage, shop, science, subscribe waitlist, and the discount popup) are wired to post to a real email tool with a **verified** success response — visitors only see "you're on the list" if the provider actually accepted the email. The old Shopify `/contact` workaround was removed (Shopify structurally rejects it on stores using New customer accounts — see the technical handoff doc, Section 4).

**Current state: CONFIGURED & VERIFIED (2026-07-17).** Klaviyo is live (site ID `TULcea`, list `U5ccR9`), the full form → Klaviyo path was tested end-to-end (202 accepted + on-page confirmation), and the discount popup is enabled. The steps below are kept for reference / if the account ever changes.

**Two follow-ups in Klaviyo (owner to-do):**
1. **Switch the `waitlist` list to single opt-in** (list → Settings → Consent). Klaviyo lists default to double opt-in, which sends a Klaviyo-branded "confirm your subscription" email — off-brand, and unconfirmed signups don't count as subscribed. Single opt-in is the right call for a waitlist.
2. **Delete the two setup test contacts** before any launch email: `qt.capture.test.2026@gmail.com` and `qt.popup.test.2026@gmail.com`.

## Step 1 — create the account (one of these, not both)

**Klaviyo (recommended — built for Shopify brands, and syncs into Shopify later):**
1. Sign up free at [klaviyo.com](https://www.klaviyo.com) with the brand email.
2. Create a **List** called `waitlist` (Audience → Lists & Segments → Create List).
3. Grab two values:
   - **Public API Key / Site ID** (6 characters): Account → Settings → API keys.
   - **List ID** (6 characters): open the `waitlist` list → Settings.

**Mailchimp (simpler, equally fine for launch):**
1. Sign up free at [mailchimp.com](https://mailchimp.com).
2. Audience → Signup forms → **Embedded form** → copy the URL inside `<form action="…">`.
   It looks like `https://xxxx.usX.list-manage.com/subscribe/post?u=…&id=…`.

## Step 2 — paste the values into the site

Open `js/main.js`, find the `CAPTURE` block at the top of the capture section:

```js
const CAPTURE = {
  provider: '',            // ← set to 'klaviyo' or 'mailchimp'
  klaviyoCompanyId: '',    // ← Klaviyo Public API Key / Site ID
  klaviyoListId: '',       // ← Klaviyo List ID
  mailchimpFormAction: ''  // ← Mailchimp embedded-form action URL
};
```

Fill in `provider` plus the field(s) for your tool, commit, push. The site redeploys itself.

## Step 3 — verify with a clean test (don't skip)

1. On qtmatcha.com, submit **one real, never-used email** through the homepage footer form.
2. Confirm it appears in Klaviyo (the `waitlist` list) or Mailchimp (Audience) within a minute.
3. Confirm the on-page message said "you're on the list" — and that a bogus test (e.g. disconnect wifi, submit) shows the retry message instead.

## Step 4 — turn the discount popup back on

In `js/main.js`, set `POPUP_ENABLED = true` (it's just above the popup builder). It shows once per visitor, 10s after load, on every page except the subscribe page.

## Launch day

The waitlist email with the 15% code is sent **from Klaviyo/Mailchimp**, not from the site. Before sending, delete the leftover `@example.com` / diagnostic test contacts (both in the email tool and in Shopify → Customers, per the handoff doc).
