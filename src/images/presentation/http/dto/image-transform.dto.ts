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

export class ImageTransformDto {
  @IsOptional()
  @IsObject()
  // @ValidateNested()
  // @Type(() => ResizeOptions)
  resize?: ResizeOptions;

  @IsOptional()
  @IsObject()
  // @ValidateNested()
  // @Type(() => CropOptions)
  crop?: CropOptions;

  @IsOptional()
  @IsObject()
  // @ValidateNested()
  // @Type(() => RotateOptions)
  rotate?: RotateOptions;

  @IsOptional()
  @IsObject()
  // @ValidateNested()
  // @Type(() => WatermarkOptions)
  watermark?: WatermarkOptions;

  @IsOptional()
  @IsObject()
  // @ValidateNested()
  // @Type(() => FlipOptions)
  flip?: FlipOptions;

  @IsOptional()
  @IsObject()
  // @ValidateNested()
  // @Type(() => CompressOptions)
  compress?: CompressOptions;

  @IsOptional()
  @IsObject()
  // @ValidateNested()
  // @Type(() => FilterOptions)
  filter?: FilterOptions;

  @IsOptional()
  @IsEnum(ImageFormat)
  format?: ImageFormat;
}
