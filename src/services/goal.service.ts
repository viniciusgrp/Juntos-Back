import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class GoalService {
  static async createGoal(data: {
    title: string
    description?: string
    targetAmount: number
    targetDate: Date
    userId: string
  }) {
    try {
      const goal = await prisma.goal.create({
        data,
      })
      return goal
    } catch (error) {
      throw error
    }
  }

  static async getGoalsByUser(userId: string) {
    try {
      const goals = await prisma.goal.findMany({
        where: { userId },
        orderBy: [
          { targetDate: 'asc' }
        ]
      })
      return goals
    } catch (error) {
      throw error
    }
  }

  static async getGoalById(id: string, userId: string) {
    try {
      const goal = await prisma.goal.findFirst({
        where: { 
          id,
          userId 
        }
      })
      return goal
    } catch (error) {
      throw error
    }
  }

  static async updateGoal(id: string, userId: string, data: {
    title?: string
    description?: string
    targetAmount?: number
    targetDate?: Date
    currentAmount?: number
  }) {
    try {
      const goal = await prisma.goal.updateMany({
        where: { 
          id,
          userId 
        },
        data
      })
      
      if (goal.count === 0) {
        throw new Error('Meta não encontrada')
      }

      return await this.getGoalById(id, userId)
    } catch (error) {
      throw error
    }
  }

  static async deleteGoal(id: string, userId: string) {
    try {
      const result = await prisma.goal.deleteMany({
        where: { 
          id,
          userId 
        }
      })
      
      if (result.count === 0) {
        throw new Error('Meta não encontrada')
      }

      return { success: true }
    } catch (error) {
      throw error
    }
  }

  static async addProgress(id: string, userId: string, amount: number) {
    try {
      const goal = await prisma.goal.findFirst({
        where: { id, userId }
      })

      if (!goal) {
        throw new Error('Meta não encontrada')
      }

      const newCurrentAmount = goal.currentAmount + amount

      const updatedGoal = await prisma.goal.update({
        where: { id },
        data: { 
          currentAmount: Math.max(0, newCurrentAmount) // Não permite valores negativos
        }
      })

      return updatedGoal
    } catch (error) {
      throw error
    }
  }

  static async getGoalProgress(id: string, userId: string) {
    try {
      const goal = await prisma.goal.findFirst({
        where: { id, userId }
      })

      if (!goal) {
        throw new Error('Meta não encontrada')
      }

      const progress = {
        id: goal.id,
        title: goal.title,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        percentage: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
        remaining: goal.targetAmount - goal.currentAmount,
        isCompleted: goal.currentAmount >= goal.targetAmount,
        daysRemaining: Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }

      return progress
    } catch (error) {
      throw error
    }
  }
}
