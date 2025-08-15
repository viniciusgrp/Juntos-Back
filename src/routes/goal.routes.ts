import { Router } from 'express'
import { goalController } from '../controllers/goal.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware)

// Rotas para metas
router.post('/', goalController.create)
router.get('/', goalController.getAll)
router.get('/:id', goalController.getById)
router.put('/:id', goalController.update)
router.delete('/:id', goalController.delete)
router.post('/:id/progress', goalController.addProgress)
router.get('/:id/progress', goalController.getProgress)

export default router
