import { Response } from 'express'
import { GoalService } from '../services/goal.service'
import { successResponse, errorResponse, asyncHandler } from '../utils/response.util'
import { AuthenticatedRequest } from '../types/auth.types'

export const goalController = {
  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { title, description, targetAmount, targetDate } = req.body
    const userId = req.user?.id

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401)
    }

    if (!title || !targetAmount || !targetDate) {
      return errorResponse(res, 'Título, valor alvo e data alvo são obrigatórios', 400)
    }

    const numericAmount = Number(targetAmount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return errorResponse(res, 'Valor alvo deve ser um número maior que zero', 400)
    }

    const parsedDate = new Date(targetDate)
    if (isNaN(parsedDate.getTime())) {
      return errorResponse(res, 'Data alvo inválida', 400)
    }

    if (parsedDate <= new Date()) {
      return errorResponse(res, 'Data alvo deve ser futura', 400)
    }

    const goal = await GoalService.createGoal({
      title,
      description,
      targetAmount: numericAmount,
      targetDate: parsedDate,
      userId
    })

    successResponse(res, goal, 'Meta criada com sucesso', 201)
  }),

  getAll: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401)
    }

    const goals = await GoalService.getGoalsByUser(userId)

    successResponse(res, goals, 'Metas encontradas com sucesso')
  }),

  getById: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401)
    }

    const goal = await GoalService.getGoalById(id, userId)

    if (!goal) {
      return errorResponse(res, 'Meta não encontrada', 404)
    }

    successResponse(res, goal, 'Meta encontrada com sucesso')
  }),

  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const { title, description, targetAmount, targetDate, currentAmount } = req.body
    const userId = req.user?.id

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401)
    }

    const updateData: any = {}
    
    if (title !== undefined) {
      updateData.title = title
    }
    
    if (description !== undefined) {
      updateData.description = description
    }
    
    if (targetAmount !== undefined) {
      const numericAmount = Number(targetAmount)
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return errorResponse(res, 'Valor alvo deve ser um número maior que zero', 400)
      }
      updateData.targetAmount = numericAmount
    }

    if (targetDate !== undefined) {
      const parsedDate = new Date(targetDate)
      if (isNaN(parsedDate.getTime())) {
        return errorResponse(res, 'Data alvo inválida', 400)
      }
      updateData.targetDate = parsedDate
    }

    if (currentAmount !== undefined) {
      const numericCurrent = Number(currentAmount)
      if (isNaN(numericCurrent) || numericCurrent < 0) {
        return errorResponse(res, 'Valor atual deve ser um número não negativo', 400)
      }
      updateData.currentAmount = numericCurrent
    }

    const goal = await GoalService.updateGoal(id, userId, updateData)

    successResponse(res, goal, 'Meta atualizada com sucesso')
  }),

  delete: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401)
    }

    await GoalService.deleteGoal(id, userId)

    successResponse(res, null, 'Meta excluída com sucesso')
  }),

  addProgress: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const { amount } = req.body
    const userId = req.user?.id

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401)
    }

    if (!amount) {
      return errorResponse(res, 'Valor é obrigatório', 400)
    }

    const numericAmount = Number(amount)
    if (isNaN(numericAmount)) {
      return errorResponse(res, 'Valor deve ser um número válido', 400)
    }

    const goal = await GoalService.addProgress(id, userId, numericAmount)

    successResponse(res, goal, 'Progresso adicionado com sucesso')
  }),

  getProgress: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401)
    }

    const progress = await GoalService.getGoalProgress(id, userId)

    successResponse(res, progress, 'Progresso da meta encontrado com sucesso')
  })
}
