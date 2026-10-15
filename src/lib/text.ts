import type { Lang } from './content';

/*
 * Splits copy into the spans the animations need — characters for the hero,
 * words for section titles and the manifesto — at render time, so the
 * prerendered HTML already carries them and nothing reflows on hydration.
 *
 * Copy may mark `*emphasis*` and `\n` line breaks; see content.ts.
 */

type Token = { t: string; em: boolean; space: boolean };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const segmenters = new Map<Lang, Intl.Segmenter>();
const segmenter = (lang: Lang) => {
	let s = segmenters.get(lang);
	if (!s) segmenters.set(lang, (s = new Intl.Segmenter(lang, { granularity: 'word' })));
	return s;
};

/**
 * Words of one line. Chinese has no spaces, so it is cut by the browser's own
 * word segmenter; punctuation stays glued to the word before it so a line
 * never starts with a comma.
 */
function tokens(line: string, lang: Lang): Token[] {
	const out: Token[] = [];
	let space = false;
	for (const [i, part] of line.split('*').entries()) {
		const em = i % 2 === 1;
		for (const seg of segmenter(lang).segment(part)) {
			if (/^\s+$/.test(seg.segment)) {
				space = out.length > 0;
				continue;
			}
			const prev = out[out.length - 1];
			if (!seg.isWordLike && prev && !space && prev.em === em) prev.t += seg.segment;
			else out.push({ t: seg.segment, em, space });
			space = false;
		}
	}
	return out;
}

const lines = (text: string) => text.split('\n');

/** Text without markup, for `aria-label`s and titles. */
export const plain = (text: string) => text.replace(/\*/g, '').replace(/\n/g, ' ');

/** Hero headline: one `.ch` per character, words kept unbreakable. */
export function splitChars(text: string, lang: Lang) {
	let i = 0;
	return lines(text)
		.map((line) => {
			const words = tokens(line, lang).map((tok) => {
				const chars = [...tok.t]
					.map((c) => `<span class="ch" style="--i:${i++}">${esc(c)}</span>`)
					.join('');
				const w = `<span class="w">${chars}</span>`;
				return (tok.space ? ' ' : '') + (tok.em ? `<em>${w}</em>` : w);
			});
			return `<span class="line" aria-hidden="true">${words.join('')}</span>`;
		})
		// a space between the block-level lines, so the text reads as words
		.join(' ');
}

/** Section titles: words rise out of a mask. Lines after the first are dimmed. */
export function splitWords(text: string, lang: Lang, { dimRest = true } = {}) {
	let i = 0;
	return lines(text)
		.map((line, n) => {
			const html = tokens(line, lang)
				.map((tok) => {
					const t = tok.em ? `<em>${esc(tok.t)}</em>` : esc(tok.t);
					return (tok.space ? ' ' : '') + `<span class="sw"><span style="--i:${i++}">${t}</span></span>`;
				})
				.join('');
			return n > 0 && dimRest ? `<span class="dim">${html}</span>` : html;
		})
		.join('<br />');
}

/**
 * Odometer: each digit is a column of 0–9 three times over, rolled to its
 * place in the third run, so every digit spins past twenty numbers first.
 */
export function odometer(value: string) {
	let k = 0;
	return [...value]
		.map((ch) => {
			if (!/\d/.test(ch)) return `<span aria-hidden="true">${esc(ch)}</span>`;
			const to = 20 + Number(ch);
			const col = Array.from({ length: 30 }, (_, n) => `<span>${n % 10}</span>`).join('');
			return `<span class="odo-d" aria-hidden="true"><span class="odo-s" style="--k:${k++};--to:${to}" data-to="${to}">${col}</span></span>`;
		})
		.join('');
}

/** Manifesto: one `.wd` per word, lit one after another by scrolling. */
export function splitManifesto(text: string, lang: Lang) {
	return tokens(text, lang)
		.map(
			(tok) =>
				(tok.space ? ' ' : '') +
				(tok.em ? `<span class="wd hl"><em>${esc(tok.t)}</em></span>` : `<span class="wd">${esc(tok.t)}</span>`)
		)
		.join('');
}
