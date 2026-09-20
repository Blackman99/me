import type { Action } from 'svelte/action';

/**
 * Adds `.in-view` the first time an element crosses into the viewport.
 *
 * IntersectionObserver rather than `animation-timeline: view()` because this
 * has to behave identically in every browser a recruiter might open — the
 * scroll-linked CSS below is progressive enhancement only.
 */
export const reveal: Action<HTMLElement, { threshold?: number; once?: boolean } | undefined> = (
	node,
	options
) => {
	const threshold = options?.threshold ?? 0.18;
	const once = options?.once ?? true;

	if (typeof IntersectionObserver === 'undefined') {
		node.classList.add('in-view');
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.classList.add('in-view');
					if (once) observer.unobserve(node);
				} else if (!once) {
					node.classList.remove('in-view');
				}
			}
		},
		{ threshold, rootMargin: '0px 0px -8% 0px' }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
};

/** Reports which section is currently filling the viewport. */
export function trackSections(ids: string[], onChange: (id: string) => void) {
	if (typeof IntersectionObserver === 'undefined') return () => {};

	const observer = new IntersectionObserver(
		(entries) => {
			const visible = entries
				.filter((e) => e.isIntersecting)
				.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
			if (visible) onChange(visible.target.id);
		},
		{ threshold: [0.35, 0.6] }
	);

	for (const id of ids) {
		const el = document.getElementById(id);
		if (el) observer.observe(el);
	}

	return () => observer.disconnect();
}
