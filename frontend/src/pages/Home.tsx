import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      <div className="hero">
        <h1>💰 InsightLedger</h1>
        <p className="tagline">Your Personal Finance & Budgeting Platform</p>
        <p className="description">
          Take control of your finances with AI-powered insights, 
          smart budgeting tools, and comprehensive expense tracking.
        </p>
        
        {!isAuthenticated ? (
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary btn-large">
              Login
            </Link>
          </div>
        ) : (
          <div className="cta-buttons">
            <Link to="/dashboard" className="btn btn-primary btn-large">
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>

      <div className="features">
        <div className="feature">
          <div className="feature-icon">📊</div>
          <h3>Smart Analytics</h3>
          <p>Get detailed insights into your spending patterns with visual charts and reports.</p>
        </div>

        <div className="feature">
          <div className="feature-icon">🎯</div>
          <h3>Budget Management</h3>
          <p>Set and track budgets for different categories to stay on top of your finances.</p>
        </div>

        <div className="feature">
          <div className="feature-icon">🤖</div>
          <h3>AI Insights</h3>
          <p>Receive personalized recommendations based on your financial behavior.</p>
        </div>

        <div className="feature">
          <div className="feature-icon">🔒</div>
          <h3>Secure & Private</h3>
          <p>Your financial data is encrypted and protected with industry-standard security.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
