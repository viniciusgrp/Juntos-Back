import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt.util';
import { AuthenticatedRequest } from '../types/auth.types';
import { errorResponse } from '../utils/response.util';

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      errorResponse(res, 'Token de acesso é obrigatório', 401);
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      errorResponse(res, 'Token de acesso é obrigatório', 401);
      return;
    }

    const decoded = JwtUtil.verifyAccessToken(token);

    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    errorResponse(res, 'Token inválido', 401);
  }
};

export const optionalAuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');

      if (token) {
        const decoded = JwtUtil.verifyAccessToken(token);
        req.user = {
          id: decoded.userId,
          email: decoded.email,
        };
      }
    }

    next();
  } catch (error) {
    next();
  }
};
