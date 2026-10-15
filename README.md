# PHANTFOCUS website

The public download site, hosted on GitHub Pages from the `main` branch of
[megamind-rgb/phantfocus](https://github.com/megamind-rgb/phantfocus):

| Page | Address |
| --- | --- |
| PHANTFOCUS (Winter Arc look) | https://megamind-rgb.github.io/phantfocus/ |
| lattefocus (the pink look) | https://megamind-rgb.github.io/phantfocus/lattefocus/ |

Both pages sell the same app and the same download: PHANTFOCUS, with both
looks inside (Settings > Look). Each page links to the other.

## What's here

| | |
| --- | --- |
| `index.html`, `style.css`, `app.js`, `assets/` | The PHANTFOCUS page: black silk, chrome, clear glass |
| `lattefocus/` | The lattefocus page, with its own `index.html`, `style.css`, `app.js` and `assets/` |
| `release.js` | The latest release (version, size, download link, release notes link), shared by both pages |
| `404.html` | Shown by GitHub Pages for any missing address. Self-contained: inline style, full links home |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

No build step, no packages, no external fonts, no analytics. The dashboard on
each page is a browser demo with sample activity: it never touches the Mac.

Links between site files are relative, so the site works under `/phantfocus/`
on GitHub Pages, from a local server and straight from the disk (`file://`).
The links between the two pages name the page (`lattefocus/index.html`,
`../index.html`), not the folder: from the disk a folder link opens a file
listing.
Full addresses appear only where they must: `404.html` (GitHub Pages shows it
at whatever address was missing) and the `canonical` and Open Graph tags,
which point at the live pages and at each page's `assets/social-preview.jpg`
(the 1200 × 630 picture shown when someone shares the link). Those two
pictures are screenshots of the pages; retake them if the pages' look changes.

## The download and the release details

Every download button points at the newest release's zip:

    https://github.com/megamind-rgb/phantfocus/releases/latest/download/PHANTFOCUS.zip

GitHub sends that to the newest release's `PHANTFOCUS.zip`, so the buttons
never need editing. The site itself never holds the zip.

`release.js` is one line, `window.PHANTFOCUS_RELEASE = {...}`, with
`version`, `size` (bytes; `0` means unknown and hides the size), `published`,
`minimum_macos`, `download` and `notes_url`. It is a script rather than a JSON
file so it also loads from `file://`. Each page loads it before `app.js`, and
`app.js` fills in these elements:

| Marked with | Gets |
| --- | --- |
| `data-release-link` | `href` = `download` (and opens the install guide when clicked) |
| `data-release="version"` | `v0.2.0` |
| `data-release="size"` | `38.9 MB` |
| `data-release-if="size"` | shown only when the size is known (holds the size and its `·`) |
| `data-release="minimum"` | `macOS 13+` |
| `data-release="notes"` | `href` = `notes_url` (the "What's new" links) |

Without `release.js` (or without JavaScript) the pages keep the words written
in the HTML, such as "Latest version · macOS 13+ · Apple silicon & Intel", and
the buttons still download the latest zip.

## Preview it locally

    cd website
    python3 -m http.server 4173 --bind 127.0.0.1

Then open http://127.0.0.1:4173/ (and http://127.0.0.1:4173/lattefocus/).
Stop the server with Control-C. Opening `index.html` straight from Finder
works too, except that Chrome leaves out the lattefocus wordmark there (it is
a CSS mask, which Chrome loads only over http).

## Publish it

Don't copy files to GitHub by hand:

- `scripts/publish_site.sh` publishes this folder to GitHub Pages, for changes
  to the pages themselves.
- `scripts/publish_release.sh` publishes a new version of the app: it uploads
  the zip and the update feed to a GitHub release, rewrites `release.js` for
  it and publishes the site.

Both scripts live in the app's project, next to this folder (not in the
public repository); its `docs/RELEASING.md` describes the whole release.
