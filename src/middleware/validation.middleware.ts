import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';
import { errorResponse } from '../utils/response.util';
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema,
  validateData 
} from '../utils/validation.util';

export const validateSchema = (schema: yup.Schema<any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await validateData(schema, req.body);
      next();
    } catch (error) {
      if (error instanceof Error) {
        errorResponse(res, error.message, 400);
      } else {
        errorResponse(res, 'Dados inválidos', 400);
      }
    }
  };
};

export const validateRegister = validateSchema(registerSchema);
export const validateLogin = validateSchema(loginSchema);
export const validateRefreshToken = validateSchema(refreshTokenSchema);

export const validateCustom = (validationFn: (data: any) => Promise<any> | any) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await validationFn(req.body);
      next();
    } catch (error) {
      if (error instanceof Error) {
        errorResponse(res, error.message, 400);
      } else {
        errorResponse(res, 'Dados inválidos', 400);
      }
    }
  };
};
