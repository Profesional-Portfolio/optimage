import { Image, type ImageProps } from '@/images/domain/entities/image.entity';
import { ImageRepository } from '@/images/domain/repositories/image.repository';
import { StorageProvider } from '@/images/domain/interfaces/storage.interface';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class GetImageByIdUseCase {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly storageProvider: StorageProvider,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async execute(id: string): Promise<[Error | null, Image | null]> {
    const cacheKey = `image:${id}`;
    const cachedImage = await this.cacheManager.get<string>(cacheKey);

    let image: Image | null = null;

    if (cachedImage) {
      image = Image.fromObject(JSON.parse(cachedImage) as ImageProps);
    } else {
      const [error, foundImage] = await this.imageRepository.findById(id);
      if (error) {
        return [error, null];
      }
      if (!foundImage) {
        return [new Error('Image not found'), null];
      }
      image = foundImage;
      await this.cacheManager.set(cacheKey, JSON.stringify(image), 600000); // 10 minutes
    }

    // Always generate a fresh pre-signed URL (or stable local URL)
    const freshUrl = await this.storageProvider.getPublicUrl(
      image.storedFileName,
    );

    // Create a new instance with the fresh URL without mutating the original or cached object
    const imageWithFreshUrl = Image.fromObject({
      ...image,
      id: image.id, // Ensure id is explicitly passed to fromObject
      filePath: freshUrl,
    });

    return [null, imageWithFreshUrl];
  }
}
