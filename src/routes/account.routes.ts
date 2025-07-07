import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateSchema } from '../middleware/validation.middleware';
import { 
  createAccountSchema, 
  updateAccountSchema, 
  transferSchema 
} from '../utils/validation.account';

const router = Router();
const accountController = new AccountController();

router.use(authMiddleware);

router.get('/', accountController.getAccounts.bind(accountController));

router.get('/stats', accountController.getAccountStats.bind(accountController));

router.post(
  '/',
  validateSchema(createAccountSchema),
  accountController.createAccount.bind(accountController)
);

router.get('/:id', accountController.getAccountById.bind(accountController));

router.put(
  '/:id',
  validateSchema(updateAccountSchema),
  accountController.updateAccount.bind(accountController)
);

router.delete('/:id', accountController.deleteAccount.bind(accountController));

router.post(
  '/transfer',
  validateSchema(transferSchema),
  accountController.transferBetweenAccounts.bind(accountController)
);

export default router;
