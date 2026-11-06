import { BadRequestException } from '@nestjs/common';

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export function normalizePhoneNumber(value: string): string {
  const trimmed = value.trim();
  const withInternationalPrefix = trimmed.startsWith('00')
    ? `+${trimmed.slice(2)}`
    : trimmed;
  const normalized = `${withInternationalPrefix.startsWith('+') ? '+' : ''}${withInternationalPrefix.replace(/\D/g, '')}`;

  if (!E164_PATTERN.test(normalized)) {
    throw new BadRequestException(
      'O número de telefone deve incluir um prefixo internacional válido.',
    );
  }

  return normalized;
}

export function normalizeOptionalPhoneNumber(
  value: string | null | undefined,
): string | null | undefined {
  if (value === null || value === undefined || value.trim() === '') {
    return value;
  }
  return normalizePhoneNumber(value);
}
