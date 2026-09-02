# realestates4u — Website

## How the site is structured now

- **Home page** — left/top half shows your highlights video, right/bottom
  half shows the project categories (including Resale Plots) as a menu,
  set against a subtle open-plots background illustration.
- **Projects** (in the top nav) — hover or tap to see a dropdown with all
  categories, including Resale Plots.
- **Category page** — lists every venture in that category. Selecting one
  goes to its detail page.
- **Venture detail page** — full info: photos, videos (YouTube or your
  own video files), brochure download, location + map link, RERA/LP
  numbers, plot availability, pricing, and a WhatsApp enquiry button.
- **Resale Plots page** — individual plots being resold, with size,
  dimensions and price shown up front. Each listing has its own detail
  page with photos and videos, same as a venture.
- **Privacy Policy page** — linked from the footer.
- **Admin panel** (`/admin`) — a form-based editor with "Add" buttons for
  new ventures and resale plots. See "Setting up the Admin panel" below.

## What's in this folder
- `index.html`, `style.css`, `app.js` — the site itself
- `data.json` — **all your content**: ventures, resale plots, prices,
  privacy policy text. Edit via the Admin panel, or by hand — see
  `CONTENT-GUIDE.md`.
- `admin/` — the Admin panel (Decap CMS). `admin/config.yml` needs a
  one-time edit before it works (see below).
- `images/` — photo files (also holds the background illustration files,
  `hero-plots.svg` and `plot-pattern.svg` — leave those two alone)
- `videos/` — your own uploaded video files
- `brochures/` — venture brochure PDFs

## Getting it online with your domain

This site now needs to be on a **GitHub-connected** Netlify project (not
drag-and-drop) for the Admin panel to work. If you're already on
drag-and-drop deploy, this is a one-time switch:

1. Create a GitHub repository and upload everything in this folder to it.
2. In Netlify, open your existing project → Project configuration →
   Build & deploy, and link it to that GitHub repo. Your domain and
   HTTPS certificate stay exactly as they are.
3. Every time you (or the Admin panel) push a change to GitHub, Netlify
   automatically rebuilds and republishes the site.

If you'd rather skip the Admin panel entirely, plain drag-and-drop
deploy still works fine too — just edit `data.json` by hand per
`CONTENT-GUIDE.md` and drag the folder onto Netlify's Deploys page as
before.

## Setting up the Admin panel (one-time)

1. Open `admin/config.yml` and replace `YOUR-GITHUB-USERNAME/YOUR-REPO-NAME`
   with your actual GitHub repo, e.g. `mallesh/realestates4u-website`.
2. In GitHub → Settings → Developer settings → OAuth Apps → New OAuth App,
   set the callback URL to `https://api.netlify.com/auth/done`. GitHub
   gives you a Client ID and Client Secret.
3. In Netlify → your project → Project configuration → General → OAuth,
   add those as an external login provider for GitHub.
4. Visit `yoursite.com/admin`, sign in with GitHub, and start editing —
   you'll see "Add" buttons for ventures inside each category, and for
   resale plots.

## Updating content day-to-day

See `CONTENT-GUIDE.md` for both the Admin panel and hand-editing options.

## Categories currently set up
- Sagar Highway Ventures (NH 565)
- Vijayawada Highway Ventures (NH 65)
- Srisailam Highway Ventures (NH 765)
- Warangal Highway Ventures (NH 163)
- Future City Ventures (Seven Hills Future City is already added as an example)
- Resale Plots (a separate section — add your own resale listings here)

Each category has one placeholder venture so you can see the structure.
