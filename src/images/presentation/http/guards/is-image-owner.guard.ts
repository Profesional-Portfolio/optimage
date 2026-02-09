import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ImageRepository } from '../../../domain/repositories/image.repository';
import { JwtPayload } from '../../../../auth/domain/interfaces/token-provider.interface';

import { Request } from 'express';

@Injectable()
export class IsImageOwnerGuard implements CanActivate {
  constructor(private readonly imageRepository: ImageRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;
    const imageId = request.params.id;

    if (!imageId) {
      return true; // Or throw an error if this guard is used on routes without :id
    }

    const [error, image] = await this.imageRepository.findById(
      imageId as string,
    );

    if (error || !image) {
      throw new NotFoundException('Image not found');
    }

    if (image.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to access this image',
      );
    }

    return true;
  }
}
