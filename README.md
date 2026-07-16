# Box Label Generator — GitHub Pages setup

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
- Add your own `logo.png` (or `logo.jpg` / `.jpeg` / `.svg`) to this same
  folder if you want it on the printed labels. Not required.

The page automatically fetches `catalog.csv` and looks for a `logo.*` file
next to it on every load — that's what makes the hosted version "one shared
version" for the whole team. No file found means the page falls back to
manual entry/upload saved only in that person's browser.

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
2. Upload these three files to the repo root: `index.html`, `catalog.csv`,
   and your `logo.png` if you have one. (Repo page → "Add file" → "Upload
   files" → drag them in → Commit.)
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
