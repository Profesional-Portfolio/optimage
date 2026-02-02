export class Image {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly originalFileName: string,
    public readonly storedFileName: string,
    public readonly filePath: string,
    public readonly mimeType: string,
    public readonly size: number,
    public readonly width: number,
    public readonly height: number,
    public readonly format: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static fromObject(object: {
    id: string;
    userId: string;
    originalFileName: string;
    storedFileName: string;
    filePath: string;
    mimeType: string;
    size: number;
    width: number;
    height: number;
    format: string;
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: any;
  }): Image {
    const {
      id,
      userId,
      originalFileName,
      storedFileName,
      filePath,
      mimeType,
      size,
      width,
      height,
      format,
      createdAt,
      updatedAt,
    } = object;

    if (!id) throw new Error('Image id is required');
    if (!userId) throw new Error('Image userId is required');
    if (!originalFileName)
      throw new Error('Image originalFileName is required');
    if (!storedFileName) throw new Error('Image storedFileName is required');
    if (!filePath) throw new Error('Image filePath is required');
    if (!mimeType) throw new Error('Image mimeType is required');
    if (!size) throw new Error('Image size is required');
    if (!width) throw new Error('Image width is required');
    if (!height) throw new Error('Image height is required');
    if (!format) throw new Error('Image format is required');

    return new Image(
      id,
      userId,
      originalFileName,
      storedFileName,
      filePath,
      mimeType,
      size,
      width,
      height,
      format,
      createdAt ?? new Date(),
      updatedAt ?? new Date(),
    );
  }
}
