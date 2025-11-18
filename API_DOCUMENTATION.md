# InsightLedger API Documentation

Base URL: `http://localhost:5000/api` (development)

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## Endpoints

### Authentication

#### Register User
- **POST** `/auth/register`
- **Public**

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

Response (201):
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### Login
- **POST** `/auth/login`
- **Public**

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Transactions

#### Get All Transactions
- **GET** `/transactions`
- **Protected**

Query Parameters:
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `type` (optional): "income" or "expense"
- `categoryId` (optional): Category ID

Response (200):
```json
[
  {
    "_id": "transaction_id",
    "userId": "user_id",
    "categoryId": {
      "_id": "category_id",
      "name": "Groceries",
      "type": "expense",
      "icon": "🛒",
      "color": "#4CAF50"
    },
    "type": "expense",
    "amount": 150.50,
    "description": "Weekly groceries",
    "date": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Get Transaction by ID
- **GET** `/transactions/:id`
- **Protected**

Response (200): Single transaction object

#### Create Transaction
- **POST** `/transactions`
- **Protected**

Request Body:
```json
{
  "categoryId": "category_id",
  "type": "expense",
  "amount": 150.50,
  "description": "Weekly groceries",
  "date": "2024-01-15T10:30:00.000Z"
}
```

Response (201): Created transaction object

#### Update Transaction
- **PUT** `/transactions/:id`
- **Protected**

Request Body:
```json
{
  "categoryId": "category_id",
  "type": "expense",
  "amount": 175.00,
  "description": "Updated groceries",
  "date": "2024-01-15T10:30:00.000Z"
}
```

Response (200): Updated transaction object

#### Delete Transaction
- **DELETE** `/transactions/:id`
- **Protected**

Response (200):
```json
{
  "message": "Transaction deleted successfully"
}
```

### Categories

#### Get All Categories
- **GET** `/categories`
- **Protected**

Query Parameters:
- `type` (optional): "income" or "expense"

Response (200):
```json
[
  {
    "_id": "category_id",
    "name": "Groceries",
    "type": "expense",
    "icon": "🛒",
    "color": "#4CAF50",
    "userId": "user_id",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Get Category by ID
- **GET** `/categories/:id`
- **Protected**

Response (200): Single category object

#### Create Category
- **POST** `/categories`
- **Protected**

Request Body:
```json
{
  "name": "Groceries",
  "type": "expense",
  "icon": "🛒",
  "color": "#4CAF50"
}
```

Response (201): Created category object

#### Update Category
- **PUT** `/categories/:id`
- **Protected**

Request Body:
```json
{
  "name": "Updated Groceries",
  "type": "expense",
  "icon": "🛍️",
  "color": "#FF5722"
}
```

Response (200): Updated category object

#### Delete Category
- **DELETE** `/categories/:id`
- **Protected**

Response (200):
```json
{
  "message": "Category deleted successfully"
}
```

### Budgets

#### Get All Budgets
- **GET** `/budgets`
- **Protected**

Query Parameters:
- `period` (optional): "weekly", "monthly", or "yearly"
- `active` (optional): "true" to get only active budgets

Response (200):
```json
[
  {
    "_id": "budget_id",
    "userId": "user_id",
    "categoryId": {
      "_id": "category_id",
      "name": "Groceries",
      "type": "expense"
    },
    "amount": 500.00,
    "period": "monthly",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.000Z",
    "spent": 350.75,
    "remaining": 149.25,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get Budget by ID
- **GET** `/budgets/:id`
- **Protected**

Response (200): Single budget object with spending details

#### Create Budget
- **POST** `/budgets`
- **Protected**

Request Body:
```json
{
  "categoryId": "category_id",
  "amount": 500.00,
  "period": "monthly",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.000Z"
}
```

Response (201): Created budget object

#### Update Budget
- **PUT** `/budgets/:id`
- **Protected**

Request Body:
```json
{
  "categoryId": "category_id",
  "amount": 600.00,
  "period": "monthly",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.000Z"
}
```

Response (200): Updated budget object

#### Delete Budget
- **DELETE** `/budgets/:id`
- **Protected**

Response (200):
```json
{
  "message": "Budget deleted successfully"
}
```

### Analytics

#### Get Dashboard Stats
- **GET** `/analytics/dashboard`
- **Protected**

Response (200):
```json
{
  "period": "monthly",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.000Z",
  "totalIncome": 5000.00,
  "totalExpenses": 3250.75,
  "balance": 1749.25,
  "transactionCount": 45
}
```

#### Get Spending by Category
- **GET** `/analytics/spending-by-category`
- **Protected**

Query Parameters:
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

Response (200):
```json
[
  {
    "categoryId": "category_id",
    "categoryName": "Groceries",
    "categoryIcon": "🛒",
    "categoryColor": "#4CAF50",
    "total": 850.50,
    "count": 12
  }
]
```

#### Get Monthly Trends
- **GET** `/analytics/monthly-trends`
- **Protected**

Query Parameters:
- `months` (optional): Number of months to include (default: 6)

Response (200):
```json
[
  {
    "month": "2024-01",
    "income": 5000.00,
    "expenses": 3250.75
  },
  {
    "month": "2024-02",
    "income": 5200.00,
    "expenses": 3100.50
  }
]
```

#### Get AI Insights
- **GET** `/analytics/insights`
- **Protected**

Response (200):
```json
{
  "insights": [
    {
      "type": "warning",
      "title": "Spending Alert",
      "message": "Your spending is up 15.2% compared to last month. Consider reviewing your expenses."
    },
    {
      "type": "info",
      "title": "Top Spending Category",
      "message": "You spent $850.50 on Groceries this month."
    },
    {
      "type": "success",
      "title": "Budget On Track",
      "message": "You're within 75% of your monthly budget for Entertainment."
    }
  ]
}
```

#### Ask AI
- **POST** `/analytics/ask`
- **Protected**

Request Body:
```json
{
  "question": "Where did I overspend this month?"
}
```

Response (200):
```json
{
  "answer": "Based on your financial data, you overspent primarily in the Dining category ($450) and Transport ($230) this month. These two categories combined account for 65% of your overspending compared to typical patterns."
}
```

#### Get Suggestion Prompts
- **POST** `/analytics/suggestions`
- **Protected**

Request Body:
```json
{
  "recentMessages": [
    {
      "role": "user",
      "content": "Where did I overspend?"
    },
    {
      "role": "model",
      "content": "You overspent in Dining and Transport categories."
    }
  ]
}
```

Response (200):
```json
{
  "suggestions": [
    "How can I redirect dining savings toward my emergency fund?",
    "What spending patterns am I not noticing in my transport category?",
    "Is my current surplus enough for long-term wealth building?",
    "Which expenses could I reduce without impacting my lifestyle?"
  ]
}
```

Note: Suggestions are AI-generated, context-aware prompts (3-6 items, max 80 characters each) based on:
- User's recent chat messages
- Current month financial data (income, expenses, budgets)
- Personal finance principles (cashflow, savings, long-term thinking)

### Health Check

#### Get API Health Status
- **GET** `/health`
- **Public**

Response (200):
```json
{
  "status": "ok",
  "message": "InsightLedger API is running"
}
```

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting:
- 100 requests per 15 minutes per IP address
- Applies to all `/api/*` endpoints

When rate limit is exceeded:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## Data Validation

All endpoints validate input data:

### Email
- Must be a valid email format
- Converted to lowercase
- Trimmed of whitespace

### Password
- Minimum 6 characters
- Hashed using bcryptjs

### Amount
- Must be a positive number
- Minimum value: 0.01

### Dates
- Must be valid ISO 8601 format
- Example: "2024-01-15T10:30:00.000Z"

### Category Type
- Must be "income" or "expense"

### Budget Period
- Must be "weekly", "monthly", or "yearly"

## Examples

### cURL Examples

Register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

Create Transaction:
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "categoryId": "category_id",
    "type": "expense",
    "amount": 150.50,
    "description": "Weekly groceries"
  }'
```

### JavaScript/Axios Examples

```javascript
// Register
const registerUser = async () => {
  try {
    const response = await axios.post('/api/auth/register', {
      email: 'user@example.com',
      password: 'password123',
      name: 'John Doe'
    });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Registration failed:', error.response.data);
  }
};

// Create Transaction
const createTransaction = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('/api/transactions', {
      categoryId: 'category_id',
      type: 'expense',
      amount: 150.50,
      description: 'Weekly groceries'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Transaction created:', response.data);
  } catch (error) {
    console.error('Failed to create transaction:', error.response.data);
  }
};
```

## Best Practices

1. **Always use HTTPS in production**
2. **Store JWT tokens securely** (HttpOnly cookies or secure storage)
3. **Validate data on client side** before sending to API
4. **Handle errors gracefully** with user-friendly messages
5. **Implement request retries** for network failures
6. **Use pagination** for large datasets (to be implemented)
7. **Cache responses** where appropriate
8. **Log errors** for debugging and monitoring

## Support

For API issues or questions:
- GitHub Issues: https://github.com/rasikasrimal/InsightLedger/issues
- Documentation: See README.md
