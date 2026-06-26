export default () => ({
  app: {
    name: process.env.APP_NAME ?? 'Momentos em Flor API',
    port: Number(process.env.PORT ?? 3001),
    environment: process.env.NODE_ENV ?? 'development',
  },
});