# Backend MVC Structure

This backend follows the **Model-View-Controller (MVC)** architectural pattern for better code organization, maintainability, and scalability.

## 📁 Directory Structure

```
backend/src/
├── config/              # Configuration files
│   └── database.js     # Database connection pool
├── models/             # Data layer (database queries)
│   └── UserModel.js    # User cache model
├── controllers/        # Request/Response handling
│   ├── authController.js
│   ├── dbController.js
│   └── healthController.js
├── services/           # Business logic layer
│   └── authService.js  # Authentication business logic
├── routes/             # Route definitions
│   ├── index.js        # Main routes file
│   └── authRoutes.js   # Authentication routes
├── middleware/         # Custom middleware
│   └── errorHandler.js # Error handling middleware
└── index.js            # Application entry point
```

## 🏗️ Architecture Layers

### 1. **Config** (`config/`)
- Contains configuration files
- Database connection setup
- Environment-specific settings

### 2. **Models** (`models/`)
- **Purpose**: Data access layer
- Handles all database queries
- Represents data structures
- Example: `UserModel.js` - handles user cache operations

### 3. **Services** (`services/`)
- **Purpose**: Business logic layer
- Contains application logic
- Independent of HTTP requests/responses
- Can be reused across different controllers
- Example: `authService.js` - handles authentication logic

### 4. **Controllers** (`controllers/`)
- **Purpose**: Request/Response handling
- Receives HTTP requests
- Calls appropriate services
- Formats and sends HTTP responses
- Example: `authController.js` - handles auth endpoints

### 5. **Routes** (`routes/`)
- **Purpose**: Route definitions
- Maps URLs to controllers
- Defines HTTP methods (GET, POST, etc.)
- Example: `authRoutes.js` - defines `/api/v1/auth/*` routes

### 6. **Middleware** (`middleware/`)
- **Purpose**: Request processing
- Error handling
- Authentication/Authorization
- Request validation
- Example: `errorHandler.js` - global error handler

## 🔄 Request Flow

```
Client Request
    ↓
Routes (routes/)
    ↓
Controllers (controllers/)
    ↓
Services (services/)
    ↓
Models (models/)
    ↓
Database
```

## 📝 Example: Login Flow

1. **Route** (`routes/authRoutes.js`): `POST /api/v1/auth/login`
2. **Controller** (`controllers/authController.js`): `login()` method
3. **Service** (`services/authService.js`): `login()` - business logic
4. **Model** (`models/UserModel.js`): `upsertUserCache()` - database operation
5. **Response**: Controller formats and sends response

## ✅ Benefits of MVC

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Maintainability**: Easy to locate and modify code
3. **Testability**: Each layer can be tested independently
4. **Scalability**: Easy to add new features
5. **Reusability**: Services can be reused across controllers
6. **Code Organization**: Clear structure for team collaboration

## 🚀 Adding New Features

To add a new feature (e.g., Products):

1. **Model**: Create `models/ProductModel.js` for database operations
2. **Service**: Create `services/productService.js` for business logic
3. **Controller**: Create `controllers/productController.js` for HTTP handling
4. **Routes**: Create `routes/productRoutes.js` and add to `routes/index.js`
5. **Update**: Add routes to main router in `routes/index.js`

## 📚 Best Practices

- **Models**: Only database queries, no business logic
- **Services**: Business logic only, no HTTP concerns
- **Controllers**: Thin layer, only request/response handling
- **Routes**: Only route definitions, no logic
- **Error Handling**: Use middleware for consistent error responses

