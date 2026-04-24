# Performance Monitoring Documentation

## Overview
This document describes the performance monitoring system implemented for the Soroban Ajo platform using Sentry, custom analytics, and alerting.

## Components

### 1. Performance Middleware
Located in `backend/src/middleware/performance.middleware.ts`

Tracks all HTTP requests and records:
- Request duration
- HTTP method and path
- Status code
- User agent and IP
- Request ID

Features:
- Automatic slow request detection (>1000ms)
- Response time headers
- Integration with Sentry breadcrumbs
- In-memory metrics storage

### 2. Analytics Service
Located in `backend/src/services/analytics.service.ts`

Provides:
- User event tracking
- System-wide metrics
- User engagement metrics
- Database analytics

Metrics tracked:
- Active users (last 30 days)
- Total groups
- Total contributions
- Average contribution amount
- User activity counts

### 3. Alerting Service
Located in `backend/src/services/alerting.service.ts`

Alert severity levels:
- INFO: Informational messages
- WARNING: Potential issues
- ERROR: Error conditions
- CRITICAL: System-critical issues

Predefined alerts:
- High error rate detection
- Slow response time warnings
- Database connection issues
- API rate limit violations

### 4. Monitoring Controller
Located in `backend/src/controllers/monitoring.controller.ts`

Endpoints:
- `GET /api/monitoring/performance` - Performance metrics
- `GET /api/monitoring/system` - System metrics
- `GET /api/monitoring/alerts` - Recent alerts
- `GET /api/monitoring/users/:userId` - User analytics
- `GET /api/monitoring/health` - Health check

## Sentry Integration

### Configuration
Sentry is configured in `backend/src/config/sentry.config.ts`

Features enabled:
- Error tracking
- Performance monitoring
- Request breadcrumbs
- User context tracking
- Release tracking

### Error Tracking
All errors are automatically captured and sent to Sentry with:
- Stack traces
- Request context
- User information
- Custom metadata

### Performance Monitoring
Tracks:
- API endpoint performance
- Database query performance
- External API calls
- Custom transactions

## DataDog Integration (Optional)

### Configuration
DataDog can be configured in `backend/src/config/datadog.ts`

Metrics sent to DataDog:
- Request count
- Response times
- Error rates
- Custom business metrics

### APM (Application Performance Monitoring)
- Distributed tracing
- Service dependencies
- Performance bottlenecks
- Resource utilization

## Usage

### Tracking Custom Events
```typescript
import { AnalyticsService } from './services/analytics.service';

const analyticsService = new AnalyticsService(prisma);

await analyticsService.trackUserEvent({
  userId: 'user123',
  event: 'contribution_made',
  properties: {
    amount: 1000,
    groupId: 'group456'
  },
  timestamp: new Date()
});
```

### Sending Custom Alerts
```typescript
import { AlertingService, AlertSeverity } from './services/alerting.service';

AlertingService.sendAlert({
  title: 'Custom Alert',
  message: 'Something important happened',
  severity: AlertSeverity.WARNING,
  metadata: { key: 'value' },
  timestamp: new Date()
});
```

### Accessing Metrics
```typescript
import { PerformanceMonitor } from './middleware/performance.middleware';

const avgResponseTime = PerformanceMonitor.getAverageResponseTime();
const slowRequests = PerformanceMonitor.getSlowRequests(1000);
```

## Monitoring Dashboard

### Key Metrics to Monitor
1. Average response time
2. Error rate
3. Request throughput
4. Active users
5. Database query performance
6. Memory usage
7. CPU usage

### Alert Thresholds
- Response time > 1000ms: WARNING
- Error rate > 5%: ERROR
- Database connection failure: CRITICAL
- Memory usage > 80%: WARNING
- CPU usage > 90%: ERROR

## Best Practices

1. Always include context in error reports
2. Use appropriate alert severity levels
3. Monitor trends, not just absolute values
4. Set up alert notifications (email, Slack, SMS)
5. Regularly review and adjust thresholds
6. Archive old metrics to prevent memory issues
7. Use sampling for high-traffic endpoints

## Integration with CI/CD

Performance monitoring is integrated with CI/CD:
- Automated performance tests
- Regression detection
- Release tracking in Sentry
- Deployment notifications

## Future Enhancements

- Real-time dashboard
- Anomaly detection with ML
- Predictive alerting
- Custom metric aggregation
- Integration with more monitoring tools
- User session replay
- Frontend performance monitoring
