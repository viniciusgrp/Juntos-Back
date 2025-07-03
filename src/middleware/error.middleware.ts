import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Erro:', err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'Dados inválidos',
      details: err.details
    });
    return;
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      error: 'Token inválido'
    });
    return;
  }

  if (err.code === 'P2002') {
    res.status(409).json({
      error: 'Recurso já existe'
    });
    return;
  }

  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Erro interno do servidor' 
    : err.message;

  res.status(status).json({ error: message });
};
