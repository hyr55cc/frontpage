# Lumen — Premium Browser Start Page

A polished, futuristic new-tab / start-page dashboard built in **pure HTML, CSS, and vanilla JavaScript**. No build step, no frameworks, no API keys. Drop it on any static host and it runs.

Design language draws from Apple Vision Pro, Arc, Linear, Notion, and Raycast: glassmorphism, soft shadows, elegant gradients, distinctive typography, and lightweight high-impact motion.

---

## Features

**Header**
- Large live clock (updates every second, self-correcting to the second boundary)
- Gregorian date + **Hijri date** via the official Umm Al-Qura calendar (`Intl` `islamic-umalqura`)
- Localized day name (Arabic in RTL mode, English in LTR)
- Time-aware greeting

**Search**
- Separate boxes for Google, ChatGPT, and DeepSeek out of the box
- Add unlimited custom engines; edit, delete, reorder (drag & drop), and color them
- Keyboard shortcuts: `/` focuses the first engine, `Alt+1…9` jumps to an engine, `Esc` closes overlays
- Focus glow + entrance animations

**Bookmarks**
- Card-based, unlimited categories and links
- Drag & drop reordering, pin/favorite (pinned float first)
- Auto favicons with letter fallback
- Grid and list view modes
- Inline add / edit / delete, rename categories on double-click

**Themes & personalization**
- 8 themes: Aurora (signature default), Light, Dark, AMOLED, Glassmorphism, Cyberpunk, Minimal, Luxury
- Custom accent color, UI font, card transparency, corner radius, glass blur
- Everything driven by CSS variables and persisted

**Backgrounds**
- Gradient presets, solid, or custom uploaded image (stored locally)
- Daily rotating gradient
- Blur and brightness controls

**Animations**
- Interactive particle field (mouse-repulsion, linked nodes, accent-tinted)
- Floating orbs, grain overlay, glass reflection sweeps, staggered entrance reveals
- Fully respects `prefers-reduced-motion`

**Widgets** (toggle each on/off)
- Weather (Open-Meteo — no key)
- Prayer times (Aladhan, Umm Al-Qura method)
- To-do list, Quick notes, Pomodoro timer
- Calendar (Gregorian grid + Hijri month label)
- World clock, Cryptocurrency prices (CoinGecko), Quick calculator

**Technical**
- Modular file structure, LocalStorage persistence
- PWA: installable, offline support via service worker (network-first for live data, cached app shell)
- Full RTL Arabic + English with one-tap language toggle
- Export / import / reset all settings as JSON

---

## Live-data sources (all keyless, run in your browser)

| Widget | Source |
|---|---|
| Weather | Open-Meteo geocoding + forecast |
| Prayer times | Aladhan API (method 4 = Umm Al-Qura) |
| Crypto | CoinGecko simple price |
| Favicons | Google s2 favicon service |

No account, no API key, no server. If you are offline these widgets simply show their last state or a gentle fallback; the rest of the dashboard keeps working.

---

## Run locally

Because of the service worker and `fetch` calls, open it through a local server (not `file://`):

```bash
cd lumen
python3 -m http.server 8080
# visit http://localhost:8080
```

## Deploy on GitHub Pages

1. Create a repository and push the contents of this folder to it.
2. In the repo: **Settings → Pages → Build and deploy → Source: Deploy from a branch**, pick `main` and `/ (root)`.
3. Open the published URL. All paths are relative, so it works from a project subpath (e.g. `username.github.io/lumen/`).

The service worker registers only over HTTPS or localhost — both of which GitHub Pages provides.

---

## Project structure

```
lumen/
├── index.html            App shell
├── manifest.json         PWA manifest
├── sw.js                 Service worker (offline cache)
├── css/
│   ├── variables.css     Design tokens + 8 theme palettes
│   ├── base.css          Layout, background stack, topbar
│   ├── components.css    Search, bookmarks, widgets, drawer, modal
│   └── animations.css    Keyframes & motion
├── js/
│   ├── storage.js        State + LocalStorage (pub/sub)
│   ├── i18n.js           English / Arabic dictionaries
│   ├── clock.js          Live clock, Gregorian + Hijri dates
│   ├── themes.js         Theme / accent / font / background engine
│   ├── search.js         Search engines + hotkeys
│   ├── bookmarks.js      Categories, cards, drag & drop
│   ├── widgets.js        All widgets
│   ├── settings.js       Settings drawer
│   └── app.js            Boot, particles, wiring
└── icons/                PWA icons
```

---

## Notes

- All data is stored **locally in your browser** (LocalStorage). Clearing site data resets it. Use **Settings → Data → Export** to back up.
- Customize defaults by editing the `DEFAULTS` object in `js/storage.js`.
