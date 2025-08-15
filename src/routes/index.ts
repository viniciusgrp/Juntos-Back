import { Router } from 'express';
import { authRoutes } from './auth.routes';
import accountRoutes from './account.routes';
import transactionRoutes from './transaction.routes';
import categoryRoutes from './category.routes';
import creditCardRoutes from './credit-card.routes';
import budgetRoutes from './budget.routes';
import goalRoutes from './goal.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/credit-cards', creditCardRoutes);
router.use('/budgets', budgetRoutes);
router.use('/goals', goalRoutes);

export { router as routes };
