import { Result } from '@/shared/domain/types/result.type';
import { Image } from '../entities/image.entity';

export abstract class ImageRepository {
  abstract save(image: Image): Promise<Result<Image>>;
  abstract findById(id: string): Promise<Result<Image | null>>;
  abstract findByUserId(userId: string): Promise<Result<Image[]>>;
  abstract delete(id: string): Promise<Result<void>>;
}
