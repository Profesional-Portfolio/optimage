import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/presentation/http/guards/jwt-auth.guard';
import { UserPersistence } from './auth/infraestructure/entities/user.persistence.entity';
import { ImagesModule } from './images/images.module';
import { ImagePersistence } from './images/infraestructure/entities/image.persistence.entity';
import { env } from './config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.DB_HOST || 'db',
      port: parseInt(env.DB_PORT || '5432'),
      username: env.DB_USER || 'postgres',
      password: env.DB_PASSWORD || 'postgres',
      database: env.DB_NAME || 'optimage',
      entities: [UserPersistence, ImagePersistence],
      synchronize: true,
    }),
    AuthModule,
    ImagesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
