import { Router } from 'express';
import { authRoutes } from './auth.routes';
import accountRoutes from './account.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);

export { router as routes };
