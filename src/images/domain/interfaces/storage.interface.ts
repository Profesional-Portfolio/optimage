export abstract class StorageProvider {
  abstract upload(
    buffer: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<void>;
  abstract download(path: string): Promise<Buffer>;
  abstract delete(path: string): Promise<void>;
  abstract generateFilename(fileName: string, folder?: string): Promise<string>;
  abstract getPublicUrl(path: string): Promise<string>;
}
