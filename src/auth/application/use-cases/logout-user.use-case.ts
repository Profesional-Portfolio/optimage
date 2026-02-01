import { Result, success } from '@/shared/domain/types/result.type';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { Injectable } from '@nestjs/common';
import { User } from '@/auth/domain/entities/user.entity';

@Injectable()
export class LogoutUserUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(userId: User['id']): Promise<Result<void>> {
    console.log(userId);
    // Logic to revoke tokens if necessary
    await Promise.resolve();
    return success(undefined);
  }
}
