import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const transactionController = new TransactionController();

router.use(authMiddleware);

router.get('/stats', transactionController.getTransactionStats.bind(transactionController));

router.get('/', transactionController.getTransactions.bind(transactionController));
router.post('/', transactionController.createTransaction.bind(transactionController));
router.get('/:id', transactionController.getTransactionById.bind(transactionController));
router.put('/:id', transactionController.updateTransaction.bind(transactionController));
router.delete('/:id', transactionController.deleteTransaction.bind(transactionController));

export default router;
