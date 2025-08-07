import { Response } from 'express';
import { CreditCardService, CreateCreditCardRequest, UpdateCreditCardRequest } from '../services/credit-card.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { AuthenticatedRequest } from '../types/auth.types';

export class CreditCardController {
  private creditCardService: CreditCardService;

  constructor() {
    this.creditCardService = new CreditCardService();
  }

  createCreditCard = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const data: CreateCreditCardRequest = req.body;

      const creditCard = await this.creditCardService.createCreditCard(userId, data);
      
      return successResponse(res, creditCard, 'Cartão de crédito criado com sucesso', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  };

  getCreditCards = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      
      const result = await this.creditCardService.getCreditCards(userId);
      
      return successResponse(res, result, 'Cartões de crédito listados com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  };

  getCreditCardById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const creditCard = await this.creditCardService.getCreditCardById(userId, id);
      
      return successResponse(res, creditCard, 'Cartão de crédito encontrado com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  };

  updateCreditCard = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data: UpdateCreditCardRequest = req.body;

      const creditCard = await this.creditCardService.updateCreditCard(userId, id, data);
      
      return successResponse(res, creditCard, 'Cartão de crédito atualizado com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  };

  deleteCreditCard = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const result = await this.creditCardService.deleteCreditCard(userId, id);
      
      return successResponse(res, result, 'Cartão de crédito excluído com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  };

  getCreditCardStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const stats = await this.creditCardService.getCreditCardStats(userId, id);
      
      return successResponse(res, stats, 'Estatísticas do cartão obtidas com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  };
}
