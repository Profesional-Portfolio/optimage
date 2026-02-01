import { AuthRepository } from '../../domain/repositories/auth.repository';
import { User } from '../../domain/entities/user.entity';
import { failure, Result, success } from '@/shared/domain/types/result.type';
import { Injectable } from '@nestjs/common';

export interface LoginUserDto {
  email: string;
  password?: string;
}

@Injectable()
export class LoginUserUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(dto: LoginUserDto): Promise<Result<User>> {
    const [error, user] = await this.repository.findByEmail(dto.email);

    if (error) return failure(error);
    if (!user) {
      return failure(new Error('Invalid credentials'));
    }

    return success(user);
  }
}
