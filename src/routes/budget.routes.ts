import { Router } from 'express'
import { budgetController } from '../controllers/budget.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware)

// Rotas para orçamentos
router.post('/', budgetController.create)
router.get('/', budgetController.getAll)
router.get('/:id', budgetController.getById)
router.get('/month/:month/year/:year', budgetController.getByMonthYear)
router.put('/:id', budgetController.update)
router.delete('/:id', budgetController.delete)
router.put('/month/:month/year/:year/update-spent', budgetController.updateSpent)

export default router
