import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const categoryController = new CategoryController();

router.use(authMiddleware);

router.get('/stats', categoryController.getCategoryStats.bind(categoryController));
router.post('/default', categoryController.createDefaultCategories.bind(categoryController));

router.get('/', categoryController.getCategories.bind(categoryController));
router.post('/', categoryController.createCategory.bind(categoryController));
router.get('/:id', categoryController.getCategoryById.bind(categoryController));
router.put('/:id', categoryController.updateCategory.bind(categoryController));
router.delete('/:id', categoryController.deleteCategory.bind(categoryController));

export default router;
