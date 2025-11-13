import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../api/analytics';
import { transactionsAPI } from '../../api/transactions';
import { DashboardStats, Insight, Transaction, SpendingByCategory, MonthlyTrend } from '../../types';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0', '#00BCD4'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [spendingByCategory, setSpendingByCategory] = useState<SpendingByCategory[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, insightsData, transactionsData, spendingData, trendsData] = await Promise.all([
          analyticsAPI.getDashboardStats(),
          analyticsAPI.getInsights(),
          transactionsAPI.getAll({ limit: 10, sortBy: 'date', order: 'desc' }),
          analyticsAPI.getSpendingByCategory(),
          analyticsAPI.getMonthlyTrends(6)
        ]);
        setStats(statsData);
        setInsights(insightsData.insights);
        setRecentTransactions(transactionsData.slice(0, 10));
        setSpendingByCategory(spendingData.slice(0, 3)); // Top 3 for summary
        setMonthlyTrends(trendsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  const totalSpent = spendingByCategory.reduce((sum, cat) => sum + cat.total, 0);

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="quick-actions">
          <button className="btn btn-primary" onClick={() => alert('Add Income feature - Navigate to Transactions')}>
            ➕ Add Income
          </button>
          <button className="btn btn-danger" onClick={() => alert('Add Expense feature - Navigate to Transactions')}>
            ➖ Add Expense
          </button>
          <button className="btn btn-secondary" onClick={() => alert('Create Budget feature - Navigate to Budgets')}>
            🎯 Create Budget
          </button>
          <button className="btn btn-secondary" onClick={() => alert('AI Assistant feature')}>
            🤖 Ask AI
          </button>
        </div>
      </div>

      {/* Total Balance Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Balance</h3>
          <div className="value" style={{ color: (stats?.balance || 0) >= 0 ? '#4CAF50' : '#f44336' }}>
            ${stats?.balance.toFixed(2) || '0.00'}
          </div>
          <div className="stat-meta">Across all accounts</div>
        </div>
        
        <div className="stat-card income">
          <h3>Income (This Month)</h3>
          <div className="value">${stats?.totalIncome.toFixed(2) || '0.00'}</div>
          <div className="stat-change positive">+8.5% vs last month</div>
        </div>
        
        <div className="stat-card expense">
          <h3>Expenses (This Month)</h3>
          <div className="value">${stats?.totalExpenses.toFixed(2) || '0.00'}</div>
          <div className="stat-change negative">-12% vs last month</div>
        </div>
        
        <div className="stat-card">
          <h3>Total Transactions</h3>
          <div className="value">{stats?.transactionCount || 0}</div>
          <div className="stat-meta">This month</div>
        </div>
      </div>

      {/* Spending Summary */}
      <div className="card">
        <h2>Spending Summary</h2>
        <div className="spending-summary">
          <div className="spending-total">
            <h3>Total Spent This Month</h3>
            <div className="amount">${totalSpent.toFixed(2)}</div>
          </div>
          <div className="spending-categories">
            <h4>Top 3 Categories</h4>
            {spendingByCategory.map((category, index) => (
              <div key={category.categoryId} className="category-item">
                <div className="category-info">
                  <span className="category-icon">{category.categoryIcon}</span>
                  <span className="category-name">{category.categoryName}</span>
                </div>
                <div className="category-amount">
                  ${category.total.toFixed(2)}
                  <span className="category-percentage">
                    ({((category.total / totalSpent) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="card chart-card">
          <h2>Spending by Category</h2>
          {spendingByCategory.length === 0 ? (
            <p>No spending data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={spendingByCategory as any}
                  dataKey="total"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {spendingByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.categoryColor || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card chart-card">
          <h2>Income vs Expenses</h2>
          {monthlyTrends.length === 0 ? (
            <p>No trend data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTrends as any}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#4CAF50" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#f44336" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2>Recent Transactions</h2>
        {recentTransactions.length === 0 ? (
          <p>No recent transactions.</p>
        ) : (
          <div className="recent-transactions">
            {recentTransactions.map((transaction) => (
              <div key={transaction._id} className="transaction-item">
                <div className="transaction-info">
                  <div className="transaction-category">
                    <span className="category-icon">
                      {typeof transaction.categoryId === 'object' ? transaction.categoryId.icon : '💰'}
                    </span>
                    <div>
                      <div className="transaction-description">{transaction.description}</div>
                      <div className="transaction-date">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="transaction-amount-wrapper">
                  <span className={`transaction-badge ${transaction.type}`}>
                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                  </span>
                  <div 
                    className="transaction-amount"
                    style={{ color: transaction.type === 'income' ? '#4CAF50' : '#f44336' }}
                  >
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Insights */}
      <div className="card ai-insights-card">
        <h2>🤖 AI Insights</h2>
        {insights.length === 0 ? (
          <p>No insights available yet. Start adding transactions to see AI-powered insights!</p>
        ) : (
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className={`alert alert-${insight.type}`}>
                <strong>{insight.title}</strong>
                <p>{insight.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
