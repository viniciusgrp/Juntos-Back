import { PrismaClient, Transaction } from '@prisma/client';
import { CreateTransactionRequest, UpdateTransactionRequest, TransactionFilters, TransactionStats } from '../types/transaction';

export class TransactionService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createTransaction(userId: string, data: CreateTransactionRequest): Promise<Transaction> {
    if (data.type === 'EXPENSE' && !data.accountId && !data.creditCardId) {
      throw new Error('Para despesas, é necessário informar uma conta ou cartão de crédito');
    }

    if (data.type === 'INCOME' && !data.accountId) {
      throw new Error('Para receitas, é necessário informar uma conta');
    }

    if (data.accountId && data.creditCardId) {
      throw new Error('Não é possível usar conta e cartão de crédito simultaneamente');
    }

    const category = await this.prisma.category.findFirst({
      where: {
        id: data.categoryId,
        userId,
        type: data.type
      }
    });

    if (!category) {
      throw new Error('Categoria não encontrada ou não pertence ao usuário');
    }

    if (data.accountId) {
      const account = await this.prisma.account.findFirst({
        where: {
          id: data.accountId,
          userId
        }
      });

      if (!account) {
        throw new Error('Conta não encontrada ou não pertence ao usuário');
      }
    }

    if (data.creditCardId) {
      const creditCard = await this.prisma.creditCard.findFirst({
        where: {
          id: data.creditCardId,
          userId
        }
      });

      if (!creditCard) {
        throw new Error('Cartão de crédito não encontrado ou não pertence ao usuário');
      }
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        type: data.type,
        date: new Date(data.date),
        isPaid: data.isPaid || false,
        userId,
        accountId: data.accountId || null,
        creditCardId: data.creditCardId || null,
        categoryId: data.categoryId
      },
      include: {
        category: true,
        account: true,
        creditCard: true
      }
    });

    if (data.isPaid && data.accountId) {
      const balanceChange = data.type === 'INCOME' ? data.amount : -data.amount;
      await this.prisma.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: balanceChange
          }
        }
      });
    }

    return transaction;
  }

  async getTransactions(userId: string, filters: TransactionFilters = {}) {
    const where: any = { userId };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.accountId) {
      where.accountId = filters.accountId;
    }

    if (filters.creditCardId) {
      where.creditCardId = filters.creditCardId;
    }

    if (filters.isPaid !== undefined) {
      where.isPaid = filters.isPaid;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    if (filters.minAmount || filters.maxAmount) {
      where.amount = {};
      if (filters.minAmount) {
        where.amount.gte = filters.minAmount;
      }
      if (filters.maxAmount) {
        where.amount.lte = filters.maxAmount;
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const total = await this.prisma.transaction.count({ where });

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
        creditCard: true
      },
      orderBy: {
        date: 'desc'
      },
      skip,
      take: limit
    });

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalPaid = transactions.filter(t => t.isPaid).reduce((sum, t) => sum + t.amount, 0);
    const totalPending = transactions.filter(t => !t.isPaid).reduce((sum, t) => sum + t.amount, 0);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      transactions,
      total,
      totalAmount,
      totalPaid,
      totalPending,
      pagination: {
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    };
  }

  async getTransactionById(userId: string, id: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        userId
      },
      include: {
        category: true,
        account: true,
        creditCard: true
      }
    });

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    return transaction;
  }

  async updateTransaction(userId: string, id: string, data: UpdateTransactionRequest): Promise<Transaction> {
    const existingTransaction = await this.getTransactionById(userId, id);

    if (data.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: data.categoryId,
          userId,
          type: data.type || existingTransaction.type
        }
      });

      if (!category) {
        throw new Error('Categoria não encontrada ou não pertence ao usuário');
      }
    }

    if (data.accountId) {
      const account = await this.prisma.account.findFirst({
        where: {
          id: data.accountId,
          userId
        }
      });

      if (!account) {
        throw new Error('Conta não encontrada ou não pertence ao usuário');
      }
    }

    if (data.creditCardId) {
      const creditCard = await this.prisma.creditCard.findFirst({
        where: {
          id: data.creditCardId,
          userId
        }
      });

      if (!creditCard) {
        throw new Error('Cartão de crédito não encontrado ou não pertence ao usuário');
      }
    }

    if (existingTransaction.isPaid && existingTransaction.accountId) {
      const balanceChange = existingTransaction.type === 'INCOME' ? -existingTransaction.amount : existingTransaction.amount;
      await this.prisma.account.update({
        where: { id: existingTransaction.accountId },
        data: {
          balance: {
            increment: balanceChange
          }
        }
      });
    }

    const updateData: any = {};
    
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.isPaid !== undefined) updateData.isPaid = data.isPaid;
    if (data.accountId !== undefined) updateData.accountId = data.accountId || null;
    if (data.creditCardId !== undefined) updateData.creditCardId = data.creditCardId || null;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.installments !== undefined) updateData.installments = data.installments;

    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        account: true,
        creditCard: true
      }
    });

    const newIsPaid = data.isPaid !== undefined ? data.isPaid : existingTransaction.isPaid;
    const newAccountId = data.accountId !== undefined ? data.accountId : existingTransaction.accountId;
    const newAmount = data.amount !== undefined ? data.amount : existingTransaction.amount;
    const newType = data.type !== undefined ? data.type : existingTransaction.type;

    if (newIsPaid && newAccountId) {
      const balanceChange = newType === 'INCOME' ? newAmount : -newAmount;
      await this.prisma.account.update({
        where: { id: newAccountId },
        data: {
          balance: {
            increment: balanceChange
          }
        }
      });
    }

    return transaction;
  }

  async deleteTransaction(userId: string, id: string): Promise<{ message: string }> {
    const transaction = await this.getTransactionById(userId, id);

    if (transaction.isPaid && transaction.accountId) {
      const balanceChange = transaction.type === 'INCOME' ? -transaction.amount : transaction.amount;
      await this.prisma.account.update({
        where: { id: transaction.accountId },
        data: {
          balance: {
            increment: balanceChange
          }
        }
      });
    }

    await this.prisma.transaction.delete({
      where: { id }
    });

    return { message: 'Transação deletada com sucesso' };
  }

  async getTransactionStats(userId: string, filters: TransactionFilters = {}): Promise<TransactionStats> {
    const where: any = { userId };

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        category: true
      }
    });

    const totalIncomes = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPaid = transactions
      .filter(t => t.isPaid)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPending = transactions
      .filter(t => !t.isPaid)
      .reduce((sum, t) => sum + t.amount, 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentMonthIncomes = transactions
      .filter(t => t.type === 'INCOME' && t.date >= startOfMonth && t.date <= endOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    const currentMonthExpenses = transactions
      .filter(t => t.type === 'EXPENSE' && t.date >= startOfMonth && t.date <= endOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeCount = transactions.filter(t => t.type === 'INCOME').length;
    const expenseCount = transactions.filter(t => t.type === 'EXPENSE').length;

    const categoryMap = new Map();
    transactions.forEach(transaction => {
      const categoryId = transaction.categoryId;
      const categoryName = transaction.category.name;
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          categoryId,
          categoryName,
          total: 0,
          count: 0
        });
      }
      
      const category = categoryMap.get(categoryId);
      category.total += transaction.amount;
      category.count += 1;
    });

    const topCategories = Array.from(categoryMap.values());

    return {
      totalIncomes,
      totalExpenses,
      totalPaid,
      totalPending,
      currentMonthIncomes,
      currentMonthExpenses,
      balance: totalIncomes - totalExpenses,
      topCategories
    };
  }
}
