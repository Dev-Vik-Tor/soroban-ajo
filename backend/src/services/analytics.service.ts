import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/node';
import { logger } from '../config/logger.config';

export interface UserAnalytics {
  userId: string;
  event: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

export interface SystemMetrics {
  activeUsers: number;
  totalGroups: number;
  totalContributions: number;
  averageContributionAmount: number;
  timestamp: Date;
}

export class AnalyticsService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async trackUserEvent(analytics: UserAnalytics): Promise<void> {
    try {
      logger.info('User event tracked', {
        userId: analytics.userId,
        event: analytics.event
      });

      // Track in Sentry
      Sentry.addBreadcrumb({
        category: 'user-action',
        message: analytics.event,
        level: 'info',
        data: {
          userId: analytics.userId,
          ...analytics.properties
        }
      });

      // Store in database for analytics
      await this.prisma.userActivity.create({
        data: {
          userId: analytics.userId,
          action: analytics.event,
          metadata: analytics.properties as any,
          timestamp: analytics.timestamp
        }
      });
    } catch (error) {
      logger.error('Failed to track user event', { error });
      Sentry.captureException(error);
    }
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const [activeUsers, totalGroups, contributionStats] = await Promise.all([
        this.prisma.user.count({
          where: {
            lastLoginAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        }),
        this.prisma.group.count(),
        this.prisma.contribution.aggregate({
          _count: true,
          _avg: {
            amount: true
          }
        })
      ]);

      return {
        activeUsers,
        totalGroups,
        totalContributions: contributionStats._count,
        averageContributionAmount: contributionStats._avg.amount || 0,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Failed to get system metrics', { error });
      Sentry.captureException(error);
      throw error;
    }
  }

  async getUserEngagementMetrics(userId: string): Promise<any> {
    try {
      const [activityCount, groupCount, contributionCount] = await Promise.all([
        this.prisma.userActivity.count({
          where: { userId }
        }),
        this.prisma.groupMember.count({
          where: { userId }
        }),
        this.prisma.contribution.count({
          where: { userId }
        })
      ]);

      return {
        userId,
        totalActivities: activityCount,
        groupsJoined: groupCount,
        contributionsMade: contributionCount,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Failed to get user engagement metrics', { error, userId });
      Sentry.captureException(error);
      throw error;
    }
  }
}
