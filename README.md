# Room Rent Website

A full-stack web application for listing and searching room rental properties. Users can browse available rooms, post their own properties, and administrators can manage listings and users.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Contributing](#contributing)

## 🎯 Project Overview

This is a **full-stack room rental platform** built with the MERN stack (MongoDB, Express, React, Node.js). The application enables:

- **Users**: Register, login, browse room listings, add new properties, and contact landlords
- **Admins**: Manage users, moderate listings, and oversee platform activities
- **Property Owners**: List their rooms/properties with images, amenities, pricing, and availability

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB with Mongoose ODM v8.19.2
- **Authentication**: JSON Web Tokens (JWT) v9.0.2
- **Password Hashing**: bcrypt v6.0.0
- **File Upload**: Multer v2.0.2, Cloudinary v2.8.0, ImageKit v6.0.0
- **Validation**: Joi v18.0.1
- **Email**: Nodemailer v7.0.10
- **Environment**: dotenv v17.2.3
- **CORS**: Express CORS middleware
- **Dev Tool**: Nodemon v3.1.11

### Frontend
- **Library**: React v19.1.1
- **Build Tool**: Vite v7.1.7
- **Routing**: React Router DOM v7.9.4
- **HTTP Client**: Axios v1.13.1
- **Maps**: Leaflet v1.9.4 with React-Leaflet v5.0.0
- **Icons**: Lucide React v0.546.0
- **Linting**: ESLint v9.36.0

## 📁 Project Structure

```
Room Rent Website/
├── Backend/
│   ├── package.json
│   ├── server.js                 # Entry point
│   ├── redmi.txt                 # Project notes
│   └── src/
│       ├── app.js                # Express app setup
│       ├── Controller/            # Request handlers
│       │   ├── admin.controller.js
│       │   ├── AuthUser.controller.js
│       │   └── listing.controller.js
│       ├── db/
│       │   └── db.js              # MongoDB connection
│       ├── Middleware/
│       │   ├── AuthUser.middleware.js
│       │   ├── upload.middleware.js
│       │   └── verifyAdmin.middleware.js
│       ├── Models/
│       │   ├── user.model.js
│       │   └── listing.model.js
│       ├── Router/
│       │   ├── Admin.route.js
│       │   ├── AuthUser.route.js
│       │   └── Listing.route.js
│       └── services/
│           └── storage.service.js # Cloud storage handling
│
└── Frontend/
    ├── package.json
    ├── vite.config.js
    ├── eslint.config.js
    ├── index.html
    ├── README.md
    ├── public/
    └── src/
        ├── main.jsx               # Entry point
        ├── App.jsx
        ├── App.css
        ├── index.css
        ├── assets/
        ├── components/
        │   ├── Header/
        │   │   ├── Navbar.jsx
        │   │   └── Navbar.css
        │   ├── HeroSection/
        │   │   ├── HeroSection.jsx
        │   │   └── HeroSection.css
        │   ├── Footer/
        │   │   ├── Footer.jsx
        │   │   └── Footer.css
        │   └── Css/
        │       ├── Choose.css
        │       └── Pg.css
        ├── page/
        │   ├── Choose.jsx
        │   ├── Pg.jsx
        │   ├── Contact/
        │   │   ├── Contact.jsx
        │   │   └── Contact.css
        │   ├── Register/
        │   │   ├── Login.jsx
        │   │   ├── Login.css
        │   │   ├── Register.jsx
        │   │   └── Register.css
        │   ├── Listing/
        │   │   ├── Listing.jsx
        │   │   └── Listing.css
        │   ├── SingleListing/
        │   │   ├── DetailedListing.jsx
        │   │   └── DetailedListing.css
        │   ├── Addpg/
        │   │   ├── AddYourProperty.jsx
        │   │   └── AddProperty.css
        │   └── Admin/
        │       ├── AdminDashboard.jsx
        │       ├── AdminDashboard.css
        │       └── AdminPages/
        │           ├── AdminListing.jsx
        │           ├── AdminListing.css
        │           └── AdminUser.jsx
        └── Router/
            └── Router.jsx
```

## ✨ Features

### User Features
- ✅ User registration and login with email verification
- ✅ Browse all available room listings
- ✅ Filter listings by location, price, room type, and amenities
- ✅ View detailed property information with images
- ✅ Post new properties with multiple images
- ✅ Manage own listings (create, update, delete)
- ✅ Contact landlords directly
- ✅ Responsive design for mobile and desktop

### Admin Features
- ✅ Comprehensive admin dashboard
- ✅ View and manage all listings
- ✅ Manage user accounts
- ✅ Approve/reject property listings
- ✅ System overview and analytics

### Technical Features
- ✅ JWT-based authentication with secure cookies
- ✅ Role-based access control (User/Admin)
- ✅ Multi-image upload with cloud storage (Cloudinary/ImageKit)
- ✅ Email verification for new accounts
- ✅ Map integration for location visualization
- ✅ Password hashing with bcrypt
- ✅ Form validation (Joi on backend, client-side on frontend)
- ✅ CORS enabled for secure cross-origin requests

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Cloudinary or ImageKit account (for image uploads)

### Backend Setup

1. **Navigate to Backend folder**
   ```bash
   cd "Backend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the Backend directory
   ```
   MONGOOS_URL=mongodb+srv://username:password@cluster.mongodb.net/roomrent
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_url
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:8080`

### Frontend Setup

1. **Navigate to Frontend folder**
   ```bash
   cd "Frontend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the Frontend directory (if needed)
   ```
   VITE_API_URL=http://localhost:8080
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## 🔑 Environment Variables

### Backend (.env)
```
MONGOOS_URL           - MongoDB connection string
JWT_SECRET            - Secret key for JWT tokens
CLOUDINARY_NAME       - Cloudinary account name
CLOUDINARY_API_KEY    - Cloudinary API key
CLOUDINARY_API_SECRET - Cloudinary API secret
IMAGEKIT_PUBLIC_KEY   - ImageKit public key
IMAGEKIT_PRIVATE_KEY  - ImageKit private key
IMAGEKIT_URL_ENDPOINT - ImageKit URL endpoint
SMTP_USER             - Email for sending notifications
SMTP_PASS             - Email app password
```

## 📡 Running the Application

### Development Mode

**Terminal 1 - Backend**
```bash
cd Backend
npm install
npm start
```

**Terminal 2 - Frontend**
```bash
cd Frontend
npm install
npm run dev
```

### Production Build

**Frontend**
```bash
npm run build
npm run preview
```

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api/v1
```

### User Endpoints (`/user`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /verify-email` - Verify email with code
- `POST /logout` - User logout
- `GET /profile` - Get user profile (protected)

### Listing Endpoints (`/listing`)
- `GET /` - Get all listings
- `GET /:id` - Get specific listing
- `POST /` - Create new listing (protected)
- `PUT /:id` - Update listing (protected)
- `DELETE /:id` - Delete listing (protected)
- `GET /user/:userId` - Get user's listings

### Admin Endpoints (`/admin`)
- `GET /users` - Get all users (admin only)
- `GET /listings` - Get all listings (admin only)
- `PUT /users/:userId` - Update user (admin only)
- `DELETE /listings/:listingId` - Delete listing (admin only)

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  phone: Number,
  password: String (required, hashed),
  isVerified: Boolean (default: false),
  verificationCode: String,
  role: String (enum: ["user", "admin"], default: "user"),
  timestamps: true
}
```

### Listing Model
```javascript
{
  title: String (required),
  description: String,
  image: [{url: String, filename: String}],
  price: Number,
  location: String,
  country: String,
  gender: String (enum: ["Boys", "Girls", "Co-Living"]),
  phoneNumber: Number,
  amenities: [String],
  roomType: String (enum: ["Single Room", "Double Room", "Full House"]),
  reviews: [ObjectId],
  owner: ObjectId (ref: "User")
}
```

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (RBAC)
- CORS protection
- Email verification for new accounts
- Secure cookie storage
- Input validation with Joi

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👥 Authors

- Frontend & Backend Development Team

## 🙋 Support

For support, please create an issue in the repository or contact the development team.

---

**Last Updated**: December 2025
