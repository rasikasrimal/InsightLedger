import React, { useEffect, useState } from 'react';
import { transactionsAPI } from '../api/transactions';
import { categoriesAPI } from '../api/categories';
import { Transaction, Category } from '../types';
import './TransactionsPage.css';

interface Filters {
  startDate: string;
  endDate: string;
  categoryId: string;
  type: string;
  minAmount: string;
  maxAmount: string;
  search: string;
}

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState<Filters>({
    startDate: '',
    endDate: '',
    categoryId: '',
    type: '',
    minAmount: '',
    maxAmount: '',
    search: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsData, categoriesData] = await Promise.all([
          transactionsAPI.getAll(),
          categoriesAPI.getAll()
        ]);
        setTransactions(transactionsData);
        setFilteredTransactions(transactionsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...transactions];

    if (filters.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate));
    }
    if (filters.categoryId) {
      filtered = filtered.filter(t => 
        (typeof t.categoryId === 'object' ? t.categoryId._id : t.categoryId) === filters.categoryId
      );
    }
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    if (filters.minAmount) {
      filtered = filtered.filter(t => t.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(t => t.amount <= parseFloat(filters.maxAmount));
    }
    if (filters.search) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [filters, transactions]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectTransaction = (id: string) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTransactions.size === paginatedTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(paginatedTransactions.map(t => t._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedTransactions.size} selected transactions?`)) {
      try {
        await Promise.all(
          Array.from(selectedTransactions).map(id => transactionsAPI.delete(id))
        );
        const updatedTransactions = transactions.filter(t => !selectedTransactions.has(t._id));
        setTransactions(updatedTransactions);
        setSelectedTransactions(new Set());
      } catch (error) {
        console.error('Failed to delete transactions:', error);
        alert('Failed to delete some transactions');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionsAPI.delete(id);
        setTransactions(transactions.filter(t => t._id !== id));
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        alert('Failed to delete transaction');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      typeof t.categoryId === 'object' ? t.categoryId.name : '',
      t.type,
      t.amount.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const text = filteredTransactions.map(t => 
      `${new Date(t.date).toLocaleDateString()} - ${t.description} - ${t.type} - $${t.amount.toFixed(2)}`
    ).join('\n');
    navigator.clipboard.writeText(text);
    alert('Transactions copied to clipboard!');
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      categoryId: '',
      type: '',
      minAmount: '',
      maxAmount: '',
      search: ''
    });
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  if (loading) {
    return <div className="loading">Loading transactions...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Transactions</h1>
        <button className="btn btn-primary" onClick={() => alert('Add Transaction form will be implemented')}>
          ➕ Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="form-group">
            <label>Min Amount</label>
            <input
              type="number"
              placeholder="0.00"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Max Amount</label>
            <input
              type="number"
              placeholder="0.00"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>
        <div className="filter-actions">
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
          <div className="filter-results">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTransactions.size > 0 && (
        <div className="bulk-actions-bar">
          <span>{selectedTransactions.size} selected</span>
          <button className="btn btn-danger" onClick={handleBulkDelete}>
            🗑️ Delete Selected
          </button>
        </div>
      )}

      {/* Export Options */}
      <div className="export-actions">
        <button className="btn btn-secondary" onClick={exportToCSV}>
          📥 Export CSV
        </button>
        <button className="btn btn-secondary" onClick={copyToClipboard}>
          📋 Copy to Clipboard
        </button>
      </div>

      {/* Transactions Table */}
      <div className="card">
        {filteredTransactions.length === 0 ? (
          <p>No transactions found. Try adjusting your filters or add a new transaction!</p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedTransactions.size === paginatedTransactions.length && paginatedTransactions.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedTransactions.has(transaction._id)}
                        onChange={() => handleSelectTransaction(transaction._id)}
                      />
                    </td>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{transaction.description}</td>
                    <td>
                      {typeof transaction.categoryId === 'object' ? (
                        <span>
                          {transaction.categoryId.icon} {transaction.categoryId.name}
                        </span>
                      ) : ''}
                    </td>
                    <td>
                      <span className={`badge badge-${transaction.type}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td style={{ 
                      color: transaction.type === 'income' ? '#4CAF50' : '#f44336',
                      fontWeight: 'bold'
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </td>
                    <td>
                      <button 
                        className="btn-icon" 
                        onClick={() => alert('Edit Transaction form will be implemented')}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleDelete(transaction._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
