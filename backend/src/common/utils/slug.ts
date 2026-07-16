export function generateSlug(
  value: string,
  suffix?: string | number,
): string {
  let slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  if (suffix !== undefined) {
    slug = `${slug}-${suffix}`;
  }

  return slug;
}