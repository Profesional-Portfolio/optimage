import { ImageProcessor } from '../../domain/interfaces/image-processor.interface';
import { StorageProvider } from '../../domain/interfaces/storage.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { failure, Result, success } from '@/shared/domain/types/result.type';
import { Image } from '../../domain/entities/image.entity';
import { ImageRepository } from '../../domain/repositories/image.repository';

export interface UploadImageDto {
  userId: string;
  buffer: Buffer;
  originalFileName: string;
  mimeType: string;
}

@Injectable()
export class UploadImageUseCase {
  private readonly logger = new Logger(UploadImageUseCase.name);
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly imageProcessor: ImageProcessor,
    private readonly storageProvider: StorageProvider,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async execute(dto: UploadImageDto): Promise<Result<Image>> {
    try {
      // 1. Get metadata (ensure it's a valid image)
      const metadata = await this.imageProcessor.getMetadata(dto.buffer);

      // 2. Generate unique filename
      const storedFileName = await this.storageProvider.generateFilename(
        dto.originalFileName,
      );

      // 3. Upload to storage
      await this.storageProvider.upload(
        dto.buffer,
        storedFileName,
        dto.mimeType,
      );

      const filePath = await this.storageProvider.getPublicUrl(storedFileName);

      this.logger.log(`File uploaded successfully: ${filePath}`);

      // 5. Save to database
      const [error, saved] = await this.imageRepository.save({
        userId: dto.userId,
        originalFileName: dto.originalFileName,
        storedFileName: storedFileName,
        filePath: filePath,
        mimeType: dto.mimeType,
        size: metadata.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      });

      if (error || !saved) return failure(error);

      const image = Image.fromObject({
        id: saved.id,
        userId: saved.userId,
        originalFileName: saved.originalFileName,
        storedFileName: saved.storedFileName,
        filePath: saved.filePath,
        mimeType: saved.mimeType,
        size: saved.size,
        width: saved.width,
        height: saved.height,
        format: saved.format,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      });

      this.logger.log(`Image saved successfully: ${JSON.stringify(image)}`);

      // 6. Invalidate cache
      const cacheKey = `user_images:${dto.userId}`;
      await this.cacheManager.del(cacheKey);

      // 7. Return the created image
      return success(image);
    } catch (error) {
      const err = error as Error;
      console.error({ error: err.stack });
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
