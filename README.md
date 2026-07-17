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
  0.5in from the top and left edge of the page. This is hardcoded on
  purpose: there's no button in the app to change or remove it, so the
  only way to update the logo is to replace this file in the repo.
- `logo-print.png` (same extension/casing options as above) — optional.
  The on-screen header sits on a dark background, so `logo.png` can be a
  white/light version. The printed 4"×6" label is on plain white paper, so
  a white logo would be invisible there. Add a `logo-print.*` file with a
  dark/colored version of your logo and it's used on printed labels
  instead; if this file isn't present, labels just fall back to using
  `logo.png` like before.
- `favicon.png` (or `favicon.ico`) — add this and it becomes the browser
  tab icon, replacing the default gray icon. Just save your icon file with
  exactly this name at the repo root, next to `index.html`.
- `.github/workflows/notify-packing-list.yml` — a GitHub Actions workflow
  that sends the notification email described below via Gmail SMTP. This
  DOES need to be uploaded to the repo, at that exact path. See "Email
  notifications" for setup.
- `cloudflare-worker.js` — not part of the GitHub repo. This is pasted into
  a separate, free Cloudflare Worker that relays the notification trigger
  without exposing a real GitHub token in the public page. See "Email
  notifications" for setup.
- `Code.gs` — deprecated, no longer used (see the note at the top of the
  file). Kept only for reference; do not upload this one to the repo.

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
count, dimensions, weight, and the SKUs/quantities in each box) is sent
automatically. The path is: page → Cloudflare Worker relay → GitHub Actions
workflow → Gmail SMTP. GitHub Pages can only host static files and can't
send email or hold secrets on its own, so these two extra pieces are what
make the "automatic email" work without exposing anything sensitive in the
public page.

(Two earlier approaches were tried and abandoned here: Google Apps Script
— see the note at the top of `Code.gs` — and a real GitHub token embedded
directly in `index.html`, which GitHub's own secret scanning kept
auto-revoking within minutes of being detected in the public repo, no
matter how narrowly it was scoped. The Worker relay below solves that by
keeping the real GitHub token private and server-side.)

**Setup (~15 minutes, one time):**

1. **Generate a Gmail App Password** for the sending account (Google
   Account → Security → 2-Step Verification → App passwords). This is the
   same kind of credential already used for other GitHub → Gmail
   automations on this account.
2. **Add repo secrets.** In the GitHub repo: Settings → Secrets and
   variables → Actions → New repository secret. Add three:
   - `GMAIL_USERNAME` — the full Gmail address sending the notification.
   - `GMAIL_APP_PASSWORD` — the app password from step 1.
   - `NOTIFY_EMAILS` — the recipient addresses, comma-separated, e.g.
     `a@company.com,b@company.com,c@company.com`
3. **Upload the workflow file.** Make sure `.github/workflows/notify-packing-list.yml`
   (included in this folder) is in the repo at that exact path. Using
   GitHub's web UI: "Add file" → "Create new file", type the full path
   `.github/workflows/notify-packing-list.yml` as the filename (GitHub
   creates the folders automatically), paste in the contents, and commit.
4. **Create a GitHub token** at
   [github.com/settings/tokens](https://github.com/settings/tokens) (classic,
   `repo` scope) or [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta)
   (fine-grained, scoped to just this repo, `Contents: Read and write`).
   Copy it — but do NOT put it in `index.html` or anything pushed to
   GitHub. It only ever goes into the Cloudflare Worker in the next step.
5. **Set up the Cloudflare Worker relay:**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com) → sign up free
     if needed.
   - Workers & Pages → Create → Create Worker. Give it any name (e.g.
     `packing-list-relay`) and deploy the default template.
   - Click "Edit code," delete everything, paste in the contents of
     `cloudflare-worker.js` (included in this folder), and Deploy.
   - Back on the Worker's page: Settings → Variables and Secrets → add two
     **secrets** (not plain variables):
     - `GH_TOKEN` = the GitHub token from step 4.
     - `RELAY_TOKEN` = any password-like string you make up.
   - Note the Worker's URL shown at the top of its dashboard page (looks
     like `https://packing-list-relay.YOUR-SUBDOMAIN.workers.dev`).
6. Open `index.html`, find these lines near the top of the script, and
   fill them in:
   ```
   var RELAY_URL = "PASTE_YOUR_CLOUDFLARE_WORKER_URL_HERE";
   var RELAY_TOKEN = "PASTE_YOUR_RELAY_TOKEN_HERE";
   ```
   Use the Worker URL from step 5 and the same `RELAY_TOKEN` string you set
   there, then push `index.html` to GitHub like any other update.

**Why the recipient list and GitHub token aren't in a repo file:**
`index.html` is fully public — anyone can view its source on GitHub Pages.
The 3 email addresses and Gmail credentials live in GitHub repo Secrets;
the real GitHub token lives only as a Cloudflare Worker secret. Neither is
ever exposed in the page source.

**About `RELAY_TOKEN` in `index.html`:** this one value IS visible in the
public page source, since a static page needs something to prove to the
Worker it's a legitimate request. It's just a shared password the Worker
checks against, not a real credential any service would recognize —
GitHub's secret scanning has no reason to flag or revoke it. Worst case if
someone found it: they could spam the notification workflow by calling the
Worker repeatedly. They could not reach GitHub, Gmail, or anything else
directly.

If the relay fails (bad `RELAY_TOKEN`, Worker misconfigured, GitHub
dispatch itself failing, etc.) a toast message will say so right on the
page instead of failing silently. Test this once after setup by completing
a packing list and checking that the email arrives — also worth checking
the repo's **Actions** tab, which shows every time the workflow ran and
whether it succeeded.

## Appearance

The page uses a dark theme (black background) throughout the app itself.
Printed labels are unaffected — they always print on a plain white
background with black text/barcodes, since that's what thermal printers
expect.
