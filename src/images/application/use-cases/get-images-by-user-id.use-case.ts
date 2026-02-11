import { Inject, Injectable } from '@nestjs/common';
import { Result, success } from '@/shared/domain/types/result.type';
import { Image, ImageProps } from '../../domain/entities/image.entity';
import { ImageRepository } from '../../domain/repositories/image.repository';
import { StorageProvider } from '@/images/domain/interfaces/storage.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class GetImagesByUserIdUseCase {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly storageProvider: StorageProvider,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async execute(userId: string): Promise<Result<Image[]>> {
    const cacheKey = `user_images:${userId}`;
    const cachedImages = await this.cacheManager.get<string>(cacheKey);

    let images: Image[] = [];

    if (cachedImages) {
      const imagesData = JSON.parse(cachedImages) as ImageProps[];
      images = imagesData.map((data) => Image.fromObject(data));
    } else {
      const result = await this.imageRepository.findByUserId(userId);
      const [error, foundImages] = result;

      if (error) return result;
      if (!foundImages) return success([]);

      images = foundImages;
      await this.cacheManager.set(cacheKey, JSON.stringify(images), 600000);
    }

    // Refresh URLs for all images
    const imagesWithFreshUrls = await Promise.all(
      images.map(async (image) => {
        const freshUrl = await this.storageProvider.getPublicUrl(
          image.storedFileName,
        );
        return Image.fromObject({
          ...image,
          id: image.id,
          filePath: freshUrl,
        });
      }),
    );

    return success(imagesWithFreshUrls);
  }
}
