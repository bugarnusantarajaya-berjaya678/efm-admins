import { v4 as uuidv4 } from 'uuid'

const HEADER = 'x-request-id'

/**
 * Attaches a UUID correlation/request ID to every inbound request.
 * Reads from the X-Request-Id header if provided by the caller, otherwise generates one.
 * The ID is available as req.requestId throughout the request lifecycle.
 */
export function correlationId(req, res, next) {
  const incoming = req.headers[HEADER]
  req.requestId = (incoming && /^[0-9a-f-]{36}$/i.test(incoming))
    ? incoming
    : uuidv4()
  res.setHeader(HEADER, req.requestId)
  next()
}
