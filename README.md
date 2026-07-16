# Packing List Label Generator — GitHub Pages setup

This tool is a single static page (`index.html`). No server, no database, no
DigitalOcean needed — GitHub Pages hosts static files for free.

## Files in this folder

- `index.html` — the app. Rename anything, but for GitHub Pages this must be
  called `index.html` and live at the repo root (or in `/docs`, see below).
- `catalog.csv` — this is your real product export (`ProductExport (1).csv`),
  used as-is. The app auto-detects `SKU`, `Name`, `EANBarcode`, and
  `UPCBarcode` columns and ignores everything else (price, weight, category,
  etc.), so you can keep exporting from your inventory system in the same
  format and just drop the new file in to replace this one.
- `logo.png` (or `logo.jpg` / `.jpeg` / `.svg`, common casings like `Logo.png`
  also work) — add your company logo here and it appears left-aligned,
  0.5in from the top and left edge of the page, plus on every printed
  label. This is hardcoded on purpose: there's no button in the app to
  change or remove it, so the only way to update the logo is to replace
  this file in the repo.
- `favicon.png` (or `favicon.ico`) — add this and it becomes the browser
  tab icon, replacing the default gray icon. Just save your icon file with
  exactly this name at the repo root, next to `index.html`.
- `Code.gs` — not part of the website itself. This is pasted into a
  separate Google Apps Script project to send the box-count/dimensions
  notification email described below. See "Email notifications" for setup.

The page automatically fetches `catalog.csv` and looks for a `logo.*` file
next to it on every load — that's what makes the hosted version "one shared
version" for the whole team. If `catalog.csv` is missing, the page falls
back to manual product entry saved only in that person's browser; if no
logo file is found, no logo is shown (nothing for a warehouse user to set).

Two things worth checking in your source data next time you export: row 45
in the current file has literal "Discontinued" text in the SKU/Name/EAN
columns instead of real product data — the app skips any row whose SKU is
exactly "Discontinued" so it won't show up, but it's worth checking your
export settings since this looks unintentional. Separately, one row
(`BM-T-78-Arrow-UK-01`) has a blank Name — the app falls back to the
Description column for the label text in that case, but a real Name value
would be cleaner.

## One-time GitHub setup

1. Go to github.com and create a new repository (Settings icon → "New
   repository"). Public is fine and free; if it's private, GitHub Pages
   requires a paid GitHub plan.
2. Upload `index.html`, `catalog.csv`, and (optionally) `logo.png` and
   `favicon.png` to the repo root. (Repo page → "Add file" → "Upload
   files" → drag them in → Commit.) Do **not** upload `Code.gs` here — it
   goes into Apps Script instead, see "Email notifications" below.
3. Go to the repo's **Settings → Pages**. Under "Build and deployment",
   set Source to **Deploy from a branch**, Branch to **main** and folder to
   **/(root)**, then Save.
4. GitHub gives you a URL like `https://yourusername.github.io/repo-name/`
   within a minute or two. That's the link to share with the warehouse team
   — bookmark it on the printing computer(s).

## Keeping the catalog current

Whenever products change, edit `catalog.csv` in the repo (GitHub's web
editor works fine — click the file → pencil icon → edit → Commit) and push.
Everyone who opens or refreshes the page after that gets the updated list
automatically — no reinstall, no manual CSV import needed on each machine.

## Searching for products

Typing in a box's search field starts showing matches as soon as 3+
characters are entered — no Enter key needed. It matches against product
name, SKU, and both barcode columns (EAN and UPC), so "iPhone 15" or a
scanned barcode both work.

## Printing

Open the hosted URL on the computer connected to the thermal printer, use
the tool as normal, and when you click "Complete & Print Labels" choose the
thermal printer in the browser's print dialog. Chrome is recommended.

Every box automatically prints twice: the first copy is labeled "APPLY TO
OUTSIDE OF BOX," and the second has a large bold banner reading "PLACE THIS
LABEL INSIDE THE BOX" — a reminder to drop that second copy inside the box
after sealing it, so the contents list travels with the box even if the
outside label is damaged or removed.

## History tab

Every time "Complete & Print Labels" is clicked, that packing list (every
box, product, and quantity) is saved to a History tab, listed by the date
it was completed and the total item quantity across all boxes, newest
first. "Reprint / Edit" loads it back into the Package Builder — add,
remove, or change quantities, then click "Complete & Print Labels" again to
print the corrected version (which is saved as its own new history entry,
so nothing is overwritten). History is stored in that browser only, the
same way the manual product entry fallback is — it doesn't sync between
different warehouse computers.

## Box dimensions and weight

Each box now has Length, Width, Height (inches), and Weight (lb) fields
right under its header. They're optional — leave them blank if you don't
need them for a given box — and they're what gets included in the
notification email below.

## Email notifications

Every time "Complete & Print Labels" is clicked, a summary email (box
count, dimensions, and weight for each box) is sent automatically to your
team. This is powered by a small Google Apps Script tied to your own Gmail
account — GitHub Pages can only host static files, it can't send email on
its own, so this one extra piece is what makes the "automatic email"
actually work.

**Setup (~5 minutes, one time):**

1. Go to [script.google.com](https://script.google.com) → New project.
2. Delete the placeholder code and paste in the contents of `Code.gs`
   (included in this folder — this file does NOT go in the GitHub repo,
   it's pasted into Apps Script instead).
3. Click the gear icon (Project Settings) → Script Properties → add two:
   - `NOTIFY_TOKEN` — make up any password-like string.
   - `NOTIFY_EMAILS` — your 3 recipient addresses, comma-separated, e.g.
     `a@company.com,b@company.com,c@company.com`
4. Click **Deploy → New deployment**, type **Web app**, set "Execute as"
   to **Me** and "Who has access" to **Anyone**, then Deploy. Authorize it
   when prompted (it's your own script acting on your own Gmail — this is
   a one-time consent, not a recurring login).
5. Copy the **Web app URL** it gives you.
6. Open `index.html`, find these two lines near the top of the script, and
   fill them in:
   ```
   var NOTIFY_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
   var NOTIFY_TOKEN = "PASTE_YOUR_SHARED_TOKEN_HERE";
   ```
   Replace with the URL from step 5 and the token from step 3, then push
   `index.html` to GitHub like any other update.

**Why the recipient list isn't in a repo file:** `index.html` is fully
public — anyone can view its source on GitHub Pages. Keeping the 3 email
addresses in the Apps Script's Script Properties (instead of in the public
page) means that URL can't be used to redirect the notification to some
other, attacker-chosen address; at worst, someone who found the URL could
trigger a junk email to your own 3 recipients, not send mail to a stranger.
The token adds a basic check against random visitors triggering sends at
all. It's not perfect security — nothing embedded in a public static page
truly is — but it's the sensible level of caution for what this is.

Because of how Apps Script responds to requests from a different domain,
the page can't actually confirm the email was received — it just fires the
request and moves on. Test it once after setup by completing a packing
list and checking that the email arrives.

## Appearance

The page uses a dark theme (black background) throughout the app itself.
Printed labels are unaffected — they always print on a plain white
background with black text/barcodes, since that's what thermal printers
expect.
