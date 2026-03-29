import { Request, Response, NextFunction } from 'express'
import { asyncHandler } from '../middleware/errorHandler'
import { GroupsService } from '../services/groupsService'

function parsePagination(query: Request['query']): { page: number; limit: number } {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string, 10) || 20))
  return { page, limit }
}

export class GroupsController {
  constructor(private readonly service: GroupsService = new GroupsService()) {}

  listGroups = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.service.listGroups(parsePagination(req.query))
    res.json({ success: true, data: result.data, pagination: result.pagination })
  })

  getGroup = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const group = await this.service.getGroup(req.params.id)
    res.json({ success: true, data: group })
  })

  createGroup = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.service.createGroup(req.body)
    if (result.unsignedXdr) return res.status(200).json({ success: true, data: result })
    return res.status(201).json({ success: true, data: result })
  })

  joinGroup = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { publicKey, signedXdr } = req.body
    const result = await this.service.joinGroup(req.params.id, publicKey, signedXdr)
    res.json({ success: true, data: result })
  })

  contribute = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { amount, publicKey, signedXdr } = req.body
    const result = await this.service.contribute(req.params.id, publicKey, amount, signedXdr)
    res.json({ success: true, data: result })
  })

  getMembers = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const members = await this.service.getMembers(req.params.id)
    res.json({ success: true, data: members })
  })

  getTransactions = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.service.getTransactions(req.params.id, parsePagination(req.query))
    res.json({ success: true, data: result.data, pagination: result.pagination })
  })
}
