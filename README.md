# 💰 InsightLedger

**A Personal Finance and Budgeting Platform**

InsightLedger is a full-stack MERN (MongoDB, Express, React, Node.js) application designed to help users manage their personal finances with intelligent insights, budgeting tools, and comprehensive expense tracking.

## 🌟 Features

- **Authentication & Authorization**: Secure JWT-based authentication with role-based access control (RBAC)
- **Transaction Management**: Track income and expenses with detailed categorization
- **Budget Tracking**: Set and monitor budgets by category with real-time spending updates
- **Category Management**: Organize transactions with customizable categories
- **AI-Powered Insights**: Get intelligent recommendations based on spending patterns
- **Analytics Dashboard**: Visualize financial data with charts and reports
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Security First**: Built with industry-standard security practices

## 🚀 Tech Stack

### Backend
- Node.js & Express.js
- TypeScript
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation
- helmet for security headers
- express-rate-limit for API protection

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Axios for API calls
- Recharts for data visualization
- Context API for state management
- Responsive CSS design

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/rasikasrimal/InsightLedger.git
cd InsightLedger
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and configure your MongoDB URI and JWT secret
```

Backend `.env` configuration:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/insightledger
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
```

Frontend `.env` configuration:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🏃 Running the Application

### Development Mode

**Backend:**
```bash
cd backend
npm run dev
```
The backend API will run on `http://localhost:5000`

**Frontend:**
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the build folder with your preferred static server
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get budget by ID
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/spending-by-category` - Get spending breakdown
- `GET /api/analytics/monthly-trends` - Get monthly income/expense trends
- `GET /api/analytics/insights` - Get AI-powered insights

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection
- Helmet.js security headers
- Secure HTTP headers

## 🎨 User Interface

The application features a modern, responsive design with:
- Clean and intuitive navigation
- Visual dashboard with key metrics
- Interactive charts and graphs
- Real-time budget tracking
- Color-coded transactions
- Mobile-friendly layout

## 📊 Data Models

### User
- Email, password, name
- Role (user, admin, premium)
- Timestamps

### Transaction
- Amount, description, date
- Type (income/expense)
- Category reference
- User reference

### Category
- Name, type, icon, color
- User reference

### Budget
- Amount, period (weekly/monthly/yearly)
- Start and end dates
- Category reference
- User reference

## 🤖 AI Insights

The platform provides intelligent insights including:
- Spending trend analysis
- Budget alerts and warnings
- Category-wise spending recommendations
- Month-over-month comparisons
- Personalized financial tips

## 🚧 Future Enhancements

- [ ] Receipt scanning and OCR
- [ ] Multi-currency support
- [ ] Recurring transactions
- [ ] Financial goals tracking
- [ ] Export to CSV/PDF
- [ ] Bank account integration
- [ ] Mobile app (React Native)
- [ ] Advanced AI predictions
- [ ] Collaborative budgets
- [ ] Bill reminders

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

Created as a demonstration of full-stack development competence with the MERN stack, featuring authentication, RBAC, and AI-powered insights.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by best practices in personal finance management
- Designed for scalability and maintainability

---

**Note**: This is a demonstration project showcasing full-stack development skills. For production use, ensure proper security audits and compliance with financial data regulations.