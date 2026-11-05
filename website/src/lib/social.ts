import type { OutboundDestination } from './analytics';

const HOSTS: Record<OutboundDestination, string> = {
  pinterest: 'pinterest.com',
  instagram: 'instagram.com',
};

export interface SocialLink {
  label: string;
  href: string;
  destination: OutboundDestination;
}

/** Which known social site an https URL points at, or undefined for anything else. */
export function socialDestination(href: string): OutboundDestination | undefined {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return undefined;
  }
  if (url.protocol !== 'https:' || url.username !== '' || url.password !== '') return undefined;
  const host = url.hostname.toLowerCase();
  for (const [destination, base] of Object.entries(HOSTS)) {
    if (host === base || host.endsWith(`.${base}`)) return destination as OutboundDestination;
  }
  return undefined;
}

/** Keeps only well-formed links to the known social sites, so a typo cannot ship a bad link. */
export function sanitizeSocialLinks(links: readonly { label: string; href: string }[]): SocialLink[] {
  const out: SocialLink[] = [];
  for (const { label, href } of links) {
    const destination = socialDestination(href);
    if (destination && label.trim() !== '') out.push({ label: label.trim(), href, destination });
  }
  return out;
}
