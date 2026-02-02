import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import {
  ImageMetadata,
  ImageProcessor,
} from '../../domain/interfaces/image-processor.interface';

@Injectable()
export class SharpAdapter implements ImageProcessor {
  async resize(buffer: Buffer, width: number, height: number): Promise<Buffer> {
    return sharp(buffer).resize(width, height).toBuffer();
  }

  async toWebP(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).webp().toBuffer();
  }

  async getMetadata(buffer: Buffer): Promise<ImageMetadata> {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: buffer.length,
    };
  }
}
