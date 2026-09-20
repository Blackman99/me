import type { Handle } from '@sveltejs/kit';

/** Stamps the right `lang` on the prerendered HTML for each locale route. */
export const handle: Handle = ({ event, resolve }) =>
	resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('%lang%', event.url.pathname.includes('/zh') ? 'zh-CN' : 'en')
	});
