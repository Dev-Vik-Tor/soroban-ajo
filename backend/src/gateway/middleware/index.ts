import { Request, Response, NextFunction } from 'express'

/**
 * Authentication middleware for API Gateway
 */
export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' })
  }

  // Token validation logic would be implemented here
  // For now, we just verify it exists
  req.user = { authenticated: true }
  next()
}

/**
 * Request validation middleware
 */
export const requestValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Validate request headers, body, query params
  if (req.method !== 'GET' && !req.is('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' })
  }

  next()
}

/**
 * Response transformation middleware
 */
export const responseTransformMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json

  res.json = function (data: any) {
    const response = {
      success: res.statusCode < 400,
      data,
      timestamp: new Date().toISOString(),
    }
    return originalJson.call(this, response)
  }

  next()
}

/**
 * Error handling middleware
 */
export const errorHandlingMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error('Gateway error:', err)

  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  })
}
