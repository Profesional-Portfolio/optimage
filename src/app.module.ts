import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserPersistence } from './auth/infraestructure/entities/user.persistence.entity';
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
      entities: [UserPersistence],
      synchronize: true,
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
