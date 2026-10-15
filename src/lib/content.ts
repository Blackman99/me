export type Lang = 'en' | 'zh';

export const LANGS: Lang[] = ['en', 'zh'];

export interface Project {
	name: string;
	href: string;
	stars?: number;
	tech: string;
	role: string;
	blurb: string;
	/** The project's own one-line pitch, shown above the blurb. */
	tagline?: string;
	/** Short chips under the blurb. Featured cards only — they cost height. */
	highlights?: string[];
	/** Secondary destinations beside the repo: site, docs, download. */
	links?: { label: string; href: string }[];
	/** Leads its section with a larger card. One per section at most. */
	featured?: boolean;
}

export interface Domain {
	label: string;
	at: string;
	body: string;
	current?: boolean;
}

/** A card about the page itself rather than a project: live frame graph,
    page weight, the motion switch. */
interface PageCard {
	tag: string;
	title: string;
	body: string;
}

/*
 * Markup inside strings, kept deliberately tiny:
 *   `*word*`  set in the display italic (the accent gradient in Chinese)
 *   `\n`      a line break; in section titles every line after the first is dimmed
 */
export interface SiteContent {
	locale: string;
	meta: { title: string; description: string; ogImage: string; ogAlt: string };
	nav: {
		work: string;
		ai: string;
		oss: string;
		play: string;
		domains: string;
		contact: string;
		cv: string;
	};
	loader: { label: string; ready: string };
	hero: {
		eyebrow: string;
		name: string;
		/** The giant headline. Its letters thicken as the cursor nears them. */
		headline: string;
		title: string;
		sub: string;
		availability: string;
		place: string;
		ctaPrimary: string;
		ctaSecondary: string;
		hint: string;
		hud: { fps: string; scale: string; gpu: string; palette: string };
		stats: { value: string; label: string }[];
	};
	manifesto: { kicker: string; text: string };
	engine: {
		kicker: string;
		hint: string;
		stages: { label: string; title: string; body: string }[];
	};
	production: {
		kicker: string;
		title: string;
		context: string;
		bullets: { tag: string; head: string; body: string }[];
		highlight: { tag: string; head: string; body: string; chips: string[] };
	};
	agents: { kicker: string; title: string; lede: string; terminal: string; projects: Project[] };
	oss: {
		kicker: string;
		title: string;
		lede: string;
		demo: { title: string; body: string; clickable: string };
		projects: Project[];
	};
	stats: { label: string };
	play: {
		kicker: string;
		title: string;
		lede: string;
		projects: Project[];
		page: {
			fps: PageCard;
			weight: PageCard & { unit: string };
			motion: PageCard & { on: string; off: string; yours: string };
		};
	};
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
		cta: string;
		sent: string;
		emailLabel: string;
		githubLabel: string;
		blogLabel: string;
		cvLabel: string;
		cvNote: string;
		cvFile: string;
		footer: string;
	};
	footer: { giant: string; time: string };
	/** Words shown inside the cursor ring over things that react. */
	cursor: { hue: string; play: string; decode: string; write: string; open: string };
	a11y: { langToggle: string; toTop: string; sectionNav: string; palette: string };
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

/** The two marquee rows. Proper nouns, so one list serves both languages. */
export const MARQUEE = [
	'Claude',
	'OpenAI',
	'DeepSeek',
	'SvelteKit',
	'React 19',
	'Go',
	'Rust',
	'Tauri',
	'WebGL2',
	'PostgreSQL'
];

/** The particle engine starts as these letters. */
export const GLYPH = 'DZ';

const en: SiteContent = {
	locale: 'en',
	meta: {
		title: 'Dongsheng Zhao — AI Full-Stack Engineer',
		description:
			'AI full-stack engineer, 9 years. Creator of Sveltepress (539 stars). Shipping LLMs into production compliance systems. Open to full-time remote or contract.',
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
		contact: 'Contact',
		cv: 'CV'
	},
	loader: { label: 'DZ / boot', ready: 'hello' },
	hero: {
		eyebrow: 'Creator of Sveltepress · 539 stars',
		name: 'Dongsheng Zhao',
		headline: 'Dongsheng\n*Zhao.*',
		title: 'AI Full-Stack Engineer · 9 years',
		sub: 'I put LLMs inside production systems, and own everything around them — engine, API, workbench, deploy.',
		availability: 'Open to full-time remote or contract',
		place: 'UTC+8 · Hefei, China · working English',
		ctaPrimary: 'View my work',
		ctaSecondary: 'Email me',
		hint: 'Move your cursor — the chrome follows it',
		hud: { fps: 'FPS', scale: 'Render scale', gpu: 'GPU', palette: 'Palette' },
		stats: [
			{ value: '9', label: 'years shipping' },
			{ value: '747', label: 'GitHub stars' },
			{ value: '89', label: 'public repos' },
			{ value: '4', label: 'open-source orgs' }
		]
	},
	manifesto: {
		kicker: 'How I work',
		text: 'I put *LLMs* inside *production* systems — regulatory reports drafted by Claude and OpenAI, a multi-chain risk engine underneath, a public API around it and the workbench on top. Design, build, test, deploy: on my *own.*'
	},
	engine: {
		kicker: 'End to end',
		hint: 'Scroll to morph · move to orbit',
		stages: [
			{
				label: '01 / Design',
				title: 'It starts as two letters.',
				body: '24,000 particles sampled from my initials, running on your GPU. Keep scrolling: this is a feature going end to end.'
			},
			{
				label: '02 / Build',
				title: 'Then it takes shape.',
				body: 'Model calls, engine, API, workbench. With the whole stack in one pair of hands, nothing is lost in a handoff.'
			},
			{
				label: '03 / Test',
				title: 'Then it has to hold together.',
				body: 'A (2,3) torus knot. Every particle leaves on its own delay, with turbulence that peaks mid-flight — like the edge cases.'
			},
			{
				label: '04 / Ship',
				title: 'Then it goes out into the world.',
				body: 'Three spiral arms, additive blending, zero textures. Move your cursor: it is all live.'
			}
		]
	},
	production: {
		kicker: 'What I am building now',
		title: 'LLMs inside a crypto\ncompliance platform',
		context:
			'A crypto AML/KYT compliance SaaS. I own the AI layer and the whole stack beneath it — screening engine, public API, workbench, and the pipeline that puts it on a server.',
		bullets: [
			{
				tag: 'LLM',
				head: 'Regulatory writing, done by the model',
				body: 'On-chain risk data and rule hits are fed to Claude and OpenAI, which draft STR/SAR reports, compliance policies and rule-set proposals — replacing a step that used to be written by hand.'
			},
			{
				tag: 'Screening',
				head: 'KYA / KYT screening engine',
				body: 'Multi-hop fund-path tracing that surfaces high-risk counterparties, sanctions and blacklist hits, then returns a graded risk verdict.'
			},
			{
				tag: 'Rules',
				head: 'Configurable rule sets',
				body: 'Path-level detection routed by scenario — deposit, withdrawal, CDD, ongoing monitoring — so compliance teams change policy without shipping code.'
			},
			{
				tag: 'API',
				head: 'Public API, v2 and v3',
				body: 'Async polling with API-key auth, address-monitoring alerts, webhooks and quota billing, across Ethereum, Tron and Base.'
			},
			{
				tag: 'Workbench',
				head: 'The workbench',
				body: 'Next.js 16 and React 19 in TypeScript: screening, batch checks, graph exploration, reports and monitoring, on SWR and Zustand.'
			},
			{
				tag: 'Ops',
				head: 'Ship and keep it up',
				body: 'Led a full cloud migration, built the CI/CD on GitHub Actions — atomic Go binary swaps, layered backups, rollback in seconds — and own production incidents.'
			}
		],
		highlight: {
			tag: 'Highlight',
			head: 'Rewrote path investigation',
			body: 'Uploading the whole graph became server-side detection with gzipped parallel paging. A single screening run got dramatically faster.',
			chips: ['Server-side detection', 'gzip', 'Parallel paging']
		}
	},
	agents: {
		kicker: 'Open source · AI and agents',
		title: 'Hand work to agents,\nthen check it is done',
		lede: 'I spend most days inside coding agents, so I build the parts they are missing.',
		terminal: '~/work — codsh',
		projects: [
			{
				name: 'deskfolk',
				href: 'https://github.com/Blackman99/deskfolk',
				stars: 12,
				tech: 'Tauri / Svelte 5',
				role: 'Author · alpha',
				featured: true,
				tagline: 'Hand it off. Walk away. Return to results.',
				blurb:
					'A local-first desktop app for multi-day, multi-step jobs. Persistent Bots chat, join groups and hand work to each other — and when one says done, the app checks first.',
				highlights: ['Done = checks pass', 'Stop is a state', 'Any endpoint, or Claude Code'],
				links: [
					{ label: 'Website', href: 'https://blackman99.github.io/deskfolk/' },
					{ label: 'Download', href: 'https://github.com/Blackman99/deskfolk/releases/latest' }
				]
			},
			{
				name: 'codsh',
				href: 'https://github.com/Blackman99/codsh',
				stars: 8,
				tech: 'TypeScript',
				role: 'Author',
				blurb:
					'Terminal coding agent for DeepSeek and any OpenAI-compatible endpoint. /ship takes one sentence to verified code: spec, ticket DAG, parallel TDD worktrees, clean merge.',
				links: [{ label: 'Gallery', href: 'https://blackman99.github.io/codsh/gallery.html' }]
			},
			{
				name: 'agent-feishu-channel',
				href: 'https://github.com/Blackman99/agent-feishu-channel',
				stars: 50,
				tech: 'TypeScript',
				role: 'Author',
				blurb:
					'Claude and Codex, natively in Feishu (Lark): a full coding-agent session in a group chat, tool calls as approval cards, sessions that survive restarts.',
				links: [{ label: 'Docs', href: 'https://blackman99.github.io/agent-feishu-channel/' }]
			}
		]
	},
	oss: {
		kicker: 'Open source · Svelte ecosystem',
		title: 'Sveltepress, and what\ngrew around it',
		lede: 'Maintained since August 2022. Most of my GitHub stars come from here.',
		demo: {
			title: 'Svelte, right inside Markdown',
			body: 'The counter is a real Svelte component, not a picture of one. That is the whole pitch of Sveltepress, so the demo had better be honest.',
			clickable: 'really clickable'
		},
		projects: [
			{
				name: 'Sveltepress',
				href: 'https://github.com/SveltePress/sveltepress',
				stars: 539,
				tech: 'SvelteKit',
				role: 'Creator and maintainer',
				featured: true,
				tagline: 'Write Markdown, keep the full power of SvelteKit.',
				blurb:
					'A docs and blog SSG on SvelteKit: Svelte 5 runes and components in Markdown, immutable doc versions, i18n, Pagefind search, and a blog theme with RSS and OG images.',
				highlights: ['Svelte 5 in Markdown', 'Versioned docs', 'i18n · Pagefind', 'llms.txt built in'],
				links: [{ label: 'sveltepress.site', href: 'https://sveltepress.site' }]
			},
			{
				name: 'svelte5plus-calendar',
				href: 'https://github.com/Blackman99/svelte5plus-calendar',
				stars: 12,
				tech: 'Svelte 5',
				role: 'Author',
				blurb:
					'Every calendar view in one zero-dependency component, month to agenda plus resources — with drag and drop, recurrence, time zones and ICS.',
				links: [{ label: 'Docs', href: 'https://blackman99.github.io/svelte5plus-calendar/' }]
			},
			{
				name: 'svelte-json-discovery',
				href: 'https://github.com/Blackman99/svelte-json-discovery',
				stars: 6,
				tech: 'Svelte 5',
				role: 'Author',
				blurb:
					'The discovery.js struct view as a standalone Svelte 5 component — type-aware previews, windowed collections, search, table and diff views.',
				links: [{ label: 'Docs', href: 'https://blackman99.github.io/svelte-json-discovery/' }]
			}
		]
	},
	stats: { label: 'In numbers' },
	play: {
		kicker: 'Playground',
		title: 'Built because\nthey were fun',
		lede: 'Some of these have more stars than the serious ones. I have made peace with it.',
		page: {
			fps: {
				tag: 'This page',
				title: 'Frame-perfect, measured live',
				body: "Your browser's real frame timeline, right now. One requestAnimationFrame loop drives every effect on this site."
			},
			weight: {
				tag: 'This page',
				title: 'Weighed on arrival',
				body: 'Compressed bytes this visit downloaded. No animation library: two WebGL programs and a physics loop.',
				unit: 'KB'
			},
			motion: {
				tag: 'This page',
				title: 'Motion you can turn off',
				body: 'Honours prefers-reduced-motion. Or flip the switch and the whole page holds still.',
				on: 'Motion on',
				off: 'Motion off',
				yours: 'Yours'
			}
		},
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
		title: 'Where the work\nhas actually been',
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
		title: 'Tell me what\nyou are *building.*',
		lede: 'If you need someone who can take an AI feature from an idea to a thing on a server, without a handoff in the middle — write to me.',
		availability: 'Open to full-time remote or contract',
		overlap: 'Based UTC+8. A full European working day overlaps; so does US East in my evening.',
		cta: 'Email me',
		sent: 'Talk soon ✦',
		emailLabel: 'Email',
		githubLabel: 'GitHub',
		blogLabel: 'Blog',
		cvLabel: 'Download CV',
		cvNote: 'PDF · English',
		cvFile: 'Dongsheng-Zhao-CV.pdf',
		footer: 'Built with SvelteKit by the person it is about. No trackers, no analytics.'
	},
	footer: { giant: 'DONGSHENG', time: 'Hefei' },
	cursor: { hue: 'Hue', play: 'Play', decode: 'Decode', write: 'Write', open: 'Open' },
	a11y: {
		langToggle: 'Switch to Chinese',
		toTop: 'Back to top',
		sectionNav: 'Section navigation',
		palette: 'Switch colour palette'
	}
};

const zh: SiteContent = {
	locale: 'zh-CN',
	meta: {
		title: '赵东升 — AI 全栈工程师',
		description:
			'AI 全栈工程师，9 年经验。Sveltepress 作者(539 star)。把 LLM 能力做进生产级合规系统。可接全职远程或合同制。',
		ogImage: 'og-zh.jpg',
		ogAlt: '赵东升 — AI 全栈工程师，9 年经验，Sveltepress 作者。可接全职远程或合同制，UTC+8。'
	},
	nav: {
		work: '生产工作',
		ai: 'Agent 工具',
		oss: '开源生态',
		play: 'Playground',
		domains: '领域',
		contact: '联系',
		cv: '简历'
	},
	loader: { label: 'DZ / 启动', ready: '你好' },
	hero: {
		eyebrow: 'Sveltepress 作者 · 539 star',
		name: '赵东升',
		headline: '赵东升\n*Dongsheng Zhao.*',
		title: 'AI 全栈工程师 · 9 年经验',
		sub: '我把 LLM 放进生产系统，并负责它周围的一切：引擎、API、工作台、部署。',
		availability: '可接全职远程 / 合同制',
		place: 'UTC+8 · 合肥 · 可用英语开会',
		ctaPrimary: '看我的作品',
		ctaSecondary: '给我写信',
		hint: '移动光标，液态金属会跟着你',
		hud: { fps: '帧率', scale: '渲染比例', gpu: 'GPU', palette: '配色' },
		stats: [
			{ value: '9', label: '年工程经验' },
			{ value: '747', label: 'GitHub star' },
			{ value: '89', label: '公开仓库' },
			{ value: '4', label: '开源组织' }
		]
	},
	manifesto: {
		kicker: '我怎么做事',
		text: '我把 *LLM* 放进*生产*系统：合规报告由 Claude 与 OpenAI 起草，底下是多链风控引擎，外面包一层开放 API，上面是工作台。设计、开发、测试、部署，*一个人*走完。'
	},
	engine: {
		kicker: '从头到尾',
		hint: '滚动变形 · 移动环绕',
		stages: [
			{
				label: '01 / 设计',
				title: '从两个字母开始。',
				body: '24,000 个粒子取样自我名字的缩写，跑在你的 GPU 上。继续往下滚：这是一个功能从头走到尾的样子。'
			},
			{
				label: '02 / 开发',
				title: '然后它有了形状。',
				body: '模型调用、引擎、API、工作台。整条栈在一个人手里，交接里就不会丢东西。'
			},
			{
				label: '03 / 测试',
				title: '然后它得扛得住。',
				body: '一个 (2,3) 环面纽结。每个粒子按自己的延迟出发，湍流在半途最强——边界情况也是这样。'
			},
			{
				label: '04 / 上线',
				title: '然后它走进世界。',
				body: '三条旋臂，叠加混合，零贴图。移动光标，全是实时的。'
			}
		]
	},
	production: {
		kicker: '正在做的事',
		title: '把 LLM 放进\n加密合规平台',
		context:
			'一家加密货币 AML/KYT 合规 SaaS。我负责 AI 层，以及它下面的整条栈——筛查引擎、开放 API、工作台，还有把它送上服务器的那套流水线。',
		bullets: [
			{
				tag: 'LLM',
				head: '合规文书交给模型写',
				body: '把链上风险数据与规则命中喂给 Claude 和 OpenAI，自动起草 STR/SAR 报告、合规政策与规则集草案，替代原本人工撰写的环节。'
			},
			{
				tag: '筛查',
				head: 'KYA / KYT 筛查引擎',
				body: '多跳资金路径回溯，识别高风险交易对手、制裁与黑名单命中，输出分级风险判定。'
			},
			{
				tag: '规则',
				head: '可配置规则集',
				body: '按存款、取款、CDD、持续监控等场景分流的路径级检测，合规团队改策略不需要发版。'
			},
			{
				tag: 'API',
				head: '对外开放 API(v2 / v3)',
				body: '异步轮询加 API Key 鉴权，地址监控告警、Webhook、配额计费，覆盖 Ethereum、Tron 与 Base。'
			},
			{
				tag: '工作台',
				head: '合规工作台',
				body: 'Next.js 16 + React 19 + TypeScript：筛查、批量检测、图谱探索、报告与监控，状态用 SWR 与 Zustand。'
			},
			{
				tag: '运维',
				head: '上线并且守住',
				body: '主导整体云迁移，搭建 GitHub Actions CI/CD——Go 二进制原子替换、多份备份、秒级回滚——并负责生产故障排查。'
			}
		],
		highlight: {
			tag: '亮点',
			head: '重写路径调查链路',
			body: '从全量路径上传改成服务端检测 + gzip 并行分页拉取，单次筛查耗时显著下降。',
			chips: ['服务端检测', 'gzip', '并行分页']
		}
	},
	agents: {
		kicker: '开源 · AI 与 Agent',
		title: '把活交给 Agent，\n再确认它真的做完了',
		lede: '我大部分时间泡在编码 Agent 里，缺什么就自己补什么。',
		terminal: '~/work — codsh',
		projects: [
			{
				name: 'deskfolk',
				href: 'https://github.com/Blackman99/deskfolk',
				stars: 12,
				tech: 'Tauri / Svelte 5',
				role: '作者 · Alpha',
				featured: true,
				tagline: '交出去，离开，回来看结果。',
				blurb:
					'面向多天、多步、要返工的活的 local-first 桌面应用。常驻 Bot 单聊、进群、互相转交任务；Bot 说做完了，应用先核过。',
				highlights: ['做完由检查说了算', '叫停是一种状态', '任意端点，或 Claude Code'],
				links: [
					{ label: '官网', href: 'https://blackman99.github.io/deskfolk/zh' },
					{ label: '下载', href: 'https://github.com/Blackman99/deskfolk/releases/latest' }
				]
			},
			{
				name: 'codsh',
				href: 'https://github.com/Blackman99/codsh',
				stars: 8,
				tech: 'TypeScript',
				role: '作者',
				blurb:
					'面向 DeepSeek 及任意 OpenAI 兼容端点的终端编码 Agent。/ship 把一句话变成验证过的代码：规格、任务 DAG、并行 worktree 跑 TDD，最后干净合并。',
				links: [{ label: '画廊', href: 'https://blackman99.github.io/codsh/gallery.zh.html' }]
			},
			{
				name: 'agent-feishu-channel',
				href: 'https://github.com/Blackman99/agent-feishu-channel',
				stars: 50,
				tech: 'TypeScript',
				role: '作者',
				blurb:
					'Claude 与 Codex 原生进飞书：在群聊里跑完整的编码 Agent 会话，工具调用变成审批卡片，进程重启会话不丢。',
				links: [{ label: '文档', href: 'https://blackman99.github.io/agent-feishu-channel/' }]
			}
		]
	},
	oss: {
		kicker: '开源 · Svelte 生态',
		title: 'Sveltepress，\n以及围绕它长出来的东西',
		lede: '2022 年 8 月至今持续维护。我 GitHub 上大部分 star 来自这里。',
		demo: {
			title: '在 Markdown 里直接写 Svelte',
			body: '计数器是真的 Svelte 组件，不是一张截图。这正是 Sveltepress 的卖点，演示当然得是真的。',
			clickable: '真的能点'
		},
		projects: [
			{
				name: 'Sveltepress',
				href: 'https://github.com/SveltePress/sveltepress',
				stars: 539,
				tech: 'SvelteKit',
				role: '创建者 / 维护者',
				featured: true,
				tagline: '写 Markdown，保留 SvelteKit 的全部能力。',
				blurb:
					'基于 SvelteKit 的文档与博客 SSG：Markdown 里直接写 Svelte 5 Runes 与组件；不可变的文档版本；i18n 与 Pagefind 搜索；文档主题，以及带 RSS 与 OG 图的博客主题。',
				highlights: ['Markdown 里写 Svelte 5', '文档版本化', 'i18n · Pagefind', '内置 llms.txt'],
				links: [{ label: 'sveltepress.site', href: 'https://sveltepress.site' }]
			},
			{
				name: 'svelte5plus-calendar',
				href: 'https://github.com/Blackman99/svelte5plus-calendar',
				stars: 12,
				tech: 'Svelte 5',
				role: '作者',
				blurb: '一个零依赖组件装下所有日历视图，从月视图到议程，外加资源视图。拖拽、重复事件、时区、ICS 导入导出。',
				links: [{ label: '文档', href: 'https://blackman99.github.io/svelte5plus-calendar/' }]
			},
			{
				name: 'svelte-json-discovery',
				href: 'https://github.com/Blackman99/svelte-json-discovery',
				stars: 6,
				tech: 'Svelte 5',
				role: '作者',
				blurb: '把 discovery.js 的 struct 视图抽成独立的 Svelte 5 组件：按类型预览、大集合窗口化读取、搜索、表格与 Diff 视图。',
				links: [{ label: '文档', href: 'https://blackman99.github.io/svelte-json-discovery/' }]
			}
		]
	},
	stats: { label: '数字' },
	play: {
		kicker: 'Playground',
		title: '纯粹因为\n好玩才写的',
		lede: '有几个的 star 比正经项目还多。我已经接受了。',
		page: {
			fps: {
				tag: '本页',
				title: '逐帧实测',
				body: '这是你的浏览器此刻真实的帧时间线。整站所有特效由同一个 requestAnimationFrame 循环驱动。'
			},
			weight: {
				tag: '本页',
				title: '到手就称重',
				body: '这次访问实际下载的压缩字节。没有动画库：两个 WebGL 程序加一个物理循环。',
				unit: 'KB'
			},
			motion: {
				tag: '本页',
				title: '动效可以关掉',
				body: '遵循系统的 prefers-reduced-motion 设置；也可以拨动开关，让整页静止。',
				on: '动效开',
				off: '动效关',
				yours: '你的设置'
			}
		},
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
		title: '这些年活儿\n到底干在哪',
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
		title: '说说你\n在做*什么。*',
		lede: '如果你需要一个能把 AI 功能从想法一路推到服务器上、中间不用交接的人，写信给我。',
		availability: '可接全职远程 / 合同制',
		overlap: '常驻 UTC+8。欧洲整个工作日可以重叠，美东在我的晚上也能对上。',
		cta: '给我写信',
		sent: '回头聊 ✦',
		emailLabel: '邮箱',
		githubLabel: 'GitHub',
		blogLabel: '博客',
		cvLabel: '下载简历',
		cvNote: 'PDF · 中文版',
		cvFile: 'Dongsheng-Zhao-CV-zh.pdf',
		footer: '本页由本人用 SvelteKit 写成。无埋点，无统计脚本。'
	},
	footer: { giant: '赵东升', time: '合肥时间' },
	cursor: { hue: '配色', play: '玩', decode: '解码', write: '写信', open: '打开' },
	a11y: {
		langToggle: '切换到英文',
		toTop: '回到顶部',
		sectionNav: '章节导航',
		palette: '切换配色'
	}
};

export const content: Record<Lang, SiteContent> = { en, zh };
