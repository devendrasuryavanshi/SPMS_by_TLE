import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'SPMS' },
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp, ...meta }) => {
            return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
              }`;
          }
        )
      ),
    }),

    ...(process.env.NODE_ENV === 'production'
      ? [
        // Error logs
        new winston.transports.File({
          filename: path.join('logs', 'error.log'),
          level: 'error',
          maxsize: 10485760, // 10MB
          maxFiles: 5,
        }),
        // Combined logs
        new winston.transports.File({
          filename: path.join('logs', 'combined.log'),
          maxsize: 10485760, // 10MB
          maxFiles: 5,
        }),
      ]
      : []),
  ],
});

export default logger;