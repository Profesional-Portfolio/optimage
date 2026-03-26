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
import { Public } from './decorators/public.decorator';
import { User } from '../../domain/entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';

@ApiTags('auth')
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

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'User already exists.' })
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

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({
    status: 200,
    description: 'Logged in successfully, cookies set.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or invalid credentials.',
  })
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
  @ApiOperation({ summary: 'Log out user and clear cookies' })
  @ApiResponse({ status: 204, description: 'Successfully logged out.' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh_token cookie' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token not found or invalid.',
  })
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
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the user profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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
