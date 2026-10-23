# PHANTFOCUS website

The public site for PHANTFOCUS, hosted on GitHub Pages from the
`main` branch of [megamind-rgb/phantfocus](https://github.com/megamind-rgb/phantfocus):
https://phantfocus.com/

PHANTFOCUS launches in November 2026. Until then the site offers no download:
its main button is a signup for the launch list (80% off for life, and one
email at launch). See "The launch list" below.

## What's here

| | |
| --- | --- |
| `index.html`, `style.css`, `app.js`, `assets/` | The page: black silk, chrome, clear glass |
| `signup.js` | The launch-list forms: the one place with the form's settings (`SIGNUP`) |
| `release.js` | The latest release, written by `scripts/publish_release.sh`. No page loads it before launch |
| `analytics.js` | The visit counter (GoatCounter, no cookies): the one place that names this site's counter |
| `assets/count.js` | GoatCounter's counting script, a copy kept here (see Visit counting) |
| `privacy.html`, `terms.html`, `licenses.html` | Privacy, Terms of use, and the open-source licences inside the app |
| `404.html` | Shown by GitHub Pages for any missing address. Self-contained: inline style, a full link home |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

No build step, no packages, no external fonts. One cookie-free visit counter
(GoatCounter); the privacy page explains it. The dashboard on the page is a
browser demo with sample activity: it never touches the Mac.

Links between site files are relative, so the site works under `/phantfocus/`
on GitHub Pages, from a local server and straight from the disk (`file://`).
Full addresses appear only where they must: `404.html` (GitHub Pages shows it
at whatever address was missing, so its links and its `analytics.js` are full addresses) and the `canonical` and Open Graph tags,
which point at the live page and at `assets/social-preview.jpg` (the
1200 × 630 picture shown when someone shares the link). That picture is a
screenshot of the page; retake it if the page's look changes.

## The launch list

The home page has two signup forms (`form[data-signup]`: one in the first
screen, one in the "Launching November 2026" section that the header's
"Get 80% off" button jumps to). Each has an email field (`you@gmail.com` as
the example; any address works), a consent box, the button "Get 80% off for
life", a hidden field for bots and a status line. `signup.js` runs them, and
its `SIGNUP` at the top is the one place with the settings:

    const SIGNUP = {
      action: 'https://docs.google.com/forms/d/e/FORM_ID/formResponse',
      fields: { email: 'entry.EMAIL', app: 'entry.APP', consent: 'entry.CONSENT' },
      app: 'phantfocus',
      consentVersion: '2026-10-23'
    };

Replace `FORM_ID` with the Google Form's id and each `entry.…` with its
question's `entry.<number>` (in the form's editor: ⋮ → Get pre-filled link,
fill in anything, Get link: the link names them). The form needs three
required short-answer questions (Email, App, Consent), must not ask people
to sign in to Google, and must be accepting responses. Make it in a Google
Workspace account with Google's Cloud Data Processing Addendum accepted:
`privacy.html` says Google keeps the list for us. While any
placeholder is left, the forms stay disabled and say "The launch list isn't
open yet", and nothing is sent.

On submit, `signup.js`:

- checks the address (the browser's own email check) and the consent box,
  and says what's missing in the status line;
- if the hidden field (`data-signup-trap`, named `note`) has anything in it,
  says "You're on the list" and sends nothing: only bots fill it;
- sends one POST, `application/x-www-form-urlencoded`, to `SIGNUP.action`
  with `fetch(…, {mode: 'no-cors', credentials: 'omit'})`: the address, the
  app (`phantfocus`) and the consent sentence exactly as the page shows it
  plus ` (v2026-10-23)`. The button is disabled meanwhile;
- Google's answer can't be read (`no-cors`), so a request that went out
  counts as done: "You're on the list. We'll email you in November with your
  80% off." A request that couldn't go out (offline, blocked) says "That
  didn't go through. Check your connection and try again.";
- counts one `signup` event with GoatCounter when the counter is on the page
  (never the address).

The forms ship disabled, with "Signing up needs JavaScript" in their status
line, so without JavaScript nothing pretends to work. No other script is
loaded for them, and the page needs no inline script.

The consent sentence is written in `index.html`, the same in both forms:

> Email me when PHANTFOCUS launches in November 2026, with my 80% lifetime
> discount. One email about the launch, no spam. I can unsubscribe any time.

followed by a link to `privacy.html#launch-list`. If it changes, change
`consentVersion` too, and add a line under Changes in `privacy.html`. If the
launch moves out of November 2026, change the sentence, `consentVersion` and
the success message in `signup.js` together, and the launch month on the
other pages.
`privacy.html#launch-list` says what the list stores (the address, the app,
the sentence and its version, the time Google records), why, the legal basis
(consent), where (Google Forms and Sheets) and for how long (until someone
unsubscribes, at the latest 6 months after the launch email, or on
31 May 2027 if PHANTFOCUS hasn't launched by then);
`terms.html#launch-offer` is the offer itself. Keep them in step with
`signup.js` and the form.

To try the forms locally with a fake Google, run a small server that prints
POST bodies and point a scratch copy of `signup.js` at it:
`action: 'http://127.0.0.1:<port>/formResponse'` and `entry.<number>`
fields (a local `http://` address is accepted for testing; anything else
must be `https://`).

## release.js

`release.js` is one line, `window.PHANTFOCUS_RELEASE = {...}`, rewritten by
`scripts/publish_release.sh` at every release (version, size, date, minimum
macOS, the zip's and the release notes' addresses). Before launch no page
loads it: the site shows no version or download. The free preview's update
check doesn't use it either (it reads `latest.json` from GitHub).

## Visit counting

Every page loads `analytics.js`, which loads this site's copy of
GoatCounter's script (`assets/count.js`) and sends visits to
`https://phantfocus.goatcounter.com/count`. To use another counter, change
`COUNTER` at the top of `analytics.js`; nothing else names it.

The script is loaded only on the live site (https), and never when the
browser sends Global Privacy Control or Do Not Track, blocks site storage, or
chose "Don't count my visits" on `privacy.html`. It sets no cookies. The
switch on `privacy.html` saves that choice as GoatCounter's own `skipgc` note
in the browser; nothing else is ever stored. A launch-list signup counts one
event, `signup` (`signup.js`, without the address). From `file://` or a local
server nothing is counted, and a content blocker that stops the script costs
nothing but the count.

`assets/count.js` is GoatCounter's own `https://gc.zgo.at/count.js` as of
16 October 2026, under its ISC licence notice (also on `licenses.html`). A
copy here means no other server is asked for the script (GoatCounter serves
gc.zgo.at through a content delivery network; the counts themselves go to
GoatCounter), and what it sends can't change under `privacy.html`. To compare
it with GoatCounter's current one:

    awk 'f; /^\/\/ Unchanged from here on\.$/ {f=1}' assets/count.js | diff - <(curl -s https://gc.zgo.at/count.js)

To take a newer one, put it after the line "Unchanged from here on.", read
what it sends, and change "Counting visits" in `privacy.html` to match (now:
the page's address and title, the address of the page before, the screen's
width and a bot check), and the date here and on `licenses.html`.

`privacy.html` promises this set-up, so the GoatCounter site settings must
match it:

| Setting | Value |
| --- | --- |
| Sessions, referrer, browser and system, country | on |
| Screen size, region, language, individual pageviews | off |
| Data retention | 730 days (the privacy page says 24 months) |
| Dashboard | private |

## Legal pages

`privacy.html`, `terms.html` and `licenses.html` are plain pages in the
site's own style (`style.css`, "Legal pages" at its end). Every page's footer
links to them and to the contact address, and carries the trademark line.

- The contact address is written in one place: the Contact block at the end
  of `privacy.html` (`#contact`). Every other page links there.
- When a legal page changes, change its "Effective" date and add a line under
  Changes (`privacy.html`).
- `privacy.html` describes what the app and this site really do (the update
  check, what the app stores and where, the counter's settings above, the
  launch list). Change it with them.
- `licenses.html` lists the open-source parts inside the app, with their
  versions and licence texts. Change it when the app's Python, its libraries
  or its icons change.

## Preview it locally

    cd website/phantfocus
    python3 -m http.server 4173 --bind 127.0.0.1

Then open http://127.0.0.1:4173/ and stop the server with Control-C. Opening
`index.html` straight from Finder works too.

## Publish it

Don't copy files to GitHub by hand:

- `scripts/publish_site.sh phantfocus` publishes this folder to GitHub Pages,
  for changes to the page itself.
- `scripts/publish_release.sh` publishes a new version of the app: it uploads
  the zip and the update feed to a GitHub release, rewrites `release.js` for
  it and publishes the site.

Both scripts live in the app's project, next to this folder (not in the
public repository); its `docs/RELEASING.md` describes the whole release.
