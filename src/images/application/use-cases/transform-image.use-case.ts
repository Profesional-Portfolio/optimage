import { User } from '@/auth/domain/entities/user.entity';
import { Image } from '@/images/domain/entities/image.entity';
import { ImageTransformOptions } from '@/images/domain/interfaces/image-transform-options.interface';
import { ImageRepository } from '@/images/domain/repositories/image.repository';
import { failure, Result, success } from '@/shared/domain/types/result.type';
import { Injectable, Logger } from '@nestjs/common';

import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import {
  IMAGE_JOBS,
  IMAGE_PROCESSING_QUEUE,
} from '../../domain/constants/queue-names.constants';

@Injectable()
export class TransformImageUseCase {
  private readonly logger = new Logger(TransformImageUseCase.name);
  constructor(
    private readonly imageRepository: ImageRepository,
    @InjectQueue(IMAGE_PROCESSING_QUEUE) private readonly imageQueue: Queue,
  ) {}

  async execute(
    imageId: Image['id'],
    userId: User['id'],
    options: ImageTransformOptions,
  ): Promise<Result<{ jobId: string }>> {
    this.logger.log(`Starting transformation for image ${imageId}`);

    try {
      this.logger.log(`Finding image ${imageId} in repository...`);
      const [errorImage, image] = await this.imageRepository.findById(imageId);
      this.logger.log(`Repository returned: ${image ? 'found' : 'not found'}`);

      if (!image) {
        return failure(new Error(errorImage?.message || 'Image not found'));
      }

      if (image.userId !== userId) {
        return failure(new Error('Unauthorized to transform this image'));
      }

      this.logger.log(`Adding job to queue ${IMAGE_PROCESSING_QUEUE}...`);
      const job = await this.imageQueue.add(IMAGE_JOBS.TRANSFORM, {
        imageId,
        userId,
        options,
      });
      this.logger.log(`Job added successfully with ID ${job.id}`);

      return success({ jobId: job.id.toString() });
    } catch (error) {
      this.logger.error(`Error in TransformImageUseCase: ${error}`);
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
