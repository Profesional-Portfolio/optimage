import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagePersistence } from './infraestructure/entities/image.persistence.entity';
import { ImageRepository } from './domain/repositories/image.repository';
import { TypeOrmImageRepository } from './infraestructure/repositories/typeorm-image.repository';
import { ImageProcessor } from './domain/interfaces/image-processor.interface';
import { SharpAdapter } from './infraestructure/adapters/sharp.adapter';
import { StorageProvider } from './domain/interfaces/storage.interface';
import { LocalStorageAdapter } from './infraestructure/adapters/local-storage.adapter';
import { UploadImageUseCase } from './application/use-cases/upload-image.use-case';
import { GetImagesByUserIdUseCase } from './application/use-cases/get-images-by-user-id.use-case';
import { DeleteImageUseCase } from './application/use-cases/delete-image.use-case';
import { ImageController } from './presentation/http/image.controller';
import { TransformImageUseCase } from './application/use-cases/transform-image.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([ImagePersistence])],
  controllers: [ImageController],
  providers: [
    {
      provide: ImageRepository,
      useClass: TypeOrmImageRepository,
    },
    {
      provide: ImageProcessor,
      useClass: SharpAdapter,
    },
    {
      provide: StorageProvider,
      useClass: LocalStorageAdapter,
    },
    {
      provide: UploadImageUseCase,
      inject: [ImageRepository, ImageProcessor, StorageProvider],
      useFactory: (
        repository: ImageRepository,
        processor: ImageProcessor,
        storage: StorageProvider,
      ) => new UploadImageUseCase(repository, processor, storage),
    },
    {
      provide: GetImagesByUserIdUseCase,
      inject: [ImageRepository],
      useFactory: (repository: ImageRepository) =>
        new GetImagesByUserIdUseCase(repository),
    },
    {
      provide: TransformImageUseCase,
      inject: [ImageRepository, ImageProcessor, StorageProvider],
      useFactory: (
        repository: ImageRepository,
        processor: ImageProcessor,
        storage: StorageProvider,
      ) => new TransformImageUseCase(repository, processor, storage),
    },
    {
      provide: DeleteImageUseCase,
      inject: [ImageRepository, StorageProvider],
      useFactory: (repository: ImageRepository, storage: StorageProvider) =>
        new DeleteImageUseCase(repository, storage),
    },
  ],
  exports: [
    UploadImageUseCase,
    GetImagesByUserIdUseCase,
    TransformImageUseCase,
    DeleteImageUseCase,
    ImageRepository,
  ],
})
export class ImagesModule {}
