export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export const createConsoleLogger = (level: 'debug' | 'info' | 'warn' | 'error' = 'info'): Logger => {
  const levels = ['debug', 'info', 'warn', 'error'];
  const minLevel = levels.indexOf(level);

  const shouldLog = (logLevel: string) => levels.indexOf(logLevel) >= minLevel;

  return {
    debug: (message, ...args) => shouldLog('debug') && console.debug(`[DEBUG] ${message}`, ...args),
    info: (message, ...args) => shouldLog('info') && console.info(`[INFO] ${message}`, ...args),
    warn: (message, ...args) => shouldLog('warn') && console.warn(`[WARN] ${message}`, ...args),
    error: (message, ...args) => shouldLog('error') && console.error(`[ERROR] ${message}`, ...args),
  };
};
