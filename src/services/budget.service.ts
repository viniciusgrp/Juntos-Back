import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class BudgetService {
  static async createBudget(data: {
    name: string
    amount: number
    month: number
    year: number
    userId: string
  }) {
    try {
      const budget = await prisma.budget.create({
        data,
      })
      return budget
    } catch (error) {
      throw error
    }
  }

  static async getBudgetsByUser(userId: string) {
    try {
      const budgets = await prisma.budget.findMany({
        where: { userId },
        orderBy: [
          { year: 'desc' },
          { month: 'desc' }
        ]
      })
      return budgets
    } catch (error) {
      throw error
    }
  }

  static async getBudgetById(id: string, userId: string) {
    try {
      const budget = await prisma.budget.findFirst({
        where: { 
          id,
          userId 
        }
      })
      return budget
    } catch (error) {
      throw error
    }
  }

  static async getBudgetByMonthYear(month: number, year: number, userId: string) {
    try {
      const budget = await prisma.budget.findFirst({
        where: { 
          month,
          year,
          userId 
        }
      })
      return budget
    } catch (error) {
      throw error
    }
  }

  static async updateBudget(id: string, userId: string, data: {
    name?: string
    amount?: number
    spent?: number
  }) {
    try {
      const budget = await prisma.budget.updateMany({
        where: { 
          id,
          userId 
        },
        data
      })
      
      if (budget.count === 0) {
        throw new Error('Orçamento não encontrado')
      }

      return await this.getBudgetById(id, userId)
    } catch (error) {
      throw error
    }
  }

  static async deleteBudget(id: string, userId: string) {
    try {
      const result = await prisma.budget.deleteMany({
        where: { 
          id,
          userId 
        }
      })
      
      if (result.count === 0) {
        throw new Error('Orçamento não encontrado')
      }

      return { success: true }
    } catch (error) {
      throw error
    }
  }

  static async updateSpentAmount(userId: string, month: number, year: number) {
    try {
      // Buscar todas as despesas do mês/ano
      const totalSpent = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'expense',
          date: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1)
          },
          isPaid: true
        },
        _sum: {
          amount: true
        }
      })

      const spentAmount = totalSpent._sum.amount || 0

      // Atualizar o orçamento se existir
      const budget = await prisma.budget.findFirst({
        where: { userId, month, year }
      })

      if (budget) {
        await prisma.budget.update({
          where: { id: budget.id },
          data: { spent: spentAmount }
        })
      }

      return spentAmount
    } catch (error) {
      throw error
    }
  }
}
