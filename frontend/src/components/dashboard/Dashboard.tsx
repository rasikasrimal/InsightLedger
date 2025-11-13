import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../api/analytics';
import { DashboardStats, Insight } from '../../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, insightsData] = await Promise.all([
          analyticsAPI.getDashboardStats(),
          analyticsAPI.getInsights()
        ]);
        setStats(statsData);
        setInsights(insightsData.insights);
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

  return (
    <div className="container">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card income">
          <h3>Total Income</h3>
          <div className="value">${stats?.totalIncome.toFixed(2) || '0.00'}</div>
        </div>
        
        <div className="stat-card expense">
          <h3>Total Expenses</h3>
          <div className="value">${stats?.totalExpenses.toFixed(2) || '0.00'}</div>
        </div>
        
        <div className="stat-card">
          <h3>Balance</h3>
          <div className="value" style={{ color: (stats?.balance || 0) >= 0 ? '#4CAF50' : '#f44336' }}>
            ${stats?.balance.toFixed(2) || '0.00'}
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Transactions</h3>
          <div className="value">{stats?.transactionCount || 0}</div>
        </div>
      </div>

      <div className="card">
        <h2>AI Insights</h2>
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
