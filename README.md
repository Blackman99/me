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

**Animation is CSS first.** Reveals run on one IntersectionObserver action;
the progress bar uses `animation-timeline: scroll()` behind an `@supports` guard
and is simply absent where that is unsupported. No animation library, no WebGL.
Measured on the built site: LCP ≈ 0.44 s, CLS 0, ~60 fps while scrolling, 236 KiB
uncompressed over 16 requests.

**`prefers-reduced-motion` is a real path, not an afterthought.** It disables
snapping, collapses every transition and forces all revealed content visible.

**The Sveltepress demo is a live Svelte component**, not a screenshot of one —
the counter in the "Open source" section really counts.

## Licence

Code MIT. The written content, CV and likeness are not.
