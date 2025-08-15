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

    if (data.goalId) {
      const goal = await this.prisma.goal.findFirst({
        where: {
          id: data.goalId,
          userId
        }
      });

      if (!goal) {
        throw new Error('Meta não encontrada ou não pertence ao usuário');
      }

      if (data.type !== 'INCOME') {
        throw new Error('Apenas receitas podem ser vinculadas a metas');
      }
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        type: data.type,
        date: new Date(data.date),
        isPaid: data.isPaid ?? true,
        userId,
        accountId: data.accountId || null,
        creditCardId: data.creditCardId || null,
        categoryId: data.categoryId,
        goalId: data.goalId || null
      },
      include: {
        category: true,
        account: true,
        creditCard: true,
        goal: true
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

    // Atualizar progresso da meta se a transação for de receita, estiver paga e vinculada a uma meta
    if (data.goalId && data.type === 'INCOME' && data.isPaid) {
      await this.updateGoalProgress(data.goalId);
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
        creditCard: true,
        goal: true
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
        creditCard: true,
        goal: true
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

    if (data.goalId) {
      const goal = await this.prisma.goal.findFirst({
        where: {
          id: data.goalId,
          userId
        }
      });

      if (!goal) {
        throw new Error('Meta não encontrada ou não pertence ao usuário');
      }

      const transactionType = data.type || existingTransaction.type;
      if (transactionType !== 'INCOME') {
        throw new Error('Apenas receitas podem ser vinculadas a metas');
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
    if (data.goalId !== undefined) updateData.goalId = data.goalId || null;
    if (data.installments !== undefined) updateData.installments = data.installments;

    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        account: true,
        creditCard: true,
        goal: true
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

    // Atualizar progresso da meta anterior se existia
    if (existingTransaction.goalId) {
      await this.updateGoalProgress(existingTransaction.goalId);
    }

    // Atualizar progresso da nova meta se for de receita e estiver paga
    const finalGoalId = data.goalId !== undefined ? data.goalId : existingTransaction.goalId;
    if (finalGoalId && newType === 'INCOME' && newIsPaid) {
      await this.updateGoalProgress(finalGoalId);
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

    // Armazenar o goalId antes de deletar a transação
    const goalId = transaction.goalId;

    await this.prisma.transaction.delete({
      where: { id }
    });

    // Atualizar progresso da meta se a transação estava vinculada a uma
    if (goalId) {
      await this.updateGoalProgress(goalId);
    }

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

    const currentMonthIncomeCount = transactions
      .filter(t => t.type === 'INCOME' && t.date >= startOfMonth && t.date <= endOfMonth)
      .length;

    const currentMonthExpenseCount = transactions
      .filter(t => t.type === 'EXPENSE' && t.date >= startOfMonth && t.date <= endOfMonth)
      .length;

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
      currentMonthIncomeCount,
      currentMonthExpenseCount,
      balance: totalIncomes - totalExpenses,
      topCategories
    };
  }

  async getDashboardStats(userId: string) {
    const now = new Date();
    
    // Mês atual
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Mês anterior
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Buscar todas as transações do usuário
    const allTransactions = await this.prisma.transaction.findMany({
      where: { userId },
      include: {
        category: true,
        account: true,
        creditCard: true
      },
      orderBy: { date: 'desc' }
    });

    // Filtrar transações do mês atual
    const currentMonthTransactions = allTransactions.filter(t => 
      t.date >= currentMonthStart && t.date <= currentMonthEnd
    );

    // Filtrar transações do mês anterior
    const previousMonthTransactions = allTransactions.filter(t => 
      t.date >= previousMonthStart && t.date <= previousMonthEnd
    );

    // Calcular estatísticas do mês atual
    const currentMonthIncomes = currentMonthTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentMonthExpenses = currentMonthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calcular estatísticas do mês anterior
    const previousMonthIncomes = previousMonthTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const previousMonthExpenses = previousMonthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calcular variações percentuais
    const incomeChange = previousMonthIncomes > 0 
      ? ((currentMonthIncomes - previousMonthIncomes) / previousMonthIncomes) * 100 
      : 0;

    const expenseChange = previousMonthExpenses > 0 
      ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100 
      : 0;

    // Buscar saldo total das contas
    const accounts = await this.prisma.account.findMany({
      where: { userId }
    });

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Buscar saldo dos cartões de crédito
    const creditCards = await this.prisma.creditCard.findMany({
      where: { userId }
    });

    // Calcular total gasto nos cartões de crédito no mês atual
    const creditCardExpenses = currentMonthTransactions
      .filter(t => t.creditCardId)
      .reduce((sum, t) => sum + t.amount, 0);

    const creditCardChange = previousMonthTransactions
      .filter(t => t.creditCardId)
      .reduce((sum, t) => sum + t.amount, 0);

    const creditCardVariation = creditCardChange > 0 
      ? ((creditCardExpenses - creditCardChange) / creditCardChange) * 100 
      : 0;

    // Buscar transações recentes (últimas 10)
    const recentTransactions = allTransactions.slice(0, 10);

    // Calcular distribuição por categoria do mês atual
    const categoryMap = new Map();
    currentMonthTransactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(transaction => {
        const categoryName = transaction.category.name;
        const currentAmount = categoryMap.get(categoryName) || 0;
        categoryMap.set(categoryName, currentAmount + transaction.amount);
      });

    const categoryDistribution = Array.from(categoryMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const totalExpensesForPercentage = currentMonthExpenses;
    const categoryDistributionWithPercentage = categoryDistribution.map(cat => ({
      ...cat,
      percentage: totalExpensesForPercentage > 0 ? (cat.amount / totalExpensesForPercentage) * 100 : 0
    }));

    return {
      totalBalance,
      currentMonthIncomes,
      currentMonthExpenses,
      creditCardExpenses,
      incomeChange: Math.round(incomeChange * 100) / 100,
      expenseChange: Math.round(expenseChange * 100) / 100,
      creditCardChange: Math.round(creditCardVariation * 100) / 100,
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        date: t.date,
        category: t.category.name,
        account: t.account?.name,
        creditCard: t.creditCard?.name,
        isPaid: t.isPaid
      })),
      categoryDistribution: categoryDistributionWithPercentage,
      accounts: accounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        type: acc.type,
        balance: acc.balance
      })),
      creditCards: creditCards.map(cc => ({
        id: cc.id,
        name: cc.name,
        limit: cc.limit,
        currentExpenses: currentMonthTransactions
          .filter(t => t.creditCardId === cc.id)
          .reduce((sum, t) => sum + t.amount, 0)
      }))
    };
  }

  private async updateGoalProgress(goalId: string): Promise<void> {
    // Buscar todas as transações de receita pagas vinculadas a esta meta
    const goalTransactions = await this.prisma.transaction.findMany({
      where: {
        goalId,
        type: 'INCOME',
        isPaid: true
      }
    });

    // Calcular o total das receitas vinculadas
    const totalAmount = goalTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    // Atualizar a meta com o novo progresso
    await this.prisma.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: totalAmount
      }
    });
  }
}
