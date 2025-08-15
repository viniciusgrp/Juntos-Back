import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginRequest, RegisterRequest, RefreshTokenRequest, AuthenticatedRequest } from '../types/auth.types';
import { successResponse, errorResponse, asyncHandler } from '../utils/response.util';

const authService = new AuthService();

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const data: RegisterRequest = req.body;

    const result = await authService.register(data);

    successResponse(res, result, 'Usuário registrado com sucesso', 201);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const data: LoginRequest = req.body;

    const result = await authService.login(data);

    successResponse(res, result, 'Login realizado com sucesso');
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const data: RefreshTokenRequest = req.body;

    const result = await authService.refreshToken(data);

    successResponse(res, result, 'Token renovado com sucesso');
  }),

  profile: asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401);
    }

    const result = await authService.getProfile(userId);

    successResponse(res, result, 'Perfil obtido com sucesso');
  }),

  validateToken: asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const userEmail = authReq.user?.email;

    if (!userId || !userEmail) {
      return errorResponse(res, 'Token inválido', 401);
    }

    successResponse(res, {
      valid: true,
      user: {
        id: userId,
        email: userEmail,
      }
    }, 'Token válido');
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'E-mail é obrigatório', 400);
    }

    const result = await authService.forgotPassword(email);

    successResponse(res, result, 'Nova senha enviada para o e-mail');
  }),
};
