import * as Sentry from '@sentry/node';
import { logger } from '../config/logger.config';

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface Alert {
  title: string;
  message: string;
  severity: AlertSeverity;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export class AlertingService {
  private static alerts: Alert[] = [];
  private static readonly MAX_ALERTS = 500;

  static sendAlert(alert: Alert): void {
    this.alerts.push(alert);

    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts.shift();
    }

    // Log based on severity
    switch (alert.severity) {
      case AlertSeverity.INFO:
        logger.info(alert.message, { title: alert.title, ...alert.metadata });
        break;
      case AlertSeverity.WARNING:
        logger.warn(alert.message, { title: alert.title, ...alert.metadata });
        Sentry.captureMessage(alert.title, {
          level: 'warning',
          extra: alert.metadata
        });
        break;
      case AlertSeverity.ERROR:
        logger.error(alert.message, { title: alert.title, ...alert.metadata });
        Sentry.captureMessage(alert.title, {
          level: 'error',
          extra: alert.metadata
        });
        break;
      case AlertSeverity.CRITICAL:
        logger.error(`CRITICAL: ${alert.message}`, { title: alert.title, ...alert.metadata });
        Sentry.captureMessage(alert.title, {
          level: 'fatal',
          extra: alert.metadata
        });
        // Send to additional channels (email, SMS, Slack, etc.)
        this.sendCriticalAlert(alert);
        break;
    }
  }

  private static sendCriticalAlert(alert: Alert): void {
    // Implement critical alert notifications
    // This could send emails, SMS, Slack messages, etc.
    logger.error('CRITICAL ALERT', {
      alert,
      note: 'Additional notification channels should be configured'
    });
  }

  static getRecentAlerts(limit: number = 50): Alert[] {
    return this.alerts.slice(-limit);
  }

  static getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return this.alerts.filter(a => a.severity === severity);
  }

  static clearAlerts(): void {
    this.alerts = [];
  }

  // Predefined alert helpers
  static highErrorRate(errorCount: number, threshold: number): void {
    if (errorCount > threshold) {
      this.sendAlert({
        title: 'High Error Rate Detected',
        message: `Error count (${errorCount}) exceeded threshold (${threshold})`,
        severity: AlertSeverity.ERROR,
        metadata: { errorCount, threshold },
        timestamp: new Date()
      });
    }
  }

  static slowResponseTime(avgResponseTime: number, threshold: number): void {
    if (avgResponseTime > threshold) {
      this.sendAlert({
        title: 'Slow Response Time',
        message: `Average response time (${avgResponseTime}ms) exceeded threshold (${threshold}ms)`,
        severity: AlertSeverity.WARNING,
        metadata: { avgResponseTime, threshold },
        timestamp: new Date()
      });
    }
  }

  static databaseConnectionIssue(error: Error): void {
    this.sendAlert({
      title: 'Database Connection Issue',
      message: error.message,
      severity: AlertSeverity.CRITICAL,
      metadata: { error: error.stack },
      timestamp: new Date()
    });
  }

  static apiRateLimitExceeded(userId: string, endpoint: string): void {
    this.sendAlert({
      title: 'API Rate Limit Exceeded',
      message: `User ${userId} exceeded rate limit on ${endpoint}`,
      severity: AlertSeverity.WARNING,
      metadata: { userId, endpoint },
      timestamp: new Date()
    });
  }
}
