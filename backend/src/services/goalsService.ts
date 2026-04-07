import { GoalRepository } from '../repositories/GoalRepository'
import { prisma } from '../config/database'
import { AppError } from '../errors/AppError'

const serializeBigInt = (data: unknown) =>
  JSON.parse(JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v)))

export class GoalsService {
  constructor(private readonly goalRepo: GoalRepository = new GoalRepository(prisma)) {}

  async createGoal(userId: string, body: {
    title: string
    description?: string
    targetAmount: string | number
    deadline: string
    category: string
    isPublic?: boolean
  }) {
    const goal = await this.goalRepo.create({
      title: body.title,
      description: body.description,
      targetAmount: BigInt(body.targetAmount),
      deadline: new Date(body.deadline),
      category: body.category,
      isPublic: body.isPublic ?? false,
      userId,
      currentAmount: BigInt(0),
    })
    return serializeBigInt(goal)
  }

  async getGoals(userId: string) {
    const goals = await this.goalRepo.findByUser(userId)
    return serializeBigInt(goals)
  }

  async getGoal(id: string) {
    const goal = await this.goalRepo.findWithMembers(id)
    if (!goal) throw new AppError('Goal not found', 'NOT_FOUND', 404)
    return serializeBigInt(goal)
  }

  async updateGoal(id: string, body: {
    title?: string
    description?: string
    targetAmount?: string | number
    deadline?: string
    category?: string
    isPublic?: boolean
    status?: string
  }) {
    const goal = await this.goalRepo.update(id, {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.targetAmount !== undefined && { targetAmount: BigInt(body.targetAmount) }),
      ...(body.deadline !== undefined && { deadline: new Date(body.deadline) }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
      ...(body.status !== undefined && { status: body.status }),
    })
    return serializeBigInt(goal)
  }

  async deleteGoal(id: string) {
    await this.goalRepo.delete(id)
  }

  checkAffordability(body: {
    monthlyIncome: number
    monthlyExpenses: number
    goalTarget: number
    goalDeadline: string
  }) {
    const deadline = new Date(body.goalDeadline)
    const today = new Date()
    const monthsUntilDeadline =
      (deadline.getFullYear() - today.getFullYear()) * 12 +
      (deadline.getMonth() - today.getMonth())

    if (monthsUntilDeadline <= 0)
      throw new AppError('Deadline must be in the future', 'VALIDATION_ERROR', 400)

    const requiredMonthlySavings = body.goalTarget / monthsUntilDeadline
    const disposableIncome = body.monthlyIncome - body.monthlyExpenses

    let status: 'Sustainable' | 'Aggressive' | 'Unattainable'
    if (requiredMonthlySavings <= disposableIncome * 0.3) status = 'Sustainable'
    else if (requiredMonthlySavings <= disposableIncome * 0.6) status = 'Aggressive'
    else status = 'Unattainable'

    return { status, requiredMonthlySavings, disposableIncome, monthsUntilDeadline }
  }

  calculateProjection(body: {
    principal: number
    monthlyContribution: number
    interestRate: number
    years: number
  }) {
    const P = Number(body.principal)
    const PMT = Number(body.monthlyContribution)
    const r = Number(body.interestRate) / 100
    const t = Number(body.years)
    const n = 12

    const compoundInterest = P * Math.pow(1 + r / n, n * t)
    const futureValueContributions =
      r > 0 ? PMT * ((Math.pow(1 + r / n, n * t) - 1) / (r / n)) : PMT * n * t
    const totalAmount = compoundInterest + futureValueContributions

    return {
      totalAmount,
      principal: P,
      totalContributions: PMT * n * t,
      interestEarned: totalAmount - P - PMT * n * t,
    }
  }
}

export const goalsService = new GoalsService()
