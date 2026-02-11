import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { ImageProcessor } from '@/images/domain/interfaces/image-processor.interface';
import { StorageProvider } from '@/images/domain/interfaces/storage.interface';
import { ImageRepository } from '@/images/domain/repositories/image.repository';
import { ImageTransformOptions } from '@/images/domain/interfaces/image-transform-options.interface';
import { Image } from '@/images/domain/entities/image.entity';
import {
  IMAGE_JOBS,
  IMAGE_PROCESSING_QUEUE,
} from '../../domain/constants/queue-names.constants';

@Processor(IMAGE_PROCESSING_QUEUE)
export class ImageJobsConsumer {
  private readonly logger = new Logger(ImageJobsConsumer.name);

  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly imageProcessor: ImageProcessor,
    private readonly storageProvider: StorageProvider,
  ) {}

  @Process(IMAGE_JOBS.TRANSFORM)
  async handleTransform(
    job: Job<{
      imageId: string;
      userId: string;
      options: ImageTransformOptions;
    }>,
  ) {
    this.logger.log(
      `Processing transformation job ${job.id} for image ${job.data.imageId}`,
    );

    const { imageId, userId, options } = job.data;

    try {
      const [_errorImage, image] = await this.imageRepository.findById(imageId);

      if (!image) {
        throw new Error('Image not found');
      }

      // 1. Download image from storage
      const originalBuffer = await this.storageProvider.download(
        image.storedFileName,
      );

      // 2. Transform image
      const transformedBuffer = await this.imageProcessor.transform(
        originalBuffer,
        options,
      );

      // 3. Generate new filename
      // const transformedId = crypto.randomUUID();
      // const extension = options.format || image.format;
      // const transformedFileName = `${transformedId}.${extension}`;
      const transformedFileName = await this.storageProvider.generateFilename(
        image.originalFileName,
        'transformed',
      );

      // 4. Upload transformed image
      await this.storageProvider.upload(
        transformedBuffer,
        transformedFileName,
        image.mimeType,
      );

      const filePath =
        await this.storageProvider.getPublicUrl(transformedFileName);

      // 5. Create new image entity
      const metadata = await this.imageProcessor.getMetadata(transformedBuffer);
      const transformedImage = Image.fromObject({
        id: image.id,
        userId: userId,
        originalFileName: `transformed-${image.originalFileName}`,
        storedFileName: transformedFileName,
        filePath: filePath,
        mimeType: image.mimeType,
        size: metadata.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      });

      // 6. Save update/new image to database
      await this.imageRepository.save(transformedImage);

      this.logger.log(`Transformation job ${job.id} completed successfully`);
      return { imageId: transformedImage.id };
    } catch (error) {
      this.logger.error(`Error processing transformation job ${job.id}`, error);
      throw error;
    }
  }
}
