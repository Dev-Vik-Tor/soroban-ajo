import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { logger } from '../config/logger.config';

export interface PerformanceMetrics {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  private static readonly MAX_METRICS = 1000;

  static recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Log slow requests
    if (metric.duration > 1000) {
      logger.warn('Slow request detected', {
        path: metric.path,
        duration: metric.duration,
        method: metric.method
      });

      Sentry.captureMessage('Slow Request', {
        level: 'warning',
        extra: metric
      });
    }

    // Track in Sentry
    Sentry.addBreadcrumb({
      category: 'http',
      message: `${metric.method} ${metric.path}`,
      level: 'info',
      data: {
        duration: metric.duration,
        statusCode: metric.statusCode
      }
    });
  }

  static getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  static getAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / this.metrics.length;
  }

  static getSlowRequests(threshold: number = 1000): PerformanceMetrics[] {
    return this.metrics.filter(m => m.duration > threshold);
  }
}

export const performanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || `req-${Date.now()}`;

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    const metric: PerformanceMetrics = {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date(),
      userAgent: req.headers['user-agent'],
      ip: req.ip
    };

    PerformanceMonitor.recordMetric(metric);

    // Add custom header with response time
    res.setHeader('X-Response-Time', `${duration}ms`);
  });

  next();
};
