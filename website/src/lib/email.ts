/**
 * The email provider's form endpoint, from `PUBLIC_EMAIL_FORM_ACTION`. Only an https URL without
 * embedded credentials is accepted; anything else counts as "not configured", so the signup form
 * is not shown and cannot post an address anywhere unsafe. The form itself relies on the
 * browser's `type="email"` validation.
 */
export function resolveSignupAction(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return undefined;
  }
  if (url.protocol !== 'https:' || url.username !== '' || url.password !== '') return undefined;
  return url.href;
}
