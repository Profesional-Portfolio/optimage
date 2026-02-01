import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserPersistence } from './infraestructure/entities/user.persistence.entity';
import { AuthRepositoryImpl } from './infraestructure/repositories/auth.repository.impl';
import { AuthRepository } from './domain/repositories/auth.repository';
import { BcryptAdapter } from './infraestructure/adapters/bcrypt.adapter';
import { JwtAdapter } from './infraestructure/adapters/jwt.adapter';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUserUseCase } from './application/use-cases/logout-user.use-case';
import { PasswordHasher } from './domain/interfaces/password-hasher.interface';
import { TokenProvider } from './domain/interfaces/token-provider.interface';
import { AuthController } from './presentation/http/auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPersistence]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AuthRepository,
      useClass: AuthRepositoryImpl,
    },
    {
      provide: PasswordHasher,
      useClass: BcryptAdapter,
    },
    {
      provide: TokenProvider,
      useClass: JwtAdapter,
    },
    {
      provide: RegisterUserUseCase,
      inject: [AuthRepository],
      useFactory: (repository: AuthRepository) =>
        new RegisterUserUseCase(repository),
    },
    {
      provide: LoginUserUseCase,
      inject: [AuthRepository],
      useFactory: (repository: AuthRepository) =>
        new LoginUserUseCase(repository),
    },
    {
      provide: RefreshTokenUseCase,
      inject: [AuthRepository],
      useFactory: (repository: AuthRepository) =>
        new RefreshTokenUseCase(repository),
    },
    {
      provide: LogoutUserUseCase,
      inject: [AuthRepository],
      useFactory: (repository: AuthRepository) =>
        new LogoutUserUseCase(repository),
    },
  ],
  exports: [AuthRepository],
})
export class AuthModule {}
