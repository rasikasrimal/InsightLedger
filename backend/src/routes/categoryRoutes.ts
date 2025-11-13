import { Router } from 'express';
import {
  createCategory,
  createCategoryValidation,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createCategoryValidation, createCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.put('/:id', createCategoryValidation, updateCategory);
router.delete('/:id', deleteCategory);

export default router;
