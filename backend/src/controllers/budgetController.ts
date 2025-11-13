import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Budget from '../models/Budget';
import Transaction from '../models/Transaction';
import { AuthRequest, BudgetPeriod } from '../types';

export const createBudgetValidation = [
  body('categoryId').isMongoId(),
  body('amount').isFloat({ min: 0.01 }),
  body('period').isIn(Object.values(BudgetPeriod)),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
];

export const createBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { categoryId, amount, period, startDate, endDate } = req.body;
    const userId = req.user?.userId;

    const budget = new Budget({
      userId,
      categoryId,
      amount,
      period,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    await budget.save();
    await budget.populate('categoryId');

    res.status(201).json(budget);
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
};

export const getBudgets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { period, active } = req.query;

    const filter: any = { userId };
    if (period) filter.period = period;
    
    if (active === 'true') {
      const now = new Date();
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    }

    const budgets = await Budget.find(filter)
      .populate('categoryId')
      .sort({ startDate: -1 });

    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spending = await Transaction.aggregate([
          {
            $match: {
              userId: budget.userId,
              categoryId: budget.categoryId,
              type: 'expense',
              date: {
                $gte: budget.startDate,
                $lte: budget.endDate
              }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        return {
          ...budget.toObject(),
          spent: spending[0]?.total || 0,
          remaining: budget.amount - (spending[0]?.total || 0)
        };
      })
    );

    res.json(budgetsWithSpending);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

export const getBudgetById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const budget = await Budget.findOne({ _id: id, userId }).populate('categoryId');

    if (!budget) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }

    const spending = await Transaction.aggregate([
      {
        $match: {
          userId: budget.userId,
          categoryId: budget.categoryId,
          type: 'expense',
          date: {
            $gte: budget.startDate,
            $lte: budget.endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const result = {
      ...budget.toObject(),
      spent: spending[0]?.total || 0,
      remaining: budget.amount - (spending[0]?.total || 0)
    };

    res.json(result);
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
};

export const updateBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user?.userId;
    const { id } = req.params;
    const { categoryId, amount, period, startDate, endDate } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId },
      { categoryId, amount, period, startDate: new Date(startDate), endDate: new Date(endDate) },
      { new: true, runValidators: true }
    ).populate('categoryId');

    if (!budget) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }

    res.json(budget);
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const budget = await Budget.findOneAndDelete({ _id: id, userId });

    if (!budget) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};
