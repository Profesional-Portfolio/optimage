import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  HttpStatus,
  HttpCode,
  Body,
  Res,
} from '@nestjs/common';
import type { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { UploadImageUseCase } from '../../application/use-cases/upload-image.use-case';
import { GetImagesByUserIdUseCase } from '../../application/use-cases/get-images-by-user-id.use-case';
import { DeleteImageUseCase } from '../../application/use-cases/delete-image.use-case';
import { ImageResponseDto } from './dto/image-response.dto';
import { StorageProvider } from '../../domain/interfaces/storage.interface';
import type { JwtPayload } from '../../../auth/domain/interfaces/token-provider.interface';
import { Image } from '../../domain/entities/image.entity';
import { TransformImageUseCase } from '@/images/application/use-cases/transform-image.use-case';
import { ImageTransformDto } from './dto/image-transform.dto';
import { IsImageOwnerGuard } from './guards/is-image-owner.guard';
import { CurrentUser } from '../../../auth/presentation/http/decorators/user.decorator';
import { GetImageByIdUseCase } from '@/images/application/use-cases/get-image-by-id.use-case';

@ApiTags('images')
@Controller('images')
export class ImageController {
  constructor(
    private readonly uploadImageUseCase: UploadImageUseCase,
    private readonly getImagesByUserIdUseCase: GetImagesByUserIdUseCase,
    private readonly transformImageUseCase: TransformImageUseCase,
    private readonly deleteImageUseCase: DeleteImageUseCase,
    private readonly storageProvider: StorageProvider,
    private readonly getImageByIdUseCase: GetImageByIdUseCase,
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
    @CurrentUser() user: JwtPayload,
  ): Promise<ImageResponseDto> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const [error, image] = await this.uploadImageUseCase.execute({
      userId: user.id,
      buffer: file.buffer,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return this.mapToResponse(image);
  }

  @Get(':id')
  @UseGuards(IsImageOwnerGuard)
  @ApiOperation({ summary: 'Get an image' })
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') id: string): Promise<ImageResponseDto> {
    const [error, image] = await this.getImageByIdUseCase.execute(id);

    if (error || !image) {
      throw new BadRequestException(error?.message || 'Image not found');
    }

    return this.mapToResponse(image);
  }

  @Post('transform/:id')
  @UseGuards(IsImageOwnerGuard)
  @ApiOperation({ summary: 'Transform an image' })
  @HttpCode(HttpStatus.OK)
  async transform(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
    @Body() options: ImageTransformDto,
  ) {
    // return { id, options };
    const [error, result] = await this.transformImageUseCase.execute(
      id,
      user.id,
      options,
    );

    if (error || !result) {
      throw new BadRequestException(error?.message || 'Transformation failed');
    }

    const { buffer: _, image } = result as { buffer: Buffer; image: Image };
    // const format = options.format || image.format;
    // const mimeType = `image/${format}`;

    // res.set({
    //   'Content-Type': mimeType,
    //   'Content-Length': buffer.length.toString(),
    //   'Content-Disposition': `attachment; filename="${image.originalFileName}"`,
    // });
    // return the actual image stored in the storage provider
    const url = await this.storageProvider.getPublicUrl(image.storedFileName);
    res.json({ url });
  }

  @Get()
  @ApiOperation({ summary: 'Get all images for the current user' })
  @HttpCode(HttpStatus.OK)
  async getImages(
    @CurrentUser() user: JwtPayload,
  ): Promise<ImageResponseDto[]> {
    const [error, images] = await this.getImagesByUserIdUseCase.execute(
      user.id,
    );

    if (error) {
      throw new BadRequestException(error.message);
    }

    return images.map((img) => this.mapToResponse(img));
  }

  @Delete(':id')
  @UseGuards(IsImageOwnerGuard)
  @ApiOperation({ summary: 'Delete an image' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    const [error] = await this.deleteImageUseCase.execute(id, user.id);

    if (error) {
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
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  }
}
