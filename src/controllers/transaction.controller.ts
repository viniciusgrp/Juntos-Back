import { Response } from 'express';
import { TransactionService } from '../services/transaction.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { CreateTransactionRequest, UpdateTransactionRequest, TransactionFilters } from '../types/transaction';
import { AuthenticatedRequest } from '../types/auth.types';

export class TransactionController {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  async createTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data: CreateTransactionRequest = req.body;

      const transaction = await this.transactionService.createTransaction(userId, data);

      successResponse(res, transaction, 'Transação criada com sucesso', 201);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const filters: TransactionFilters = {
        type: req.query.type as any,
        categoryId: req.query.categoryId as string,
        accountId: req.query.accountId as string,
        creditCardId: req.query.creditCardId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        isPaid: req.query.isPaid ? req.query.isPaid === 'true' : undefined,
        minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
        maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };

      const transactionsData = await this.transactionService.getTransactions(userId, filters);

      successResponse(res, transactionsData, 'Transações listadas com sucesso');
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getTransactionById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const transaction = await this.transactionService.getTransactionById(userId, id);

      successResponse(res, transaction, 'Transação encontrada com sucesso');
    } catch (error: any) {
      if (error.message === 'Transação não encontrada') {
        errorResponse(res, error.message, 404);
      } else {
        errorResponse(res, error.message, 400);
      }
    }
  }

  async updateTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data: UpdateTransactionRequest = req.body;

      const transaction = await this.transactionService.updateTransaction(userId, id, data);

      successResponse(res, transaction, 'Transação atualizada com sucesso');
    } catch (error: any) {
      if (error.message === 'Transação não encontrada') {
        errorResponse(res, error.message, 404);
      } else {
        errorResponse(res, error.message, 400);
      }
    }
  }

  async deleteTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const result = await this.transactionService.deleteTransaction(userId, id);

      successResponse(res, result, 'Transação deletada com sucesso');
    } catch (error: any) {
      if (error.message === 'Transação não encontrada') {
        errorResponse(res, error.message, 404);
      } else {
        errorResponse(res, error.message, 400);
      }
    }
  }

  async getTransactionStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const filters: TransactionFilters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };

      const stats = await this.transactionService.getTransactionStats(userId, filters);

      successResponse(res, stats, 'Estatísticas das transações obtidas com sucesso');
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const stats = await this.transactionService.getDashboardStats(userId);

      successResponse(res, stats, 'Estatísticas do dashboard obtidas com sucesso');
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }
}
