import { Request, Response } from 'express';
import { PerformanceMonitor } from '../middleware/performance.middleware';
import { AlertingService } from '../services/alerting.service';
import { AnalyticsService } from '../services/analytics.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const analyticsService = new AnalyticsService(prisma);

export class MonitoringController {
  async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = {
        averageResponseTime: PerformanceMonitor.getAverageResponseTime(),
        slowRequests: PerformanceMonitor.getSlowRequests(1000),
        recentMetrics: PerformanceMonitor.getMetrics().slice(-50)
      };

      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve performance metrics' });
    }
  }

  async getSystemMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await analyticsService.getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve system metrics' });
    }
  }

  async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { severity, limit } = req.query;
      
      let alerts;
      if (severity) {
        alerts = AlertingService.getAlertsBySeverity(severity as any);
      } else {
        alerts = AlertingService.getRecentAlerts(
          limit ? parseInt(limit as string) : 50
        );
      }

      res.json({ alerts });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve alerts' });
    }
  }

  async getUserAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const metrics = await analyticsService.getUserEngagementMetrics(userId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve user analytics' });
    }
  }

  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      const health = {
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        averageResponseTime: PerformanceMonitor.getAverageResponseTime()
      };

      res.json(health);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: 'Database connection failed'
      });
    }
  }
}

export const monitoringController = new MonitoringController();
