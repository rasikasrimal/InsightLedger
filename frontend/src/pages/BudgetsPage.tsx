import React, { useEffect, useState } from 'react';
import { budgetsAPI } from '../api/budgets';
import { Budget } from '../types';

const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const data = await budgetsAPI.getAll({ active: true });
        setBudgets(data);
      } catch (error) {
        console.error('Failed to fetch budgets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  if (loading) {
    return <div className="loading">Loading budgets...</div>;
  }

  return (
    <div className="container">
      <h1>Budgets</h1>
      <div className="card">
        {budgets.length === 0 ? (
          <p>No budgets set. Create a budget to track your spending!</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Period</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => {
                const percentage = ((budget.spent || 0) / budget.amount) * 100;
                return (
                  <tr key={budget._id}>
                    <td>{typeof budget.categoryId === 'object' ? budget.categoryId.name : ''}</td>
                    <td>{budget.period}</td>
                    <td>${budget.amount.toFixed(2)}</td>
                    <td>${(budget.spent || 0).toFixed(2)}</td>
                    <td style={{ color: (budget.remaining || 0) >= 0 ? '#4CAF50' : '#f44336' }}>
                      ${(budget.remaining || 0).toFixed(2)}
                    </td>
                    <td>
                      <div style={{ 
                        width: '100px', 
                        height: '20px', 
                        background: '#e0e0e0', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${Math.min(percentage, 100)}%`, 
                          height: '100%', 
                          background: percentage > 90 ? '#f44336' : percentage > 75 ? '#ff9800' : '#4CAF50',
                          transition: 'width 0.3s'
                        }} />
                      </div>
                      {percentage.toFixed(0)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BudgetsPage;
