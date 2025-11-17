import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../api/analytics';
import { categoriesAPI } from '../api/categories';
import { MonthlyTrend, SpendingByCategory, Category } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './AnalyticsPage.css';

const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0', '#00BCD4', '#FF9800', '#E91E63'];

const AnalyticsPage: React.FC = () => {
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [spending, setSpending] = useState<SpendingByCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [aiQuery, setAiQuery] = useState('Where did I overspend this month?');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiError, setAiError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [trendsData, spendingData, categoriesData] = await Promise.all([
          analyticsAPI.getMonthlyTrends(6),
          analyticsAPI.getSpendingByCategory(),
          categoriesAPI.getAll()
        ]);
        setTrends(trendsData);
        setSpending(spendingData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const calculateTrendChange = () => {
    if (trends.length < 2) return null;
    const current = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    
    const incomeChange = ((current.income - previous.income) / previous.income) * 100;
    const expenseChange = ((current.expenses - previous.expenses) / previous.expenses) * 100;
    
    return { incomeChange, expenseChange };
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;
    setAiError('');
    setAiAnswer('');
    setAiLoading(true);
    try {
      const response = await analyticsAPI.askAI(aiQuery.trim());
      setAiAnswer(response.answer);
    } catch (error: any) {
      setAiError(error.response?.data?.error || 'Failed to get AI response. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const trendChange = calculateTrendChange();
  const totalSpending = spending.reduce((sum, cat) => sum + cat.total, 0);

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="container">
      <h1>Analytics</h1>

      {/* Key Insights Summary */}
      <div className="insights-summary">
        <div className="insight-card">
          <div className="insight-icon">📊</div>
          <div className="insight-content">
            <h3>Total Spending</h3>
            <div className="insight-value">${totalSpending.toFixed(2)}</div>
            <div className="insight-meta">Current Period</div>
          </div>
        </div>
        
        {trendChange && (
          <>
            <div className="insight-card">
              <div className="insight-icon">💰</div>
              <div className="insight-content">
                <h3>Income Trend</h3>
                <div 
                  className="insight-value"
                  style={{ color: trendChange.incomeChange >= 0 ? '#4CAF50' : '#f44336' }}
                >
                  {trendChange.incomeChange >= 0 ? '+' : ''}{trendChange.incomeChange.toFixed(1)}%
                </div>
                <div className="insight-meta">vs Last Month</div>
              </div>
            </div>
            
            <div className="insight-card">
              <div className="insight-icon">💸</div>
              <div className="insight-content">
                <h3>Expense Trend</h3>
                <div 
                  className="insight-value"
                  style={{ color: trendChange.expenseChange <= 0 ? '#4CAF50' : '#f44336' }}
                >
                  {trendChange.expenseChange >= 0 ? '+' : ''}{trendChange.expenseChange.toFixed(1)}%
                </div>
                <div className="insight-meta">vs Last Month</div>
              </div>
            </div>
          </>
        )}

        <div className="insight-card">
          <div className="insight-icon">📈</div>
          <div className="insight-content">
            <h3>Top Category</h3>
            <div className="insight-value">
              {spending.length > 0 ? spending[0].categoryIcon : '💰'}
            </div>
            <div className="insight-meta">
              {spending.length > 0 ? spending[0].categoryName : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Spending by Category - Full Detailed View */}
      <div className="card">
        <h2>💰 Spending by Category</h2>
        {spending.length === 0 ? (
          <p>No spending data available yet.</p>
        ) : (
          <div className="analytics-grid">
            <div className="chart-section">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={spending as any}
                    dataKey="total"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={(props: any) => `${props.categoryName}: ${(props.percent * 100).toFixed(0)}%`}
                  >
                    {spending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.categoryColor || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="category-breakdown">
              <h3>Category Details</h3>
              {spending.map((cat, index) => (
                <div key={cat.categoryId} className="category-detail-item">
                  <div className="category-detail-header">
                    <span className="category-icon">{cat.categoryIcon}</span>
                    <span className="category-name">{cat.categoryName}</span>
                  </div>
                  <div className="category-detail-stats">
                    <span className="category-amount">${cat.total.toFixed(2)}</span>
                    <span className="category-percentage">
                      {((cat.total / totalSpending) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="category-progress-bar">
                    <div 
                      className="category-progress-fill"
                      style={{ 
                        width: `${(cat.total / totalSpending) * 100}%`,
                        background: cat.categoryColor || COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Trends - Deep Comparison */}
      <div className="card">
        <h2>📊 Monthly Trends</h2>
        {trends.length === 0 ? (
          <p>No trend data available yet. Start tracking transactions to see trends!</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trends as any}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#4CAF50" strokeWidth={3} name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#f44336" strokeWidth={3} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
            
            {trendChange && (
              <div className="trend-insights">
                <div className="trend-insight">
                  <strong>Income Analysis:</strong> Income {trendChange.incomeChange >= 0 ? 'increased' : 'decreased'} by {Math.abs(trendChange.incomeChange).toFixed(1)}% this month
                </div>
                <div className="trend-insight">
                  <strong>Expense Analysis:</strong> Expenses {trendChange.expenseChange >= 0 ? 'increased' : 'decreased'} by {Math.abs(trendChange.expenseChange).toFixed(1)}% this month
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Category Trend Over Time */}
      <div className="card">
        <h2>📈 Category Trend Over Time</h2>
        <div className="form-group">
          <label>Select Category to Analyze:</label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Choose a category...</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
        {selectedCategory ? (
          <div className="trend-placeholder">
            <p>📊 Category trend chart will show month-to-month spending for the selected category.</p>
            <p>Feature: Track how your spending in this category changes over time.</p>
          </div>
        ) : (
          <p>Select a category above to see its spending trend over time.</p>
        )}
      </div>

      {/* Spending Comparison - Bar Chart */}
      <div className="card">
        <h2>📊 Category Comparison</h2>
        {spending.length === 0 ? (
          <p>No spending data available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={spending as any}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoryName" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="total" fill="#4CAF50" name="Amount Spent" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* AI Insights Panel */}
      <div className="card ai-panel">
        <h2>🤖 AI Financial Insights</h2>
        <div className="ai-query-section">
          <p className="ai-description">
            Ask AI anything about your finances and get intelligent insights based on your data.
          </p>
          <div className="ai-query-input">
            <input
              type="text"
              placeholder="e.g., Where did I overspend this month?"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiQuery()}
            />
            <button className="btn btn-primary" onClick={handleAiQuery} disabled={aiLoading}>
              {aiLoading ? 'Thinking...' : 'Ask AI'}
            </button>
          </div>
          <div className="ai-suggestions">
            <p><strong>Suggested Questions:</strong></p>
            <div className="suggestion-chips">
              <button 
                className="suggestion-chip"
                onClick={() => setAiQuery("Where did I overspend this month?")}
              >
                Where did I overspend?
              </button>
              <button 
                className="suggestion-chip"
                onClick={() => setAiQuery("Why are my expenses higher?")}
              >
                Why are expenses higher?
              </button>
              <button 
                className="suggestion-chip"
                onClick={() => setAiQuery("What cost grew most?")}
              >
                What cost grew most?
              </button>
              <button 
                className="suggestion-chip"
                onClick={() => setAiQuery("Give me a savings plan")}
              >
                Give me a savings plan
              </button>
            </div>
          </div>
          {aiError && <div className="alert alert-error">{aiError}</div>}
          {aiAnswer && (
            <div className="ai-answer">
              <h4>AI Response</h4>
              <p>{aiAnswer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
