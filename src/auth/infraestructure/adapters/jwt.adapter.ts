import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { env } from '@/config';
import type {
  JwtPayload,
  TokenProvider,
} from '@/auth/domain/interfaces/token-provider.interface';
import { failure, Result, success } from '@/shared/domain/types/result.type';
import { jwtConfig } from '@/config';

@Injectable()
export class JwtAdapter implements TokenProvider {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(payload: JwtPayload): Promise<Result<string>> {
    try {
      const token = await this.jwtService.signAsync(payload, {
        privateKey: jwtConfig.privateKey,
        algorithm: 'RS256',
        expiresIn: +env.JWT_EXPIRES_IN,
      } satisfies JwtSignOptions);
      return success(token);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async generateRefreshToken(payload: JwtPayload): Promise<Result<string>> {
    try {
      const token = await this.jwtService.signAsync(payload, {
        privateKey: jwtConfig.privateKey,
        algorithm: 'RS256',
        expiresIn: +env.REFRESH_TOKEN_EXPIRES_IN,
      } satisfies JwtSignOptions);
      return success(token);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async verifyToken(token: string): Promise<Result<JwtPayload>> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        publicKey: jwtConfig.publicKey,
        algorithms: ['RS256'],
      } satisfies JwtVerifyOptions);
      return success(payload);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
