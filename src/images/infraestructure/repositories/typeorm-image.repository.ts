import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageRepository } from '../../domain/repositories/image.repository';
import { ImagePersistence } from '../entities/image.persistence.entity';
import { Image } from '../../domain/entities/image.entity';
import { failure, Result, success } from '@/shared/domain/types/result.type';

@Injectable()
export class TypeOrmImageRepository implements ImageRepository {
  constructor(
    @InjectRepository(ImagePersistence)
    private readonly repository: Repository<ImagePersistence>,
  ) {}

  async save(image: Image): Promise<Result<Image>> {
    try {
      const persistence = this.mapToPersistence(image);
      const saved = await this.repository.save(persistence);
      return success(this.mapToDomain(saved));
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findById(id: string): Promise<Result<Image | null>> {
    try {
      const found = await this.repository.findOne({ where: { id } });
      if (!found) return success(null);
      return success(this.mapToDomain(found));
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findByUserId(userId: string): Promise<Result<Image[]>> {
    try {
      const found = await this.repository.find({ where: { userId } });
      return success(found.map((item) => this.mapToDomain(item)));
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.repository.delete(id);
      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private mapToDomain(persistence: ImagePersistence): Image {
    return Image.fromObject({
      id: persistence.id,
      userId: persistence.userId,
      originalFileName: persistence.originalFileName,
      storedFileName: persistence.storedFileName,
      filePath: persistence.filePath,
      mimeType: persistence.mimeType,
      size: persistence.size,
      width: persistence.width,
      height: persistence.height,
      format: persistence.format,
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
    });
  }

  private mapToPersistence(domain: Image): ImagePersistence {
    const persistence = new ImagePersistence();
    persistence.id = domain.id;
    persistence.userId = domain.userId;
    persistence.originalFileName = domain.originalFileName;
    persistence.storedFileName = domain.storedFileName;
    persistence.filePath = domain.filePath;
    persistence.mimeType = domain.mimeType;
    persistence.size = domain.size;
    persistence.width = domain.width;
    persistence.height = domain.height;
    persistence.format = domain.format;
    return persistence;
  }
}
