import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { Logger } from '../config/logger.js';
import { AppError, RepositoryUnavailableError } from '../lib/errors.js';

interface ErrorBody {
  success: false;
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

const send = (res: Parameters<ErrorRequestHandler>[2], status: number, body: ErrorBody) =>
  res.status(status).json(body);

export const notFoundHandler: RequestHandler = (_req, res) => {
  send(res, 404, {
    success: false,
    code: 'NOT_FOUND',
    message: 'The requested resource was not found.',
  });
};

/**
 * Maps errors to safe public responses. Stack traces, SQL, credentials and other internals are
 * logged server-side only and never included in the response body.
 */
export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (error, req, res, next) => {
    if (res.headersSent) return next(error);

    if (error instanceof AppError) {
      return send(res, error.statusCode, {
        success: false,
        code: error.code,
        message: error.message,
        ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
      });
    }

    // Errors raised by the JSON body parser (http-errors style).
    const type = (error as { type?: string } | null)?.type;
    if (type === 'entity.too.large') {
      return send(res, 413, {
        success: false,
        code: 'PAYLOAD_TOO_LARGE',
        message: 'The request is too large.',
      });
    }
    if (type === 'entity.parse.failed') {
      return send(res, 400, {
        success: false,
        code: 'INVALID_JSON',
        message: 'The request body is not valid JSON.',
      });
    }
    if (type === 'charset.unsupported' || type === 'encoding.unsupported') {
      return send(res, 415, {
        success: false,
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Unsupported request encoding.',
      });
    }

    if (error instanceof RepositoryUnavailableError) {
      logger.error(
        { err: error, cause: String((error as Error & { cause?: unknown }).cause ?? '') },
        'data store unavailable',
      );
      return send(res, 503, {
        success: false,
        code: 'SERVICE_UNAVAILABLE',
        message: 'The message service is temporarily unavailable.',
      });
    }

    logger.error({ err: error, method: req.method, path: req.path }, 'unhandled error');
    return send(res, 500, {
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong on our side. Please try again later.',
    });
  };
}
