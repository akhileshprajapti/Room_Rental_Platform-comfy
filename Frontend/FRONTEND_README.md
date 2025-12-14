# Room Rent Website - Frontend

A modern React-based web application for browsing and posting room rental properties. Built with Vite for fast development and optimized production builds.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Pages & Components](#pages--components)
- [Running the Application](#running-the-application)
- [Build & Deployment](#build--deployment)
- [Development Guidelines](#development-guidelines)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The frontend is a responsive web application that allows users to:
- **Browse Listings** - View available room rentals with filters
- **Post Properties** - Add new rental properties with images
- **User Authentication** - Register, login, and email verification
- **Admin Dashboard** - Manage listings and users (admin users only)
- **Property Details** - View detailed information with location maps
- **Contact Landlords** - Reach out to property owners

## 🛠 Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.1.1 | UI library |
| react-dom | 19.1.1 | React DOM rendering |
| react-router-dom | 7.9.4 | Client-side routing |
| axios | 1.13.1 | HTTP client |
| vite | 7.1.7 | Build tool & dev server |
| leaflet | 1.9.4 | Map library |
| react-leaflet | 5.0.0 | React wrapper for Leaflet |
| lucide-react | 0.546.0 | Icon library |
| eslint | 9.36.0 | Code linting |

## 📦 Installation

1. **Navigate to frontend directory**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (optional)
   ```
   VITE_API_URL=http://localhost:8080
   VITE_API_VERSION=v1
   ```

## ⚙️ Configuration

### Vite Configuration (`vite.config.js`)
- React plugin for Fast Refresh
- HMR enabled for development
- Optimized build output

### ESLint Configuration (`eslint.config.js`)
- React-specific rules
- React Hooks validation
- Import rules

## 🗂 Project Structure

```
src/
├── main.jsx                      # Application entry point
├── App.jsx                       # Root component
├── App.css                       # Global styles
├── index.css                     # Global CSS
├── assets/                       # Static assets (images, fonts)
├── components/                   # Reusable components
│   ├── Header/
│   │   ├── Navbar.jsx           # Navigation bar
│   │   └── Navbar.css
│   ├── HeroSection/
│   │   ├── HeroSection.jsx      # Landing section
│   │   └── HeroSection.css
│   ├── Footer/
│   │   ├── Footer.jsx           # Footer component
│   │   └── Footer.css
│   └── Css/                     # Shared CSS files
│       ├── Choose.css
│       └── Pg.css
├── page/                        # Page components
│   ├── Choose.jsx               # Why Choose Us page
│   ├── Pg.jsx                   # Properties page
│   ├── Contact/                 # Contact page
│   │   ├── Contact.jsx
│   │   └── Contact.css
│   ├── Register/                # Authentication pages
│   │   ├── Login.jsx
│   │   ├── Login.css
│   │   ├── Register.jsx
│   │   └── Register.css
│   ├── Listing/                 # Property listings
│   │   ├── Listing.jsx
│   │   └── Listing.css
│   ├── SingleListing/           # Single property detail
│   │   ├── DetailedListing.jsx
│   │   └── DetailedListing.css
│   ├── Addpg/                   # Add property
│   │   ├── AddYourProperty.jsx
│   │   └── AddProperty.css
│   └── Admin/                   # Admin features
│       ├── AdminDashboard.jsx
│       ├── AdminDashboard.css
│       └── AdminPages/
│           ├── AdminListing.jsx
│           ├── AdminListing.css
│           └── AdminUser.jsx
└── Router/
    └── Router.jsx               # Main routing component
```

## 📄 Pages & Components

### Pages

#### Home (`Router.jsx`)
- Hero section with call-to-action
- "Why Choose Us" section
- Featured properties carousel
- Footer with contact info

#### Listings (`page/Listing/`)
- Browse all available properties
- Filters: location, price, room type
- Amenities filter
- Property cards with images and price
- Pagination

#### Single Listing (`page/SingleListing/`)
- Detailed property information
- Image gallery
- Map integration with Leaflet
- Owner contact details
- Amenities list
- Room specifications

#### Add Property (`page/Addpg/`)
- Form to post new property
- Multiple image upload
- Property details form:
  - Title, description, price
  - Location and country
  - Room type and gender preference
  - Amenities selection
  - Contact phone number

#### Authentication (`page/Register/`)
- **Login.jsx** - User login form
- **Register.jsx** - New user registration
- Email verification flow
- Password validation

#### Admin Dashboard (`page/Admin/`)
- User management
- Listing management
- System overview
- Analytics (if implemented)

#### Contact (`page/Contact/`)
- Static contact page
- Contact form
- Company information

### Components

#### Navbar (`components/Header/`)
- Navigation links
- User authentication state
- Responsive menu
- Admin panel link (admin users only)

#### Hero Section (`components/HeroSection/`)
- Landing banner
- Search functionality
- Call-to-action buttons

#### Footer (`components/Footer/`)
- Links and information
- Contact details
- Social media links
- Copyright information

## 🚀 Running the Application

### Development Server
```bash
npm run dev
```

**Output:**
```
  VITE v7.1.7  ready in 567 ms

  ➜  Local:   http://localhost:5173/
  ➜  Press h + enter to show help
```

**Access at:** `http://localhost:5173`

**Features:**
- Hot Module Replacement (HMR) enabled
- Auto-reload on file changes
- Fast build times

### Linting
```bash
npm run lint
```

Checks code quality and style violations.

## 🏗 Build & Deployment

### Production Build
```bash
npm run build
```

**Output:**
- Minified and optimized bundle
- Generated in `dist/` directory
- Ready for deployment

### Preview Build Locally
```bash
npm run preview
```

Preview the production build locally before deployment.

## 📝 Development Guidelines

### Component Structure

All page components should follow this pattern:
```jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './ComponentName.css'

export default function ComponentName() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch data or initialize component
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  )
}
```

### API Integration

Use Axios for API calls:
```javascript
const API_URL = import.meta.env.VITE_API_URL

const fetchListings = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/listing`)
    return response.data
  } catch (error) {
    console.error('Error fetching listings:', error)
    throw error
  }
}
```

### Authentication

Store JWT tokens in localStorage or cookies:
```javascript
const token = localStorage.getItem('authToken')

const headers = {
  Authorization: `Bearer ${token}`
}

axios.get(`${API_URL}/api/v1/user/profile`, { headers })
```

### Styling

- Use CSS modules or component-specific CSS files
- Follow the naming convention: `ComponentName.css`
- Use responsive design with media queries
- Maintain consistent spacing and colors

## 🎨 Design Features

- **Responsive Design** - Mobile, tablet, and desktop support
- **Clean UI** - Modern and user-friendly interface
- **Maps Integration** - Location visualization with Leaflet
- **Image Gallery** - Multiple property images
- **Filtering** - Advanced property search
- **Icons** - Lucide React icons for better UX

## 🔐 Security Features

- JWT token-based authentication
- Secure API calls with Authorization headers
- CORS protection (backend enforced)
- Input validation before sending to backend
- Protected routes (admin pages)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# The dev server uses port 5173 by default
# To use a different port:
npm run dev -- --port 3000
```

### API Connection Issues
- Verify backend is running on `http://localhost:8080`
- Check `VITE_API_URL` environment variable
- Check browser console for CORS errors
- Verify backend CORS configuration

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

### Hot Reload Not Working
- Check if Vite dev server is running
- Verify file paths and imports
- Restart the development server

## 📚 Related Documentation

- [Backend README](../Backend/README.md)
- [Main Project README](../README.md)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)
- [Leaflet Documentation](https://leafletjs.com)

## 🔧 Scripts Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint checks |
| `npm run preview` | Preview production build |

## 📧 Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | http://localhost:8080 | Backend API URL |
| `VITE_API_VERSION` | v1 | API version |

---

**Last Updated**: December 2025
