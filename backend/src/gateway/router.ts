import { Request, Response, NextFunction } from 'express'
import { GatewayConfig, defaultGatewayConfig } from './config'

interface CircuitBreakerState {
  failures: number
  lastFailureTime: number
  state: 'closed' | 'open' | 'half-open'
}

export class APIGateway {
  private config: GatewayConfig
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map()
  private requestCounts: Map<string, number> = new Map()

  constructor(config: Partial<GatewayConfig> = {}) {
    this.config = { ...defaultGatewayConfig, ...config }
  }

  /**
   * Rate limiting middleware
   */
  rateLimitMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.config.rateLimit.keyGenerator?.(req) || req.ip || 'unknown'
      const now = Date.now()
      const windowStart = now - this.config.rateLimit.windowMs

      const count = this.requestCounts.get(key) || 0
      if (count >= this.config.rateLimit.maxRequests) {
        return res.status(429).json({ error: 'Too many requests' })
      }

      this.requestCounts.set(key, count + 1)
      setTimeout(() => {
        const current = this.requestCounts.get(key) || 0
        this.requestCounts.set(key, Math.max(0, current - 1))
      }, this.config.rateLimit.windowMs)

      next()
    }
  }

  /**
   * Authentication middleware
   */
  authMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.authentication.enabled) return next()

      const token = req.headers.authorization?.split(' ')[1]
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Token validation would be implemented here
      next()
    }
  }

  /**
   * Circuit breaker for service calls
   */
  private getCircuitBreaker(service: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(service)) {
      this.circuitBreakers.set(service, {
        failures: 0,
        lastFailureTime: 0,
        state: 'closed',
      })
    }
    return this.circuitBreakers.get(service)!
  }

  /**
   * Check circuit breaker state
   */
  isCircuitOpen(service: string): boolean {
    const breaker = this.getCircuitBreaker(service)
    if (breaker.state === 'closed') return false

    if (breaker.state === 'open') {
      const timeSinceFailure = Date.now() - breaker.lastFailureTime
      if (timeSinceFailure > this.config.routing.circuitBreaker.timeout) {
        breaker.state = 'half-open'
        return false
      }
      return true
    }

    return false
  }

  /**
   * Record service call result
   */
  recordServiceCall(service: string, success: boolean) {
    const breaker = this.getCircuitBreaker(service)

    if (success) {
      breaker.failures = 0
      if (breaker.state === 'half-open') {
        breaker.state = 'closed'
      }
    } else {
      breaker.failures++
      breaker.lastFailureTime = Date.now()

      if (breaker.failures >= this.config.routing.circuitBreaker.threshold) {
        breaker.state = 'open'
      }
    }
  }

  /**
   * Request routing middleware
   */
  routingMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const service = req.path.split('/')[1]

      if (this.isCircuitOpen(service)) {
        return res.status(503).json({ error: 'Service unavailable' })
      }

      const originalSend = res.send
      res.send = function (data: any) {
        const success = res.statusCode < 400
        this.recordServiceCall(service, success)
        return originalSend.call(this, data)
      }

      next()
    }
  }

  /**
   * Logging middleware
   */
  loggingMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.logging.enabled) return next()

      const start = Date.now()
      const originalSend = res.send

      res.send = function (data: any) {
        const duration = Date.now() - start
        console.log(`[${this.config.logging.level}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`)
        return originalSend.call(this, data)
      }

      next()
    }
  }

  /**
   * Get gateway health status
   */
  getHealth() {
    const circuitBreakerStatus: Record<string, string> = {}
    this.circuitBreakers.forEach((breaker, service) => {
      circuitBreakerStatus[service] = breaker.state
    })

    return {
      status: 'healthy',
      circuitBreakers: circuitBreakerStatus,
      rateLimitingActive: this.config.rateLimit.maxRequests > 0,
    }
  }
}

export const apiGateway = new APIGateway()
