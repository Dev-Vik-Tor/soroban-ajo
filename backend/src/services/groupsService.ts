import { SorobanService } from './sorobanService'
import { gamificationService } from './gamification/GamificationService'
import { notificationService } from './notificationService'
import { logger } from '../utils/logger'
import { NotFoundError } from '../errors/AppError'

export class GroupsService {
  constructor(private readonly soroban: SorobanService = new SorobanService()) {}

  async listGroups(pagination: { page: number; limit: number }) {
    return this.soroban.getAllGroups(pagination)
  }

  async getGroup(id: string) {
    const group = await this.soroban.getGroup(id)
    if (!group) throw new NotFoundError('Group', id)
    return group
  }

  async createGroup(groupData: Record<string, unknown>) {
    return this.soroban.createGroup(groupData)
  }

  async joinGroup(id: string, publicKey: string, signedXdr?: string) {
    const result = await this.soroban.joinGroup(id, publicKey, signedXdr)

    if (result.txHash && publicKey) {
      try {
        await notificationService.sendToGroup(
          id,
          {
            type: 'member_joined',
            title: 'New member joined',
            message: 'A new member has joined your savings group.',
            actionUrl: `/groups/${id}`,
          },
          publicKey
        )
      } catch (err) {
        logger.error('Failed to send member_joined notification', { err })
      }
    }

    return result
  }

  async contribute(id: string, publicKey: string, amount: number, signedXdr?: string) {
    const result = await this.soroban.contribute(id, publicKey, amount, signedXdr)

    if (result.txHash && publicKey) {
      try {
        await gamificationService.handleContribution(publicKey, result.txHash)
      } catch (err) {
        logger.error('Failed to update gamification', { err, publicKey })
      }

      try {
        notificationService.sendToUser(publicKey, {
          type: 'contribution_received',
          title: 'Contribution confirmed',
          message: 'Your contribution to the group has been recorded on-chain.',
          groupId: id,
          actionUrl: `/groups/${id}`,
        })
      } catch (err) {
        logger.error('Failed to send contribution_received notification', { err })
      }
    }

    return result
  }

  async getMembers(id: string) {
    return this.soroban.getGroupMembers(id)
  }

  async getTransactions(id: string, pagination: { page: number; limit: number }) {
    return this.soroban.getGroupTransactions(id, pagination)
  }
}

export const groupsService = new GroupsService()
