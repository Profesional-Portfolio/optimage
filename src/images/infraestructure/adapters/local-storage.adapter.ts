import { Injectable } from '@nestjs/common';
import { StorageProvider } from '../../domain/interfaces/storage.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class LocalStorageAdapter implements StorageProvider {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    void this.ensureDirExists();
  }

  private async ensureDirExists() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async upload(
    buffer: Buffer,
    fileName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mimeType: string,
  ): Promise<string> {
    await this.ensureDirExists();
    const filePath = path.join(this.uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    return fileName; // We return the fileName as the path key
  }

  async delete(fileName: string): Promise<void> {
    const filePath = path.join(this.uploadDir, fileName);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error);
    }
  }

  getPublicUrl(fileName: string): string {
    // For local storage, we might want to serve it via a static route
    return `/uploads/${fileName}`;
  }
}
