import { Result } from '@/shared/domain/types/result.type';

export interface JwtPayload {
  id: string;
  email: string;
  [key: string]: any;
}

export abstract class TokenProvider {
  abstract generateAccessToken(payload: JwtPayload): Promise<Result<string>>;
  abstract generateRefreshToken(payload: JwtPayload): Promise<Result<string>>;
  abstract verifyToken(token: string): Promise<Result<JwtPayload>>;
}
