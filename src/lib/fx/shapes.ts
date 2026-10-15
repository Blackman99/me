/*
 * The four destinations of the particle engine, one per stage of shipping a
 * feature: the initials on an artboard (design), the stack exploded into its
 * four layers (build), a lens over a bug (test) and a rocket at lift-off
 * (ship). Flat drawings are rasterised on a 2D canvas and sampled; the solid
 * ones are sampled from their surfaces directly.
 *
 * Besides positions, every point carries four tags, one per shape, that the
 * vertex shader reads to animate it once it lands (see VS_PTS):
 *   x  design: 1 for the editor overlay (anchors, handles, pointer), lit white
 *   y  build: plate 0–3 bottom to top, or 4 for data running up a riser
 *   z  test: 1 for the magnifier, which drifts over the bug
 *   w  ship: 1 for exhaust, 2 for a star streaming past
 * Exhaust and stars are stored as parameters, not positions: the shader
 * moves them every frame.
 */

export const N = 24000;

type Ctx = CanvasRenderingContext2D;
type Put = (x: number, y: number, z: number, tag?: number) => void;

const TAU = Math.PI * 2;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * Rasterise a drawing made in design units (`scale` pixels each) and return
 * a picker of random covered points, back in design units.
 */
function raster(w: number, h: number, draw: (x: Ctx) => void, scale = 0.6) {
	const c = document.createElement('canvas');
	const cw = (c.width = Math.ceil(w * scale));
	const ch = (c.height = Math.ceil(h * scale));
	const x = c.getContext('2d', { willReadFrequently: true })!;
	x.scale(scale, scale);
	x.fillStyle = x.strokeStyle = '#fff';
	x.lineCap = 'round';
	x.lineJoin = 'round';
	draw(x);
	const d = x.getImageData(0, 0, cw, ch).data;
	const pts: number[] = [];
	for (let yy = 0; yy < ch; yy++) for (let xx = 0; xx < cw; xx++) if (d[(yy * cw + xx) * 4 + 3] > 110) pts.push(xx, yy);
	if (!pts.length) pts.push(cw / 2, ch / 2);
	return () => {
		const k = ((Math.random() * pts.length) >> 1) << 1;
		return [(pts[k] + Math.random()) / scale, (pts[k + 1] + Math.random()) / scale] as const;
	};
}

/** Writes one shape's points in order; whatever is left goes to the last part. */
function writer(P: Float32Array, K: Float32Array, slot: number) {
	let i = 0;
	const put: Put = (x, y, z, tag = 0) => {
		if (i >= N) return;
		P[i * 3] = x;
		P[i * 3 + 1] = y;
		P[i * 3 + 2] = z;
		K[i * 4 + slot] = tag;
		i++;
	};
	return { put, left: () => N - i };
}

const polyline = (x: Ctx, pts: number[][]) => {
	x.beginPath();
	pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b)));
	x.stroke();
};
const dot = (x: Ctx, a: number, b: number, r: number) => {
	x.beginPath();
	x.arc(a, b, r, 0, TAU);
	x.fill();
};

/* --------------------------------------------------------- 0 — design */

// D and Z built the way a type designer would: straight stems, a bowl of
// two cubic quarter-ellipses, a 520-unit cap height on a 640 baseline.
const D_OUT = 'M200 120L200 640L390 640C533.6 640 650 523.6 650 380C650 236.4 533.6 120 390 120Z';
const D_IN = 'M310 230L390 230C472.8 230 540 297.2 540 380C540 462.8 472.8 530 390 530L310 530Z';
const Z_OUT = 'M770 120L1200 120L1200 220L900 540L1210 540L1210 640L760 640L760 540L1060 220L770 220Z';
const CORNERS = [
	[200, 120], [200, 640], [310, 230], [310, 530],
	[770, 120], [1200, 120], [1200, 220], [900, 540], [1210, 540],
	[1210, 640], [760, 640], [760, 540], [1060, 220], [770, 220]
];
const SMOOTH = [[390, 640], [650, 380], [390, 120], [390, 230], [540, 380], [390, 530]];
const HANDLES = [
	[390, 640, 533.6, 640], [650, 380, 650, 523.6], [650, 380, 650, 236.4], [390, 120, 533.6, 120],
	[390, 230, 472.8, 230], [540, 380, 540, 297.2], [540, 380, 540, 462.8], [390, 530, 472.8, 530]
];

function design(put: Put, left: () => number) {
	const W = 1400;
	const H = 800;
	const s = 3.3 / 1035;
	const map = (p: readonly [number, number], z: number, tag = 0) =>
		put((p[0] - 717) * s, -(p[1] - 390) * s, z, tag);
	const glyphs = new Path2D(D_OUT + D_IN + Z_OUT);

	const guides = raster(W, H, (x) => {
		x.lineWidth = 2.5;
		x.setLineDash([16, 14]);
		for (const y of [120, 640]) polyline(x, [[60, y], [1340, y]]);
	});
	const fill = raster(W, H, (x) => x.fill(glyphs, 'evenodd'));
	const outline = raster(W, H, (x) => {
		x.lineWidth = 5;
		x.stroke(glyphs);
	});
	const anchors = raster(W, H, (x) => {
		x.lineWidth = 4;
		for (const [a, b] of CORNERS) x.strokeRect(a - 12, b - 12, 24, 24);
		for (const [a, b] of SMOOTH) {
			x.beginPath();
			x.arc(a, b, 13, 0, TAU);
			x.stroke();
		}
	});
	const handles = raster(W, H, (x) => {
		x.lineWidth = 2.5;
		for (const [a, b, c, d] of HANDLES) {
			polyline(x, [[a, b], [c, d]]);
			dot(x, c, d, 8);
		}
	});
	// the pointer, mid-drag on the Z's last corner
	const pointer = raster(W, H, (x) => x.fill(new Path2D('M1228 652L1228 734L1248 714L1262 746L1276 740L1262 709L1290 709Z')));

	for (let i = 0; i < 2200; i++) map(guides(), -0.22);
	for (let i = 0; i < 2400; i++) map(fill(), rnd(-0.09, 0.09));
	for (let i = 0; i < 3600; i++) map(anchors(), 0.14, 1);
	for (let i = 0; i < 2000; i++) map(handles(), 0.14, 1);
	for (let i = 0; i < 700; i++) map(pointer(), 0.2, 1);
	for (let n = left(), i = 0; i < n; i++) map(outline(), rnd(-0.03, 0.03));
}

/* ---------------------------------------------------------- 1 — build */

// Plates are drawn on a 1000×520 canvas and laid flat (canvas top = far),
// spaced so that, seen from above, no plate hides the one below it.
const PLATE = 0.0024;
const PLATE_GAP = 0.76;
const RISERS = [[-0.98, -0.44], [0.98, -0.44], [-0.98, 0.44], [0.98, 0.44]];

const motifs: ((x: Ctx) => void)[] = [
	// model calls: a small network
	(x) => {
		const cols = [[250, [150, 260, 370]], [500, [100, 205, 315, 420]], [750, [150, 260, 370]]] as const;
		x.lineWidth = 3;
		for (let c = 0; c < 2; c++)
			for (const a of cols[c][1]) for (const b of cols[c + 1][1]) polyline(x, [[cols[c][0], a], [cols[c + 1][0], b]]);
		x.lineWidth = 8;
		for (const [cx, ys] of cols)
			for (const y of ys) {
				x.beginPath();
				x.arc(cx, y, 30, 0, TAU);
				x.stroke();
			}
	},
	// engine: a gear
	(x) => {
		const teeth = 10;
		x.lineWidth = 9;
		x.beginPath();
		for (let i = 0; i <= teeth * 4; i++) {
			const a = (i / (teeth * 4)) * TAU;
			const r = i % 4 < 2 ? 205 : 162;
			const px = 500 + Math.cos(a) * r;
			const py = 260 + Math.sin(a) * r;
			if (i) x.lineTo(px, py);
			else x.moveTo(px, py);
		}
		x.closePath();
		x.stroke();
		x.beginPath();
		x.arc(500, 260, 66, 0, TAU);
		x.stroke();
		dot(x, 500, 260, 20);
	},
	// API: { key: value }
	(x) => {
		x.lineWidth = 12;
		for (const side of [-1, 1]) {
			const bx = 500 + side * 250;
			const k = -side;
			x.beginPath();
			x.moveTo(bx + k * 45, 80);
			x.quadraticCurveTo(bx, 80, bx, 130);
			x.lineTo(bx, 220);
			x.quadraticCurveTo(bx, 260, bx - k * 40, 260);
			x.quadraticCurveTo(bx, 260, bx, 300);
			x.lineTo(bx, 390);
			x.quadraticCurveTo(bx, 440, bx + k * 45, 440);
			x.stroke();
		}
		x.lineWidth = 16;
		for (const [y, a, b] of [[180, 140, 300], [260, 120, 240], [340, 140, 270]]) {
			polyline(x, [[350, y], [350 + a, y]]);
			polyline(x, [[350 + a + 40, y], [350 + a + 40 + b - a, y]]);
		}
	},
	// workbench: the app window on top
	(x) => {
		x.lineWidth = 7;
		x.beginPath();
		x.roundRect(80, 50, 840, 420, 26);
		x.stroke();
		polyline(x, [[80, 115], [920, 115]]);
		for (const cx of [125, 160, 195]) dot(x, cx, 82, 11);
		polyline(x, [[300, 115], [300, 470]]);
		x.lineWidth = 12;
		for (const [y, w] of [[160, 140], [210, 110], [260, 130], [310, 90]]) polyline(x, [[125, y], [125 + w, y]]);
		x.lineWidth = 7;
		polyline(x, [[350, 300], [440, 240], [520, 265], [610, 175], [700, 205], [790, 140], [870, 165]]);
		x.beginPath();
		x.roundRect(345, 335, 250, 105, 14);
		x.roundRect(625, 335, 250, 105, 14);
		x.stroke();
	}
];

function build(put: Put, left: () => number) {
	const W = 1000;
	const H = 520;
	const edge = raster(W, H, (x) => {
		x.lineWidth = 8;
		x.beginPath();
		x.roundRect(20, 20, 960, 480, 50);
		x.stroke();
	});
	const grid = raster(W, H, (x) => {
		for (let gx = 75; gx < 960; gx += 50) for (let gy = 70; gy < 480; gy += 50) dot(x, gx, gy, 3.2);
	});
	const map = (p: readonly [number, number], y: number, layer: number) =>
		put((p[0] - 500) * PLATE, y, (p[1] - 260) * PLATE, layer);
	for (let layer = 0; layer < 4; layer++) {
		const y = (layer - 1.5) * PLATE_GAP;
		const motif = raster(W, H, motifs[layer]);
		// the edge has depth: a slab, not a sheet
		for (let i = 0; i < 1400; i++) map(edge(), y - (i % 2 ? 0 : Math.random() * 0.08), layer);
		for (let i = 0; i < 800; i++) map(grid(), y, layer);
		for (let i = 0; i < 2600; i++) map(motif(), y + 0.012, layer);
	}
	// risers: (x, z, phase) of data climbing between the plates, a thin pipe
	// with five packets on it
	for (let n = left(), i = 0; i < n; i++) {
		const [rx, rz] = RISERS[i % 4];
		const a = Math.random() * TAU;
		const r = Math.sqrt(Math.random()) * 0.035;
		const ph = i % 5 < 2 ? Math.random() : (Math.floor(Math.random() * 5) + Math.random() * 0.16) / 5;
		put(rx + Math.cos(a) * r, rz + Math.sin(a) * r, ph, 4);
	}
}

/* ----------------------------------------------------------- 2 — test */

const LENS = { x: -0.25, y: 0.28, r: 1.0, tube: 0.085 };

function test(put: Put, left: () => number) {
	const { x: cx, y: cy, r: R, tube } = LENS;
	// the rim: a torus facing the viewer
	for (let i = 0; i < 6000; i++) {
		const u = Math.random() * TAU;
		const v = Math.random() * TAU;
		const rr = R + tube * Math.cos(v);
		put(cx + rr * Math.cos(u), cy + rr * Math.sin(u), tube * Math.sin(v), 1);
	}
	// the glass bulges towards you, with a glint across its upper left
	const bulge = (d: number) => 0.22 * Math.sqrt(Math.max(0, 1 - (d / R) ** 2));
	for (let i = 0; i < 1400; i++) {
		const a = Math.random() * TAU;
		const d = Math.sqrt(Math.random()) * (R - 0.1);
		put(cx + Math.cos(a) * d, cy + Math.sin(a) * d, bulge(d), 1);
	}
	for (let i = 0; i < 800; i++) {
		const a = rnd(1.85, 2.75);
		const d = 0.72 * R + rnd(-0.025, 0.025);
		put(cx + Math.cos(a) * d, cy + Math.sin(a) * d, bulge(d) + 0.01, 1);
	}
	// the handle: a collar, then the grip, then an end cap
	const dx = Math.SQRT1_2;
	const dy = -Math.SQRT1_2;
	const tube3 = (s0: number, s1: number, rad: number, n: number) => {
		for (let i = 0; i < n; i++) {
			const s = rnd(s0, s1);
			const t = Math.random() * TAU;
			const o = Math.cos(t) * rad;
			put(cx + dx * s - dy * o, cy + dy * s + dx * o, Math.sin(t) * rad, 1);
		}
	};
	tube3(R + 0.06, R + 0.26, 0.17, 1100);
	tube3(R + 0.26, R + 1.3, 0.125, 3300);
	for (let i = 0; i < 300; i++) {
		const t = Math.random() * TAU;
		const o = Math.sqrt(Math.random()) * 0.125;
		const s = R + 1.3;
		put(cx + dx * s - dy * Math.cos(t) * o, cy + dy * s + dx * Math.cos(t) * o, Math.sin(t) * o, 1);
	}

	// the bug, under the glass: a beetle with its spots and six legs
	const body = raster(600, 600, (x) => {
		dot(x, 300, 172, 52);
		x.beginPath();
		x.ellipse(300, 245, 72, 40, 0, 0, TAU);
		x.ellipse(300, 378, 128, 152, 0, 0, TAU);
		x.fill();
		x.globalCompositeOperation = 'destination-out';
		x.lineWidth = 10;
		polyline(x, [[300, 238], [300, 535]]);
		polyline(x, [[220, 278], [380, 278]]);
		for (const [a, b] of [[245, 335], [355, 335], [250, 440], [350, 440]]) dot(x, a, b, 24);
	});
	const limbs = raster(600, 600, (x) => {
		x.lineWidth = 12;
		const legs = [
			[[235, 250], [165, 222], [128, 160]],
			[[182, 345], [100, 336], [62, 398]],
			[[200, 455], [128, 492], [108, 565]]
		];
		for (const side of [1, -1])
			for (const leg of legs) polyline(x, leg.map(([a, b]) => [side > 0 ? a : 600 - a, b]));
		x.lineWidth = 8;
		for (const side of [1, -1]) {
			const f = (a: number) => (side > 0 ? a : 600 - a);
			x.beginPath();
			x.moveTo(f(282), 128);
			x.quadraticCurveTo(f(262), 58, f(214), 42);
			x.stroke();
			dot(x, f(214), 42, 13);
		}
	});
	const bs = 1.2 / 600;
	const bug = (p: readonly [number, number]) => put(cx + (p[0] - 300) * bs, cy - (p[1] - 300) * bs, rnd(-0.17, -0.07));
	for (let i = 0; i < 3600; i++) bug(limbs());
	for (let n = left(), i = 0; i < n; i++) bug(body());
}

/* ----------------------------------------------------------- 3 — ship */

/** Must match NOZ in VS_PTS: where the exhaust leaves the bell. */
const NOZZLE_Y = -0.62;
const BODY_R = 0.36;

const hull = (y: number) => {
	if (y < 0.75) return BODY_R;
	const s = Math.min(1, (y - 0.75) / 0.85);
	return BODY_R * Math.pow(1 - Math.pow(s, 1.8), 0.6);
};

function ship(put: Put, left: () => number) {
	const ring = (y: number, r: number, n: number, w = 0.012) => {
		for (let i = 0; i < n; i++) {
			const a = Math.random() * TAU;
			const rr = r + 0.006;
			put(Math.cos(a) * rr, y + rnd(-w, w), Math.sin(a) * rr);
		}
	};
	// four fins, each a trapezoid out from the hull, outline-heavy
	const FIN = [[BODY_R, 0.12], [BODY_R, -0.45], [0.82, -0.74], [0.8, -0.42]];
	for (let f = 0; f < 4; f++) {
		const phi = (f * TAU) / 4;
		const c = Math.cos(phi);
		const sn = Math.sin(phi);
		for (let i = 0; i < 760; i++) {
			let rho: number, y: number;
			if (i % 5 < 3) {
				const e = (Math.random() * 3) | 0;
				const t = Math.random();
				const [a, b] = [FIN[e + 1], FIN[(e + 2) % 4]];
				rho = a[0] + (b[0] - a[0]) * t;
				y = a[1] + (b[1] - a[1]) * t;
			} else {
				const u = Math.random();
				const v = Math.random();
				const top = FIN[0][1] + (FIN[3][1] - FIN[0][1]) * u;
				const bot = FIN[1][1] + (FIN[2][1] - FIN[1][1]) * u;
				rho = BODY_R + (0.82 - BODY_R) * u;
				y = bot + (top - bot) * v;
			}
			const th = rnd(-0.012, 0.012);
			put(c * rho - sn * th, y, sn * rho + c * th);
		}
	}
	// the bell, and the rim the flame leaves from
	for (let i = 0; i < 1000; i++) {
		const y = rnd(NOZZLE_Y, -0.45);
		const r = 0.17 + 0.08 * Math.pow((-0.45 - y) / 0.17, 1.5);
		const a = Math.random() * TAU;
		put(Math.cos(a) * r, y, Math.sin(a) * r);
	}
	ring(NOZZLE_Y, 0.25, 300, 0.008);
	// bands and a porthole
	ring(-0.3, BODY_R, 450);
	ring(0.62, BODY_R, 450);
	for (let i = 0; i < 1000; i++) {
		const a = Math.random() * TAU;
		const d = i < 700 ? 0.13 + rnd(-0.012, 0.012) : Math.sqrt(Math.random()) * 0.1;
		const px = Math.cos(a) * d;
		put(px, 0.3 + Math.sin(a) * d, Math.sqrt(BODY_R * BODY_R - px * px) + 0.012);
	}
	// exhaust: (angle, radius fraction, phase), denser at the core
	for (let i = 0; i < 6600; i++) put(Math.random() * TAU, Math.pow(Math.random(), 0.75), Math.random(), 1);
	// stars streaming past: (x, z, phase), kept off the hull
	for (let i = 0; i < 1500; i++) {
		let x: number, z: number;
		do {
			x = rnd(-2.8, 2.8);
			z = rnd(-2.2, 0.9);
		} while (Math.abs(x) < 0.9 && z > -0.6);
		put(x, z, Math.random(), 2);
	}
	// the hull, area-weighted, takes the rest
	for (let n = left(), i = 0; i < n; ) {
		const y = rnd(-0.45, 1.6);
		const r = hull(y);
		if (Math.random() * BODY_R > r) continue;
		const a = Math.random() * TAU;
		put(Math.cos(a) * r, y, Math.sin(a) * r);
		i++;
	}
}

/* ------------------------------------------------------------------------ */

export function buildShapes() {
	const P = [0, 1, 2, 3].map(() => new Float32Array(N * 3));
	const K = new Float32Array(N * 4);
	const R = new Float32Array(N);
	for (let i = 0; i < N; i++) R[i] = Math.random();
	[design, build, test, ship].forEach((fn, i) => {
		const w = writer(P[i], K, i);
		fn(w.put, w.left);
	});
	return { P, K, R };
}
