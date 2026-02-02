import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Request } from 'express';
import { UploadImageUseCase } from '../../application/use-cases/upload-image.use-case';
import { GetImagesByUserIdUseCase } from '../../application/use-cases/get-images-by-user-id.use-case';
import { DeleteImageUseCase } from '../../application/use-cases/delete-image.use-case';
import { JwtAuthGuard } from '../../../auth/presentation/http/guards/jwt-auth.guard';
import { ImageResponseDto } from './dto/image-response.dto';
import { StorageProvider } from '../../domain/interfaces/storage.interface';
import { JwtPayload } from '../../../auth/domain/interfaces/token-provider.interface';
import { Image } from '../../domain/entities/image.entity';

@ApiTags('images')
@Controller('images')
@UseGuards(JwtAuthGuard)
export class ImageController {
  constructor(
    private readonly uploadImageUseCase: UploadImageUseCase,
    private readonly getImagesByUserIdUseCase: GetImagesByUserIdUseCase,
    private readonly deleteImageUseCase: DeleteImageUseCase,
    private readonly storageProvider: StorageProvider,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload an image' })
  @HttpCode(HttpStatus.CREATED)
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<ImageResponseDto> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const [error, image] = await this.uploadImageUseCase.execute({
      userId: (req.user as JwtPayload).id,
      buffer: file.buffer,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return this.mapToResponse(image);
  }

  @Get()
  @ApiOperation({ summary: 'Get all images for the current user' })
  @HttpCode(HttpStatus.OK)
  async getImages(@Req() req: Request): Promise<ImageResponseDto[]> {
    const [error, images] = await this.getImagesByUserIdUseCase.execute(
      (req.user as JwtPayload).id,
    );

    if (error) {
      throw new BadRequestException(error.message);
    }

    return images.map((img) => this.mapToResponse(img));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an image' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const [error] = await this.deleteImageUseCase.execute(
      id,
      (req.user as JwtPayload).id,
    );

    if (error) {
      if (error.message === 'Image not found') {
        throw new NotFoundException(error.message);
      }
      if (error.message === 'Unauthorized to delete this image') {
        throw new ForbiddenException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  private mapToResponse(image: Image): ImageResponseDto {
    return {
      id: image.id,
      userId: image.userId,
      originalFileName: image.originalFileName,
      storedFileName: image.storedFileName,
      mimeType: image.mimeType,
      size: image.size,
      width: image.width,
      height: image.height,
      format: image.format,
      url: this.storageProvider.getPublicUrl(image.storedFileName),
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  }
}
