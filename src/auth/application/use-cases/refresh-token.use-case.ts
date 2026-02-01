import { AuthRepository } from '../../domain/repositories/auth.repository';
import { User } from '../../domain/entities/user.entity';
import { failure, Result, success } from '@/shared/domain/types/result.type';
import { Injectable } from '@nestjs/common';
import { TokenProvider } from '../../domain/interfaces/token-provider.interface';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly repository: AuthRepository,
    private readonly tokenProvider: TokenProvider,
  ) {}

  async execute(refreshToken: string): Promise<Result<User>> {
    const [errorVerify, payload] =
      await this.tokenProvider.verifyToken(refreshToken);

    if (errorVerify)
      return failure(new Error('Invalid or expired refresh token'));

    const [errorRepo, user] = await this.repository.findById(payload.id);

    if (errorRepo) return failure(errorRepo);
    if (!user || !user.isActive) {
      return failure(new Error('User not found or inactive'));
    }

    return success(user);
  }
}
