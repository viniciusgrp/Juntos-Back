import { CreateAccountRequest, UpdateAccountRequest, TransferRequest, AccountsResponse, AccountFilters } from '../types/account';
import prisma from '../config/database.config';

export class AccountService {
  async createAccount(userId: string, data: CreateAccountRequest) {
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId,
        name: data.name
      }
    });

    if (existingAccount) {
      throw new Error('Já existe uma conta com este nome');
    }

    const account = await prisma.account.create({
      data: {
        name: data.name,
        type: data.type,
        balance: data.balance || 0,
        userId
      }
    });

    return account;
  }

  async getAccounts(userId: string, filters?: AccountFilters): Promise<AccountsResponse> {
    const whereClause: any = { userId };

    if (filters?.type) {
      whereClause.type = filters.type;
    }

    const accounts = await prisma.account.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    
    const accountsByType = {
      checking: accounts.filter(acc => acc.type === 'checking').reduce((sum, acc) => sum + acc.balance, 0),
      savings: accounts.filter(acc => acc.type === 'savings').reduce((sum, acc) => sum + acc.balance, 0),
      investment: accounts.filter(acc => acc.type === 'investment').reduce((sum, acc) => sum + acc.balance, 0),
      cash: accounts.filter(acc => acc.type === 'cash').reduce((sum, acc) => sum + acc.balance, 0)
    };

    return {
      accounts,
      totalBalance,
      accountsByType
    };
  }

  async getAccountById(userId: string, accountId: string) {
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId
      }
    });

    if (!account) {
      throw new Error('Conta não encontrada');
    }

    return account;
  }

  async updateAccount(userId: string, accountId: string, data: UpdateAccountRequest) {
    const existingAccount = await this.getAccountById(userId, accountId);

    if (data.name && data.name !== existingAccount.name) {
      const accountWithSameName = await prisma.account.findFirst({
        where: {
          userId,
          name: data.name,
          id: { not: accountId }
        }
      });

      if (accountWithSameName) {
        throw new Error('Já existe uma conta com este nome');
      }
    }

    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.balance !== undefined && { balance: data.balance })
      }
    });

    return updatedAccount;
  }

  async deleteAccount(userId: string, accountId: string) {
    await this.getAccountById(userId, accountId);

    const transactionCount = await prisma.transaction.count({
      where: { accountId }
    });

    if (transactionCount > 0) {
      throw new Error('Não é possível deletar conta que possui transações');
    }

    await prisma.account.delete({
      where: { id: accountId }
    });

    return { message: 'Conta deletada com sucesso' };
  }

  async transferBetweenAccounts(userId: string, data: TransferRequest) {
    const fromAccount = await this.getAccountById(userId, data.fromAccountId);
    const toAccount = await this.getAccountById(userId, data.toAccountId);

    if (fromAccount.balance < data.amount) {
      throw new Error('Saldo insuficiente na conta de origem');
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedFromAccount = await tx.account.update({
        where: { id: data.fromAccountId },
        data: { balance: { decrement: data.amount } }
      });

      const updatedToAccount = await tx.account.update({
        where: { id: data.toAccountId },
        data: { balance: { increment: data.amount } }
      });

        // TODO Criar registros de transação

      return {
        fromAccount: updatedFromAccount,
        toAccount: updatedToAccount,
        transferAmount: data.amount,
        description: data.description || `Transferência de ${fromAccount.name} para ${toAccount.name}`
      };
    });

    return result;
  }

  async getAccountStats(userId: string) {
    const accounts = await prisma.account.findMany({
      where: { userId }
    });

    const stats = {
      totalAccounts: accounts.length,
      totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
      accountsByType: {
        checking: accounts.filter(acc => acc.type === 'checking').length,
        savings: accounts.filter(acc => acc.type === 'savings').length,
        investment: accounts.filter(acc => acc.type === 'investment').length,
        cash: accounts.filter(acc => acc.type === 'cash').length
      },
      balanceByType: {
        checking: accounts.filter(acc => acc.type === 'checking').reduce((sum, acc) => sum + acc.balance, 0),
        savings: accounts.filter(acc => acc.type === 'savings').reduce((sum, acc) => sum + acc.balance, 0),
        investment: accounts.filter(acc => acc.type === 'investment').reduce((sum, acc) => sum + acc.balance, 0),
        cash: accounts.filter(acc => acc.type === 'cash').reduce((sum, acc) => sum + acc.balance, 0)
      },
      highestBalance: Math.max(...accounts.map(acc => acc.balance), 0),
      averageBalance: accounts.length > 0 ? accounts.reduce((sum, acc) => sum + acc.balance, 0) / accounts.length : 0
    };

    return stats;
  }
}
