import { Response } from 'express';
import { Types } from 'mongoose';
import Transaction from '../models/Transaction';
import Budget from '../models/Budget';
import { AuthRequest } from '../types';
import { generateFinancialAnswer, generateSuggestionPrompts } from '../services/geminiService';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userObjectId = new Types.ObjectId(userId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [income, expenses, transactionCount] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: 'income',
            date: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: 'expense',
            date: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.countDocuments({
        userId: userObjectId,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      })
    ]);

    const totalIncome = income[0]?.total || 0;
    const totalExpenses = expenses[0]?.total || 0;
    const balance = totalIncome - totalExpenses;

    res.json({
      period: 'monthly',
      startDate: startOfMonth,
      endDate: endOfMonth,
      totalIncome,
      totalExpenses,
      balance,
      transactionCount
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

export const getSpendingByCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userObjectId = new Types.ObjectId(userId);
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate as string) : new Date();

    const spendingByCategory = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: 'expense',
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$categoryId',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          categoryId: '$_id',
          categoryName: '$category.name',
          categoryIcon: '$category.icon',
          categoryColor: '$category.color',
          total: 1,
          count: 1
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    res.json(spendingByCategory);
  } catch (error) {
    console.error('Get spending by category error:', error);
    res.status(500).json({ error: 'Failed to fetch spending by category' });
  }
};

export const getMonthlyTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userObjectId = new Types.ObjectId(userId);
    const months = parseInt(req.query.months as string) || 6;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const trends = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const formattedTrends = trends.reduce((acc: any[], item) => {
      const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      let monthData = acc.find((m) => m.month === monthKey);

      if (!monthData) {
        monthData = { month: monthKey, income: 0, expenses: 0 };
        acc.push(monthData);
      }

      if (item._id.type === 'income') {
        monthData.income = item.total;
      } else {
        monthData.expenses = item.total;
      }

      return acc;
    }, []);

    res.json(formattedTrends);
  } catch (error) {
    console.error('Get monthly trends error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly trends' });
  }
};

export const getAIInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userObjectId = new Types.ObjectId(userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [currentMonthExpenses, lastMonthExpenses, topCategories, budgetStatus] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: 'expense',
            date: { $gte: startOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: 'expense',
            date: { $gte: lastMonthStart, $lte: lastMonthEnd }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: 'expense',
            date: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: '$categoryId',
            total: { $sum: '$amount' }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        { $sort: { total: -1 } },
        { $limit: 3 }
      ]),
      Budget.find({
        userId: userObjectId,
        startDate: { $lte: now },
        endDate: { $gte: now }
      }).populate('categoryId')
    ]);

    const insights = [];

    const currentTotal = currentMonthExpenses[0]?.total || 0;
    const lastTotal = lastMonthExpenses[0]?.total || 0;
    
    if (lastTotal > 0) {
      const percentChange = ((currentTotal - lastTotal) / lastTotal) * 100;
      if (percentChange > 20) {
        insights.push({
          type: 'warning',
          title: 'Spending Alert',
          message: `Your spending is up ${percentChange.toFixed(1)}% compared to last month. Consider reviewing your expenses.`
        });
      } else if (percentChange < -10) {
        insights.push({
          type: 'success',
          title: 'Great Job!',
          message: `Your spending is down ${Math.abs(percentChange).toFixed(1)}% compared to last month. Keep up the good work!`
        });
      }
    }

    if (topCategories.length > 0) {
      const topCategory = topCategories[0];
      insights.push({
        type: 'info',
        title: 'Top Spending Category',
        message: `You spent $${topCategory.total.toFixed(2)} on ${topCategory.category.name} this month.`
      });
    }

    for (const budget of budgetStatus) {
      const spent = await Transaction.aggregate([
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

      const spentAmount = spent[0]?.total || 0;
      const percentUsed = (spentAmount / budget.amount) * 100;

      if (percentUsed > 90) {
        insights.push({
          type: 'warning',
          title: 'Budget Alert',
          message: `You've used ${percentUsed.toFixed(1)}% of your budget for ${(budget.categoryId as any).name}.`
        });
      } else if (percentUsed > 75) {
        insights.push({
          type: 'info',
          title: 'Budget Notice',
          message: `You've used ${percentUsed.toFixed(1)}% of your budget for ${(budget.categoryId as any).name}.`
        });
      }
    }

    if (insights.length === 0) {
      insights.push({
        type: 'success',
        title: 'Looking Good!',
        message: 'Your finances are on track. Keep monitoring your spending habits.'
      });
    }

    res.json({ insights });
  } catch (error) {
    console.error('Get AI insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
};

export const askAI = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { question } = req.body;
    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      res.status(400).json({ error: 'Please provide a valid question.' });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [incomeAgg, expenseAgg, categorySpend, recentTransactions] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: userObjectId, type: 'income', date: { $gte: startOfMonth, $lte: now } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Transaction.aggregate([
        { $match: { userId: userObjectId, type: 'expense', date: { $gte: startOfMonth, $lte: now } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Transaction.aggregate([
        { $match: { userId: userObjectId, type: 'expense', date: { $gte: startOfMonth, $lte: now } } },
        { $group: { _id: '$categoryId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $sort: { total: -1 } },
        { $limit: 5 }
      ]),
      Transaction.find({ userId: userObjectId })
        .populate('categoryId')
        .sort({ date: -1 })
        .limit(20)
        .lean()
    ]);

    const budgets = await Budget.find({
      userId: userObjectId,
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .populate('categoryId')
      .lean();

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpenses = expenseAgg[0]?.total || 0;
    const balance = totalIncome - totalExpenses;

    const categorySummary = categorySpend
      .map((c: any) => `- ${c.category?.name || 'Uncategorized'}: $${c.total.toFixed(2)} across ${c.count} expenses`)
      .join('\n');

    const budgetSummary = budgets
      .map((b) => {
        const category: any = b.categoryId;
        return `- ${category?.name || 'Category'} budget $${b.amount} (${b.period}) from ${b.startDate?.toISOString?.().slice(0, 10)} to ${b.endDate
          ?.toISOString?.()
          .slice(0, 10)}`;
      })
      .join('\n');

    const recentSummary = recentTransactions
      .map((t) => {
        const category: any = t.categoryId;
        return `${t.type === 'income' ? 'Income' : 'Expense'} $${t.amount} for ${t.description} in ${category?.name || 'Uncategorized'} on ${new Date(
          t.date
        ).toISOString().slice(0, 10)}`;
      })
      .join('\n');

    const prompt = `
You are a concise personal finance assistant. Use the user's data below to answer their question clearly and helpfully.

User question: """${question.trim()}"""

Current month summary:
- Income: $${totalIncome.toFixed(2)} (transactions: ${incomeAgg[0]?.count || 0})
- Expenses: $${totalExpenses.toFixed(2)} (transactions: ${expenseAgg[0]?.count || 0})
- Balance: $${balance.toFixed(2)}

Top expense categories this month:
${categorySummary || '- No expenses yet.'}

Active budgets:
${budgetSummary || '- No active budgets.'}

Recent transactions (newest first):
${recentSummary || 'No recent transactions.'}

Guidelines:
- Keep it short (4-6 sentences).
- If suggesting actions, make them concrete and prioritized.
- Avoid hallucinating data not present in the context.
- Answer in plain text (no markdown bullets needed by default).
`;

    const answer = await generateFinancialAnswer(prompt);
    res.json({ answer });
  } catch (error) {
    console.error('Ask AI error:', error);
    res.status(502).json({ error: (error as Error)?.message || 'Failed to get AI response' });
  }
};

export const getSuggestionPrompts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get recent messages from request body (optional)
    const { recentMessages = [] } = req.body;

    // Gather financial data for the current month
    const [incomeAgg, expenseAgg, categorySpend, budgets, savingsGoals] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: userObjectId, type: 'income', date: { $gte: startOfMonth, $lte: now } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { userId: userObjectId, type: 'expense', date: { $gte: startOfMonth, $lte: now } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { userId: userObjectId, type: 'expense', date: { $gte: startOfMonth, $lte: now } } },
        { $group: { _id: '$categoryId', spent: { $sum: '$amount' } } },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $sort: { spent: -1 } },
        { $limit: 5 }
      ]),
      Budget.find({
        userId: userObjectId,
        startDate: { $lte: now },
        endDate: { $gte: now }
      })
        .populate('categoryId')
        .lean(),
      // Placeholder for savings goals - could be from a separate model if exists
      Promise.resolve([])
    ]);

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpenses = expenseAgg[0]?.total || 0;
    const currentBalance = totalIncome - totalExpenses;

    // Build active budgets with spent amounts
    const activeBudgets = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await Transaction.aggregate([
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

        const spentAmount = spent[0]?.total || 0;
        const category: any = budget.categoryId;

        return {
          name: category?.name || 'Uncategorized',
          spent: spentAmount,
          limit: budget.amount
        };
      })
    );

    const financialData = {
      currency: 'USD',
      currentBalance,
      totalIncomeThisMonth: totalIncome,
      totalExpensesThisMonth: totalExpenses,
      activeBudgets,
      savingsGoals: [
        // Placeholder - would come from actual savings goals model
      ]
    };

    const suggestions = await generateSuggestionPrompts(recentMessages, financialData);

    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestion prompts error:', error);
    res.status(500).json({ error: 'Failed to generate suggestion prompts' });
  }
};
