import { AuthRepository } from '../../domain/repositories/auth.repository';
import { User } from '../../domain/entities/user.entity';
import { failure, Result } from '@/shared/domain/types/result.type';
import { Injectable } from '@nestjs/common';

export interface RegisterUserDto {
  email: string;
  password?: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(dto: RegisterUserDto): Promise<Result<User>> {
    const [error, existingUser] = await this.repository.findByEmail(dto.email);
    if (error) return failure(error);
    if (existingUser) {
      return failure(new Error('User already exists'));
    }

    return await this.repository.register(dto);
  }
}
