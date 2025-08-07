import { PrismaClient, CreditCard } from '@prisma/client';

export interface CreateCreditCardRequest {
  name: string;
  limit: number;
  closeDate: number;
  dueDate: number;
}

export interface UpdateCreditCardRequest {
  name?: string;
  limit?: number;
  closeDate?: number;
  dueDate?: number;
}

export class CreditCardService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createCreditCard(userId: string, data: CreateCreditCardRequest): Promise<CreditCard> {
    if (data.closeDate < 1 || data.closeDate > 31) {
      throw new Error('Dia de fechamento deve estar entre 1 e 31');
    }

    if (data.dueDate < 1 || data.dueDate > 31) {
      throw new Error('Dia de vencimento deve estar entre 1 e 31');
    }

    if (data.limit <= 0) {
      throw new Error('Limite deve ser maior que zero');
    }

    const creditCard = await this.prisma.creditCard.create({
      data: {
        name: data.name,
        limit: data.limit,
        closeDate: data.closeDate,
        dueDate: data.dueDate,
        userId
      }
    });

    return creditCard;
  }

  async getCreditCards(userId: string) {
    const creditCards = await this.prisma.creditCard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return {
      creditCards,
      total: creditCards.length
    };
  }

  async getCreditCardById(userId: string, id: string): Promise<CreditCard> {
    const creditCard = await this.prisma.creditCard.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!creditCard) {
      throw new Error('Cartão de crédito não encontrado');
    }

    return creditCard;
  }

  async updateCreditCard(userId: string, id: string, data: UpdateCreditCardRequest): Promise<CreditCard> {
    await this.getCreditCardById(userId, id);

    if (data.closeDate !== undefined && (data.closeDate < 1 || data.closeDate > 31)) {
      throw new Error('Dia de fechamento deve estar entre 1 e 31');
    }

    if (data.dueDate !== undefined && (data.dueDate < 1 || data.dueDate > 31)) {
      throw new Error('Dia de vencimento deve estar entre 1 e 31');
    }

    if (data.limit !== undefined && data.limit <= 0) {
      throw new Error('Limite deve ser maior que zero');
    }

    const creditCard = await this.prisma.creditCard.update({
      where: { id },
      data
    });

    return creditCard;
  }

  async deleteCreditCard(userId: string, id: string): Promise<{ message: string }> {
    await this.getCreditCardById(userId, id);

    const transactionsCount = await this.prisma.transaction.count({
      where: { creditCardId: id }
    });

    if (transactionsCount > 0) {
      throw new Error('Não é possível excluir um cartão que possui transações vinculadas');
    }

    await this.prisma.creditCard.delete({
      where: { id }
    });

    return { message: 'Cartão de crédito excluído com sucesso' };
  }

  async getCreditCardStats(userId: string, creditCardId: string) {
    const creditCard = await this.getCreditCardById(userId, creditCardId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        creditCardId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const availableLimit = creditCard.limit - totalSpent;
    const limitUsagePercentage = (totalSpent / creditCard.limit) * 100;

    return {
      creditCard,
      totalSpent,
      availableLimit,
      limitUsagePercentage: Math.round(limitUsagePercentage * 100) / 100,
      transactionsCount: transactions.length
    };
  }
}
