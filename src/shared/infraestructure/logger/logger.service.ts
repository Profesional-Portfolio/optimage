import { ConsoleLogger, Injectable } from '@nestjs/common';
import { IAppLogger } from '@/shared/domain/interfaces/logger.interface';
import { IdGenerator } from '@/shared/infraestructure/utils/id-generator';

@Injectable()
export class AppLogger extends ConsoleLogger implements IAppLogger {
  private traceId: string = new IdGenerator().generate();

  constructor(context?: string) {
    super();
    this.setContext(context || 'AppLogger');
  }

  getTraceId(): string {
    return this.traceId;
  }

  setTraceId(traceId: string): void {
    this.traceId = traceId;
  }

  log(context: string, message: string): void {
    super.log(`[${this.traceId}] ${context}: ${message}`);
  }

  error(context: string, message: string): void {
    super.error(`[${this.traceId}] ${context}: ${message}`);
  }

  warn(context: string, message: string): void {
    super.warn(`[${this.traceId}] ${context}: ${message}`);
  }

  debug(context: string, message: string): void {
    super.debug(`[${this.traceId}] ${context}: ${message}`);
  }

  verbose(context: string, message: string): void {
    super.verbose(`[${this.traceId}] ${context}: ${message}`);
  }
}
