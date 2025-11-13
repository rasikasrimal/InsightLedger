import React, { useEffect, useState } from 'react';
import { categoriesAPI } from '../api/categories';
import { Category } from '../types';
import './CategoriesPage.css';

const DEFAULT_ICONS = ['💰', '🏠', '🚗', '🍔', '💡', '🎬', '🏥', '📚', '👕', '✈️', '🎮', '💼'];
const DEFAULT_COLORS = [
  '#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0', '#00BCD4',
  '#FF9800', '#E91E63', '#3F51B5', '#009688', '#795548', '#607D8B'
];

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    icon: '💰',
    color: '#4CAF50'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory._id, formData);
      } else {
        await categoriesAPI.create(formData);
      }
      fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This cannot be undone.')) {
      try {
        await categoriesAPI.delete(id);
        fetchCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert('Failed to delete category. It may be in use by transactions.');
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon || '💰',
      color: category.color || '#4CAF50'
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      icon: '💰',
      color: '#4CAF50'
    });
    setEditingCategory(null);
    setShowCreateModal(false);
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Categories</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          ➕ Create Category
        </button>
      </div>

      {/* Default Categories Info */}
      <div className="card info-card">
        <p>
          📌 <strong>Tip:</strong> Organize your transactions with custom categories. 
          Use icons and colors to make them easily recognizable!
        </p>
      </div>

      {/* Income Categories */}
      <div className="card">
        <h2>💵 Income Categories ({incomeCategories.length})</h2>
        {incomeCategories.length === 0 ? (
          <p>No income categories yet. Create one to track your income sources!</p>
        ) : (
          <div className="categories-grid">
            {incomeCategories.map((category) => (
              <div key={category._id} className="category-card">
                <div className="category-card-header">
                  <div 
                    className="category-icon-large"
                    style={{ background: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div className="category-actions">
                    <button 
                      className="btn-icon" 
                      onClick={() => handleEdit(category)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-icon" 
                      onClick={() => handleDelete(category._id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="category-card-body">
                  <h3>{category.name}</h3>
                  <span className="category-type-badge income">
                    Income
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense Categories */}
      <div className="card">
        <h2>💸 Expense Categories ({expenseCategories.length})</h2>
        {expenseCategories.length === 0 ? (
          <p>No expense categories yet. Create one to track your expenses!</p>
        ) : (
          <div className="categories-grid">
            {expenseCategories.map((category) => (
              <div key={category._id} className="category-card">
                <div className="category-card-header">
                  <div 
                    className="category-icon-large"
                    style={{ background: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div className="category-actions">
                    <button 
                      className="btn-icon" 
                      onClick={() => handleEdit(category)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-icon" 
                      onClick={() => handleDelete(category._id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="category-card-body">
                  <h3>{category.name}</h3>
                  <span className="category-type-badge expense">
                    Expense
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Create New Category'}</h2>
              <button className="modal-close" onClick={resetForm}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Groceries, Salary, Rent"
                  required
                />
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div className="form-group">
                <label>Icon</label>
                <div className="icon-selector">
                  {DEFAULT_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, icon })}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-selector">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="color-picker"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
