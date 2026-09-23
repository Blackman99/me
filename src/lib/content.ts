export type Lang = 'en' | 'zh';

export const LANGS: Lang[] = ['en', 'zh'];

export interface Project {
	name: string;
	href: string;
	stars?: number;
	tech: string;
	role: string;
	blurb: string;
}

export interface Domain {
	label: string;
	at: string;
	body: string;
	current?: boolean;
}

export interface SiteContent {
	locale: string;
	meta: { title: string; description: string; ogImage: string; ogAlt: string };
	nav: { work: string; ai: string; oss: string; play: string; domains: string; contact: string };
	hero: {
		eyebrow: string;
		name: string;
		title: string;
		lede: string;
		availability: string;
		place: string;
		ctaPrimary: string;
		ctaSecondary: string;
		scroll: string;
		stats: { value: string; label: string }[];
	};
	production: {
		kicker: string;
		title: string;
		context: string;
		bullets: { head: string; body: string }[];
		highlight: { head: string; body: string };
	};
	agents: { kicker: string; title: string; lede: string; projects: Project[] };
	oss: { kicker: string; title: string; lede: string; projects: Project[] };
	play: { kicker: string; title: string; lede: string; projects: Project[] };
	domains: {
		kicker: string;
		title: string;
		lede: string;
		items: Domain[];
		stackTitle: string;
		stack: { label: string; items: string }[];
	};
	contact: {
		kicker: string;
		title: string;
		lede: string;
		availability: string;
		overlap: string;
		emailLabel: string;
		githubLabel: string;
		blogLabel: string;
		cvLabel: string;
		cvNote: string;
		cvFile: string;
		footer: string;
	};
	a11y: { langToggle: string; toTop: string; sectionNav: string };
}

export const EMAIL = 'dongshengzhao47@gmail.com';
export const GITHUB = 'https://github.com/Blackman99';
export const BLOG = 'https://dongsheng-blog.netlify.app';
export const SVELTEPRESS = 'https://sveltepress.site';
/** Absolute origin used for canonical, hreflang and Open Graph URLs.
    Change this (and static/robots.txt + static/sitemap.xml) if the site
    moves to a custom domain. */
export const SITE_URL = 'https://blackman99.github.io/me';

/** Caption under the fund-path graph. Node labels stay in English —
    OFAC and "mixer" are the industry's own terms — but the verdict is
    prose and gets translated. */
export const GRAPH_CAPTION: Record<Lang, { verdict: string; detail: string }> = {
	en: { verdict: 'HIGH RISK', detail: '3 hops · sanctions list hit' },
	zh: { verdict: '高风险', detail: '3 跳 · 命中制裁名单' }
};

const en: SiteContent = {
	locale: 'en',
	meta: {
		title: 'Dongsheng Zhao — AI Full-Stack Engineer',
		description:
			'AI full-stack engineer, 9 years. Creator of Sveltepress (537 stars). Shipping LLMs into production compliance systems. Open to full-time remote or contract.',
		ogImage: 'og.jpg',
		ogAlt:
			'Dongsheng Zhao — AI Full-Stack Engineer, 9 years, creator of Sveltepress. Open to full-time remote or contract, UTC+8.'
	},
	nav: {
		work: 'Production',
		ai: 'Agents',
		oss: 'Open source',
		play: 'Playground',
		domains: 'Domains',
		contact: 'Contact'
	},
	hero: {
		eyebrow: 'Creator of Sveltepress · 537 stars',
		name: 'Dongsheng Zhao',
		title: 'AI Full-Stack Engineer · 9 years',
		lede: "I put LLMs inside production systems — regulatory reports drafted by Claude and OpenAI, a multi-chain risk engine underneath, a public API around it and the workbench on top. Design, build, test, deploy: on my own.",
		availability: 'Open to full-time remote or contract',
		place: 'UTC+8 · Hefei, China · working English',
		ctaPrimary: 'View my work',
		ctaSecondary: 'Email me',
		scroll: 'Scroll',
		stats: [
			{ value: '9', label: 'years shipping' },
			{ value: '722', label: 'GitHub stars' },
			{ value: '80', label: 'public repos' },
			{ value: '4', label: 'open-source orgs' }
		]
	},
	production: {
		kicker: 'What I am building now',
		title: 'LLMs inside a crypto compliance platform',
		context:
			'A crypto AML/KYT compliance SaaS. I own the AI layer and the whole stack beneath it — screening engine, public API, workbench, and the pipeline that puts it on a server.',
		bullets: [
			{
				head: 'Regulatory writing, done by the model',
				body: 'On-chain risk data and rule hits are fed to Claude and OpenAI, which draft STR/SAR reports, compliance policies and rule-set proposals — replacing a step that used to be written by hand.'
			},
			{
				head: 'KYA / KYT screening engine',
				body: 'Multi-hop fund-path tracing that surfaces high-risk counterparties, sanctions and blacklist hits, then returns a graded risk verdict.'
			},
			{
				head: 'Configurable rule sets',
				body: 'Path-level detection routed by scenario — deposit, withdrawal, CDD, ongoing monitoring — so compliance teams change policy without shipping code.'
			},
			{
				head: 'Public API, v2 and v3',
				body: 'Async polling with API-key auth, address-monitoring alerts, webhooks and quota billing, across Ethereum, Tron and Base.'
			},
			{
				head: 'The workbench',
				body: 'Next.js 16 and React 19 in TypeScript: screening, batch checks, graph exploration, reports and monitoring, on SWR and Zustand.'
			},
			{
				head: 'Ship and keep it up',
				body: 'Led a full cloud migration, built the CI/CD on GitHub Actions — atomic Go binary swaps, layered backups, rollback in seconds — and own production incidents.'
			}
		],
		highlight: {
			head: 'Rewrote path investigation',
			body: 'Uploading the whole graph became server-side detection with gzipped parallel paging. A single screening run got dramatically faster.'
		}
	},
	agents: {
		kicker: 'Open source · AI and agents',
		title: 'Tools that drive coding agents',
		lede: 'I spend a lot of time inside coding agents, so I build the parts that are missing.',
		projects: [
			{
				name: 'agent-feishu-channel',
				href: 'https://github.com/Blackman99/agent-feishu-channel',
				stars: 48,
				tech: 'TypeScript',
				role: 'Author',
				blurb:
					'Bridges Claude Code and Codex sessions into a Feishu (Lark) bot — session lifecycle, plus two-way relay of messages and tool calls. Drive a coding agent from the chat client you already have open.'
			},
			{
				name: 'codsh',
				href: 'https://github.com/Blackman99/codsh',
				stars: 6,
				tech: 'TypeScript',
				role: 'Author',
				blurb:
					'A terminal coding agent on the DeepSeek harness, with its own tool-call loop and interaction design. One sentence to /ship, and it comes back verified.'
			},
			{
				name: 'real-bot',
				href: 'https://github.com/Blackman99/real-bot',
				stars: 6,
				tech: 'TypeScript',
				role: 'Author',
				blurb:
					'Alpha. A local-first macOS app for persistent AI teammates — open model endpoints and MCP tools, nothing leaving the machine unless you say so.'
			}
		]
	},
	oss: {
		kicker: 'Open source · Svelte ecosystem',
		title: 'Sveltepress, and what grew around it',
		lede: 'Maintained since August 2022. Most of my GitHub stars come from here.',
		projects: [
			{
				name: 'Sveltepress',
				href: 'https://github.com/SveltePress/sveltepress',
				stars: 537,
				tech: 'SvelteKit',
				role: 'Creator and maintainer',
				blurb:
					'A content-first site builder on SvelteKit: SSR, SSG and CSR; Svelte 5 components written straight into Markdown; versioning, i18n and Pagefind search; themeable, with a default theme and a fully typed API end to end.'
			},
			{
				name: 'svelte5plus-calendar',
				href: 'https://github.com/Blackman99/svelte5plus-calendar',
				tech: 'Svelte 5',
				role: 'Author',
				blurb:
					'A full calendar with zero dependencies — month, week, day, year and agenda views, drag and drop, recurring events, i18n and dark mode.'
			},
			{
				name: 'svelte-json-discovery',
				href: 'https://github.com/Blackman99/svelte-json-discovery',
				stars: 5,
				tech: 'Svelte 5',
				role: 'Author',
				blurb:
					'The discovery.js JSON struct view, lifted out into a standalone Svelte 5 component you can drop anywhere.'
			}
		]
	},
	play: {
		kicker: 'Playground',
		title: 'Built because they were fun',
		lede: 'Some of these have more stars than the serious ones. I have made peace with it.',
		projects: [
			{
				name: 'v-rap',
				href: 'https://github.com/Blackman99/v-rap',
				stars: 27,
				tech: 'Vue 3',
				role: 'Author',
				blurb: "A Vue 3 library whose entire purpose is embedding the Vue author's rap video in your app."
			},
			{
				name: 'joueur',
				href: 'https://github.com/Blackman99/joueur',
				stars: 27,
				tech: 'Svelte',
				role: 'Author',
				blurb: 'A tiny, playful music player.'
			},
			{
				name: 'siyuan-plugin-*-repl',
				href: 'https://github.com/Blackman99/siyuan-plugin-vue-repl',
				stars: 14,
				tech: 'Vue / Svelte / React',
				role: 'Author',
				blurb: 'Live Vue, Svelte and React REPLs embedded inside SiYuan notes. Three plugins, one idea.'
			},
			{
				name: 'reditor',
				href: 'https://github.com/Blackman99/reditor',
				stars: 8,
				tech: 'Vue',
				role: 'Author',
				blurb: 'An online resume builder with decent templates. Yes, I wrote a resume tool before I wrote this page.'
			}
		]
	},
	domains: {
		kicker: 'Nine years, six domains',
		title: 'Where the work has actually been',
		lede: 'Regulated finance, hospital equipment, consumer audio, lending at scale, internal platforms. Different constraints, same job: make it correct and make it ship.',
		items: [
			{
				label: 'Crypto compliance and on-chain risk',
				at: 'Current',
				body: 'LLM-generated regulatory output, multi-hop tracing, configurable rule sets, a public API and the cloud it runs on.',
				current: true
			},
			{
				label: 'Internal developer platforms',
				at: 'Yiyi Data',
				body: 'Planned and led an in-house low-code platform — core engine plus its own domain design language. Delivery on internal projects got about 30% faster, and duplicate work went away.'
			},
			{
				label: 'Medical imaging',
				at: 'GE Healthcare China',
				body: 'Technical management and core feature work on the x20 system and the China AW imaging platform.'
			},
			{
				label: 'Consumer audio at scale',
				at: 'Bilibili · MissEvan',
				body: 'Product features and frontend iteration, plus the internal component and utility libraries the team built on.'
			},
			{
				label: 'Overseas lending and merchant platforms',
				at: 'Oufei Tech, Beijing',
				body: 'Lending H5 flows, back-office and a data aggregation platform behind a loan book over $100M and a million-plus merchants. Build time down 50%, dev start and HMR twice as fast, Lighthouse 90+ in production.'
			},
			{
				label: 'Telecom-grade frontend',
				at: 'AsiaInfo · Uinnova',
				body: 'Stack selection, project scaffolding, core pages and CI; built the shared libraries the department kept using after I left.'
			}
		],
		stackTitle: 'The stack I reach for',
		stack: [
			{ label: 'AI', items: 'Claude · OpenAI · DeepSeek · structured output · tool-call loops · agent CLIs' },
			{ label: 'Languages', items: 'TypeScript · Go · Rust · Java · Python' },
			{ label: 'Frontend', items: 'React 19 / Next.js · Svelte 5 / SvelteKit · Vue 3 · Vite / Rollup / Nx · Tauri · D3 / ECharts' },
			{ label: 'Backend', items: 'Node.js · Go · PostgreSQL / MySQL · Redis · REST and async jobs' },
			{ label: 'Infra', items: 'AWS · Tencent Cloud · Docker · GitHub Actions / Jenkins · Linux · systemd deploys with rollback' },
			{ label: 'Chains', items: 'EVM and Tron on-chain data · Ethereum · Tron · Base' }
		]
	},
	contact: {
		kicker: 'Contact',
		title: 'Tell me what you are building',
		lede: 'If you need someone who can take an AI feature from an idea to a thing on a server, without a handoff in the middle — write to me.',
		availability: 'Open to full-time remote or contract',
		overlap: 'Based UTC+8. A full European working day overlaps; so does US East in my evening.',
		emailLabel: 'Email',
		githubLabel: 'GitHub',
		blogLabel: 'Blog',
		cvLabel: 'Download CV',
		cvNote: 'PDF · English',
		cvFile: 'Dongsheng-Zhao-CV.pdf',
		footer: 'Built with SvelteKit by the person it is about. No trackers, no analytics.'
	},
	a11y: { langToggle: 'Switch to Chinese', toTop: 'Back to top', sectionNav: 'Section navigation' }
};

const zh: SiteContent = {
	locale: 'zh-CN',
	meta: {
		title: '赵东升 — AI 全栈工程师',
		description:
			'AI 全栈工程师，9 年经验。Sveltepress 作者(537 star)。把 LLM 能力做进生产级合规系统。可接全职远程或合同制。',
		ogImage: 'og-zh.jpg',
		ogAlt: '赵东升 — AI 全栈工程师，9 年经验，Sveltepress 作者。可接全职远程或合同制，UTC+8。'
	},
	nav: {
		work: '生产工作',
		ai: 'Agent 工具',
		oss: '开源生态',
		play: 'Playground',
		domains: '领域',
		contact: '联系'
	},
	hero: {
		eyebrow: 'Sveltepress 作者 · 537 star',
		name: '赵东升',
		title: 'AI 全栈工程师 · 9 年经验',
		lede: '我把 LLM 放进生产系统：合规报告由 Claude 与 OpenAI 起草，底下是多链风控引擎，外面包一层开放 API，上面是工作台。设计、开发、测试、部署，一个人走完。',
		availability: '可接全职远程 / 合同制',
		place: 'UTC+8 · 合肥 · 可用英语开会',
		ctaPrimary: '看我的作品',
		ctaSecondary: '给我写信',
		scroll: '向下滚动',
		stats: [
			{ value: '9', label: '年工程经验' },
			{ value: '722', label: 'GitHub star' },
			{ value: '80', label: '公开仓库' },
			{ value: '4', label: '开源组织' }
		]
	},
	production: {
		kicker: '正在做的事',
		title: '把 LLM 放进加密合规平台',
		context:
			'一家加密货币 AML/KYT 合规 SaaS。我负责 AI 层，以及它下面的整条栈——筛查引擎、开放 API、工作台，还有把它送上服务器的那套流水线。',
		bullets: [
			{
				head: '合规文书交给模型写',
				body: '把链上风险数据与规则命中喂给 Claude 和 OpenAI，自动起草 STR/SAR 报告、合规政策与规则集草案，替代原本人工撰写的环节。'
			},
			{
				head: 'KYA / KYT 筛查引擎',
				body: '多跳资金路径回溯，识别高风险交易对手、制裁与黑名单命中，输出分级风险判定。'
			},
			{
				head: '可配置规则集',
				body: '按存款、取款、CDD、持续监控等场景分流的路径级检测，合规团队改策略不需要发版。'
			},
			{
				head: '对外开放 API(v2 / v3)',
				body: '异步轮询加 API Key 鉴权，地址监控告警、Webhook、配额计费，覆盖 Ethereum、Tron 与 Base。'
			},
			{
				head: '合规工作台',
				body: 'Next.js 16 + React 19 + TypeScript：筛查、批量检测、图谱探索、报告与监控，状态用 SWR 与 Zustand。'
			},
			{
				head: '上线并且守住',
				body: '主导整体云迁移，搭建 GitHub Actions CI/CD——Go 二进制原子替换、多份备份、秒级回滚——并负责生产故障排查。'
			}
		],
		highlight: {
			head: '重写路径调查链路',
			body: '从全量路径上传改成服务端检测 + gzip 并行分页拉取，单次筛查耗时显著下降。'
		}
	},
	agents: {
		kicker: '开源 · AI 与 Agent',
		title: '驱动编码 Agent 的工具',
		lede: '我大量时间泡在编码 Agent 里，缺什么就自己补什么。',
		projects: [
			{
				name: 'agent-feishu-channel',
				href: 'https://github.com/Blackman99/agent-feishu-channel',
				stars: 48,
				tech: 'TypeScript',
				role: '作者',
				blurb:
					'把 Claude Code / Codex 会话桥接到飞书机器人：会话生命周期管理，消息与工具调用双向转发。在你本来就开着的 IM 里直接驱动编码 Agent。'
			},
			{
				name: 'codsh',
				href: 'https://github.com/Blackman99/codsh',
				stars: 6,
				tech: 'TypeScript',
				role: '作者',
				blurb:
					'基于 DeepSeek Harness 的终端编码 Agent，自行实现工具调用循环与交互设计。一句话 /ship，回来的是验证过的代码。'
			},
			{
				name: 'real-bot',
				href: 'https://github.com/Blackman99/real-bot',
				stars: 6,
				tech: 'TypeScript',
				role: '作者',
				blurb:
					'Alpha 阶段。local-first 的 macOS 应用，常驻 AI 队友：开放模型端点与 MCP 工具，不主动把东西送出这台机器。'
			}
		]
	},
	oss: {
		kicker: '开源 · Svelte 生态',
		title: 'Sveltepress，以及围绕它长出来的东西',
		lede: '2022 年 8 月至今持续维护。我 GitHub 上大部分 star 来自这里。',
		projects: [
			{
				name: 'Sveltepress',
				href: 'https://github.com/SveltePress/sveltepress',
				stars: 537,
				tech: 'SvelteKit',
				role: '创建者 / 维护者',
				blurb:
					'基于 SvelteKit 的内容优先站点构建工具：支持 SSR / SSG / CSR;Markdown 里可以直接写 Svelte 5 组件；版本化、i18n 与 Pagefind 搜索；主题可自定义并附带默认主题，全链路类型化 API。'
			},
			{
				name: 'svelte5plus-calendar',
				href: 'https://github.com/Blackman99/svelte5plus-calendar',
				tech: 'Svelte 5',
				role: '作者',
				blurb: '零依赖的全功能日历：月 / 周 / 日 / 年 / 议程视图，拖拽，重复事件，i18n 与暗色模式。'
			},
			{
				name: 'svelte-json-discovery',
				href: 'https://github.com/Blackman99/svelte-json-discovery',
				stars: 5,
				tech: 'Svelte 5',
				role: '作者',
				blurb: '把 discovery.js 的 JSON 结构视图抽成独立的 Svelte 5 组件，哪里都能塞。'
			}
		]
	},
	play: {
		kicker: 'Playground',
		title: '纯粹因为好玩才写的',
		lede: '有几个的 star 比正经项目还多。我已经接受了。',
		projects: [
			{
				name: 'v-rap',
				href: 'https://github.com/Blackman99/v-rap',
				stars: 27,
				tech: 'Vue 3',
				role: '作者',
				blurb: '一个 Vue 3 库，唯一的功能是把尤雨溪的 rap 视频嵌进你的应用。'
			},
			{
				name: 'joueur',
				href: 'https://github.com/Blackman99/joueur',
				stars: 27,
				tech: 'Svelte',
				role: '作者',
				blurb: '一个小而好玩的音乐播放器。'
			},
			{
				name: 'siyuan-plugin-*-repl',
				href: 'https://github.com/Blackman99/siyuan-plugin-vue-repl',
				stars: 14,
				tech: 'Vue / Svelte / React',
				role: '作者',
				blurb: '在思源笔记里嵌入可运行的 Vue / Svelte / React REPL。三个插件，一个想法。'
			},
			{
				name: 'reditor',
				href: 'https://github.com/Blackman99/reditor',
				stars: 8,
				tech: 'Vue',
				role: '作者',
				blurb: '在线简历编辑器，模板还不错。是的，我先写了简历工具，才写了这个页面。'
			}
		]
	},
	domains: {
		kicker: '九年，六个领域',
		title: '这些年活儿到底干在哪',
		lede: '强监管金融、医院设备、消费音频、规模化信贷、内部平台。约束各不相同，要做的事是同一件：做对，然后让它上线。',
		items: [
			{
				label: '加密合规与链上风控',
				at: '当前',
				body: 'LLM 生成监管文书，多跳路径回溯，可配置规则集，对外开放 API，以及承载它们的云。',
				current: true
			},
			{
				label: '内部研发平台',
				at: '易壹数据',
				body: '规划并带队实施自建低代码平台——核心引擎加一套自主领域设计语言。内部项目研发效率提升约 30%，重复开发被砍掉。'
			},
			{
				label: '医疗成像',
				at: '通用电气医疗(中国)',
				body: 'x20 系统与 China AW 医疗成像系统的技术管理及核心功能实现。'
			},
			{
				label: '规模化消费音频',
				at: '哔哩哔哩 · 猫耳 FM',
				body: '业务需求开发与前端技术迭代，以及团队赖以开发的内部组件库与工具库。'
			},
			{
				label: '海外信贷与商户平台',
				at: '北京欧非科技',
				body: '海外信贷 H5、业务管理系统与数据聚合平台，支撑在贷金额上亿美金、百万级入驻商户。构建速度提升 50%，开发启动与热更新提速 100%，生产 Lighthouse 各项 90+。'
			},
			{
				label: '电信级前端工程',
				at: '亚信科技 · 优锘科技',
				body: '技术选型、工程搭建、核心页面与持续集成；沉淀了部门在我离开后还在用的内部类库与组件。'
			}
		],
		stackTitle: '顺手的技术栈',
		stack: [
			{ label: 'AI', items: 'Claude · OpenAI · DeepSeek · 结构化输出 · 工具调用循环 · Agent CLI 工作流' },
			{ label: '语言', items: 'TypeScript · Go · Rust · Java · Python' },
			{ label: '前端', items: 'React 19 / Next.js · Svelte 5 / SvelteKit · Vue 3 · Vite / Rollup / Nx · Tauri · D3 / ECharts' },
			{ label: '服务端', items: 'Node.js · Go · PostgreSQL / MySQL · Redis · REST 与异步任务' },
			{ label: '基础设施', items: 'AWS · 腾讯云 · Docker · GitHub Actions / Jenkins · Linux · systemd 部署与回滚' },
			{ label: '链上', items: 'EVM 与 Tron 链上数据 · Ethereum · Tron · Base' }
		]
	},
	contact: {
		kicker: '联系',
		title: '说说你在做什么',
		lede: '如果你需要一个能把 AI 功能从想法一路推到服务器上、中间不用交接的人，写信给我。',
		availability: '可接全职远程 / 合同制',
		overlap: '常驻 UTC+8。欧洲整个工作日可以重叠，美东在我的晚上也能对上。',
		emailLabel: '邮箱',
		githubLabel: 'GitHub',
		blogLabel: '博客',
		cvLabel: '下载简历',
		cvNote: 'PDF · 中文版',
		cvFile: 'Dongsheng-Zhao-CV-zh.pdf',
		footer: '本页由本人用 SvelteKit 写成。无埋点，无统计脚本。'
	},
	a11y: { langToggle: '切换到英文', toTop: '回到顶部', sectionNav: '章节导航' }
};

export const content: Record<Lang, SiteContent> = { en, zh };
