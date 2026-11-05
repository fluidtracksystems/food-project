import { track, type OutboundDestination } from '../lib/analytics';
import type { Pillar } from '../lib/pillar-list';

// One small delegated script for every page. Markup opts in with data attributes:
//   [data-track-recipe][data-track-pillar]  recipe_viewed, once on load
//   a[data-track-outbound="pinterest"]      outbound_click
//   form[data-track-signup="signup"]        email_signup, on submit (never the address)
// track() validates everything and drops anything invalid, so a bad attribute does nothing.
const page = location.pathname;

const viewed = document.querySelector<HTMLElement>('[data-track-recipe]');
if (viewed) {
  track('recipe_viewed', {
    slug: viewed.dataset.trackRecipe ?? '',
    pillar: (viewed.dataset.trackPillar ?? '') as Pillar,
  });
}

document.addEventListener('click', (event) => {
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-track-outbound]');
  if (!link) return;
  track('outbound_click', { destination: link.dataset.trackOutbound as OutboundDestination, page });
});

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || form.dataset.trackSignup === undefined) return;
  track('email_signup', { page, form: form.dataset.trackSignup });
});
