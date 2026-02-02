export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

export abstract class ImageProcessor {
  abstract resize(
    buffer: Buffer,
    width: number,
    height: number,
  ): Promise<Buffer>;
  abstract toWebP(buffer: Buffer): Promise<Buffer>;
  abstract getMetadata(buffer: Buffer): Promise<ImageMetadata>;
}
