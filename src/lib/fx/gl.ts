import { FS_HERO, FS_PTS, VS_PTS, VS_QUAD } from './shaders';

type RGB = [number, number, number];
type Uniforms = Record<string, WebGLUniformLocation | null>;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function program(gl: WebGL2RenderingContext, vs: string, fs: string) {
	const sh = (type: number, src: string) => {
		const s = gl.createShader(type)!;
		gl.shaderSource(s, src);
		gl.compileShader(s);
		if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
		return s;
	};
	const p = gl.createProgram()!;
	gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
	gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
	gl.linkProgram(p);
	if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link');
	const u: Uniforms = {};
	for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++) {
		const name = gl.getActiveUniform(p, i)!.name;
		u[name] = gl.getUniformLocation(p, name);
	}
	return { p, u };
}

/** "Apple M2 Pro" rather than the full ANGLE string. */
function gpuName(gl: WebGL2RenderingContext) {
	const ext = gl.getExtension('WEBGL_debug_renderer_info');
	const raw = String((ext && gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) || gl.getParameter(gl.RENDERER) || 'unknown');
	const m = raw.match(/Renderer: ([^,)]+)/) || raw.match(/^ANGLE \([^,]+, ([^,(]+)/);
	const name = (m ? m[1] : raw).replace(/\s+/g, ' ').trim();
	return name.length > 34 ? name.slice(0, 33) + '…' : name;
}

const lose = (gl: WebGL2RenderingContext) => gl.getExtension('WEBGL_lose_context')?.loseContext();

const context = (cv: HTMLCanvasElement) =>
	cv.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });

/* ------------------------------------------------------------------ hero */

export interface Hero {
	gpu: string;
	ms: number;
	scale: number;
	render(time: number, mouse: { x: number; y: number }, scroll: number, cam: number, pal: RGB[]): void;
	destroy(): void;
}

export function initHero(cv: HTMLCanvasElement): Hero | null {
	const gl = context(cv);
	if (!gl) return null;
	const t0 = performance.now();
	let prg: ReturnType<typeof program>;
	try {
		prg = program(gl, VS_QUAD, FS_HERO);
	} catch (err) {
		console.error(err);
		return null;
	}
	gl.finish();
	const vao = gl.createVertexArray();
	let scale = 0.62;
	return {
		gpu: gpuName(gl),
		ms: Math.round(performance.now() - t0),
		get scale() {
			return scale;
		},
		set scale(v) {
			scale = clamp(v, 0.28, 0.8);
		},
		render(time, m, scroll, cam, pal) {
			const w = Math.max(2, Math.round(cv.clientWidth * scale));
			const h = Math.max(2, Math.round(cv.clientHeight * scale));
			if (cv.width !== w || cv.height !== h) {
				cv.width = w;
				cv.height = h;
			}
			gl.viewport(0, 0, w, h);
			gl.useProgram(prg.p);
			gl.bindVertexArray(vao);
			gl.uniform2f(prg.u.uRes, w, h);
			gl.uniform1f(prg.u.uTime, time);
			gl.uniform1f(prg.u.uScroll, scroll);
			gl.uniform1f(prg.u.uCam, cam);
			gl.uniform3f(prg.u.uMouse, m.x, m.y, 0);
			gl.uniform3fv(prg.u.uA, pal[0]);
			gl.uniform3fv(prg.u.uB, pal[1]);
			gl.uniform3fv(prg.u.uC, pal[2]);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		},
		destroy: () => lose(gl)
	};
}

/* ------------------------------------------------------------- particles */

export const N = 24000;

/** Four point clouds of N points each: glyph, sphere, torus knot, galaxy. */
function buildShapes(glyph: string, font: string) {
	const P = [0, 1, 2, 3].map(() => new Float32Array(N * 3));
	const R = new Float32Array(N);
	const g = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

	// 0 — the glyph, sampled from a 2D canvas sized to fit the letters
	const fs = 300;
	const c = document.createElement('canvas');
	const x = c.getContext('2d', { willReadFrequently: true })!;
	x.font = `700 ${fs}px ${font}`;
	const tw = Math.ceil(x.measureText(glyph).width);
	const w = (c.width = tw + 40);
	const h = (c.height = Math.round(fs * 1.15));
	x.font = `700 ${fs}px ${font}`;
	x.fillStyle = '#fff';
	x.textAlign = 'center';
	x.textBaseline = 'middle';
	x.fillText(glyph, w / 2, h / 2 + fs * 0.04);
	const d = x.getImageData(0, 0, w, h).data;
	const pts: number[] = [];
	for (let yy = 0; yy < h; yy += 2)
		for (let xx = 0; xx < w; xx += 2) if (d[(yy * w + xx) * 4 + 3] > 128) pts.push(xx, yy);
	// as wide as the sphere that follows, and never taller than it
	const sc = Math.min(3.4 / tw, 2.1 / fs);
	for (let i = 0; i < N; i++) {
		const k = ((Math.random() * pts.length) >> 1) << 1;
		P[0][i * 3] = (pts[k] - w / 2 + Math.random() * 2) * sc;
		P[0][i * 3 + 1] = -(pts[k + 1] - h / 2 + Math.random() * 2) * sc;
		P[0][i * 3 + 2] = (Math.random() - 0.5) * 0.25;
		R[i] = Math.random();
	}
	// 1 — fibonacci sphere with a dusty outer shell
	const ga = Math.PI * (3 - Math.sqrt(5));
	for (let i = 0; i < N; i++) {
		const y = 1 - (i / (N - 1)) * 2;
		const r = Math.sqrt(1 - y * y);
		const th = ga * i;
		const rad = 1.5 * (i % 6 === 0 ? 1.1 + Math.random() * 0.7 : 1);
		P[1][i * 3] = Math.cos(th) * r * rad;
		P[1][i * 3 + 1] = y * rad;
		P[1][i * 3 + 2] = Math.sin(th) * r * rad;
	}
	// 2 — (2,3) torus knot with a tube
	for (let i = 0; i < N; i++) {
		const t = Math.random() * Math.PI * 2;
		const rr = 2 + Math.cos(3 * t);
		const u = Math.random() * Math.PI * 2;
		const v = Math.acos(2 * Math.random() - 1);
		const tube = 0.34 * (0.8 + 0.2 * Math.random());
		P[2][i * 3] = (rr * Math.cos(2 * t) + tube * Math.sin(v) * Math.cos(u)) * 0.55;
		P[2][i * 3 + 1] = (rr * Math.sin(2 * t) + tube * Math.sin(v) * Math.sin(u)) * 0.55;
		P[2][i * 3 + 2] = (-Math.sin(3 * t) + tube * Math.cos(v)) * 0.55;
	}
	// 3 — three-armed spiral galaxy with a core
	for (let i = 0; i < N; i++) {
		let px: number, py: number, pz: number;
		if (i % 9 === 0) {
			px = g() * 0.35;
			py = g() * 0.22;
			pz = g() * 0.35;
		} else {
			const rr = Math.pow(Math.random(), 0.6) * 2.3;
			const a = (i % 3) * ((Math.PI * 2) / 3) + rr * 2.2;
			const s = 0.07 + (0.4 * rr) / 2.3;
			px = Math.cos(a) * rr + g() * s;
			pz = Math.sin(a) * rr + g() * s;
			py = g() * 0.12 * (1.25 - rr / 2.3);
		}
		P[3][i * 3] = px;
		P[3][i * 3 + 1] = py;
		P[3][i * 3 + 2] = pz;
	}
	return { P, R };
}

export interface Particles {
	ms: number;
	render(o: { m: number; spin: number; tilt: number; time: number; dpr: number; pal: RGB[] }): void;
	destroy(): void;
}

export function initParticles(cv: HTMLCanvasElement, glyph: string, font: string): Particles | null {
	const gl = context(cv);
	if (!gl) return null;
	const t0 = performance.now();
	let prg: ReturnType<typeof program>;
	try {
		prg = program(gl, VS_PTS, FS_PTS);
	} catch (err) {
		console.error(err);
		return null;
	}
	const { P, R } = buildShapes(glyph, font);
	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	const attr = (loc: number, data: Float32Array, size: number) => {
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(loc);
		gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
	};
	P.forEach((d, i) => attr(i, d, 3));
	attr(4, R, 1);
	gl.finish();
	return {
		ms: Math.round(performance.now() - t0),
		render(o) {
			const w = Math.round(cv.clientWidth * o.dpr);
			const h = Math.round(cv.clientHeight * o.dpr);
			if (cv.width !== w || cv.height !== h) {
				cv.width = w;
				cv.height = h;
			}
			gl.viewport(0, 0, w, h);
			gl.clearColor(0.024, 0.024, 0.031, 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.ONE, gl.ONE);
			gl.useProgram(prg.p);
			gl.bindVertexArray(vao);
			const asp = w / h;
			gl.uniform1f(prg.u.uMorph, o.m);
			gl.uniform1f(prg.u.uTime, o.time);
			gl.uniform1f(prg.u.uSize, 14 * o.dpr * clamp(h / o.dpr / 900, 0.7, 1.3));
			gl.uniform1f(prg.u.uAsp, asp);
			gl.uniform1f(prg.u.uFit, clamp(asp / 1.45, 0.42, 1));
			gl.uniform1f(prg.u.uTilt, o.tilt);
			gl.uniform1f(prg.u.uSpin, o.spin);
			gl.uniform3fv(prg.u.uA, o.pal[0]);
			gl.uniform3fv(prg.u.uB, o.pal[1]);
			gl.uniform3fv(prg.u.uC, o.pal[2]);
			gl.drawArrays(gl.POINTS, 0, N);
		},
		destroy: () => lose(gl)
	};
}
