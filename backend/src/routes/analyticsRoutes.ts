import { Router } from 'express';
import {
  getDashboardStats,
  getSpendingByCategory,
  getMonthlyTrends,
  getAIInsights,
  askAI,
  getSuggestionPrompts
} from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/spending-by-category', getSpendingByCategory);
router.get('/monthly-trends', getMonthlyTrends);
router.get('/insights', getAIInsights);
router.post('/ask', askAI);
router.post('/suggestions', getSuggestionPrompts);

export default router;
