import { Result, success } from '@/shared/domain/types/result.type';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LogoutUserUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(): Promise<Result<void>> {
    // Logic to revoke tokens if necessary
    // await this.repository.revokeToken(userId);
    await Promise.resolve();
    return success(undefined);
  }
}
