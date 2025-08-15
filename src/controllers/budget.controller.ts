import { Request, Response } from 'express'
import { BudgetService } from '../services/budget.service'
import { successResponse, errorResponse, asyncHandler } from '../utils/response.util'
import { AuthenticatedRequest } from '../types/auth.types'

export const budgetController = {
  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name, amount, month, year } = req.body
    const userId = req.user?.id

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401)
    }

    if (!name || !amount || !month || !year) {
      return errorResponse(res, 'Todos os campos são obrigatórios', 400)
    }

    if (month < 1 || month > 12) {
      return errorResponse(res, 'Mês deve estar entre 1 e 12', 400)
    }

    const numericAmount = Number(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return errorResponse(res, 'Valor do orçamento deve ser um número maior que zero', 400)
    }

    // Verificar se já existe um orçamento para este mês/ano
    const existingBudget = await BudgetService.getBudgetByMonthYear(month, year, userId)
    if (existingBudget) {
      return errorResponse(res, 'Já existe um orçamento para este mês/ano', 400)
    }

    const budget = await BudgetService.createBudget({
      name,
      amount: numericAmount,
      month: Number(month),
      year: Number(year),
      userId
    })

    // Calcular gastos atuais para este mês/ano
    await BudgetService.updateSpentAmount(userId, Number(month), Number(year))

    const updatedBudget = await BudgetService.getBudgetById(budget.id, userId)

    successResponse(res, updatedBudget, 'Orçamento criado com sucesso', 201)
  }),

  getAll: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401)
    }

    const budgets = await BudgetService.getBudgetsByUser(userId)

    successResponse(res, budgets, 'Orçamentos encontrados com sucesso')
  }),

  getById: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401)
    }

    const budget = await BudgetService.getBudgetById(id, userId)

    if (!budget) {
      return errorResponse(res, 'Orçamento não encontrado', 404)
    }

    successResponse(res, budget, 'Orçamento encontrado com sucesso')
  }),

  getByMonthYear: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { month, year } = req.params
    const userId = req.user?.id

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401)
    }

    const monthNum = parseInt(month)
    const yearNum = parseInt(year)

    if (isNaN(monthNum) || isNaN(yearNum)) {
      return errorResponse(res, 'Mês e ano devem ser números válidos', 400)
    }

    if (monthNum < 1 || monthNum > 12) {
      return errorResponse(res, 'Mês deve estar entre 1 e 12', 400)
    }

    // Atualizar gastos antes de retornar
    await BudgetService.updateSpentAmount(userId, monthNum, yearNum)

    const budget = await BudgetService.getBudgetByMonthYear(monthNum, yearNum, userId)

    if (!budget) {
      return errorResponse(res, 'Orçamento não encontrado para este mês/ano', 404)
    }

    successResponse(res, budget, 'Orçamento encontrado com sucesso')
  }),

  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const { name, amount } = req.body
    const userId = req.user?.id

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401)
    }

    const updateData: any = {}
    
    if (name !== undefined) {
      updateData.name = name
    }
    
    if (amount !== undefined) {
      const numericAmount = Number(amount)
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return errorResponse(res, 'Valor do orçamento deve ser um número maior que zero', 400)
      }
      updateData.amount = numericAmount
    }

    const budget = await BudgetService.updateBudget(id, userId, updateData)

    successResponse(res, budget, 'Orçamento atualizado com sucesso')
  }),

  delete: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401)
    }

    await BudgetService.deleteBudget(id, userId)

    successResponse(res, null, 'Orçamento excluído com sucesso')
  }),

  updateSpent: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { month, year } = req.params
    const userId = req.user?.id

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401)
    }

    const monthNum = parseInt(month)
    const yearNum = parseInt(year)

    if (isNaN(monthNum) || isNaN(yearNum)) {
      return errorResponse(res, 'Mês e ano devem ser números válidos', 400)
    }

    const spentAmount = await BudgetService.updateSpentAmount(userId, monthNum, yearNum)

    successResponse(res, { spent: spentAmount }, 'Gastos atualizados com sucesso')
  })
}
