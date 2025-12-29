# Student Achievement Management System - Backend API

## Overview

RESTful API backend for the Student Achievement Management System built with Node.js, Express, MongoDB, and JWT authentication.

## Features

- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Admin, HOD, Advisor, Student roles
- **File Upload** - Multer for certificate and photo uploads
- **MongoDB** - Scalable database with proper schemas
- **CRUD Operations** - Complete CRUD for all entities
- **Error Handling** - Centralized error handling middleware
- **Validation** - Input validation and duplicate prevention

## Tech Stack

- Node.js & Express
- MongoDB & Mongoose
- JWT (jsonwebtoken)
- Multer (file uploads)
- Bcryptjs (password hashing)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
DB_URL=mongodb://localhost:27017/student-achievement
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
PORT=5000
NODE_ENV=development
```

3. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user (Admin only)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get single department
- `POST /api/departments` - Create department (Admin)
- `PUT /api/departments/:id` - Update department (Admin)
- `DELETE /api/departments/:id` - Delete department (Admin)

### Programs
- `GET /api/programs` - Get all programs
- `GET /api/programs/:id` - Get single program
- `POST /api/programs` - Create program (Admin)
- `PUT /api/programs/:id` - Update program (Admin)
- `DELETE /api/programs/:id` - Delete program (Admin)

### Academic Structure
- `GET /api/academic/years` - Get all years
- `POST /api/academic/years` - Create year (Admin)
- `GET /api/academic/divisions` - Get all divisions
- `POST /api/academic/divisions` - Create division (Admin)
- `GET /api/academic/batches` - Get all batches
- `POST /api/academic/batches` - Create batch (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Achievements
- `GET /api/achievements` - Get achievements (with filters)
- `POST /api/achievements` - Create achievement (Student)
- `GET /api/achievements/:id` - Get single achievement
- `PUT /api/achievements/:id` - Update achievement
- `PUT /api/achievements/:id/verify` - Verify achievement (Advisor/HOD)
- `PUT /api/achievements/:id/reject` - Reject achievement (Advisor/HOD)
- `DELETE /api/achievements/:id` - Delete achievement

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `PUT /api/users/:id/assign` - Assign advisor (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Analytics
- `GET /api/analytics` - Get analytics data

### Files
- `GET /api/files/:id` - Get file
- `DELETE /api/files/:id` - Delete file

## Database Schema

### User
- name, email, password, role
- rollNo (student), department, program, year, division, batch
- assignedDivisions, assignedBatches (advisor)

### Department
- code, name, hod, description

### Program
- code, name, department

### Year
- code, name, program, academicYear, semester

### Division
- code, name, year, advisor

### Batch
- number, division, advisor

### Achievement
- student, title, category, description, date
- status, certificate, photo
- verifiedBy, verifiedDate, rejectionReason

### Category
- code, name, description

### File
- filename, originalName, mimeType, size, path
- uploadedBy, fileType

## Authorization Rules

- **Admin**: Full access to all resources
- **HOD**: Access to their department's data
- **Advisor**: Access to assigned divisions/batches
- **Student**: Access to own achievements only

## File Upload

- Certificates: PDF, JPG, PNG (max 500KB)
- Photos: JPG, PNG (max 500KB)
- Files stored in `uploads/certificates` and `uploads/photos`

## Error Handling

All errors follow consistent format:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Role-based authorization
- File type validation
- Input validation

