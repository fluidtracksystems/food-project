/**
 * Serializes data for a <script type="application/ld+json"> block.
 * Escapes "<" so recipe text can never close the script tag.
 */
export function toJsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
