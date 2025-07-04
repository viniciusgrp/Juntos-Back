import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRegister, validateLogin, validateRefreshToken } from '../middleware/validation.middleware';

const router = Router();

// Rotas públicas
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', validateRefreshToken, authController.refresh);

// Rotas protegidas
router.get('/profile', authMiddleware, authController.profile);
router.get('/validate', authMiddleware, authController.validateToken);

export { router as authRoutes };
