import { IIdGenerator } from '@/shared/domain/interfaces/id-generator.interface';

export class IdGenerator implements IIdGenerator {
  generate(): string {
    return crypto.randomUUID();
  }
}
