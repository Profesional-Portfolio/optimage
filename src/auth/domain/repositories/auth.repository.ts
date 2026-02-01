import { Result } from '@/shared/domain/types/result.type';
import { User } from '../entities/user.entity';

export abstract class AuthRepository {
  abstract register(user: Partial<User>): Promise<Result<User>>;
  abstract findByEmail(email: string): Promise<Result<User | null>>;
  abstract findById(id: string): Promise<Result<User | null>>;
  abstract updateLastLogin(userId: string): Promise<Result<void>>;
  // Additional methods as needed for refresh tokens etc.
}
