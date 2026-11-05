// The address is rendered into href="mailto:...", so this is deliberately narrower than the full email
// standard: a plain local part, then dot-separated domain labels. That keeps query strings, fragments,
// quotes and markup out of the link. An unusual but valid address can be given as a different one.
const LABEL = '[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?';
const EMAIL = new RegExp(`^[A-Za-z0-9._+-]+@${LABEL}(?:\\.${LABEL})+$`);
const MAX_EMAIL_LENGTH = 254;

/** Whether a value is usable as the public contact address on the privacy page. */
export function isContactEmail(value: string): boolean {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  return v.length <= MAX_EMAIL_LENGTH && EMAIL.test(v);
}

export interface PrivacyConfig {
  /** The validated email form endpoint, or undefined when the signup is off. */
  signupEndpoint?: string;
  /** Who receives the addresses, named on the privacy page. */
  providerName?: string;
  /** Where people can send privacy requests. */
  contactEmail?: string;
}

/**
 * Problems that must be fixed before the site is built. Turning the email signup on without naming
 * who receives the addresses, or without a way to reach the site owner, would collect personal data
 * the privacy page cannot honestly describe, so the build fails instead.
 */
export function privacyProblems(config: PrivacyConfig): string[] {
  const problems: string[] = [];
  const signupOn = typeof config.signupEndpoint === 'string' && config.signupEndpoint.trim() !== '';
  const contact = (config.contactEmail ?? '').trim();

  if (signupOn && (config.providerName ?? '').trim() === '') {
    problems.push('The email signup is on, but EMAIL_PROVIDER_NAME in src/lib/site.ts is empty. Name the email provider.');
  }
  if (contact === '') {
    if (signupOn) {
      problems.push('The email signup is on, but CONTACT_EMAIL in src/lib/site.ts is empty. Add a contact address for privacy requests.');
    }
  } else if (!isContactEmail(contact)) {
    problems.push('CONTACT_EMAIL in src/lib/site.ts is not a valid email address.');
  }
  return problems;
}
