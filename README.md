# me

Personal site for Dongsheng Zhao — AI full-stack engineer, creator of
[Sveltepress](https://sveltepress.site). Seven full-screen sections, English and
Chinese, built with SvelteKit and deployed as a static site to GitHub Pages.

中文说明见 [README.zh.md](./README.zh.md)。

## What is here

| Path | What it holds |
| --- | --- |
| `src/lib/content.ts` | Every string on the site, in both languages. Edit copy here and nowhere else. |
| `src/lib/components/` | The sections and the three hand-drawn visuals (chain graph, terminal, Markdown → Svelte). |
| `src/lib/aurora.ts` | The hero's WebGL backdrop — one fragment shader, no dependencies. |
| `src/lib/reveal.ts` | The IntersectionObserver action behind the scroll-in animations. |
| `src/app.css` | Design tokens, the full-screen paging rules and the reduced-motion fallback. |
| `scripts/cv.html` | Source of the English CV. |
| `static/` | The built CV PDF, favicon, `robots.txt`, `sitemap.xml`. |

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm check      # svelte-check, must stay at 0 errors 0 warnings
pnpm build      # static output in build/
pnpm preview    # serve build/ locally
```

## The CV PDF

`static/Dongsheng-Zhao-CV.pdf` is generated from `scripts/cv.html` and committed,
so CI never needs a browser. After editing the HTML:

```bash
./scripts/build-cv.sh      # needs Google Chrome; override with $CHROME
```

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

**Full-screen paging is conditional.** Every section is laid out to fit inside a
viewport of at least 992 × 768, and `scroll-snap-type: y mandatory` is switched on
only at that size. Anywhere smaller — phones, short windows — it falls back to
`proximity`, because mandatory snapping on a section taller than the viewport
strands the content nobody can scroll to.

**The hero backdrop is a shader, and it is optional.** `src/lib/aurora.ts` is a
single domain-warped noise fragment shader on one triangle — raw WebGL, no scene
library, 5.4 KB. It is imported dynamically after the `load` event, so it is
never on the critical path, and it renders at half resolution because the field
is low-frequency enough that nobody can tell.

It only runs on a viewport of at least 992 px with a fine pointer, at least four
cores, and no reduced-motion preference. Phones, tablets and anyone who asked for
less motion get the CSS backdrop underneath instead and never download the
module at all: 11 JS chunks on desktop, 10 everywhere else.

An IntersectionObserver pauses it the moment the hero leaves the screen —
measured as exactly zero `drawArrays` calls while any other section is in view —
and `visibilitychange` pauses it for a backgrounded tab.

**Everything else is CSS.** Reveals run on one IntersectionObserver action; the
scroll progress bar and the hero's scroll-away both use scroll-linked animation
behind an `@supports` guard and are simply absent where that is unsupported. The
headline wipe, its specular sheen and the travelling highlight on the badge are
plain keyframes. The only JavaScript animation outside the shader is the stat
count-up, and the stats reserve their final width so it cannot shift the layout.

Measured on the built site: LCP ≈ 0.46 s, CLS 0, ~60 fps throughout, 61 KiB
transferred on desktop and 58 KiB on a phone.

**`prefers-reduced-motion` is a real path, not an afterthought.** It disables
snapping, collapses every transition, forces all revealed content visible, drops
the headline wipe and sheen, fills the stats in immediately, and skips the shader
entirely.

**The Sveltepress demo is a live Svelte component**, not a screenshot of one —
the counter in the "Open source" section really counts.

## Licence

Code MIT. The written content, CV and likeness are not.
