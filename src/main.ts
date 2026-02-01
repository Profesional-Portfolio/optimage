import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './shared/infraestructure/interceptors/response.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const reflector = new Reflector();
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  app.enableCors();
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  await app.listen(env.APPLICATION_PORT);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
