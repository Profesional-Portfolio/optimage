import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  APPLICATION_PORT: z.coerce.string(),
  JWT_PUBLIC_KEY: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_FROM_EMAIL: z.string(),
  SMTP_FROM_NAME: z.string(),
  SMTP_SECURE: z.string().default('false'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
});

export type EnvType = z.infer<typeof envSchema>;

const { success, error, data } = envSchema.safeParse(process.env);

if (!success) {
  throw new Error(error.message);
}

export const env = data;
