# Pawmate Connect - Deployment Guide

## 🚀 Local Development with Docker

### Prerequisites
- Docker & Docker Compose installed
- Node.js 20+ (for local development without Docker)

### Quick Start

1. **Clone & Setup Environment**
```bash
cp .env.example .env
# Edit .env with your values (especially COOKIE_SECRET and DB_PASSWORD)
```

2. **Build & Run Locally**
```bash
docker-compose up --build
```

The app will be available at:
- Frontend: http://localhost:8080
- API: http://localhost:3000/api
- Database: localhost:5432

3. **Stop Services**
```bash
docker-compose down
```

---

## 🌐 Deploy to Production (Railway.app)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project

### Step 2: Add PostgreSQL
1. In Railway dashboard: Click "+ New Service"
2. Select "Database" → "PostgreSQL"
3. Copy DATABASE_URL from variables

### Step 3: Deploy API Server
1. Click "+ New Service" → "GitHub Repo"
2. Select your Pawmate Connect repo
3. Set as root directory: `artifacts/api-server/`
4. Add environment variables:
   ```
   NODE_ENV=production
   COOKIE_SECRET=<generate-random-string>
   FRONTEND_ORIGIN=https://your-domain.railway.app
   DATABASE_URL=<from-postgres-service>
   PORT=3000
   ```
5. Deploy!

### Step 4: Deploy Frontend
1. Click "+ New Service" → "GitHub Repo"
2. Select Pawmate Connect repo
3. Set root directory: `artifacts/pawmate/`
4. Add environment variables:
   ```
   VITE_API_URL=https://api-your-domain.railway.app/api
   ```
5. Set custom domain (if desired)
6. Deploy!

### Step 5: Update CORS
After deployment, update API's `FRONTEND_ORIGIN` to match your frontend domain.

---

## 📋 Environment Variables Reference

### API Server
```env
NODE_ENV=production          # Environment
DATABASE_URL=postgresql://...  # DB connection string
COOKIE_SECRET=your-secret    # Session cookie encryption
FRONTEND_ORIGIN=http://...   # CORS origin
PORT=3000                    # Server port
```

### Frontend
```env
VITE_API_URL=http://localhost:3000/api  # API endpoint
```

---

## 🧪 Testing Deployment

### Health Check
```bash
curl http://localhost:3000/api/health
# Response: { "status": "ok" }
```

### Test Full Flow
1. Sign up at http://localhost:8080
2. Go to "+ Event" and create test event
3. View in Community page
4. Check API logs: `docker-compose logs api`

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check if postgres is running
docker-compose ps

# View postgres logs
docker-compose logs postgres
```

### Port Already in Use
```bash
# Use different ports in docker-compose.yml
# Or kill existing process
lsof -i :3000  # Find what's using port 3000
kill -9 <PID>
```

### Build Fails
```bash
# Clear Docker cache and rebuild
docker-compose down
docker system prune -a
docker-compose up --build
```

---

## 📚 Docker Commands

```bash
# View logs
docker-compose logs api
docker-compose logs postgres
docker-compose logs -f web    # Follow logs

# Access database
docker-compose exec postgres psql -U pawmate -d pawmate

# Rebuild specific service
docker-compose up --build api

# Remove all containers & data
docker-compose down -v
```

---

## ✅ Production Checklist

- [ ] Set strong `COOKIE_SECRET` (generate with `openssl rand -hex 32`)
- [ ] Set `FRONTEND_ORIGIN` to production domain
- [ ] Use strong `DB_PASSWORD`
- [ ] Enable HTTPS in Railway (automatic)
- [ ] Set up monitoring/logging
- [ ] Run database migrations (if any)
- [ ] Test full auth flow
- [ ] Set up backups for PostgreSQL

---

## 🚀 Next Steps After Deployment

1. **Image Upload** - Set up Cloudinary/S3 for image handling
2. **Monitoring** - Add error tracking (Sentry)
3. **Performance** - Set up caching & CDN
4. **Scaling** - Configure auto-scaling in Railway
