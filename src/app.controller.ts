import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './auth/presentation/http/decorators/public.decorator';

@ApiTags('System')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'API Root' })
  @ApiResponse({ status: 200, description: 'Welcome message' })
  @HttpCode(HttpStatus.OK)
  getHello(): { message: string; version: string } {
    return {
      message: 'Welcome to the Image Processing API',
      version: '1.0.0',
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health Check' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  @HttpCode(HttpStatus.OK)
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
