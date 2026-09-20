/**
 * The hero's WebGL backdrop: a domain-warped noise field in the brand palette.
 *
 * Deliberately dependency-free — a fragment shader on one triangle costs a few
 * kilobytes, where a scene library would cost hundreds and land on the critical
 * path. This module is imported dynamically and only on hardware that asked for
 * it; the CSS backdrop underneath is what everyone else sees.
 */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;

float hash21(vec2 p) {
	p = fract(p * vec2(123.34, 456.21));
	p += dot(p, p + 45.32);
	return fract(p.x * p.y);
}

float vnoise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	float a = hash21(i);
	float b = hash21(i + vec2(1.0, 0.0));
	float c = hash21(i + vec2(0.0, 1.0));
	float d = hash21(i + vec2(1.0, 1.0));
	return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
	float v = 0.0;
	float a = 0.5;
	mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
	for (int i = 0; i < 5; i++) {
		v += a * vnoise(p);
		p = m * p;
		a *= 0.5;
	}
	return v;
}

void main() {
	vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
	p += u_mouse * 0.085;

	float t = u_time * 0.05;

	// Squashing x stretches the noise into ribbons rather than blobs.
	vec2 sp = vec2(p.x * 0.52, p.y * 1.45);

	vec2 w1 = vec2(fbm(sp + vec2(0.0, t)), fbm(sp + vec2(4.1, 1.7) - t * 0.72));
	float f1 = fbm(sp + 2.4 * w1);

	vec2 w2 = vec2(fbm(sp * 1.45 + vec2(2.8, -t * 0.94)), fbm(sp * 1.45 + vec2(7.3, t * 0.61)));
	float f2 = fbm(sp * 1.45 + 2.1 * w2 + 3.0);

	vec3 ember  = vec3(1.000, 0.390, 0.130);
	vec3 teal   = vec3(0.290, 0.950, 0.830);
	vec3 violet = vec3(0.470, 0.290, 1.000);

	// Additive, never mixed: mixing complementary hues only makes grey.
	// Ember carries the most weight because it is the page accent, and teal
	// the least because it has far the highest luminance of the three.
	vec3 col = vec3(0.0);
	col += ember * pow(smoothstep(0.40, 0.70, f1), 1.25) * 2.10;
	col += violet * pow(smoothstep(0.44, 0.74, (f1 + f2) * 0.5), 1.60) * 1.00;
	col += teal * pow(smoothstep(0.50, 0.74, f2), 1.90) * 0.38;

	// Thin filaments where the two fields cross. These are what make it read
	// as aurora rather than fog — the contrast matters more than the glow.
	float seam = pow(clamp(1.0 - abs(f1 - f2) * 9.0, 0.0, 1.0), 2.0);
	float seam2 = pow(clamp(1.0 - abs(f1 + f2 - 1.04) * 8.0, 0.0, 1.0), 2.4);
	col += mix(ember, vec3(1.0), 0.20) * seam * 1.70;
	col += mix(teal, vec3(1.0), 0.18) * seam2 * 0.50;

	// Diagonal composition: darkest at the lower left where the page begins,
	// opening up toward the top right.
	float lit = smoothstep(-0.75, 0.85, p.x * 0.62 + p.y * 0.95 + 0.10);

	// A soft pocket of shadow behind the headline block, so the type never
	// has to fight the backdrop for contrast.
	vec2 cz = (p - vec2(-0.20, 0.04)) * vec2(0.90, 2.40);
	float copyShadow = 1.0 - 0.88 * exp(-dot(cz, cz) * 1.05);

	// Asymmetric trim. The bottom is a section seam against flat page colour,
	// so it fades earlier; the top only has to clear the fixed nav bar.
	float topFade = smoothstep(0.500, 0.395, p.y);
	float botFade = smoothstep(0.500, 0.315, -p.y);
	float vfade = mix(botFade, topFade, step(0.0, p.y));

	col *= lit * copyShadow * vfade * 3.6;

	// Filmic roll-off: without it the cores clip to white and stop looking
	// like they belong to the rest of the page.
	col = (vec3(1.0) - exp(-col * 2.0)) * 0.70;

	vec3 bg = vec3(0.031, 0.035, 0.043);
	col += bg;

	// Dither: these gradients band badly on 8-bit panels without it.
	col += (hash21(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.018;

	gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
	const sh = gl.createShader(type);
	if (!sh) return null;
	gl.shaderSource(sh, src);
	gl.compileShader(sh);
	if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
		gl.deleteShader(sh);
		return null;
	}
	return sh;
}

export interface Aurora {
	play(): void;
	pause(): void;
	stop(): void;
}

export function startAurora(canvas: HTMLCanvasElement): Aurora | null {
	const gl = canvas.getContext('webgl', {
		alpha: false,
		antialias: false,
		depth: false,
		stencil: false,
		preserveDrawingBuffer: false,
		powerPreference: 'low-power'
	}) as WebGLRenderingContext | null;
	if (!gl) return null;

	const vs = compile(gl, gl.VERTEX_SHADER, VERT);
	const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
	if (!vs || !fs) return null;

	const prog = gl.createProgram();
	if (!prog) return null;
	gl.attachShader(prog, vs);
	gl.attachShader(prog, fs);
	gl.linkProgram(prog);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
	gl.useProgram(prog);

	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
	const loc = gl.getAttribLocation(prog, 'a_pos');
	gl.enableVertexAttribArray(loc);
	gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

	const uRes = gl.getUniformLocation(prog, 'u_res');
	const uTime = gl.getUniformLocation(prog, 'u_time');
	const uMouse = gl.getUniformLocation(prog, 'u_mouse');

	// The field is low-frequency, so half resolution is indistinguishable once
	// the browser scales the canvas back up — and costs a quarter of the fill.
	const SCALE = 0.5;

	function resize() {
		const w = Math.max(1, Math.round(canvas.clientWidth * SCALE));
		const h = Math.max(1, Math.round(canvas.clientHeight * SCALE));
		if (canvas.width === w && canvas.height === h) return;
		canvas.width = w;
		canvas.height = h;
		gl!.viewport(0, 0, w, h);
		gl!.uniform2f(uRes, w, h);
	}

	let raf = 0;
	let running = false;
	let last = performance.now();
	let elapsed = 0;
	let mx = 0;
	let my = 0;
	let tx = 0;
	let ty = 0;

	function onPointer(e: PointerEvent) {
		tx = (e.clientX / window.innerWidth) * 2 - 1;
		ty = 1 - (e.clientY / window.innerHeight) * 2;
	}

	function frame(now: number) {
		if (!running) return;
		// Clamp the step so a backgrounded tab does not jump the animation.
		const dt = Math.min(now - last, 50);
		last = now;
		elapsed += dt;

		mx += (tx - mx) * 0.045;
		my += (ty - my) * 0.045;

		resize();
		gl!.uniform1f(uTime, elapsed / 1000);
		gl!.uniform2f(uMouse, mx, my);
		gl!.drawArrays(gl!.TRIANGLES, 0, 3);

		raf = requestAnimationFrame(frame);
	}

	const onVisibility = () => (document.hidden ? pause() : play());
	const onLost = (e: Event) => {
		e.preventDefault();
		pause();
	};

	function play() {
		if (running || document.hidden) return;
		running = true;
		last = performance.now();
		raf = requestAnimationFrame(frame);
	}

	function pause() {
		running = false;
		cancelAnimationFrame(raf);
	}

	resize();
	// One frame immediately, so the canvas is never shown empty.
	gl.uniform1f(uTime, 0);
	gl.uniform2f(uMouse, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, 3);

	window.addEventListener('pointermove', onPointer, { passive: true });
	document.addEventListener('visibilitychange', onVisibility);
	canvas.addEventListener('webglcontextlost', onLost);

	return {
		play,
		pause,
		stop() {
			pause();
			window.removeEventListener('pointermove', onPointer);
			document.removeEventListener('visibilitychange', onVisibility);
			canvas.removeEventListener('webglcontextlost', onLost);
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		}
	};
}
