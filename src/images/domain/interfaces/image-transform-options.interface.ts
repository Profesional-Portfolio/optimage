export enum FitType {
  COVER = 'cover',
  CONTAIN = 'contain',
  FILL = 'fill',
}

export enum WatermarkPosition {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
  CENTER = 'center',
}

export enum ImageFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
  AVIF = 'avif',
}

export class ResizeOptions {
  width?: number;

  height?: number;

  fit?: FitType;
}

export class CropOptions {
  width: number;

  height: number;

  x: number;

  y: number;
}

export class RotateOptions {
  angle: number;
}

export class WatermarkOptions {
  text: string;

  position?: WatermarkPosition;
}

export class FlipOptions {
  horizontal?: boolean;

  vertical?: boolean;
}

export class CompressOptions {
  quality: number;
}

export class FilterOptions {
  grayscale?: boolean;

  sepia?: boolean;

  blur?: number;

  sharpen?: boolean;

  negate?: boolean;
}

export class ImageTransformOptions {
  resize?: ResizeOptions;

  crop?: CropOptions;

  rotate?: RotateOptions;

  watermark?: WatermarkOptions;

  flip?: FlipOptions;

  compress?: CompressOptions;

  filter?: FilterOptions;

  format?: ImageFormat;
}
