import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../api/analytics';
import { MonthlyTrend, SpendingByCategory } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0', '#00BCD4'];

const AnalyticsPage: React.FC = () => {
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [spending, setSpending] = useState<SpendingByCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [trendsData, spendingData] = await Promise.all([
          analyticsAPI.getMonthlyTrends(6),
          analyticsAPI.getSpendingByCategory()
        ]);
        setTrends(trendsData);
        setSpending(spendingData);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="container">
      <h1>Analytics</h1>

      <div className="card">
        <h2>Monthly Trends</h2>
        {trends.length === 0 ? (
          <p>No data available yet. Start tracking transactions to see trends!</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends as any}>
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

      <div className="card">
        <h2>Spending by Category</h2>
        {spending.length === 0 ? (
          <p>No spending data available yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spending as any}
                  dataKey="total"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {spending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.categoryColor || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spending as any}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoryName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
