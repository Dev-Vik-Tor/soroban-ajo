import * as Sentry from '@sentry/react';

export interface FrontendMetric {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: Date;
}

export class FrontendMonitoringService {
  static trackPageView(pageName: string): void {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${pageName}`,
      level: 'info'
    });
  }

  static trackUserAction(action: string, metadata?: Record<string, any>): void {
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: action,
      level: 'info',
      data: metadata
    });
  }

  static trackPerformance(metric: FrontendMetric): void {
    // Track custom performance metrics
    if (window.performance && window.performance.mark) {
      window.performance.mark(metric.name);
    }

    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${metric.name}: ${metric.value}ms`,
      level: 'info',
      data: metric.tags
    });
  }

  static trackError(error: Error, context?: Record<string, any>): void {
    Sentry.captureException(error, {
      extra: context
    });
  }

  static setUser(userId: string, email?: string, username?: string): void {
    Sentry.setUser({
      id: userId,
      email,
      username
    });
  }

  static clearUser(): void {
    Sentry.setUser(null);
  }

  static measureComponentRender(componentName: string, duration: number): void {
    this.trackPerformance({
      name: `component.render.${componentName}`,
      value: duration,
      tags: { component: componentName },
      timestamp: new Date()
    });
  }

  static measureApiCall(endpoint: string, duration: number, success: boolean): void {
    this.trackPerformance({
      name: `api.call.${endpoint}`,
      value: duration,
      tags: {
        endpoint,
        success: success.toString()
      },
      timestamp: new Date()
    });
  }
}
