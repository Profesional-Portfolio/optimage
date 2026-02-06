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
      const metadata = await this.imageProcessor.getMetadata(dto.buffer);

      // 2. Generate unique filename
      const fileId = randomUUID();
      const storedFileName = `${fileId}.${metadata.format}`;

      // 3. Upload to storage
      await this.storageProvider.upload(
        dto.buffer,
        storedFileName,
        dto.mimeType,
      );

      const filePath = await this.storageProvider.getFilePath(storedFileName);

      // 4. Create domain entity
      const image = Image.fromObject({
        id: fileId,
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

      // 5. Save to database
      const saveResult = await this.imageRepository.save(image);
      return saveResult;
    } catch (error) {
      const err = error as Error;
      console.error({ error: err.stack });
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
