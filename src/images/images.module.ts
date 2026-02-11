import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagePersistence } from './infraestructure/entities/image.persistence.entity';
import { ImageRepository } from './domain/repositories/image.repository';
import { TypeOrmImageRepositoryImpl } from './infraestructure/repositories/typeorm-image.repository.impl';
import { ImageProcessor } from './domain/interfaces/image-processor.interface';
import { SharpAdapter } from './infraestructure/adapters/sharp.adapter';
import { StorageProvider } from './domain/interfaces/storage.interface';
// import { LocalStorageAdapter } from './infraestructure/adapters/local-storage.adapter';
import { UploadImageUseCase } from './application/use-cases/upload-image.use-case';
import { GetImagesByUserIdUseCase } from './application/use-cases/get-images-by-user-id.use-case';
import { GetImageByIdUseCase } from './application/use-cases/get-image-by-id.use-case';
import { DeleteImageUseCase } from './application/use-cases/delete-image.use-case';
import { ImageController } from './presentation/http/image.controller';
import { TransformImageUseCase } from './application/use-cases/transform-image.use-case';
import { S3StorageAdapter } from './infraestructure/adapters/s3-storage.adapter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { BullModule } from '@nestjs/bull';
import { Queue } from 'bull';
import { ImageJobsConsumer } from './infraestructure/jobs/image-jobs.consumer';
import { IMAGE_PROCESSING_QUEUE } from './domain/constants/queue-names.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImagePersistence]),
    BullModule.registerQueue({
      name: IMAGE_PROCESSING_QUEUE,
    }),
  ],
  controllers: [ImageController],
  providers: [
    ImageJobsConsumer,
    {
      provide: ImageRepository,
      useClass: TypeOrmImageRepositoryImpl,
    },
    {
      provide: ImageProcessor,
      useClass: SharpAdapter,
    },
    {
      provide: StorageProvider,
      useClass: S3StorageAdapter,
    },
    {
      provide: UploadImageUseCase,
      inject: [ImageRepository, ImageProcessor, StorageProvider, CACHE_MANAGER],
      useFactory: (
        repository: ImageRepository,
        processor: ImageProcessor,
        storage: StorageProvider,
        cacheManager: Cache,
      ) => new UploadImageUseCase(repository, processor, storage, cacheManager),
    },
    {
      provide: GetImagesByUserIdUseCase,
      inject: [ImageRepository, StorageProvider, CACHE_MANAGER],
      useFactory: (
        repository: ImageRepository,
        storage: StorageProvider,
        cacheManager: Cache,
      ) => new GetImagesByUserIdUseCase(repository, storage, cacheManager),
    },
    {
      provide: GetImageByIdUseCase,
      inject: [ImageRepository, StorageProvider, CACHE_MANAGER],
      useFactory: (
        repository: ImageRepository,
        storage: StorageProvider,
        cacheManager: Cache,
      ) => new GetImageByIdUseCase(repository, storage, cacheManager),
    },
    {
      provide: TransformImageUseCase,
      inject: [ImageRepository, `BullQueue_${IMAGE_PROCESSING_QUEUE}`],
      useFactory: (repository: ImageRepository, imageQueue: Queue) =>
        new TransformImageUseCase(repository, imageQueue),
    },
    {
      provide: DeleteImageUseCase,
      inject: [ImageRepository, StorageProvider, CACHE_MANAGER],
      useFactory: (
        repository: ImageRepository,
        storage: StorageProvider,
        cacheManager: Cache,
      ) => new DeleteImageUseCase(repository, storage, cacheManager),
    },
  ],
  exports: [
    UploadImageUseCase,
    GetImagesByUserIdUseCase,
    GetImageByIdUseCase,
    TransformImageUseCase,
    DeleteImageUseCase,
    ImageRepository,
  ],
})
export class ImagesModule {}
