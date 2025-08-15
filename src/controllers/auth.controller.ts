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

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401);
    }

    const updateData = req.body;
    const result = await authService.updateProfile(userId, updateData);

    successResponse(res, result, 'Perfil atualizado com sucesso');
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

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      return errorResponse(res, 'Usuário não autenticado', 401);
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return errorResponse(res, 'Todos os campos são obrigatórios', 400);
    }

    if (newPassword !== confirmPassword) {
      return errorResponse(res, 'Nova senha e confirmação não coincidem', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'Nova senha deve ter pelo menos 6 caracteres', 400);
    }

    if (currentPassword === newPassword) {
      return errorResponse(res, 'A nova senha deve ser diferente da senha atual', 400);
    }

    const result = await authService.changePassword(userId, currentPassword, newPassword);

    successResponse(res, result, 'Senha alterada com sucesso');
  }),
};
