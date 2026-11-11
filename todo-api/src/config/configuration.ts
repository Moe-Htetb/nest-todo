const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env and configure it.`,
    );
  }
  return value;
};

const isProduction = process.env.NODE_ENV === 'production';

export const configuration = () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: requireEnv('DB_HOST'),
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: requireEnv('DB_USERNAME'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_DATABASE'),
    synchronize: !isProduction,
  },
});

export type AppConfig = ReturnType<typeof configuration>;
