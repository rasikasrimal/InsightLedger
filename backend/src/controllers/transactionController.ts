import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Transaction from '../models/Transaction';
import { AuthRequest, TransactionType } from '../types';

export const createTransactionValidation = [
  body('categoryId').isMongoId(),
  body('type').isIn(Object.values(TransactionType)),
  body('amount').isFloat({ min: 0.01 }),
  body('description').trim().notEmpty(),
  body('date').optional().isISO8601()
];

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { categoryId, type, amount, description, date } = req.body;
    const userId = req.user?.userId;

    const transaction = new Transaction({
      userId,
      categoryId,
      type,
      amount,
      description,
      date: date || new Date()
    });

    await transaction.save();
    await transaction.populate('categoryId');

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { startDate, endDate, type, categoryId } = req.query;

    const filter: any = { userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    if (type) filter.type = type;
    if (categoryId) filter.categoryId = categoryId;

    const transactions = await Transaction.find(filter)
      .populate('categoryId')
      .sort({ date: -1 })
      .limit(100);

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

export const getTransactionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const transaction = await Transaction.findOne({ _id: id, userId }).populate('categoryId');

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user?.userId;
    const { id } = req.params;
    const { categoryId, type, amount, description, date } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      { categoryId, type, amount, description, date },
      { new: true, runValidators: true }
    ).populate('categoryId');

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    res.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({ _id: id, userId });

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};
