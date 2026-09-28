/**
 * Standard error categories for EFM PP Foundation.
 * All API error responses use one of these types.
 */

export const ErrorType = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
})

const HTTP_STATUS = {
  [ErrorType.VALIDATION_ERROR]: 400,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.CONFLICT]: 409,
  [ErrorType.UNAUTHORIZED]: 401,
  [ErrorType.FORBIDDEN]: 403,
  [ErrorType.INTERNAL_ERROR]: 500,
  [ErrorType.BUSINESS_RULE_VIOLATION]: 422,
}

export class AppError extends Error {
  constructor(type, message, details = null) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.httpStatus = HTTP_STATUS[type] ?? 500
    this.details = details
  }

  toJSON() {
    return {
      error: {
        type: this.type,
        message: this.message,
        ...(this.details ? { details: this.details } : {}),
      },
    }
  }
}

export function validationError(message, details) {
  return new AppError(ErrorType.VALIDATION_ERROR, message, details)
}

export function notFound(entity, id) {
  return new AppError(ErrorType.NOT_FOUND, `${entity} not found: ${id}`)
}

export function conflict(message) {
  return new AppError(ErrorType.CONFLICT, message)
}

export function unauthorized(message = 'Authentication required') {
  return new AppError(ErrorType.UNAUTHORIZED, message)
}

export function forbidden(message = 'Access denied') {
  return new AppError(ErrorType.FORBIDDEN, message)
}

export function internalError(message = 'Internal server error') {
  return new AppError(ErrorType.INTERNAL_ERROR, message)
}

export function businessRuleViolation(rule, message) {
  return new AppError(ErrorType.BUSINESS_RULE_VIOLATION, message, { rule })
}
