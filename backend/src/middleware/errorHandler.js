import { AppError, ErrorType } from '../shared/errors.js'

/**
 * Global Express error handler.
 * Converts AppError instances to structured JSON responses.
 * Hides internal details in production.
 */
export function errorHandler(err, req, res, _next) {
  const requestId = req.requestId

  if (err instanceof AppError) {
    const body = err.toJSON()
    if (requestId) body.error.requestId = requestId
    return res.status(err.httpStatus).json(body)
  }

  // Unexpected errors — log and return INTERNAL_ERROR
  console.error('[error]', { requestId, message: err.message, stack: err.stack })

  const isProd = process.env.NODE_ENV === 'production'
  return res.status(500).json({
    error: {
      type: ErrorType.INTERNAL_ERROR,
      message: isProd ? 'Internal server error' : err.message,
      ...(requestId ? { requestId } : {}),
    },
  })
}

/** Wrap async route handlers to pass errors to the error handler. */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}
