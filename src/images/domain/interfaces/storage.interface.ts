export abstract class StorageProvider {
  abstract upload(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<string>;
  abstract delete(path: string): Promise<void>;
  abstract getPublicUrl(path: string): string;
}
