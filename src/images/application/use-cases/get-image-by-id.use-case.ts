import { Image } from '@/images/domain/entities/image.entity';
import { ImageRepository } from '@/images/domain/repositories/image.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetImageByIdUseCase {
  constructor(private readonly imageRepository: ImageRepository) {}

  async execute(id: string): Promise<[Error | null, Image | null]> {
    const [error, image] = await this.imageRepository.findById(id);
    if (error) {
      return [error, null];
    }
    if (!image) {
      return [new Error('Image not found'), null];
    }
    return [null, image];
  }
}
