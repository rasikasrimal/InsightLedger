import React, { useEffect, useState } from 'react';
import { categoriesAPI } from '../api/categories';
import { Category } from '../types';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div className="container">
      <h1>Categories</h1>
      <div className="card">
        {categories.length === 0 ? (
          <p>No categories yet. Create categories to organize your transactions!</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Name</th>
                <th>Type</th>
                <th>Color</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td style={{ fontSize: '24px' }}>{category.icon}</td>
                  <td>{category.name}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      background: category.type === 'income' ? '#d4edda' : '#f8d7da',
                      color: category.type === 'income' ? '#155724' : '#721c24'
                    }}>
                      {category.type}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '30px', 
                        height: '30px', 
                        background: category.color,
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }} />
                      {category.color}
                    </div>
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

export default CategoriesPage;
