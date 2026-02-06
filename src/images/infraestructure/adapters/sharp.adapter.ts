import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import {
  ImageMetadata,
  ImageProcessor,
} from '../../domain/interfaces/image-processor.interface';
import {
  FitType,
  ImageTransformOptions,
  WatermarkPosition,
} from '@/images/domain/interfaces/image-transform-options.interface';

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

  async transform(
    buffer: Buffer,
    options: ImageTransformOptions,
  ): Promise<Buffer> {
    let image = sharp(buffer);

    if (options.crop) {
      image = image.extract({
        left: options.crop.x,
        top: options.crop.y,
        width: options.crop.width,
        height: options.crop.height,
      });
    }

    if (options.resize) {
      const { width, height, fit } = options.resize;
      image = image.resize(width, height, {
        fit: this.mapFitType(fit || FitType.COVER),
      });
    }

    if (options.rotate) {
      image = image.rotate(options.rotate.angle);
    }

    if (options.flip) {
      image = image.flip(options.flip.horizontal).flip(options.flip.vertical);
    }

    if (options.compress) {
      image = image.jpeg({ quality: options.compress.quality });
    }

    if (options.filter) {
      if (options.filter.grayscale) image = image.grayscale();
      if (options.filter.blur) image = image.blur(options.filter.blur);
      if (options.filter.sharpen) image = image.sharpen();
      if (options.filter.negate) image = image.negate();
      if (options.filter.sepia) {
        image = image.recomb([
          [0.3588, 0.7044, 0.1368],
          [0.299, 0.587, 0.114],
          [0.2392, 0.4696, 0.0912],
        ]);
      }
    }

    if (options.watermark) {
      const waterMarkBuffer = this.createWatermark(
        options.watermark.text,
        100,
        100,
        options.watermark.position || WatermarkPosition.BOTTOM_RIGHT,
      );
      image = image.composite([
        {
          input: waterMarkBuffer,
          gravity: this.mapWatermarkPosition(
            options.watermark.position || WatermarkPosition.BOTTOM_RIGHT,
          ),
        },
      ]);
    }

    if (options.format) {
      image = image.toFormat(options.format);
    }

    return image.toBuffer();
  }

  private mapFitType(fit: FitType): keyof sharp.FitEnum {
    const fitMap: Record<FitType, keyof sharp.FitEnum> = {
      [FitType.COVER]: 'cover',
      [FitType.CONTAIN]: 'contain',
      [FitType.FILL]: 'fill',
    };
    return fitMap[fit];
  }

  private mapWatermarkPosition(position: WatermarkPosition): string {
    const positionMap: Record<WatermarkPosition, string> = {
      [WatermarkPosition.TOP_LEFT]: 'northwest',
      [WatermarkPosition.TOP_RIGHT]: 'northeast',
      [WatermarkPosition.BOTTOM_LEFT]: 'southwest',
      [WatermarkPosition.BOTTOM_RIGHT]: 'southeast',
      [WatermarkPosition.CENTER]: 'center',
    };
    return positionMap[position];
  }

  private createWatermark(
    text: string,
    imageWidth: number,
    imageHeight: number,
    position: WatermarkPosition,
  ): Buffer {
    const svg = `
      <svg width="${imageWidth}" height="${imageHeight}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .title {
            fill: #ffffff;
            font-size: 50px;
            font-weight: bold;
            font-family: Arial, sans-serif;
            text-anchor: middle;
            dominant-baseline: middle;
          }
        </style>
        <text x="${this.getWatermarkX(position, imageWidth)}" y="${this.getWatermarkY(position, imageHeight)}" class="title">${text}</text>
      </svg>
    `;
    return Buffer.from(svg);
  }

  private getWatermarkX(position: WatermarkPosition, width: number): string {
    switch (position) {
      case WatermarkPosition.TOP_LEFT:
      case WatermarkPosition.BOTTOM_LEFT:
        return '10';
      case WatermarkPosition.TOP_RIGHT:
      case WatermarkPosition.BOTTOM_RIGHT:
        return `${width - 10}`;
      case WatermarkPosition.CENTER:
        return `${width / 2}`;
    }
  }

  private getWatermarkY(position: WatermarkPosition, height: number): string {
    switch (position) {
      case WatermarkPosition.TOP_LEFT:
      case WatermarkPosition.TOP_RIGHT:
        return '30';
      case WatermarkPosition.BOTTOM_LEFT:
      case WatermarkPosition.BOTTOM_RIGHT:
        return `${height - 10}`;
      case WatermarkPosition.CENTER:
        return `${height / 2}`;
    }
  }
}
