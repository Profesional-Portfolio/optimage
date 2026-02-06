import { User } from '@/auth/domain/entities/user.entity';
import { Image } from '@/images/domain/entities/image.entity';
import { ImageProcessor } from '@/images/domain/interfaces/image-processor.interface';
import { ImageTransformOptions } from '@/images/domain/interfaces/image-transform-options.interface';
import { StorageProvider } from '@/images/domain/interfaces/storage.interface';
import { ImageRepository } from '@/images/domain/repositories/image.repository';
import { failure, Result, success } from '@/shared/domain/types/result.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransformImageUseCase {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly imageProcessor: ImageProcessor,
    private readonly storageProvider: StorageProvider,
  ) {}

  async execute(
    imageId: Image['id'],
    userId: User['id'],
    options: ImageTransformOptions,
  ): Promise<Result<{ buffer: Buffer; image: Image }>> {
    // 1. Get image from database
    // 2. Check if user is authorized
    // 3. Get image from storage
    // 4. Transform image
    // 5. Save image to database
    // 6. Save image to storage
    // 7. Return image

    const [errorImage, image] = await this.imageRepository.findById(imageId);

    if (!image) {
      return failure(new Error(errorImage?.message || 'Image not found'));
    }

    if (image.userId !== userId) {
      return failure(new Error('Unauthorized'));
    }

    try {
      // 1. Download image from storage
      const originalBuffer = await this.storageProvider.download(
        image.storedFileName,
      );

      // 2. Transform image
      const transformedBuffer = await this.imageProcessor.transform(
        originalBuffer,
        options,
      );

      // 3. Generate new filename for transformed image
      const transformedId = crypto.randomUUID();
      const extension = options.format || image.format;
      const transformedFileName = `${transformedId}.${extension}`;

      // 4. Upload transformed image
      await this.storageProvider.upload(
        transformedBuffer,
        transformedFileName,
        `image/${extension}`,
      );

      const filePath =
        await this.storageProvider.getFilePath(transformedFileName);

      // 5. Create new image entity (derivative)
      const metadata = await this.imageProcessor.getMetadata(transformedBuffer);
      const transformedImage = Image.fromObject({
        id: transformedId,
        userId: userId,
        originalFileName: `transformed-${image.originalFileName}`,
        storedFileName: transformedFileName,
        filePath: filePath,
        mimeType: `image/${extension}`,
        size: metadata.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      });

      // 6. Save update/new image to database
      await this.imageRepository.save(transformedImage);
      return success({ buffer: transformedBuffer, image: transformedImage });
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
