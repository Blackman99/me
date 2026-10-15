# me

赵东升的个人主页 —— AI 全栈工程师，[Sveltepress](https://sveltepress.site) 作者。
一页长滚动、中英双语，用 SvelteKit 写成，以静态站点部署到 GitHub Pages；视觉与特效来自
[Lumen Landing](https://github.com/Blackman99/curio/tree/main/lumen-landing)：
光线步进的液态金属、24,000 个粒子的形变、随滚动点亮的文字，以及一切都会朝它靠拢的光标。

English version: [README.md](./README.md)

## 目录结构

| 路径 | 内容 |
| --- | --- |
| `src/lib/content.ts` | 站点全部文案，中英各一份。改文案只改这里。 |
| `src/lib/components/` | 各段落。只有标记，外加两块手写图形（资金路径图、Markdown → Svelte）。 |
| `src/lib/fx/index.ts` | 全部特效：挂到预渲染好的标记上，由同一个 `requestAnimationFrame` 循环驱动。 |
| `src/lib/fx/gl.ts` | 两个 WebGL2 程序：首屏液态金属与粒子引擎。 |
| `src/lib/fx/shaders.ts` | 它们的 GLSL 与配色，社交卡片脚本也用这一份。 |
| `src/lib/text.ts` | 渲染时把文案拆成动画需要的字符、词 span。 |
| `src/app.css` | 整份样式表：设计变量、各段落、减少动效与打印分支。 |
| `scripts/build-og.mjs` | 生成社交分享卡片与触摸图标。 |
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

文案里可以写两种标记：`*词*` 用展示斜体（中文里换成强调色渐变），`\n` 换行——
段落标题里第一行之后的行会变暗。

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

输出是确定性的——液态金属固定在某个时间点绘制，光标那颗球也停在固定位置，
不改任何东西重新生成，得到的字节完全一致。

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

**先预渲染，再动起来。** 页面上每个字都在静态 HTML 里，而且已经拆成动画要用的
span，所以搜索引擎和链接预览能看到全文，脚本到达时也不会重排。特效模块按 id 挂到
这些标记上，自己不渲染任何内容。

**一个循环，只算屏幕上的东西。** 首屏、跑马灯、宣言、粒子、横向滚动、实时卡片和
光标，全由同一个 `requestAnimationFrame` 循环驱动。IntersectionObserver 维护一张
可见性表，每一块只在所属段落离视口 120px 以内时才运行——首屏和粒子段都不在视野里时
GPU 是闲着的。首屏以 0.62 倍分辨率渲染，帧率跌破 48 时继续往下降。

**首屏是光线步进出来的。** 六颗融球加上光标自己那颗，合成一个平滑的有向距离场，
每像素步进 64 次，按彩虹色金属着色，环境光是程序生成的摄影棚。标题用可变字体，
光标靠近哪个字母，哪个字母就变粗。

**粒子引擎**有 24,000 个点，每个点带四个目的地，对应一个功能上线的四步：画板上
名字缩写的矢量轮廓（设计）、拆成四层的整条栈（开发）、放大镜下的 bug（测试）、
点火升空的火箭（上线）。滚动决定它们处在哪两个形状之间；顶点着色器让每个点按自己
的延迟出发，半途加一阵湍流，落定后还让形状继续动：栈在呼吸、数据沿立柱往上爬，
放大镜来回移动，尾焰在流，星星往后掠。

**配色是实时的。** 语言切换旁边那颗按钮（或按 `p` 键）在四套配色间循环，用圆形
视图过渡展开；CSS 强调色和两个着色器一起变，选择会被记住。

**切换语言会干净地卸载。** `/` 与 `/zh/` 共用一个组件，两者之间是客户端导航：特效
模块会撤掉自己建的每一个监听、观察器、定时器和 GL 上下文。

**整屏分页去掉了。** 旧站一屏一屏地吸附；现在宣言、粒子引擎和开源横向轨道都有意
占好几屏的滚动距离，吸附只会和它们打架。

构建产物实测：首页 gzip 后 84 KB——HTML、CSS 与 JS，不含字体。

**`prefers-reduced-motion` 是一条真实分支。** 驱动着色器、跑马灯和弹簧的时钟停住，
入场内容直接出现、不滑动不模糊，所有 CSS 动画暂停。Playground 里的动效开关可以随时
做同样的事。没有 JavaScript 时，所有文字都可见。

**Sveltepress 那块演示里的组件是真的 Svelte 组件**，不是截图——
开源横向轨道里的计数器真的能点。

## 许可

代码 MIT。文字内容、简历与个人信息不在此列。
