# Room Rent Website - Backend

Express.js backend server for the Room Rent Website application. Handles user authentication, property listings management, and admin controls.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Directory Structure](#directory-structure)
- [API Routes](#api-routes)
- [Database Models](#database-models)
- [Middleware](#middleware)
- [Services](#services)
- [Error Handling](#error-handling)
- [Running the Server](#running-the-server)

## 🎯 Overview

This backend service provides:
- User authentication and authorization
- Room/Property listing management
- Admin dashboard functionality
- File upload and cloud storage integration
- Email verification and notifications
- JWT-based secure authentication

## 🛠 Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| express | 5.1.0 | Web framework |
| mongoose | 8.19.2 | MongoDB ODM |
| jsonwebtoken | 9.0.2 | JWT authentication |
| bcrypt | 6.0.0 | Password hashing |
| multer | 2.0.2 | File upload handling |
| cloudinary | 2.8.0 | Cloud image storage |
| imagekit | 6.0.0 | Alternative image service |
| joi | 18.0.1 | Data validation |
| nodemailer | 7.0.10 | Email service |
| cors | 2.8.5 | Cross-origin requests |
| cookie-parser | 1.4.7 | Cookie handling |
| dotenv | 17.2.3 | Environment variables |
| uuid | 13.0.0 | Unique ID generation |
| nodemon | 3.1.11 | Development auto-reload |

## 📦 Installation

1. **Clone and navigate to backend**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   # Database
   MONGOOS_URL=mongodb+srv://username:password@cluster.mongodb.net/roomrent
   
   # Authentication
   JWT_SECRET=your_super_secret_jwt_key_change_this
   
   # Cloudinary (Image Storage)
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # ImageKit (Alternative Image Service)
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-endpoint
   
   # Email Service
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_specific_password
   
   # Server
   PORT=8080
   ```

## 🗂 Directory Structure

```
Backend/
├── src/
│   ├── app.js                      # Express app configuration
│   ├── Controller/
│   │   ├── admin.controller.js      # Admin operations
│   │   ├── AuthUser.controller.js   # User authentication
│   │   └── listing.controller.js    # Listing CRUD operations
│   ├── db/
│   │   └── db.js                   # MongoDB connection
│   ├── Middleware/
│   │   ├── AuthUser.middleware.js   # JWT verification
│   │   ├── upload.middleware.js     # File upload handling
│   │   └── verifyAdmin.middleware.js # Admin authorization
│   ├── Models/
│   │   ├── user.model.js           # User schema
│   │   └── listing.model.js        # Listing schema
│   ├── Router/
│   │   ├── Admin.route.js          # Admin routes
│   │   ├── AuthUser.route.js       # Auth routes
│   │   └── Listing.route.js        # Listing routes
│   └── services/
│       └── storage.service.js      # Cloud storage utilities
├── package.json
├── server.js                       # Server entry point
└── redmi.txt                       # Project notes
```

## 🛣 API Routes

### Base URL
```
http://localhost:8080/api/v1
```

### Authentication Routes (`/user`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | User login | ❌ |
| POST | `/verify-email` | Verify email with code | ❌ |
| GET | `/profile` | Get user profile | ✅ |
| POST | `/logout` | Logout user | ✅ |

### Listing Routes (`/listing`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all listings | ❌ |
| GET | `/:id` | Get specific listing | ❌ |
| POST | `/` | Create new listing | ✅ |
| PUT | `/:id` | Update listing | ✅ |
| DELETE | `/:id` | Delete listing | ✅ |
| GET | `/user/:userId` | Get user's listings | ❌ |

### Admin Routes (`/admin`)
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|-----------|
| GET | `/users` | Get all users | ✅ | ✅ |
| GET | `/listings` | Get all listings | ✅ | ✅ |
| PUT | `/users/:userId` | Update user | ✅ | ✅ |
| PUT | `/listings/:listingId` | Update listing | ✅ | ✅ |
| DELETE | `/listings/:listingId` | Delete listing | ✅ | ✅ |
| DELETE | `/users/:userId` | Delete user | ✅ | ✅ |

## 📊 Database Models

### User Model (`models/user.model.js`)

```javascript
{
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: Number,
  password: {
    type: String,
    required: true
    // Note: Hashed with bcrypt
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Listing Model (`models/listing.model.js`)

```javascript
{
  title: {
    type: String,
    required: true
  },
  description: String,
  image: [{
    url: String,
    filename: String
  }],
  price: Number,
  location: String,
  country: String,
  gender: {
    type: String,
    enum: ["Boys", "Girls", "Co-Living"]
  },
  phoneNumber: Number,
  amenities: {
    type: [String],
    default: []
  },
  roomType: {
    type: String,
    enum: ['Single Room', 'Double Room', 'Full House']
  },
  reviews: [{
    type: ObjectId,
    ref: "Review"
  }],
  owner: {
    type: ObjectId,
    ref: "User"
  }
}
```

## 🔐 Middleware

### AuthUser Middleware (`Middleware/AuthUser.middleware.js`)
- Verifies JWT tokens from request headers or cookies
- Extracts user information and attaches to request object
- Protects routes that require authentication

### Upload Middleware (`Middleware/upload.middleware.js`)
- Handles file uploads using Multer
- Validates file types and sizes
- Processes single or multiple file uploads
- Integrates with cloud storage services

### Admin Verification Middleware (`Middleware/verifyAdmin.middleware.js`)
- Checks if authenticated user has admin role
- Restricts admin-only endpoints
- Returns 403 Forbidden for non-admin users

## 🔧 Services

### Storage Service (`services/storage.service.js`)
Handles file upload and storage operations:
- Upload to Cloudinary
- Upload to ImageKit
- File validation
- Storage optimization
- Error handling

## ⚙️ Configuration

### Express Setup (`src/app.js`)
```javascript
- CORS: Enabled for http://localhost:5173
- Credentials: Allowed for cross-origin requests
- Body Parser: JSON request parsing
- Cookie Parser: Cookie handling
- Routes: Mounted on /api/v1 prefix
```

### MongoDB Connection (`src/db/db.js`)
- Connects via Mongoose to MongoDB
- Handles connection errors gracefully
- Console logging for connection status

## 🚀 Running the Server

### Development Mode
```bash
npm start
```
Uses Nodemon for automatic restart on file changes.

### Server Output
```
MongoDB is connected
Server is running on port 8080
```

### Available at
```
http://localhost:8080
```

### Health Check
```bash
curl http://localhost:8080/
# Response: "Hello World"
```

## 📝 Environment Variables Reference

| Variable | Type | Required | Example |
|----------|------|----------|---------|
| MONGOOS_URL | String | ✅ | mongodb+srv://user:pass@cluster.mongodb.net/db |
| JWT_SECRET | String | ✅ | your-secret-key-here |
| CLOUDINARY_NAME | String | ✅ | cloudinary-account |
| CLOUDINARY_API_KEY | String | ✅ | api-key |
| CLOUDINARY_API_SECRET | String | ✅ | api-secret |
| IMAGEKIT_PUBLIC_KEY | String | ⚠️ | public-key |
| IMAGEKIT_PRIVATE_KEY | String | ⚠️ | private-key |
| IMAGEKIT_URL_ENDPOINT | String | ⚠️ | https://ik.imagekit.io/endpoint |
| SMTP_USER | String | ⚠️ | email@gmail.com |
| SMTP_PASS | String | ⚠️ | app-password |

**✅ = Required | ⚠️ = Optional (if using that service)**

## 🔍 Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🔒 Security Best Practices

1. **Password Security**
   - All passwords hashed with bcrypt
   - Salt rounds: 10

2. **Authentication**
   - JWT tokens with expiration
   - Secure cookie storage
   - Token verification on protected routes

3. **Authorization**
   - Role-based access control
   - Admin-only endpoint protection
   - Owner verification for resource updates

4. **Data Validation**
   - Joi schema validation
   - Input sanitization
   - File type and size restrictions

5. **CORS Security**
   - Restricted to frontend URL
   - Credentials enabled for secure requests

## 📧 Email Service

Uses Nodemailer for:
- Email verification codes
- Account notifications
- Password reset (if implemented)
- Contact form responses

Configure with Gmail App Password or other SMTP service.

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify `MONGOOS_URL` is correct
- Check MongoDB is running/accessible
- Ensure IP whitelist includes your machine

### Image Upload Failures
- Verify Cloudinary/ImageKit credentials
- Check file size limits
- Ensure proper file types

### JWT Errors
- Check `JWT_SECRET` is set
- Verify token not expired
- Ensure token format is correct

## 📚 Related Files

- Frontend: See `../Frontend/README.md`
- Main Project: See `../README.md`

---

**Last Updated**: December 2025
