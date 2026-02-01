import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '@/auth/domain/interfaces/token-provider.interface';
import { env } from '@/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const cookies = request.cookies as Record<string, string> | undefined;
          return cookies?.access_token ?? null;
        },
      ]),
      ignoreExpiration: true,
      secretOrKey: Buffer.from(env.JWT_PUBLIC_KEY, 'base64').toString('ascii'),
      algorithms: ['RS256'],
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.id, email: payload.email };
  }
}
