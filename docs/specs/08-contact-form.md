# Contact form

The static `/contact/` page posts contact messages to the existing same-origin PHP endpoint at
`/api/contact.php`. QuantityHost's separate repository owns that endpoint and the shared PHP backend.
This project contains no PHP or server adapter. Contact messages are separate from newsletter signups.

The visitor-facing email address is configured once as `CONTACT_EMAIL` in `website/src/lib/site.ts`.
The owner approved publishing `food@quantityhost.com` on 6 November 2026.

## Integration

Send exactly `name`, `email`, `message`, and the normally empty `hp_check` using
`application/x-www-form-urlencoded`. The service controls recipients, senders, subjects and limits.
Only HTTP 200 with JSON `ok: true` confirms success. Field errors use HTTP 422; HTTP 429 means wait
before trying again. Other responses and network errors keep the visitor's entered values.

HostGator can intercept a first submission with HTTP 409 and a cookie-assignment script. The client
extracts the assignment as data, sets a path-scoped cookie, and retries the identical POST once.
It never executes the response script or inserts response HTML. A second challenge is a failure.

No contact fields are sent to analytics or persisted in browser storage. Server field errors must be
rendered as text. Client constraints are convenience checks; the server remains authoritative.

The contact script is deliberately excluded from Astro's small-script inlining via a narrowly scoped
`assetsInlineLimit` callback in `astro.config.mjs`. Other assets retain their default build behavior.

## Verification and deployment

Run `npm test`, `npm run check`, and `npm run build` from the repository root. Check the generated
`website/dist/contact/index.html`, canonical URL, sitemap entry, and bundled `_astro/` JavaScript.
The development preview must be absent from production output.

Implementation verification on 6 November 2026: 433 tests passed (15 contact tests); type checking
and the static build passed. Local browser checks covered all outcome states, reset/restart, retained
values, validation focus, duplicate submission, keyboard navigation, and 375px light/dark layouts.
The build contained the hashed contact script and correct canonical/sitemap entry, with no preview
code. Code and security reviews found no blocking issues.

After owner deployment, one authorized submission from a fresh isolated browser session received
HTTP 409, retried once, and received HTTP 200 with `{"ok":true}`. The success/reset flow worked,
and the owner confirmed receipt of the test email. Reply-To and SPF/DKIM headers were not inspected.

The Astro dev server and static preview cannot run the PHP endpoint. Use the development mock
described below for local form states; automated tests mock fetch and never contact the live service.

Run `npm run dev`, then open `/contact/?contact-preview=success` on the local URL printed by Astro.
Replace `success` with `validation`, `limited`, `failed`, `network`, or `submitting` to preview each
state. Enter native-valid values and submit; `submitting` delays the result for eight seconds so you
can check the disabled button and double-submit prevention. All development submissions are mocked;
without a recognized mode the form shows the generic failure state. No email is sent. Static
`npm run preview` serves the production build, where these mock modes are unavailable.

Upload the contents of `website/dist/` only when approved. Preserve the existing server `api/` folder
and its configuration: do not use an upload mode that deletes remote files absent from the build.
The backend is managed and deployed from the QuantityHost project.

## Manual check after deployment

Ask the owner before sending the one real message: it sends email and consumes one of the visitor's
three hourly slots. Do not run this as an automated test.

1. Open a fresh private window and visit `https://food.quantityhost.com/contact/`.
2. Submit one valid message with an address you can reply from. The first submission should handle
   any HostGator challenge automatically, with at most one retry and no duplicate delivery.
3. Confirm the success message, cleared fields, and keyboard access to “send another”.
4. Confirm receipt in the food mailbox (including spam), correct site/subject, and Reply-To. Check
   SPF/DKIM results in the received message headers.
5. Check required-field validation without sending another valid message. Use local mocks for
   rate limits and failures rather than spending live sending slots.
