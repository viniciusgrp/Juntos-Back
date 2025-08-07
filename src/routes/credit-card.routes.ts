import { Router } from 'express';
import { CreditCardController } from '../controllers/credit-card.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const creditCardController = new CreditCardController();

router.use(authMiddleware);

router.post('/', creditCardController.createCreditCard);
router.get('/', creditCardController.getCreditCards);
router.get('/:id', creditCardController.getCreditCardById);
router.get('/:id/stats', creditCardController.getCreditCardStats);
router.put('/:id', creditCardController.updateCreditCard);
router.delete('/:id', creditCardController.deleteCreditCard);

export default router;
