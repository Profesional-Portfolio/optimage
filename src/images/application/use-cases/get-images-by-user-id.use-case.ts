import { Injectable } from '@nestjs/common';
import { Result } from '@/shared/domain/types/result.type';
import { Image } from '../../domain/entities/image.entity';
import { ImageRepository } from '../../domain/repositories/image.repository';

@Injectable()
export class GetImagesByUserIdUseCase {
  constructor(private readonly imageRepository: ImageRepository) {}

  async execute(userId: string): Promise<Result<Image[]>> {
    return this.imageRepository.findByUserId(userId);
  }
}
