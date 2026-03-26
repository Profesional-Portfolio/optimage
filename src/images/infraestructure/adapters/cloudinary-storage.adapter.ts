import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { StorageProvider } from '@/images/domain/interfaces/storage.interface';
import { env } from '@/config/env';
import path from 'path';

@Injectable()
export class CloudinaryStorageAdapter implements StorageProvider {
  private readonly logger = new Logger(CloudinaryStorageAdapter.name);

  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  }

  async generateFilename(fileName: string, folder = 'images'): Promise<string> {
    const ext = path.extname(fileName);
    const randomString = crypto.randomUUID();
    return Promise.resolve(`${folder}/${randomString}${ext}`);
  }

  async getPublicUrl(path: string): Promise<string> {
    // Return standard HTTP URL to bypass potential S3 pre-signed specific logic on the client
    return Promise.resolve(cloudinary.url(path));
  }

  async upload(
    buffer: Buffer,
    filename: string,
    _mimetype: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const publicId = this.stripExtension(filename);
      const uploadStream = cloudinary.uploader.upload_stream(
        { public_id: publicId },
        (error, _result) => {
          if (error) {
            this.logger.error('Error uploading file to Cloudinary', error);
            return reject(error as Error);
          }
          this.logger.log(
            `File uploaded successfully to Cloudinary: ${filename}`,
          );
          resolve();
        },
      );

      uploadStream.end(buffer);
    });
  }

  async download(fileName: string): Promise<Buffer> {
    try {
      const url = cloudinary.url(fileName);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      this.logger.error(
        `Error downloading file ${fileName} from Cloudinary`,
        error,
      );
      throw error;
    }
  }

  async delete(fileName: string): Promise<void> {
    try {
      const publicId = this.stripExtension(fileName);
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`File deleted successfully from Cloudinary: ${fileName}`);
    } catch (error) {
      this.logger.error(
        `Error deleting file ${fileName} from Cloudinary`,
        error,
      );
      throw error;
    }
  }

  private stripExtension(fileName: string): string {
    const ext = path.extname(fileName);
    return ext ? fileName.slice(0, -ext.length) : fileName;
  }
}
