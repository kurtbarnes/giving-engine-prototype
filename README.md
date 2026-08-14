# Giving Engine — Interactive Prototype

A clickable, front-end-only prototype of the donation forms/checkout product described in
`Giving-Engine-Design-Document.docx`. No backend, no real payments — all data is mocked in
`app-core.js`. It exists to give a visual, interactive sense of what should be built, not to be
shipped as-is.

## Running it

**Just open `index.html` in a browser.** No build step, no server, no install required —
React, ReactDOM, and Babel are vendored locally in `vendor/` and everything else is inlined
into `index.html` at load time, so it also works if you open the file directly (`file://`)
instead of serving it.

If you'd rather serve it (e.g. to test on a phone on the same network):
```
python3 -m http.server 8000
```
then visit `http://localhost:8000/index.html`.

## What's in here

- **`index.html`** — the actual app. It inlines the four `app-*.js` files below and transforms
  their JSX in-browser with Babel Standalone at load time. This makes the whole prototype a
  single self-contained file (plus `vendor/` and `styles.css`).
- **`app-core.js`** — mock data (5 sample organizations, ~48 mock gifts) and the shared
  `useCheckout()` state hook every donor template is built on.
- **`app-templates.js`** — the 5 donor-facing checkout templates (Classic NXT, Minimal Checkout,
  Story Page, Modal Overlay, Split Designation). All 5 consume the same `useCheckout()` hook —
  only layout/styling differs, matching the "one config, many renderings" approach in the design
  doc (§10–11).
- **`app-admin.js`** — the admin console: gift history (search/filter/export), form builder,
  branding/brand-kit editor, merchant account summary.
- **`app-onboarding.js`** — the 5-step Rainforest merchant-onboarding (KYC) wizard.
- **`app-shell.js`** — top-level nav, template gallery, and the root `App` component that ties
  the three sections together.
- **`styles.css`** — all styling: a shared "shell" design system for the admin/nav chrome, plus
  five distinct, fully separate visual systems (colors, type, layout) for the five templates.
- **`vendor/`** — local copies of React 18, ReactDOM 18, and Babel Standalone, so the prototype
  has no CDN dependency and works offline.

## Reading this as a dev handoff

The most useful thing to look at first is `useCheckout()` in `app-core.js` — it's the checkout
state machine (step, amount, frequency, designation, split allocations, donor info, submit) that
all 5 templates share. In a real build, this is the seam between the "headless checkout engine"
and "template" layers described in the design doc (§10.1) — the templates here are deliberately
thin, presentational consumers of one shared hook, not five separate implementations of checkout
logic.

Everything is mock data / setTimeout-simulated network calls — there is no real Rainforest, RE
NXT, or backend integration here. Treat interactions (submitting a gift, submitting onboarding,
toggling a field in the form builder) as illustrations of the intended flow and UI, not reference
implementations.
