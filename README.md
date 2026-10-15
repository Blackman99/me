# me

Personal site for Dongsheng Zhao — AI full-stack engineer, creator of
[Sveltepress](https://sveltepress.site). One long scroll in English and Chinese,
built with SvelteKit, deployed as a static site to GitHub Pages, and dressed in
the effects of [Lumen Landing](https://github.com/Blackman99/curio/tree/main/lumen-landing):
raymarched liquid chrome, a 24,000-particle morph, scroll-lit type and a cursor
that everything leans towards.

中文说明见 [README.zh.md](./README.zh.md)。

## What is here

| Path | What it holds |
| --- | --- |
| `src/lib/content.ts` | Every string on the site, in both languages. Edit copy here and nowhere else. |
| `src/lib/components/` | The sections. Markup only, plus the two hand-drawn figures (fund-path graph, Markdown → Svelte). |
| `src/lib/fx/index.ts` | Every effect, wired onto the prerendered markup and driven by one `requestAnimationFrame` loop. |
| `src/lib/fx/gl.ts` | The two WebGL2 programs: hero chrome and particle engine. |
| `src/lib/fx/shaders.ts` | Their GLSL and the colour palettes, shared with the social card script. |
| `src/lib/text.ts` | Splits copy into the character and word spans the animations need, at render time. |
| `src/app.css` | The whole stylesheet: tokens, sections, the reduced-motion and print paths. |
| `scripts/build-og.mjs` | Renders the social preview cards and the touch icon. |
| `scripts/cv.html`, `scripts/cv.zh.html` | Sources of the English and Chinese CVs. |
| `static/` | Built CV PDFs, social cards, icons, `robots.txt`, `sitemap.xml`. |

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm check      # svelte-check, must stay at 0 errors 0 warnings
pnpm build      # static output in build/
pnpm preview    # serve build/ locally
```

Copy may carry two bits of markup: `*word*` sets a word in the display italic
(the accent gradient in Chinese), and `\n` breaks a line — in section titles every
line after the first is dimmed.

## The CV PDF

`static/Dongsheng-Zhao-CV.pdf` is generated from `scripts/cv.html` and committed,
so CI never needs a browser. After editing the HTML:

```bash
./scripts/build-cv.sh      # needs Google Chrome; override with $CHROME
```

## Social preview cards

`static/og.jpg` and `static/og-zh.jpg` are generated from the site's own content
module and hero shader, so the card cannot drift away from the page it links to:

```bash
pnpm build:og      # needs Playwright and Chrome
```

Output is deterministic — the chrome is drawn at a fixed time with the cursor's
blob parked at a fixed spot, so rebuilding without changes gives identical bytes.

The cards deliberately carry claims that stay true (`9 years`, `500+ stars on one
project`) rather than the exact counts on the page. Social platforms cache these
images for weeks regardless of what the file says, and a precise number that has
gone stale reads worse than a rounded one.

## Deploy

`.github/workflows/deploy.yml` builds on every push to `main` and publishes to
GitHub Pages. Enable **Settings → Pages → Source: GitHub Actions** once.

The site is served from a project subpath, so the build takes the base path from
an environment variable:

```yaml
env:
  BASE_PATH: /me      # must match the repository name
```

Moving to a custom domain means three edits: set `BASE_PATH` to an empty string,
update `SITE_URL` in `src/lib/content.ts`, and update the absolute URLs in
`static/robots.txt` and `static/sitemap.xml`.

## Design notes

**Prerendered first, animated second.** Every word on the page is in the static
HTML, already split into the spans the animations use, so search engines and
link previews see the full text and nothing reflows when the script arrives. The
effects module then attaches to that markup by id; it renders no content of its
own.

**One loop, and only what is on screen.** A single `requestAnimationFrame` loop
drives the hero, the marquee, the manifesto, the particles, the side-scroll, the
live cards and the cursor. An IntersectionObserver keeps a visibility map, and
each block runs only while its section is within 120px of the viewport — the
GPU is idle unless the hero or the engine is in view. The hero renders at
0.62× resolution and steps down further whenever the frame rate drops below 48.

**The hero is raymarched.** Six metaballs and the cursor's own blob are one
smooth signed-distance field, marched 64 steps per pixel and shaded as
iridescent chrome against a procedural studio. The headline is a variable font;
each letter thickens as the cursor nears it.

**The particle engine** holds 24,000 points with four destinations each, one
per stage of shipping a feature: the initials as vector outlines on an artboard
(design), the stack exploded into its four layers (build), a magnifier over a
bug (test) and a rocket at lift-off (ship). Scrolling picks where they are
between two shapes; the vertex shader gives every point its own delay and a
burst of turbulence mid-flight, then keeps each shape alive once it lands — the
stack breathes and data climbs its risers, the lens drifts, the exhaust
streams and stars rush past.

**The palette is live.** The button beside the language switch (or the `p` key)
cycles four palettes with a circular view transition; the CSS accents and both
shaders change together, and the choice is remembered.

**Language hops tear down cleanly.** `/` and `/zh/` share one component.
Moving between them is a client-side navigation: the effects module removes
every listener, observer, timer and GL context it made.

**Full-screen paging is gone.** The old site snapped section by section; the
manifesto, the particle engine and the open-source track are each several
screens of scroll on purpose, which snapping would fight.

Measured on the build: the home page is 84 KB gzipped — HTML, CSS and JS,
fonts excluded.

**`prefers-reduced-motion` is a real path.** The clock that drives the shaders,
marquee and spring stops, reveals appear without sliding or blurring, and every
CSS animation is paused. The motion switch in the Playground does the same on
demand. Without JavaScript every word is visible.

**The Sveltepress demo is a live Svelte component**, not a screenshot of one —
the counter in the open-source track really counts.

## Licence

Code MIT. The written content, CV and likeness are not.
