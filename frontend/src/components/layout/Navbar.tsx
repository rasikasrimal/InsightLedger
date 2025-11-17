import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          💰 InsightLedger
        </Link>
        
        {isAuthenticated ? (
          <>
            <ul className="navbar-menu">
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/transactions">Transactions</Link></li>
              <li><Link to="/budgets">Budgets</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/analytics">Analytics</Link></li>
              <li><Link to="/ai-chat">AI Chat</Link></li>
            </ul>
            <div className="navbar-user">
              <span>Hi, {user?.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="navbar-auth">
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
