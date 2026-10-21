# Dokan - Inventory Management System

A comprehensive Inventory Management System with integrated POS for local businesses in Bangladesh, built with Node.js and PostgreSQL.

## 🏗️ Architecture

- **Database**: PostgreSQL 16
- **Backend**: Node.js 20 with Express
- **Architecture**: Modular Monolith (can be migrated to microservices)
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- [Docker](https://www.docker.com/get-started) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)
- [Node.js](https://nodejs.org/) (version 18+) - for local development without Docker

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd dokan
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration (optional - defaults work for development).

### 3. Start with Docker Compose

```bash
# Start all services (PostgreSQL, Node.js app, pgAdmin)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

### 4. Verify Installation

```bash
# Check if containers are running
docker-compose ps

# Test database connection
docker-compose exec app node -e "require('./src/index.js')"

# Check health endpoint
curl http://localhost:3000/health
```

## 📦 Services

### PostgreSQL Database
- **Port**: `5432`
- **User**: `dokan_user` (default)
- **Password**: `dokan_password` (default)
- **Database**: `dokan_db` (default)
- **Connection**: `postgresql://dokan_user:dokan_password@localhost:5432/dokan_db`

### Node.js Application
- **Port**: `3000`
- **Health Check**: `http://localhost:3000/health`
- **API**: `http://localhost:3000/api/v1`

### pgAdmin (Database Management UI)
- **Port**: `5050`
- **URL**: `http://localhost:5050`
- **Email**: `admin@dokan.com` (default)
- **Password**: `admin` (default)

## 🔧 Development

### Running Locally (without Docker)

```bash
# Install dependencies
npm install

# Start PostgreSQL (using Docker)
docker-compose up -d postgres

# Run application
npm run dev
```

### Database Access

#### Using psql (Command Line)

```bash
# Connect to database
docker-compose exec postgres psql -U dokan_user -d dokan_db

# Or from host machine (if PostgreSQL client installed)
psql -h localhost -U dokan_user -d dokan_db
```

#### Using pgAdmin (Web UI)

1. Open `http://localhost:5050`
2. Login with credentials from `.env`
3. Add new server:
   - **Name**: Dokan Database
   - **Host**: `postgres` (or `localhost` if connecting from host)
   - **Port**: `5432`
   - **Username**: `dokan_user`
   - **Password**: `dokan_password`
   - **Database**: `dokan_db`

### Database Schema

The database schema is automatically initialized from:
- `docker/init-db.sql` - Initial setup
- `plan/schema.sql` - Main schema (Traditional Monolith)
- `plan/modular-monolith-schema.sql` - Modular Monolith schema (optional)

To use the modular monolith schema:

```bash
# Stop containers
docker-compose down

# Update docker-compose.yml to use modular-monolith-schema.sql
# Then restart
docker-compose up -d
```

## 📁 Project Structure

```
dokan/
├── docker/
│   └── init-db.sql          # Database initialization
├── plan/
│   ├── schema.sql           # Traditional monolith schema
│   ├── modular-monolith-schema.sql  # Modular monolith schema
│   └── ARCHITECTURE_COMPARISON.md   # Architecture guide
├── src/
│   └── index.js             # Main application entry
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .dockerignore            # Docker ignore file
├── .gitignore              # Git ignore file
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Node.js container definition
├── package.json            # Node.js dependencies
└── README.md               # This file
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start with nodemon (auto-reload)

# Production
npm start            # Start application

# Database
npm run db:migrate   # Run migrations (when implemented)
npm run db:seed      # Seed database (when implemented)
npm run db:reset     # Reset database (when implemented)

# Code Quality
npm run lint         # Run ESLint
```

## 🔐 Security Notes

⚠️ **Important**: The default credentials are for **development only**!

For production:
1. Change all default passwords in `.env`
2. Use strong, randomly generated secrets
3. Enable SSL for database connections
4. Use environment-specific configuration
5. Never commit `.env` file to version control

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# Linux/Mac
lsof -i :3000
lsof -i :5432

# Change ports in .env file
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Container Won't Start

```bash
# Rebuild containers
docker-compose build --no-cache

# Remove and recreate
docker-compose down -v
docker-compose up -d
```

### Permission Issues (Linux/Mac)

```bash
# Fix ownership
sudo chown -R $USER:$USER .

# Fix Docker permissions
sudo usermod -aG docker $USER
# Then logout and login again
```

## 📊 Database Management

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U dokan_user dokan_db > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U dokan_user dokan_db < backup.sql
```

### Reset Database

```bash
# Stop containers
docker-compose down

# Remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Use secure secrets management
2. **Database**: Use managed PostgreSQL service (AWS RDS, Azure Database, etc.)
3. **SSL/TLS**: Enable SSL for all connections
4. **Backups**: Set up automated database backups
5. **Monitoring**: Add application and database monitoring
6. **Scaling**: Use Docker Swarm or Kubernetes for orchestration

## 📝 API Endpoints

### Health Check
```
GET /health
```

### API Info
```
GET /api/v1
```

### Database Info
```
GET /api/v1/db/info
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Your License Here]

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact: [Your Contact Info]

## 🙏 Acknowledgments

Built for local businesses in Bangladesh 🇧🇩

---

**Happy Coding! 🚀**

