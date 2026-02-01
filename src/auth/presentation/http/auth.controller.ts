import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { PasswordHasher } from '../../domain/interfaces/password-hasher.interface';
import { TokenProvider } from '../../domain/interfaces/token-provider.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUserUseCase,
    private readonly bcryptAdapter: PasswordHasher,
    private readonly jwtAdapter: TokenProvider,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const hashed = await this.bcryptAdapter.hash(registerDto.password);
    const [error, user] = await this.registerUseCase.execute({
      ...registerDto,
      password: hashed,
    });

    if (error) {
      if (error.message === 'User already exists') {
        throw new ConflictException(error.message);
      }
      throw new BadRequestException(error.message);
    }

    return user;
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const [error, user] = await this.loginUseCase.execute(loginDto);

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    const isPasswordValid = await this.bcryptAdapter.compare(
      loginDto.password,
      user.password || '',
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtAdapter.generateAccessToken({
      id: user.id,
      email: user.email,
    });
    const refreshToken = await this.jwtAdapter.generateRefreshToken({
      id: user.id,
      email: user.email,
    });

    return {
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken,
    };
  }

  // Logout and Refresh would be similar, using their respective use cases and token logic
}
