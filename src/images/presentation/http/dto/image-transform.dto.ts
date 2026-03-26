import {
  ResizeOptions,
  CropOptions,
  RotateOptions,
  WatermarkOptions,
  FlipOptions,
  CompressOptions,
  FilterOptions,
  ImageFormat,
} from '@/images/domain/interfaces/image-transform-options.interface';
import { IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ImageTransformDto {
  @ApiPropertyOptional({
    description: 'Options for resizing the image',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  resize?: ResizeOptions;

  @ApiPropertyOptional({
    description: 'Options for cropping the image',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  crop?: CropOptions;

  @ApiPropertyOptional({
    description: 'Options to rotate the image',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  rotate?: RotateOptions;

  @ApiPropertyOptional({
    description: 'Options to add a watermark',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  watermark?: WatermarkOptions;

  @ApiPropertyOptional({
    description: 'Options to flip the image',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  flip?: FlipOptions;

  @ApiPropertyOptional({
    description: 'Options to compress the image',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  compress?: CompressOptions;

  @ApiPropertyOptional({
    description: 'Filters to apply to the image',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  filter?: FilterOptions;

  @ApiPropertyOptional({
    enum: ImageFormat,
    description: 'Format to convert the image to',
  })
  @IsOptional()
  @IsEnum(ImageFormat)
  format?: ImageFormat;
}
