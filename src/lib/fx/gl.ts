import { FS_HERO, FS_PTS, VS_PTS, VS_QUAD } from './shaders';
import { N, buildShapes } from './shapes';

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
	scale: number;
	render(time: number, mouse: { x: number; y: number }, scroll: number, cam: number, pal: RGB[]): void;
	destroy(): void;
}

export function initHero(cv: HTMLCanvasElement): Hero | null {
	const gl = context(cv);
	if (!gl) return null;
	let prg: ReturnType<typeof program>;
	try {
		prg = program(gl, VS_QUAD, FS_HERO);
	} catch (err) {
		console.error(err);
		return null;
	}
	const vao = gl.createVertexArray();
	let scale = 0.62;
	return {
		gpu: gpuName(gl),
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

export interface Particles {
	render(o: { m: number; spin: number; tilt: number; time: number; dpr: number; pal: RGB[] }): void;
	destroy(): void;
}

export function initParticles(cv: HTMLCanvasElement): Particles | null {
	const gl = context(cv);
	if (!gl) return null;
	let prg: ReturnType<typeof program>;
	try {
		prg = program(gl, VS_PTS, FS_PTS);
	} catch (err) {
		console.error(err);
		return null;
	}
	const { P, K, R } = buildShapes();
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
	attr(5, K, 4);
	return {
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
