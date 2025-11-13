import React, { useEffect, useState } from 'react';
import { budgetsAPI } from '../api/budgets';
import { Budget } from '../types';
import './BudgetsPage.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const budgetsData = await budgetsAPI.getAll({ active: true });
        setBudgets(budgetsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return '#f44336';
    if (percentage >= 90) return '#ff9800';
    if (percentage >= 75) return '#FFC107';
    return '#4CAF50';
  };

  const budgetAlerts = budgets.filter(b => {
    const percentage = ((b.spent || 0) / b.amount) * 100;
    return percentage >= 80;
  });

  if (loading) {
    return <div className="loading">Loading budgets...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Budgets</h1>
        <button className="btn btn-primary" onClick={() => alert('Create Budget form will be implemented')}>
          ➕ Create Budget
        </button>
      </div>

      {/* Month Selector */}
      <div className="card month-selector-card">
        <div className="month-selector">
          <button 
            className="btn btn-secondary"
            onClick={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
              } else {
                setSelectedMonth(selectedMonth - 1);
              }
            }}
          >
            ← Previous
          </button>
          <div className="selected-period">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="month-select"
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="year-select"
            >
              {Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
            }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="card alerts-card">
          <h2>⚠️ Budget Alerts</h2>
          <div className="alerts-list">
            {budgetAlerts.map(budget => {
              const percentage = ((budget.spent || 0) / budget.amount) * 100;
              const categoryName = typeof budget.categoryId === 'object' ? budget.categoryId.name : '';
              return (
                <div key={budget._id} className="alert alert-warning">
                  <strong>
                    {percentage >= 100 
                      ? `You've exceeded your ${categoryName} budget!` 
                      : `You've used ${percentage.toFixed(0)}% of your ${categoryName} budget.`}
                  </strong>
                  <p>
                    {percentage >= 100
                      ? `You're ${((percentage - 100)).toFixed(0)}% over budget.`
                      : `Only $${(budget.amount - (budget.spent || 0)).toFixed(2)} remaining.`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Budget Cards */}
      <div className="budgets-grid">
        {budgets.length === 0 ? (
          <div className="card">
            <p>No budgets set for {MONTHS[selectedMonth]} {selectedYear}. Create a budget to track your spending!</p>
          </div>
        ) : (
          budgets.map((budget) => {
            const percentage = Math.min(((budget.spent || 0) / budget.amount) * 100, 100);
            const remaining = budget.amount - (budget.spent || 0);
            const categoryName = typeof budget.categoryId === 'object' ? budget.categoryId.name : '';
            const categoryIcon = typeof budget.categoryId === 'object' ? budget.categoryId.icon : '💰';
            
            return (
              <div key={budget._id} className="budget-card">
                <div className="budget-header">
                  <div className="budget-category">
                    <span className="category-icon">{categoryIcon}</span>
                    <h3>{categoryName}</h3>
                  </div>
                  <span className="budget-period">{budget.period}</span>
                </div>
                
                <div className="budget-amounts">
                  <div className="amount-item">
                    <span className="amount-label">Limit</span>
                    <span className="amount-value">${budget.amount.toFixed(2)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="amount-label">Spent</span>
                    <span className="amount-value spent">${(budget.spent || 0).toFixed(2)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="amount-label">Remaining</span>
                    <span 
                      className="amount-value"
                      style={{ color: remaining >= 0 ? '#4CAF50' : '#f44336' }}
                    >
                      ${remaining.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="budget-progress">
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill"
                      style={{ 
                        width: `${percentage}%`,
                        background: getProgressColor(percentage)
                      }}
                    />
                  </div>
                  <div className="progress-text">
                    <span>{percentage.toFixed(0)}% used</span>
                    {percentage >= 100 && (
                      <span className="over-budget">Over budget!</span>
                    )}
                  </div>
                </div>

                <div className="budget-actions">
                  <button className="btn-text">✏️ Edit</button>
                  <button className="btn-text">🗑️ Delete</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* History View */}
      <div className="card history-card">
        <h2>Budget History</h2>
        <div className="history-table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Category</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => {
                const percentage = ((budget.spent || 0) / budget.amount) * 100;
                const categoryName = typeof budget.categoryId === 'object' ? budget.categoryId.name : '';
                
                return (
                  <tr key={budget._id}>
                    <td>
                      {new Date(budget.startDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td>{categoryName}</td>
                    <td>${budget.amount.toFixed(2)}</td>
                    <td>${(budget.spent || 0).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${
                        percentage >= 100 ? 'over' : 
                        percentage >= 90 ? 'warning' : 
                        'good'
                      }`}>
                        {percentage >= 100 ? 'Over Budget' : 
                         percentage >= 90 ? 'Near Limit' : 
                         'On Track'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetsPage;
