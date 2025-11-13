import React, { useEffect, useState } from 'react';
import { transactionsAPI } from '../api/transactions';
import { Transaction } from '../types';

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await transactionsAPI.getAll();
        setTransactions(data);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return <div className="loading">Loading transactions...</div>;
  }

  return (
    <div className="container">
      <h1>Transactions</h1>
      <div className="card">
        {transactions.length === 0 ? (
          <p>No transactions yet. Start by adding your first transaction!</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>{transaction.description}</td>
                  <td>{typeof transaction.categoryId === 'object' ? transaction.categoryId.name : ''}</td>
                  <td>{transaction.type}</td>
                  <td style={{ color: transaction.type === 'income' ? '#4CAF50' : '#f44336' }}>
                    ${transaction.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
