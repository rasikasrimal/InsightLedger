import { Router } from 'express';
import {
  createBudget,
  createBudgetValidation,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget
} from '../controllers/budgetController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createBudgetValidation, createBudget);
router.get('/', getBudgets);
router.get('/:id', getBudgetById);
router.put('/:id', createBudgetValidation, updateBudget);
router.delete('/:id', deleteBudget);

export default router;
