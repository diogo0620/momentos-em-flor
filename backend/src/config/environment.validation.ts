const PRODUCTION_REQUIRED_VARIABLES = [
  'DATABASE_URL',
  'FRONTEND_URL',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'GOOGLE_MAPS_API_KEY',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'SUPABASE_URL',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_PRODUCT_IMAGES_BUCKET',
] as const;

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  if (config.NODE_ENV !== 'production') return config;

  const missing = PRODUCTION_REQUIRED_VARIABLES.filter(
    (name) => typeof config[name] !== 'string' || !String(config[name]).trim(),
  );

  if (missing.length > 0) {
    throw new Error(
      `Configuração de produção incompleta: ${missing.join(', ')}.`,
    );
  }

  if (String(config.JWT_SECRET).length < 32) {
    throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres.');
  }

  for (const name of ['FRONTEND_URL'] as const) {
    if (!String(config[name]).startsWith('https://')) {
      throw new Error(`${name} deve utilizar HTTPS em produção.`);
    }
  }

  return config;
}
