import { CONTACT_FIELDS, sendContact, type ContactField, type ContactOutcome } from '../lib/contact';

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');

if (form) {
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const status = document.querySelector<HTMLElement>('[data-contact-status]')!;
  const error = document.querySelector<HTMLElement>('[data-contact-error]')!;
  const errorCopy = error.querySelector<HTMLElement>('[data-error-copy]')!;
  const success = document.querySelector<HTMLElement>('[data-contact-success]')!;
  const restart = success.querySelector<HTMLButtonElement>('button')!;
  const email = form.dataset.contactEmail ?? '';
  let pending = false;
  let submit = (data: FormData): Promise<ContactOutcome> => sendContact(data, {
    fetch: window.fetch.bind(window),
    setCookie: (cookie) => { document.cookie = cookie; },
  });

  // Local development always uses an injected mock: the dev server has no PHP.
  // Dynamic import and mock strings disappear from the production build.
  if (import.meta.env.DEV) {
    const mode = new URLSearchParams(location.search).get('contact-preview');
    submit = async () => {
      const { previewContact } = await import('./contact-preview');
      return previewContact(mode)();
    };
    const note = document.createElement('p');
    note.className = 'meta';
    note.textContent = mode
      ? `Local contact preview: ${mode}. No message will be sent.`
      : 'Local contact preview: choose ?contact-preview=success, validation, limited, failed, network or submitting. No message will be sent.';
    form.before(note);
  }

  const input = (field: ContactField) => form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement;
  const clearErrors = () => {
    error.hidden = true;
    errorCopy.textContent = '';
    for (const field of CONTACT_FIELDS) {
      input(field).removeAttribute('aria-invalid');
      document.getElementById(`contact-${field}-error`)!.textContent = '';
    }
  };
  const showError = (message: string) => {
    errorCopy.textContent = message;
    error.hidden = false;
    error.focus();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending) return;
    pending = true;
    clearErrors();
    status.textContent = 'Sending your message…';
    button.disabled = true;
    button.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    const outcome = await submit(new FormData(form));
    pending = false;
    button.disabled = false;
    button.textContent = 'Send message';
    form.removeAttribute('aria-busy');
    status.textContent = '';

    switch (outcome.kind) {
      case 'sent':
        form.reset();
        form.hidden = true;
        success.hidden = false;
        status.textContent = 'Your message has been sent.';
        success.focus();
        break;
      case 'invalid': {
        errorCopy.textContent = 'Please check the marked fields and try again.';
        error.hidden = false;
        let first: ContactField | undefined;
        for (const field of CONTACT_FIELDS) {
          const message = outcome.fields[field];
          if (!message) continue;
          input(field).setAttribute('aria-invalid', 'true');
          document.getElementById(`contact-${field}-error`)!.textContent = message;
          first ??= field;
        }
        if (first) input(first).focus();
        break;
      }
      case 'limited':
        showError('Too many messages have been sent recently. Please try again in an hour, or email us below.');
        break;
      case 'network':
        showError('We could not connect to send your message. Check your connection, then try again or email us below. Your message is still here.');
        break;
      default:
        showError('We could not send your message. Please try again or email us below. Your message is still here.');
    }
  });

  // The address is rendered by Astro from site configuration; never from a response.
  button.disabled = !email;
  restart.addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
    status.textContent = '';
    clearErrors();
    input('name').focus();
  });
}
