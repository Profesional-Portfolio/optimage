import { AuthRepository } from '../../domain/repositories/auth.repository';
import { User } from '../../domain/entities/user.entity';
import { failure, Result, success } from '@/shared/domain/types/result.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(userId: string): Promise<Result<User>> {
    const [error, user] = await this.repository.findById(userId);

    if (error) return failure(error);
    if (!user || !user.isActive) {
      return failure(new Error('User not found or inactive'));
    }

    return success(user);
  }
}
