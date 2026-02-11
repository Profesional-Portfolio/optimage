import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { UserPersistence } from '../entities/user.persistence.entity';
import { User } from '../../domain/entities/user.entity';
import { failure, Result, success } from '@/shared/domain/types/result.type';

@Injectable()
export class TypeOrmAuthRepositoryImpl implements AuthRepository {
  constructor(
    @InjectRepository(UserPersistence)
    private readonly repository: Repository<UserPersistence>,
  ) {}

  async register(user: Partial<User>): Promise<Result<User>> {
    try {
      const newUser = this.repository.create({
        email: user.email,
        password: user.password,
      });
      const savedUser = await this.repository.save(newUser);
      return success(this.mapToDomain(savedUser));
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findByEmail(email: string): Promise<Result<User | null>> {
    try {
      const user = await this.repository.findOne({ where: { email } });
      if (!user) return success(null);
      return success(this.mapToDomain(user));
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findById(id: string): Promise<Result<User | null>> {
    try {
      const user = await this.repository.findOne({ where: { id } });
      if (!user) return success(null);
      return success(this.mapToDomain(user));
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async updateLastLogin(userId: string): Promise<Result<void>> {
    try {
      console.log(`Update last login for user: ${userId}`);
      await Promise.resolve();
      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private mapToDomain(persistence: UserPersistence): User {
    return User.fromObject({
      id: persistence.id,
      email: persistence.email,
      password: persistence.password,
      isActive: persistence.isActive,
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
    });
  }

  // private mapToPersistence(domain: User): UserPersistence {
  //   const persistence = new UserPersistence();
  //   persistence.email = domain.email;
  //   persistence.password = domain.password;
  //   persistence.isActive = domain.isActive;
  //   return persistence;
  // }
}
