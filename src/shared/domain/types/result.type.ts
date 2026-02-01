export type Result<T> = [Error, null] | [null, T];

export const success = <T>(data: T): Result<T> => [null, data];
export const failure = <T>(error: Error): Result<T> => [error, null];
