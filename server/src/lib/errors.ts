/** An error whose message is safe to show to API clients. */
export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** The database cannot be reached or is missing its schema. Mapped to HTTP 503. */
export class RepositoryUnavailableError extends Error {
  constructor(message = 'The data store is unavailable', options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'RepositoryUnavailableError';
  }
}

/** The generated public reference collided with an existing one; the caller retries. */
export class ReferenceCollisionError extends Error {
  constructor() {
    super('Reference collision');
    this.name = 'ReferenceCollisionError';
  }
}
