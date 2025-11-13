import { Router } from 'express';
import {
  createTransaction,
  createTransactionValidation,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createTransactionValidation, createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.put('/:id', createTransactionValidation, updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
