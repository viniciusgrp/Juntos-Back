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
    // Garantir que os valores sejam números
    const limit = Number(data.limit);
    const closeDate = Number(data.closeDate);
    const dueDate = Number(data.dueDate);

    // Validações
    if (closeDate < 1 || closeDate > 31) {
      throw new Error('Dia de fechamento deve estar entre 1 e 31');
    }

    if (dueDate < 1 || dueDate > 31) {
      throw new Error('Dia de vencimento deve estar entre 1 e 31');
    }

    if (limit <= 0) {
      throw new Error('Limite deve ser maior que zero');
    }

    const creditCard = await this.prisma.creditCard.create({
      data: {
        name: data.name,
        limit: limit,
        closeDate: closeDate,
        dueDate: dueDate,
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
    // Verificar se o cartão existe e pertence ao usuário
    await this.getCreditCardById(userId, id);

    // Converter valores para números quando fornecidos
    const updateData: any = { ...data };
    if (data.limit !== undefined) {
      updateData.limit = Number(data.limit);
    }
    if (data.closeDate !== undefined) {
      updateData.closeDate = Number(data.closeDate);
    }
    if (data.dueDate !== undefined) {
      updateData.dueDate = Number(data.dueDate);
    }

    // Validações para os campos que estão sendo atualizados
    if (updateData.closeDate !== undefined && (updateData.closeDate < 1 || updateData.closeDate > 31)) {
      throw new Error('Dia de fechamento deve estar entre 1 e 31');
    }

    if (updateData.dueDate !== undefined && (updateData.dueDate < 1 || updateData.dueDate > 31)) {
      throw new Error('Dia de vencimento deve estar entre 1 e 31');
    }

    if (updateData.limit !== undefined && updateData.limit <= 0) {
      throw new Error('Limite deve ser maior que zero');
    }

    const creditCard = await this.prisma.creditCard.update({
      where: { id },
      data: updateData
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
