# Editing content

There are two ways to update ventures, resale plots, photos, videos and
prices. Use whichever you're set up for.

## Option A — the Admin panel (recommended once set up)

Visit `yoursite.com/admin`, log in with GitHub, and you'll see a form with
an **"Add"** button inside each category (for new ventures) and inside
Resale Plots (for new listings) — no file editing needed. Photos and
videos can be uploaded directly there too. See `admin/config.yml` for the
one-time setup this needs (a GitHub repo + Netlify connected to it).

## Option B — editing `data.json` directly

If you're not using the admin panel yet, you can still edit `data.json`
in any plain text editor. A few rules, since this is a JSON file (no
comments allowed inside it):

1. Every piece of text must be inside double quotes `" "`.
2. Every field (except the very last one in a `{ }` block) needs a comma
   after it.
3. To add a photo: put the image file inside `/images`, then add its
   filename to the venture's `"photos"` list, e.g.
   `"photos": ["images/sagar-1.jpg", "images/sagar-2.jpg"]`
4. To add a YouTube video: add the video ID (the part after `v=` in the
   URL) to `"youtube"`, e.g. `"youtube": ["ABC123"]`
5. To add your own video file: put it inside `/videos`, then add its
   filename to `"localVideos"`, e.g.
   `"localVideos": ["videos/sagar-drone.mp4"]`. Keep files under
   ~15–20MB so pages load quickly.
6. To add a brochure: put the PDF inside `/brochures`, then set
   `"brochure": "brochures/sagar-venture.pdf"`
7. To add a map: copy a Google Maps share link into `"mapLink"`.
8. To add a whole new venture, copy an existing `{ ... }` block inside a
   category's `"ventures"` list, and edit the copy — same for a new
   resale plot inside `"resale" → "listings"`.
9. Save the file, then re-upload `data.json` (and any new images, videos
   or PDFs) to your hosting.

A free tool like [jsonlint.com](https://jsonlint.com) can check your file
for typos before you upload it, if you're not sure it's valid.
