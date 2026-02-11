import { failure, Result } from '@/shared/domain/types/result.type';
import { ImageRepository } from '../../domain/repositories/image.repository';
import { StorageProvider } from '../../domain/interfaces/storage.interface';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class DeleteImageUseCase {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly storageProvider: StorageProvider,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async execute(imageId: string, userId: string): Promise<Result<void>> {
    try {
      // 1. Find image to ensure it exists and belongs to the user
      const [error, image] = await this.imageRepository.findById(imageId);
      if (error) return failure(error);
      if (!image) return failure(new Error('Image not found'));
      if (image.userId !== userId)
        return failure(new Error('Unauthorized to delete this image'));

      // 2. Delete from storage
      await this.storageProvider.delete(image.storedFileName);

      // 3. Delete from database
      const result = await this.imageRepository.delete(imageId);

      // 4. Invalidate cache
      await this.cacheManager.del(`image:${imageId}`);
      await this.cacheManager.del(`user_images:${userId}`);

      return result;
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
