export interface ImageProps {
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
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: any;
}

export class Image {
  public id: string = '';
  public userId: string = '';
  public originalFileName: string = '';
  public storedFileName: string = '';
  public filePath: string = '';
  public mimeType: string = '';
  public size: number = 0;
  public width: number = 0;
  public height: number = 0;
  public format: string = '';
  public createdAt: Date = new Date();
  public updatedAt: Date = new Date();

  constructor() {}

  static fromObject(object: ImageProps): Image {
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

    const props: ImageProps = {
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
      createdAt: createdAt ? new Date(createdAt) : new Date(),
      updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
    };

    const image = new Image();
    Object.assign(image, props);
    return image;
  }
}
