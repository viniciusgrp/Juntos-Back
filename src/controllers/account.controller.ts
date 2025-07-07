import { Response } from 'express';
import { AccountService } from '../services/account.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { CreateAccountRequest, UpdateAccountRequest, TransferRequest, AccountFilters } from '../types/account';
import { AuthenticatedRequest } from '../types/auth.types';

export class AccountController {
  private accountService: AccountService;

  constructor() {
    this.accountService = new AccountService();
  }

  async createAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data: CreateAccountRequest = req.body;

      const account = await this.accountService.createAccount(userId, data);

      successResponse(res, account, 'Conta criada com sucesso', 201);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getAccounts(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const filters: AccountFilters = {
        type: req.query.type as any,
        minBalance: req.query.minBalance ? parseFloat(req.query.minBalance as string) : undefined,
        maxBalance: req.query.maxBalance ? parseFloat(req.query.maxBalance as string) : undefined
      };

      const accountsData = await this.accountService.getAccounts(userId, filters);

      successResponse(res, accountsData, 'Contas listadas com sucesso');
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getAccountById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const account = await this.accountService.getAccountById(userId, id);

      successResponse(res, account, 'Conta encontrada com sucesso');
    } catch (error: any) {
      if (error.message === 'Conta não encontrada') {
        errorResponse(res, error.message, 404);
      } else {
        errorResponse(res, error.message, 400);
      }
    }
  }

  async updateAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data: UpdateAccountRequest = req.body;

      const account = await this.accountService.updateAccount(userId, id, data);

      successResponse(res, account, 'Conta atualizada com sucesso');
    } catch (error: any) {
      if (error.message === 'Conta não encontrada') {
        errorResponse(res, error.message, 404);
      } else {
        errorResponse(res, error.message, 400);
      }
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const result = await this.accountService.deleteAccount(userId, id);

      successResponse(res, result, 'Conta deletada com sucesso');
    } catch (error: any) {
      if (error.message === 'Conta não encontrada') {
        errorResponse(res, error.message, 404);
      } else {
        errorResponse(res, error.message, 400);
      }
    }
  }

  async transferBetweenAccounts(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data: TransferRequest = req.body;

      const result = await this.accountService.transferBetweenAccounts(userId, data);

      successResponse(res, result, 'Transferência realizada com sucesso');
    } catch (error: any) {
      if (error.message === 'Conta não encontrada') {
        errorResponse(res, error.message, 404);
      } else {
        errorResponse(res, error.message, 400);
      }
    }
  }

  async getAccountStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const stats = await this.accountService.getAccountStats(userId);

      successResponse(res, stats, 'Estatísticas das contas obtidas com sucesso');
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }
}
