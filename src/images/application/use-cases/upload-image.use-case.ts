import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { failure, Result } from '@/shared/domain/types/result.type';
import { Image } from '../../domain/entities/image.entity';
import { ImageRepository } from '../../domain/repositories/image.repository';
import { ImageProcessor } from '../../domain/interfaces/image-processor.interface';
import { StorageProvider } from '../../domain/interfaces/storage.interface';

export interface UploadImageDto {
  userId: string;
  buffer: Buffer;
  originalFileName: string;
  mimeType: string;
}

@Injectable()
export class UploadImageUseCase {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly imageProcessor: ImageProcessor,
    private readonly storageProvider: StorageProvider,
  ) {}

  async execute(dto: UploadImageDto): Promise<Result<Image>> {
    try {
      // 1. Get metadata (ensure it's a valid image)
      await this.imageProcessor.getMetadata(dto.buffer);

      // 2. Transform to WebP for optimization
      const webpBuffer = await this.imageProcessor.toWebP(dto.buffer);
      const webpMetadata = await this.imageProcessor.getMetadata(webpBuffer);

      // 3. Generate unique filename
      const fileId = randomUUID();
      const storedFileName = `${fileId}.webp`;

      // 4. Upload to storage
      const filePath = await this.storageProvider.upload(
        webpBuffer,
        storedFileName,
        'image/webp',
      );

      // 5. Create domain entity
      const image = Image.fromObject({
        id: fileId,
        userId: dto.userId,
        originalFileName: dto.originalFileName,
        storedFileName: storedFileName,
        filePath: filePath,
        mimeType: 'image/webp',
        size: webpMetadata.size,
        width: webpMetadata.width,
        height: webpMetadata.height,
        format: 'webp',
      });

      // 6. Save to database
      const saveResult = await this.imageRepository.save(image);
      return saveResult;
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
