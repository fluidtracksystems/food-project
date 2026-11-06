import type { ContactOutcome } from '../lib/contact';

/** Imported only by the DEV branch. It never replaces global fetch or calls the API. */
export function previewContact(mode: string | null): () => Promise<ContactOutcome> {
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, mode === 'submitting' ? 8000 : 600));
    switch (mode) {
      case 'success':
      case 'submitting':
        return { kind: 'sent' };
      case 'validation':
        return { kind: 'invalid', fields: { name: 'Enter your name on one line, using no more than 100 characters.', email: 'Enter a plain email address, using no more than 254 characters.', message: 'Enter a message, using no more than 5,000 characters.' } };
      case 'limited':
        return { kind: 'limited' };
      case 'network':
        return { kind: 'network' };
      default:
        return { kind: 'failed' };
    }
  };
}
