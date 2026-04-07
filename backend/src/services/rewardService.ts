import { PrismaClient } from '@prisma/client'
import { RewardEngine } from './RewardEngine'
import { FraudDetector } from './FraudDetector'
import Redis from 'ioredis'

export class RewardService {
  private readonly rewardEngine: RewardEngine

  constructor(
    private readonly prisma: PrismaClient = new PrismaClient(),
    redis: Redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
  ) {
    const fraudDetector = new FraudDetector(prisma, redis)
    this.rewardEngine = new RewardEngine(prisma, fraudDetector)
  }

  async getRewards(userId: string, filters: { status?: string; type?: string }) {
    return this.prisma.reward.findMany({
      where: {
        userId,
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
      },
      orderBy: { earnedAt: 'desc' },
    })
  }

  async redeemReward(userId: string, rewardId: string) {
    const reward = await this.prisma.reward.findUnique({ where: { id: rewardId } })
    if (!reward) throw Object.assign(new Error('Reward not found'), { statusCode: 404 })
    if (reward.userId !== userId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 })

    await this.rewardEngine.redeemReward(rewardId)
    return this.prisma.reward.findUnique({ where: { id: rewardId } })
  }

  async getRewardHistory(userId: string) {
    const history = await this.prisma.reward.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    })
    return {
      history,
      totalEarned: history.length,
      totalRedeemed: history.filter((r: { status: string }) => r.status === 'REDEEMED').length,
    }
  }
}

export const rewardService = new RewardService()
