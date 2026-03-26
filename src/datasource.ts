import { DataSource } from 'typeorm';
import { UserPersistence } from './auth/infraestructure/entities/user.persistence.entity';
import { ImagePersistence } from './images/infraestructure/entities/image.persistence.entity';

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [UserPersistence, ImagePersistence],
  migrations: ['src/migrations/*.ts'],
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: !isProduction,
});
