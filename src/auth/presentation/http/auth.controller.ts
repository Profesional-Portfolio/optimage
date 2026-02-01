import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Res,
  Get,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { LogoutUserUseCase } from '../../application/use-cases/logout-user.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { PasswordHasher } from '../../domain/interfaces/password-hasher.interface';
import { TokenProvider } from '../../domain/interfaces/token-provider.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { User } from '../../domain/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
    private readonly bcryptAdapter: PasswordHasher,
    private readonly jwtAdapter: TokenProvider,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
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
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
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

    await this.setAuthCookies(res, user);

    return {
      user: { id: user.id, email: user.email },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'] as string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const [error, user] = await this.refreshTokenUseCase.execute(refreshToken);

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    await this.setAuthCookies(res, user);

    return {
      user: { id: user.id, email: user.email },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  getProfile(@Req() req: Request) {
    return req.user;
  }

  private async setAuthCookies(res: Response, user: User) {
    const [errorAccessToken, accessToken] =
      await this.jwtAdapter.generateAccessToken({
        id: user.id,
        email: user.email,
      });
    const [errorRefreshToken, refreshToken] =
      await this.jwtAdapter.generateRefreshToken({
        id: user.id,
        email: user.email,
      });

    if (errorAccessToken || errorRefreshToken) {
      throw new InternalServerErrorException('Error generating tokens');
    }

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000, // 1h
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800000, // 7d
    });
  }
}
