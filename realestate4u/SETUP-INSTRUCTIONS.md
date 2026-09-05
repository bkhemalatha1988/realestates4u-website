# realestates4u.in — setup guide

This site reads live from your "Projects" Google Sheet — no code editing
needed after this one-time setup.

## 1. Connect the Projects sheet

1. Open the Google Sheet that your "Add Project" form (see apps-script.gs)
   writes to.
2. File > Share > Publish to web.
3. In the dropdown, select the "Projects" sheet tab specifically, and choose
   format "Comma-separated values (.csv)".
4. Click Publish, copy the link it gives you.
5. Paste that link into `config.js` as `SHEET_CSV_URL`.

The website re-reads this link live, so any new row (new project) appears
automatically — no redeploy needed.

## 2. Connect the Enquiry form

1. Open your public "Enquiry" Google Form.
2. Click Send > the embed icon (`<>`).
3. Copy the URL inside `src="..."` from the code shown (it ends in
   `/viewform?embedded=true`).
4. Paste it into `config.js` as `ENQUIRY_FORM_URL`.

Optional — pre-fill the venture name when someone clicks "Enquire now" from
a venture page: on the Enquiry form, use "Get pre-filled link", fill a
sample answer in the venture-name question, generate the link, and copy the
`entry.XXXXXXXXX=` part into `ENQUIRY_VENTURE_FIELD` in `config.js`.

## 3. Column names matter

The site matches Sheet columns by partial name, so keep the Google Form
question titles close to these (already matches apps-script.gs):
Project name, Category (highway), RERA no., LP no., Total acres,
Total plots / Available plots, Market price per sq yard,
Govt price per sq yard, Location / Google Maps link, Photos,
YouTube video link, Brochure PDF.

For the Photos question (file upload, multiple files allowed), Forms
stores several links in one cell separated by commas — the site already
splits on commas and shows each as a gallery image.

## 4. Home page greeting banner (festival wishes / daily quote image)

This adds a photo banner near the top of the home page that you update
yourself, whenever you like, by editing a Google Sheet — never a website
file.

**One-time setup:**

1. In the same Google Sheet as your Projects tab, add a new tab named
   `Greeting`.
2. Give it these column headers in row 1: `Active`, `Image URL`, `Caption`,
   `Link`.
3. Fill in one row under it (see below).
4. File > Share > Publish to web > in the dropdown pick the `Greeting` tab
   specifically > format CSV > Publish. Copy the link.
5. Paste that link into `config.js` as `GREETING_CSV_URL`.

**The columns:**
- `Active` — type `yes` to show the banner, `no` to hide it. Leave blank and
  it's treated as `yes`.
- `Image URL` — paste a Google Drive share link to your photo (same way you
  do it for project photos: upload the image to Drive, right-click > Share >
  Anyone with the link, then paste the link here).
- `Caption` — optional short text shown over the photo, e.g. "Wishing all
  our customers a very Happy Diwali!" Leave blank for no caption.
- `Link` — optional. If filled, tapping the banner opens this URL (e.g. a
  WhatsApp link or a venture page). Leave blank to make it non-clickable.

**Whenever you want to change the photo** (a new festival, a new daily
quote): open the `Greeting` tab, replace the `Image URL` (and `Caption`) in
that same row, and save. The website reads this tab live, so the home page
picks up the change automatically within a few seconds — no code, no
re-upload, no redeploy.

If you want to switch it off temporarily, set `Active` to `no` instead of
deleting the row — that way you can bring back the same image later just by
changing it to `yes` again.

## 5. Hosting

Any static host works — Netlify, GitHub Pages, or your existing
realestates4u.in shared hosting. Just upload all files
(index.html, style.css, app.js, config.js) keeping them in the same folder.
No build step, no server needed.

## 6. Testing before going live

1. Add one test project through the "Add Project" form.
2. Refresh the site — it should appear under its category and on the home
   page within a few seconds.
3. Click into it — check photos, video, and the Enquire button all work.
4. Submit a test enquiry — confirm both emails (owner + customer) arrive.
