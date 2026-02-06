import { ImageTransformOptions } from './image-transform-options.interface';

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

export abstract class ImageProcessor {
  abstract getMetadata(buffer: Buffer): Promise<ImageMetadata>;
  abstract transform(
    buffer: Buffer,
    options: ImageTransformOptions,
  ): Promise<Buffer>;
}
