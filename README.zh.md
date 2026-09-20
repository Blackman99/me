# me

赵东升的个人主页 —— AI 全栈工程师，[Sveltepress](https://sveltepress.site) 作者。
七个整屏分屏、中英双语，用 SvelteKit 写成，以静态站点部署到 GitHub Pages。

English version: [README.md](./README.md)

## 目录结构

| 路径 | 内容 |
| --- | --- |
| `src/lib/content.ts` | 站点全部文案，中英各一份。改文案只改这里。 |
| `src/lib/components/` | 各分屏，以及三块手写图形（链路图、终端、Markdown → Svelte）。 |
| `src/lib/reveal.ts` | 滚动入场动画背后的 IntersectionObserver action。 |
| `src/app.css` | 设计变量、整屏分屏规则、reduced-motion 降级。 |
| `scripts/cv.html` | 英文 CV 的源文件。 |
| `static/` | 构建好的 CV PDF、favicon、`robots.txt`、`sitemap.xml`。 |

## 本地开发

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm check      # svelte-check，必须保持 0 错误 0 警告
pnpm build      # 静态产物输出到 build/
pnpm preview    # 本地预览 build/
```

## CV PDF

`static/Dongsheng-Zhao-CV.pdf` 由 `scripts/cv.html` 生成并提交进仓库，
因此 CI 不需要浏览器。改完 HTML 后执行：

```bash
./scripts/build-cv.sh      # 需要 Google Chrome，可用 $CHROME 覆盖路径
```

## 部署

`.github/workflows/deploy.yml` 会在每次推送到 `main` 时构建并发布到 GitHub Pages。
只需在 **Settings → Pages → Source** 里选一次 **GitHub Actions**。

站点位于项目子路径下，因此构建时从环境变量读取 base path：

```yaml
env:
  BASE_PATH: /me      # 必须与仓库名一致
```

换成自有域名需要改三处：把 `BASE_PATH` 设为空字符串、更新
`src/lib/content.ts` 里的 `SITE_URL`、以及 `static/robots.txt` 与
`static/sitemap.xml` 里的绝对地址。

## 设计取舍

**整屏分屏是有条件开启的。** 每一屏都按「不超过 992 × 768 视口」来排版，
`scroll-snap-type: y mandatory` 也只在这个尺寸以上才打开。更小的屏幕
（手机、矮窗口）退回 `proximity`——因为当一屏比视口还高时，强制吸附会把
内容卡住，用户永远滚不到。

**动效以 CSS 为主。** 入场动画统一走一个 IntersectionObserver action；
顶部进度条用 `animation-timeline: scroll()`，外面包了 `@supports`，
不支持的浏览器上直接不出现。没有动画库，没有 WebGL。
构建产物实测：LCP ≈ 0.44s，CLS 0，滚动全程约 60fps，16 个请求共 236 KiB（未压缩）。

**`prefers-reduced-motion` 是一条真实分支，不是补丁。** 它会关掉吸附、
把所有过渡压到 0，并强制显示全部入场内容。

**Sveltepress 那块演示里的组件是真的 Svelte 组件**，不是截图——
「开源生态」一屏里的计数器真的能点。

## 许可

代码 MIT。文字内容、简历与个人信息不在此列。
