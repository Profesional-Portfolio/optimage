import { env } from '@/config/env';

export const jwtConfig = {
  privateKey: Buffer.from(env.JWT_PRIVATE_KEY, 'base64').toString('ascii'),
  publicKey: Buffer.from(env.JWT_PUBLIC_KEY, 'base64').toString('ascii'),
};
