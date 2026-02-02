import { Injectable } from '@nestjs/common';
import { failure, Result } from '@/shared/domain/types/result.type';
import { ImageRepository } from '../../domain/repositories/image.repository';
import { StorageProvider } from '../../domain/interfaces/storage.interface';

@Injectable()
export class DeleteImageUseCase {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly storageProvider: StorageProvider,
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
      return await this.imageRepository.delete(imageId);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
