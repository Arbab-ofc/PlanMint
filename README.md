# 🌿 PlanMint

### Lightweight, role-aware project & task management platform

<div align="center">

🌐 [Live Demo](https://your-deployment-url.com) • 💻 [GitHub Repository](https://github.com/Arbab-ofc/PlanMint) • 📄 [License](LICENSE)

**PlanMint is a clean, fast project platform that keeps small teams focused.** It pairs a crisp UI with opinionated guardrails: owners and admins control membership and project status; members stay focused on their assigned work.

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🔐 Roles & Permissions](#-roles--permissions)
- [⚙️ Environment Setup](#️-environment-setup)
- [📦 Installation & Running](#-installation--running)
- [🔌 API Documentation](#-api-documentation)
- [🧭 Frontend Routes](#-frontend-routes)
- [🎨 UI Guidelines](#-ui-guidelines)
- [🧪 Testing Examples](#-testing-examples)
- [🐞 Troubleshooting](#-troubleshooting)
- [🔐 Security](#-security)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🔒 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Protected routes** with middleware validation
- **Role-based access control** (RBAC) at app and project levels

### 👤 User Management
- **Profile Management**: Update name, timezone, locale preferences
- **Avatar System**: Cloudinary-powered image uploads with fallback initials
- **Password Security**: Enforced policy (8-128 chars, alphanumeric required)
- **Admin Portal**: Comprehensive user administration dashboard

### 📊 Project Management
- **Project Creation & Organization**: Full CRUD operations
- **Three-tier Role System**: Owner, Admin, Member with distinct permissions
- **Status Tracking**: Visual status indicators (Pending, Done, Failed)
- **Member Management**: Add/remove members, role assignments
- **Ownership Transfer**: Seamless project ownership transitions
- **Search & Filter**: Quick project discovery
- **Archive Support**: Clean project archival system

### ✅ Task Management
- **Task CRUD Operations**: Create, read, update, delete
- **Advanced Filtering**: By status, priority, assignee
- **Pagination Support**: Handle large task lists efficiently
- **Assignment System**: Dynamic task reassignment
- **Due Date Tracking**: Deadline management and visualization

### 🔔 Notification System
- **Broadcast Messaging**: Project-wide notifications
- **Event-driven Alerts**: Task assignments, overdue reminders
- **Multiple Notification Types**: Customizable event triggers

### 👨‍💼 Admin Portal
- **User Directory**: Searchable user list with pagination
- **Bulk Operations**: Mass user management capabilities
- **Role Management**: Change user permissions
- **Email Verification**: Manual verification controls
- **Advanced Filtering**: Search by role, verification status

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="50%">

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**Libraries:**
- `react-toastify` - Toast notifications
- `react-icons` - Icon components
- `axios` - HTTP client

</td>
<td align="center" width="50%">

### Backend

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

**Tools:**
- `mongoose` - ODM
- `bcryptjs` - Password hashing
- `multer` - File uploads
- `cloudinary` - Image storage

</td>
</tr>
</table>

---

## 📁 Project Structure

```
planmint/
├── 📁 client/
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ...
│   │   ├── 📁 contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── 📁 pages/
│   │   │   ├── AdminPortal.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── ProjectDetails.jsx
│   │   │   └── ...
│   │   ├── 📁 utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── 📁 server/
│   ├── 📁 controllers/
│   │   ├── users.controller.js
│   │   ├── adminUsers.controller.js
│   │   ├── adminProjects.controller.js
│   │   └── ...
│   ├── 📁 models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── 📁 middlewares/
│   │   ├── auth.middleware.js
│   │   └── upload.middleware.js
│   ├── 📁 routes/
│   │   ├── users.routes.js
│   │   ├── adminUsers.routes.js
│   │   └── adminProjects.routes.js
│   ├── 📁 config/
│   │   ├── database.js
│   │   └── cloudinary.js
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🔐 Roles & Permissions

### 🌐 Application-Level Roles

| Role | Badge | Permissions |
|------|-------|-------------|
| **Admin** | 🟡 Gold Badge | • Access Admin Portal<br>• Manage all users<br>• Access `/api/admin/*` endpoints<br>• Full system control |
| **Member** | 🟢 Green Badge | • Standard user access<br>• Create projects<br>• Join projects as member |

### 📊 Project-Level Roles

| Role | Permissions |
|------|-------------|
| **Owner** | • Full project control<br>• Update project status<br>• Transfer ownership<br>• Add/remove members<br>• Manage all tasks<br>• Delete project |
| **Admin** | • Update project status<br>• Add/remove members<br>• Manage all tasks<br>• Update project settings |
| **Member** | • View project details<br>• View assigned tasks<br>• Update own task status<br>• Comment on tasks |

### 🎯 Permission Matrix

```
Action                    │ Owner │ Admin │ Member
──────────────────────────┼───────┼───────┼────────
Change Project Status     │   ✅  │   ✅  │   ❌
Add/Remove Members        │   ✅  │   ✅  │   ❌
Assign Tasks              │   ✅  │   ✅  │   ❌
Update Any Task           │   ✅  │   ✅  │   ❌
View All Tasks            │   ✅  │   ✅  │   ❌
Update Own Tasks          │   ✅  │   ✅  │   ✅
Transfer Ownership        │   ✅  │   ❌  │   ❌
Delete Project            │   ✅  │   ❌  │   ❌
```

---

## ⚙️ Environment Setup

### 📋 Prerequisites

![Node.js](https://img.shields.io/badge/Node.js-18+-43853D?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-4EA94B?style=flat-square&logo=mongodb)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Account-3448C5?style=flat-square&logo=cloudinary)

### 🔧 Server Configuration

Create `/server/.env`:

```bash
# Server
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/planmint

# Authentication
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# File Uploads
UPLOAD_TMP_DIR=./tmp
MAX_FILE_SIZE=5242880
```

### 🎨 Client Configuration

Create `/client/.env`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Optional: Environment
VITE_APP_ENV=development
```

> **Note:** For Create React App, use `REACT_APP_API_BASE_URL` instead of `VITE_API_BASE_URL`

---

## 📦 Installation & Running

### 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/planmint.git
cd planmint

# Install server dependencies
cd server
npm install

# Start the server (development mode)
npm run dev
# ✅ Server running at http://localhost:5000

# In a new terminal, install client dependencies
cd ../client
npm install

# Start the client (development mode)
npm run dev
# ✅ Client running at http://localhost:5173
```

### 🏗️ Production Build

```bash
# Build client for production
cd client
npm run build

# Start server in production mode
cd ../server
npm start
```

### 🐳 Docker Support (Optional)

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

---

## 🔌 API Documentation

> **Base URL:** `http://localhost:5000/api`
> 
> **Authentication:** All protected endpoints require `Authorization: Bearer <JWT>` header

### 🔑 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Register new user |
| `POST` | `/auth/login` | User login |
| `POST` | `/auth/logout` | User logout |
| `POST` | `/auth/refresh` | Refresh JWT token |

### 👤 User Endpoints (Self-Service)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users/profile` | Get current user profile |
| `PUT` | `/users/profile` | Update profile (name, timezone, locale) |
| `POST` | `/users/avatar` | Upload avatar image |
| `DELETE` | `/users/avatar` | Delete avatar image |
| `PATCH` | `/users/password` | Change password |

**Password Change Body:**
```json
{
  "password": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

### 👥 Admin - User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/users` | List all users (paginated) |
| `GET` | `/admin/users/:userId` | Get specific user details |
| `PUT` | `/admin/users/:userId` | Update user details |
| `PATCH` | `/admin/users/:userId/role` | Change user role |
| `PATCH` | `/admin/users/:userId/verify-email` | Manually verify email |

**Query Parameters for User List:**
```
?page=1&limit=10&search=john&role=admin&emailVerified=true
```

### 📊 Admin - Project Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/projects` | List all projects |
| `GET` | `/admin/projects/search` | Search projects |
| `GET` | `/admin/projects/:projectId` | Get project details |
| `PUT` | `/admin/projects/:projectId` | Update project metadata |
| `PATCH` | `/admin/projects/:projectId/status` | Update project status |
| `PATCH` | `/admin/projects/:projectId/transfer-ownership` | Transfer ownership |
| `POST` | `/admin/projects/:projectId/members` | Add project member |
| `PATCH` | `/admin/projects/:projectId/members/:username/role` | Update member role |
| `DELETE` | `/admin/projects/:projectId/members/:username` | Remove member |
| `DELETE` | `/admin/projects/:projectId` | Delete project |

**Status Update Body:**
```json
{
  "status": "done"  // pending | done | failed
}
```

**Add Member Body:**
```json
{
  "username": "johndoe",
  "role": "admin"  // admin | member
}
```

### ✅ Task Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects/:projectId/tasks` | List project tasks |
| `POST` | `/projects/:projectId/tasks` | Create new task |
| `GET` | `/tasks/:taskId` | Get task details |
| `PUT` | `/tasks/:taskId` | Update task |
| `DELETE` | `/tasks/:taskId` | Delete task |

---

## 🧭 Frontend Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/about` | Public | About page |
| `/login` | Public | Login page |
| `/signup` | Public | Registration page |
| `/dashboard` | Protected | User dashboard |
| `/profile` | Protected | User profile management |
| `/projects/:id` | Protected | Project details & tasks |
| `/admin` | Admin Only | Admin portal |

### 🎯 Route Guards

- **Public Routes**: Accessible to all users
- **Protected Routes**: Require authentication (JWT token)
- **Admin Routes**: Require admin role + authentication

---

## 🎨 UI Guidelines

### 🖼️ Avatar System

**Display Logic:**
```javascript
if (user.avatarUrl) {
  // Show uploaded image
  <img src={user.avatarUrl} alt={user.name} />
} else {
  // Show first letter fallback
  <div>{user.name[0].toUpperCase()}</div>
}
```

**Border Colors:**
- **Admin**: `border-amber-400` (🟡 Gold)
- **Member**: `border-emerald-500` (🟢 Green)

### 🎨 Status Badges

| Status | Color | Badge |
|--------|-------|-------|
| Pending | Yellow | `bg-yellow-100 text-yellow-800` |
| Done | Green | `bg-green-100 text-green-800` |
| Failed | Red | `bg-red-100 text-red-800` |

### 🎯 Priority Indicators

| Priority | Color | Icon |
|----------|-------|------|
| High | Red | 🔴 |
| Medium | Orange | 🟠 |
| Low | Blue | 🔵 |

### 🔒 Password Policy

```
✅ Minimum 8 characters
✅ Maximum 128 characters
✅ At least one letter (a-z, A-Z)
✅ At least one number (0-9)
✅ Cannot match current password
```

---

## 🧪 Testing Examples

### 📡 cURL Examples

**Get User Profile:**
```bash
curl -H "Authorization: Bearer <YOUR_TOKEN>" \
  http://localhost:5000/api/users/profile
```

**Change Password:**
```bash
curl -X PATCH http://localhost:5000/api/users/password \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "MyNewPassw0rd",
    "confirmPassword": "MyNewPassw0rd"
  }'
```

**Admin: List Users:**
```bash
curl -H "Authorization: Bearer <ADMIN_TOKEN>" \
  "http://localhost:5000/api/admin/users?page=1&limit=10&search=john"
```

**Admin: Change User Role:**
```bash
curl -X PATCH http://localhost:5000/api/admin/users/<USER_ID>/role \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

**Admin: Update Project Status:**
```bash
curl -X PATCH http://localhost:5000/api/admin/projects/<PROJECT_ID>/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

### 🧪 Postman Collection

Import the provided Postman collection for comprehensive API testing:
```bash
# Import collection
postman-collection.json
```

---

## 🐞 Troubleshooting

### Common Issues & Solutions

#### 🔴 401 Unauthorized Error
```
Problem: Cannot access protected routes
Solution:
  ✅ Verify JWT token is present in Authorization header
  ✅ Check token format: "Bearer <token>"
  ✅ Ensure token hasn't expired
  ✅ Validate JWT_SECRET matches between login and verification
```

#### 🔴 403 Forbidden Error
```
Problem: Access denied to admin resources
Solution:
  ✅ Verify user has admin role in database
  ✅ Check project-level permissions for project routes
  ✅ Ensure requireAdmin middleware is applied correctly
```

#### 🔴 Avatar Upload Fails
```
Problem: Image upload returns error
Solution:
  ✅ Verify Cloudinary credentials in .env
  ✅ Check UPLOAD_TMP_DIR exists and is writable
  ✅ Ensure multer middleware uses 'avatar' field name
  ✅ Validate file size is under MAX_FILE_SIZE
  ✅ Confirm supported file types (jpg, png, gif)
```

#### 🔴 CORS Error
```
Problem: Cross-origin requests blocked
Solution:
  ✅ Set CORS_ORIGIN to match client URL
  ✅ Include credentials in axios requests
  ✅ Verify preflight OPTIONS requests are handled
```

#### 🔴 Invalid ObjectId Error
```
Problem: MongoDB ObjectId validation fails
Solution:
  ✅ Ensure ID parameters are valid 24-character hex strings
  ✅ Add ObjectId validation middleware
  ✅ Check database documents exist before operations
```

#### 🔴 MongoDB Connection Failed
```
Problem: Cannot connect to database
Solution:
  ✅ Verify MONGODB_URI is correct
  ✅ Ensure MongoDB service is running
  ✅ Check network connectivity
  ✅ Validate database user permissions
```

### 📊 Debug Mode

Enable debug logging:
```bash
# Server
DEBUG=app:* npm run dev

# Client
VITE_DEBUG=true npm run dev
```

---

## 🔐 Security

### 🛡️ Security Best Practices

✅ **Environment Variables**
- Never commit `.env` files
- Use different secrets for dev/staging/production
- Rotate secrets regularly

✅ **Password Security**
- Passwords hashed with `bcryptjs`
- Enforced password complexity policy
- Secure password reset flow

✅ **Data Protection**
- Sensitive fields removed via `toJSON` transform
- JWT tokens with expiration
- HTTP-only cookies for token storage (recommended)

✅ **Input Validation**
- All user inputs validated and sanitized
- MongoDB injection prevention
- XSS protection via React's built-in escaping

✅ **API Security**
- Rate limiting on authentication endpoints
- CORS configuration
- Helmet.js for HTTP headers
- Request size limits

### 🔍 Security Checklist

```
□ All secrets in environment variables
□ HTTPS enabled in production
□ Database connection string secured
□ File upload validation implemented
□ Rate limiting configured
□ Error messages don't leak sensitive data
□ Dependencies regularly updated
□ Security headers configured
□ Input validation on all endpoints
□ Authentication tokens securely stored
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 🔄 Workflow

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### 📝 Code Style

- Follow existing code patterns
- Use meaningful variable names
- Comment complex logic
- Write descriptive commit messages
- Update documentation for new features

### ✅ PR Checklist

```
□ Code follows project style guidelines
□ All tests pass
□ New features include tests
□ Documentation updated
□ No console.log statements
□ Commit messages are clear
□ Branch is up to date with main
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 PlanMint

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🙏 Acknowledgements

### 💙 Built With Love Using

- [React](https://react.dev/) - Frontend framework
- [React Router](https://reactrouter.com/) - Client-side routing
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM
- [Cloudinary](https://cloudinary.com/) - Image hosting
- [React Toastify](https://fkhadra.github.io/react-toastify/) - Notifications
- [React Icons](https://react-icons.github.io/react-icons/) - Icon library
- [JWT](https://jwt.io/) - Authentication
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) - Password hashing
- [Vite](https://vitejs.dev/) - Build tool

### 🌟 Special Thanks

- All contributors who help improve PlanMint
- The open-source community for amazing tools and libraries
- Beta testers for valuable feedback

---

<div align="center">

### 🚀 Ready to Ship Projects Without the Bloat?

**[Get Started](https://your-deployment-url.com)** • **[Documentation](#)** • **[Report Bug](https://github.com/yourusername/planmint/issues)** • **[Request Feature](https://github.com/yourusername/planmint/issues)**

Made with ❤️ by the PlanMint Team

**Happy Building! 🌿**

</div>