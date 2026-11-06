import type { CookieOptions } from 'express';

import { AUTH_CONSTANTS } from './constants/auth.constants';

export function getRefreshCookieOptions(
  includeMaxAge = false,
): CookieOptions {
  const configuredSameSite = process.env.COOKIE_SAME_SITE?.toLowerCase();
  const sameSite: CookieOptions['sameSite'] =
    configuredSameSite === 'strict' ||
    configuredSameSite === 'lax' ||
    configuredSameSite === 'none'
      ? configuredSameSite
      : process.env.NODE_ENV === 'production'
        ? 'none'
        : 'lax';

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/api/auth',
    ...(process.env.COOKIE_DOMAIN
      ? { domain: process.env.COOKIE_DOMAIN }
      : {}),
    ...(includeMaxAge
      ? {
          maxAge:
            AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_IN_DAYS *
            24 *
            60 *
            60 *
            1000,
        }
      : {}),
  };
}
