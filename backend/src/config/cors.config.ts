export function createCorsConfig() {
  const configuredOrigins = (
    process.env.CORS_ORIGINS ??
    process.env.FRONTEND_URL ??
    'http://localhost:3000'
  )
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  return {
    origin: configuredOrigins,
    credentials: true,
  };
}
