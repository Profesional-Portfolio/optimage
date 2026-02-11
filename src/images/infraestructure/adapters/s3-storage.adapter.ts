import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageProvider } from '@/images/domain/interfaces/storage.interface';
import { env } from '@/config/env';
import path from 'path';

@Injectable()
export class S3StorageAdapter implements StorageProvider {
  private readonly bucketName: string;
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(S3StorageAdapter.name);

  constructor() {
    this.s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = env.AWS_S3_BUCKET;
  }

  async generateFilename(fileName: string, folder = 'images'): Promise<string> {
    const ext = path.extname(fileName);
    const randomString = crypto.randomUUID();
    return Promise.resolve(`${folder}/${randomString}${ext}`);
  }

  async getPublicUrl(path: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: path,
    });

    try {
      // Generate a pre-signed URL with an expiration time (e.g., 1 hour)
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      return url;
    } catch (error) {
      this.logger.error(`Error generating pre-signed URL for ${path}`, error);
      throw error;
    }
  }

  async upload(
    buffer: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
        Body: buffer,
        ContentType: mimetype,
      });

      await this.s3Client.send(command);
      this.logger.log(`File uploaded successfully: ${filename}`);
    } catch (error) {
      this.logger.error('Error uploading file to S3', error);
      throw error;
    }
  }

  async download(fileName: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    try {
      const response = await this.s3Client.send(command);
      if (!response.Body) {
        throw new Error('Empty response body from S3');
      }

      const uint8Array = await response.Body.transformToByteArray();
      return Buffer.from(uint8Array);
    } catch (error) {
      this.logger.error(`Error downloading file ${fileName} from S3`, error);
      throw error;
    }
  }

  async delete(fileName: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${fileName}`);
    } catch (error) {
      this.logger.error(`Error deleting file ${fileName} from S3`, error);
      throw error;
    }
  }
}
