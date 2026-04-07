export interface GatewayConfig {
  rateLimit: {
    windowMs: number
    maxRequests: number
    keyGenerator?: (req: any) => string
  }
  authentication: {
    enabled: boolean
    strategies: string[]
  }
  routing: {
    timeout: number
    retries: number
    circuitBreaker: {
      enabled: boolean
      threshold: number
      timeout: number
    }
  }
  logging: {
    enabled: boolean
    level: 'debug' | 'info' | 'warn' | 'error'
  }
}

export const defaultGatewayConfig: GatewayConfig = {
  rateLimit: {
    windowMs: 60000,
    maxRequests: 100,
  },
  authentication: {
    enabled: true,
    strategies: ['jwt', 'api-key'],
  },
  routing: {
    timeout: 30000,
    retries: 2,
    circuitBreaker: {
      enabled: true,
      threshold: 50,
      timeout: 60000,
    },
  },
  logging: {
    enabled: true,
    level: 'info',
  },
}
