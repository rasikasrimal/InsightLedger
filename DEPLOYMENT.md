# InsightLedger Deployment Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- A domain name (for production)
- SSL certificate (for production)

## Local Development

### 1. Database Setup

Install and run MongoDB locally:
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
Download and install from https://www.mongodb.com/try/download/community
```

### 2. Environment Configuration

**Backend (.env):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/insightledger
JWT_SECRET=your-very-secure-random-string-change-this
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Run Development Servers

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

Access the application at `http://localhost:3000`

## Production Deployment

### Option 1: Heroku Deployment

#### Backend Deployment

1. Create a Heroku account and install Heroku CLI
2. Create a new Heroku app:
```bash
heroku create your-app-name-api
```

3. Add MongoDB addon:
```bash
heroku addons:create mongolab:sandbox
```

4. Set environment variables:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-very-secure-random-string
heroku config:set FRONTEND_URL=https://your-frontend-domain.com
```

5. Deploy:
```bash
cd backend
git init
heroku git:remote -a your-app-name-api
git add .
git commit -m "Deploy backend"
git push heroku main
```

#### Frontend Deployment

1. Update `.env.production`:
```env
REACT_APP_API_URL=https://your-app-name-api.herokuapp.com/api
```

2. Build and deploy to Netlify/Vercel:
```bash
cd frontend
npm run build
# Follow Netlify or Vercel deployment instructions
```

### Option 2: DigitalOcean/AWS Deployment

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Deploy Backend

```bash
# Clone repository
git clone https://github.com/rasikasrimal/InsightLedger.git
cd InsightLedger/backend

# Install dependencies
npm install

# Create .env file
nano .env
# Add production environment variables

# Build
npm run build

# Start with PM2
pm2 start dist/index.js --name insightledger-api
pm2 save
pm2 startup
```

#### 3. Deploy Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Build
npm run build

# Serve with nginx or pm2
pm2 serve build 3000 --spa --name insightledger-frontend
pm2 save
```

#### 4. Nginx Configuration

Create `/etc/nginx/sites-available/insightledger`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /path/to/InsightLedger/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/insightledger /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

### Option 3: Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: insightledger-mongo
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_DATABASE: insightledger

  backend:
    build: ./backend
    container_name: insightledger-api
    restart: always
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/insightledger
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    container_name: insightledger-frontend
    restart: always
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_URL=${API_URL}
    depends_on:
      - backend

volumes:
  mongo-data:
```

Backend `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

Frontend `Dockerfile`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Deploy:
```bash
docker-compose up -d
```

## Environment Variables Reference

### Backend
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (use strong random string)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend
- `REACT_APP_API_URL` - Backend API URL

## Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Enable HTTPS/SSL in production
- [ ] Set secure CORS origins
- [ ] Configure MongoDB authentication
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Implement logging and monitoring
- [ ] Set up database backups
- [ ] Review and test all endpoints

## Monitoring

### Health Check Endpoint
```
GET /api/health
```

### PM2 Monitoring
```bash
pm2 status
pm2 logs insightledger-api
pm2 logs insightledger-frontend
pm2 monit
```

### MongoDB Monitoring
```bash
mongo
> use insightledger
> db.stats()
> db.users.count()
> db.transactions.count()
```

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `sudo systemctl status mongod`
- Verify environment variables are set
- Check logs: `pm2 logs insightledger-api`
- Verify port 5000 is available: `sudo lsof -i :5000`

### Frontend build fails
- Clear cache: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (should be v14+)
- Verify API URL is correct in .env

### Database connection issues
- Verify MongoDB is running
- Check MONGODB_URI format
- Test connection: `mongo mongodb://localhost:27017/insightledger`

## Backup and Restore

### Backup MongoDB
```bash
mongodump --db insightledger --out /backup/$(date +%Y%m%d)
```

### Restore MongoDB
```bash
mongorestore --db insightledger /backup/20240101/insightledger
```

## Performance Optimization

1. Enable MongoDB indexes (already configured in models)
2. Use a CDN for frontend static assets
3. Enable gzip compression in nginx
4. Implement Redis caching for frequently accessed data
5. Use PM2 cluster mode for load balancing
6. Optimize React bundle size with code splitting

## Support

For issues and questions:
- GitHub Issues: https://github.com/rasikasrimal/InsightLedger/issues
- Documentation: See README.md

---

**Note**: Always test deployments in a staging environment before production deployment.
