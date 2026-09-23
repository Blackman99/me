# me

赵东升的个人主页 —— AI 全栈工程师，[Sveltepress](https://sveltepress.site) 作者。
七个整屏分屏、中英双语，用 SvelteKit 写成，以静态站点部署到 GitHub Pages。

English version: [README.md](./README.md)

## 目录结构

| 路径 | 内容 |
| --- | --- |
| `src/lib/content.ts` | 站点全部文案，中英各一份。改文案只改这里。 |
| `src/lib/components/` | 各分屏，以及三块手写图形（链路图、终端、Markdown → Svelte）。 |
| `src/lib/aurora.ts` | 首屏的 WebGL 背景——一个片元着色器，零依赖。 |
| `scripts/build-og.mjs` | 生成社交分享卡片与触摸图标。 |
| `src/lib/reveal.ts` | 滚动入场动画背后的 IntersectionObserver action。 |
| `src/app.css` | 设计变量、整屏分屏规则、reduced-motion 降级。 |
| `scripts/cv.html`、`scripts/cv.zh.html` | 中英文 CV 的源文件。 |
| `static/` | 构建好的 CV PDF、社交卡片、图标、`robots.txt`、`sitemap.xml`。 |

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

## 社交分享卡片

`static/og.jpg` 与 `static/og-zh.jpg` 由站点自己的内容模块和首屏着色器生成，
因此卡片不会和它所指向的页面脱节：

```bash
pnpm build:og      # 需要 Playwright 与 Chrome
```

输出是确定性的——着色器固定在某个时间点绘制，这个时间点是通过在整段动画上采样
文字区域亮度选出来的：画面整体明亮，但文字所在的位置恰好是暗的。用 JPEG 而非
PNG，是因为背景是连续渐变：约 100 KB，而视觉等价的 PNG 要约 700 KB。

卡片上有意写不会过期的说法（`9 years`、`500+ stars on one project`），而不是
页面上的精确数字。社交平台会把这些图缓存数周，无论文件本身怎么变；一个已经过期
的精确数字，比一个取整的说法更难看。

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

**首屏背景是着色器，而且是可选的。** `src/lib/aurora.ts` 是一个域扭曲噪声片元
着色器，画在一个三角形上——裸 WebGL，不引场景库，5.4 KB。它在 `load` 事件之后
动态 import，因此永远不在关键路径上；并且以一半分辨率渲染，因为这个场足够低频，
放大回去看不出区别。

它只在视口宽度 ≥ 992px、精确指针、CPU 核心数 ≥ 4、且用户未要求减少动效时才启用。
手机、平板以及选择了减少动效的人，看到的是底下那层 CSS 背景，**并且根本不会下载
这个模块**：桌面 11 个 JS chunk，其余环境 10 个。

IntersectionObserver 会在首屏离开视口的瞬间暂停它——实测此时 `drawArrays`
调用数为 0——`visibilitychange` 则负责在标签页切到后台时暂停。

**其余全是 CSS。** 入场动画统一走一个 IntersectionObserver action；顶部滚动进度条
与首屏的滚动退场都使用滚动驱动动画，外面包了 `@supports`，不支持的浏览器上直接
不出现。标题的擦除揭示、高光扫过、徽章上的流动描边都是普通 keyframes。着色器之外
唯一的 JS 动画是数字滚动，而统计数字预留了最终宽度，因此不会引起布局偏移。

构建产物实测：LCP ≈ 0.46s，CLS 0，全程约 60fps，桌面传输 61 KiB，手机 58 KiB。

**`prefers-reduced-motion` 是一条真实分支，不是补丁。** 它会关掉吸附、
把所有过渡压到 0、强制显示全部入场内容、去掉标题擦除与高光、让统计数字直接显示
最终值，并完全跳过着色器。

**Sveltepress 那块演示里的组件是真的 Svelte 组件**，不是截图——
「开源生态」一屏里的计数器真的能点。

## 许可

代码 MIT。文字内容、简历与个人信息不在此列。
