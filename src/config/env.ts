import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  // Application
  APPLICATION_PORT: z.coerce.number(),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  // JWT
  JWT_PUBLIC_KEY: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  // SMTP
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_FROM_EMAIL: z.string(),
  SMTP_FROM_NAME: z.string(),
  SMTP_SECURE: z.coerce.boolean().default(false),
  // Database
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  // AWS S3
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_S3_BUCKET: z.string(),
  // Sotrage mode
  STORAGE_MODE: z.enum(['local', 's3']).default('local'),
  // Redis
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
});

export type EnvType = z.infer<typeof envSchema>;

const { success, error, data } = envSchema.safeParse(process.env);

if (!success) {
  throw new Error(error.message);
}

export const env = data;
