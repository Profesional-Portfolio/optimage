type LogMessage = any;
type LogContext = string;

export interface IAppLogger {
  log(context: LogContext, message: LogMessage): void;
  error(context: LogContext, message: LogMessage): void;
  warn(context: LogContext, message: LogMessage): void;
  debug(context: LogContext, message: LogMessage): void;
  verbose(context: LogContext, message: LogMessage): void;
}
