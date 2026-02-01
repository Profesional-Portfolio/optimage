import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T> {
  @ApiProperty({ type: 'object', example: {}, additionalProperties: true })
  data: T;

  @ApiProperty({ type: 'boolean', example: true })
  success: boolean;

  @ApiProperty({ type: 'string', example: 'Operation successful' })
  message: string;

  @ApiProperty({ type: 'number', example: 200 })
  statusCode: number;

  @ApiProperty({ type: 'string', example: '/api/v1/users' })
  path: string;

  @ApiProperty({ type: 'string', example: new Date().toISOString() })
  timestamp: Date;

  @ApiProperty({ type: 'string', example: 'trace-id-1234567890' })
  traceId: string;
}
