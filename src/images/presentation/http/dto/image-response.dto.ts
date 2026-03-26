import { ApiProperty } from '@nestjs/swagger';

export class ImageResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the image',
  })
  id: string;

  @ApiProperty({
    example: 'user-id-123',
    description: 'ID of the user who owns the image',
  })
  userId: string;

  @ApiProperty({
    example: 'nature.jpg',
    description: 'Original name of the uploaded file',
  })
  originalFileName: string;

  @ApiProperty({
    example: '1234abcd.jpg',
    description: 'Name of the file as stored on the server',
  })
  storedFileName: string;

  @ApiProperty({ example: 'image/jpeg', description: 'MIME type of the image' })
  mimeType: string;

  @ApiProperty({ example: 102450, description: 'Size of the image in bytes' })
  size: number;

  @ApiProperty({
    example: '/uploads/1234abcd.jpg',
    description: 'Path to access the image',
  })
  filePath: string;

  @ApiProperty({ example: 1920, description: 'Width of the image in pixels' })
  width: number;

  @ApiProperty({ example: 1080, description: 'Height of the image in pixels' })
  height: number;

  @ApiProperty({ example: 'jpeg', description: 'Format of the image' })
  format: string;

  @ApiProperty({
    type: Date,
    description: 'Date and time when the image was created',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Date and time when the image was last updated',
  })
  updatedAt: Date;
}
