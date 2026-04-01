# Job Portal Project Architecture Analysis

## Project Overview
A full-stack job portal application built with MERN stack (MongoDB, Express, React, Node.js) featuring dual user roles (student/job seeker and recruiter/admin).

## Technology Stack

### Backend (Node.js/Express)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with cookie-based sessions
- **File Upload**: Multer with Cloudinary integration
- **Middleware**: CORS, cookie-parser, body parsing
- **API Version**: v1

### Frontend (React)
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **State Management**: Redux Toolkit with Redux Persist
- **Styling**: Tailwind CSS
- **UI Components**: Custom UI library
- **HTTP Client**: Axios

## Folder Structure Diagram

```
jobportal-main/
├── backend/
│   ├── index.js                    # Main server entry point
│   ├── package.json               # Backend dependencies
│   ├── .env                       # Environment variables
│   ├── .gitignore
│   │
│   ├── controllers/               # Business logic layer
│   │   ├── user.controller.js     # User registration, login, profile
│   │   ├── company.controller.js  # Company management
│   │   ├── job.controller.js      # Job CRUD operations
│   │   ├── application.controller.js # Job applications
│   │   └── savedJob.controller.js # Saved jobs functionality
│   │
│   ├── models/                    # Database schema definitions
│   │   ├── user.model.js          # User schema (student/recruiter)
│   │   ├── company.model.js       # Company schema
│   │   ├── job.model.js           # Job posting schema
│   │   └── application.model.js   # Job application schema
│   │
│   ├── routes/                    # API endpoint definitions
│   │   ├── user.route.js          # /api/v1/user/*
│   │   ├── company.route.js       # /api/v1/company/*
│   │   ├── job.route.js           # /api/v1/job/*
│   │   ├── application.route.js   # /api/v1/application/*
│   │   └── savedJob.route.js      # /api/v1/user/saved-jobs/*
│   │
│   ├── middlewares/               # Custom middleware
│   │   ├── isAuthenticated.js     # JWT authentication
│   │   └── mutler.js              # File upload handling
│   │
│   └── utils/                     # Utility functions
│       ├── cloudinary.js          # Cloudinary integration
│       ├── datauri.js             # Data URI conversion
│       └── db.js                  # Database connection
│
└── frontend/
    ├── src/
    │   ├── main.jsx                 # React app entry point
    │   ├── App.jsx                  # Main router component
    │   ├── App.css                  # Global styles
    │   ├── index.css                # CSS imports
    │   │
    │   ├── components/              # React components
    │   │   ├── Home.jsx             # Landing page
    │   │   ├── Jobs.jsx             # Job listings
    │   │   ├── Browse.jsx           # Job browsing
    │   │   ├── Profile.jsx          # User profile
    │   │   ├── JobDescription.jsx   # Individual job details
    │   │   ├── SavedJobs.jsx        # Saved jobs list
    │   │   ├── AppliedJobTable.jsx  # Applied jobs table
    │   │   │
    │   │   ├── auth/                # Authentication components
    │   │   │   ├── Login.jsx        # User login
    │   │   │   └── Signup.jsx       # User registration
    │   │   │
    │   │   ├── admin/               # Admin/recruiter components
    │   │   │   ├── ProtectedRoute.jsx    # Route protection
    │   │   │   ├── Companies.jsx         # Company management
    │   │   │   ├── CompanyCreate.jsx     # Create company
    │   │   │   ├── CompanySetup.jsx      # Company setup
    │   │   │   ├── AdminJobs.jsx         # Admin job management
    │   │   │   ├── PostJob.jsx           # Post new job
    │   │   │   ├── EditJob.jsx           # Edit job posting
    │   │   │   └── Applicants.jsx        # View job applicants
    │   │   │
    │   │   ├── shared/              # Shared components
    │   │   │   ├── Navbar.jsx       # Navigation bar
    │   │   │   ├── Footer.jsx       # Footer
    │   │   │   └── Breadcrumbs.jsx  # Navigation breadcrumbs
    │   │   │
    │   │   ├── ui/                  # Reusable UI components
    │   │   │   ├── button.jsx       # Custom buttons
    │   │   │   ├── input.jsx        # Custom inputs
    │   │   │   ├── table.jsx        # Custom tables
    │   │   │   └── [other UI components]
    │   │   │
    │   │   └── [other components]
    │   │
    │   ├── hooks/                   # Custom React hooks
    │   │   ├── useGetAllJobs.jsx    # Fetch all jobs
    │   │   ├── useGetAllCompanies.jsx # Fetch companies
    │   │   ├── useGetAppliedJobs.jsx    # Fetch applied jobs
    │   │   └── [other hooks]
    │   │
    │   ├── redux/                   # Redux state management
    │   │   ├── store.js             # Redux store configuration
    │   │   ├── authSlice.js         # Authentication state
    │   │   ├── jobSlice.js          # Job state
    │   │   ├── companySlice.js      # Company state
    │   │   ├── applicationSlice.js  # Application state
    │   │   └── savedJobSlice.js     # Saved jobs state
    │   │
    │   ├── utils/                   # Utility functions
    │   │   └── constant.js          # API endpoints and constants
    │   │
    │   ├── lib/                     # Library functions
    │   │   └── utils.js             # Helper functions
    │   │
    │   └── assets/                  # Static assets
    │       ├── react.svg
    │       └── expenselogo.png
    │
    ├── public/                      # Public assets
    │   └── vite.svg
    │
    ├── package.json                 # Frontend dependencies
    ├── vite.config.js               # Vite configuration
    ├── tailwind.config.js           # Tailwind CSS config
    ├── postcss.config.js            # PostCSS config
    ├── jsconfig.json                # JavaScript config
    └── .eslintrc.cjs                # ESLint configuration
```

## API Routes and Endpoints

### User Routes (`/api/v1/user/*`)
- **POST** `/register` - User registration (with file upload)
- **POST** `/login` - User login
- **GET** `/logout` - User logout
- **POST** `/profile/update` - Update user profile (with file upload)
- **GET** `/saved-jobs` - Get user's saved jobs
- **POST** `/saved-jobs` - Save a job
- **DELETE** `/saved-jobs/:id` - Remove saved job

### Job Routes (`/api/v1/job/*`)
- **POST** `/post` - Post new job (authenticated)
- **GET** `/get` - Get all jobs (authenticated, with keyword search)
- **GET** `/getadminjobs` - Get admin jobs (authenticated)
- **GET** `/get/:id` - Get job by ID (authenticated)
- **PUT** `/update/:id` - Update job (authenticated)
- **DELETE** `/delete/:id` - Delete job (authenticated)

### Company Routes (`/api/v1/company/*`)
- **POST** `/create` - Create company (authenticated)
- **GET** `/get` - Get all companies (authenticated)
- **GET** `/get/:id` - Get company by ID (authenticated)
- **PUT** `/update/:id` - Update company (authenticated)
- **DELETE** `/delete/:id` - Delete company (authenticated)

### Application Routes (`/api/v1/application/*`)
- **POST** `/apply` - Apply for job (authenticated)
- **GET** `/get` - Get user applications (authenticated)
- **GET** `/get/:id` - Get application by ID (authenticated)
- **DELETE** `/delete/:id` - Delete application (authenticated)

### Saved Job Routes (`/api/v1/user/saved-jobs/*`)
- **GET** `/` - Get saved jobs (authenticated)
- **POST** `/` - Save job (authenticated)
- **DELETE** `/:id` - Remove saved job (authenticated)

## User Flow and Authentication

### Authentication Flow
1. **JWT-based Authentication**: Uses JWT tokens stored in HTTP-only cookies
2. **Role-based Access**: Two user roles - `student` (job seeker) and `recruiter` (admin)
3. **Protected Routes**: Middleware validates JWT tokens for authenticated endpoints
4. **Auto-redirect**: Users automatically redirected based on role after login

### User Roles and Permissions

#### Student/Job Seeker Role
- **Access**: Public job listings, job descriptions, browsing
- **Actions**: 
  - Register and login
  - Update profile (resume upload)
  - Apply for jobs
  - Save/unsaved jobs
  - View applied jobs
- **Protected Routes**: Profile, saved jobs, job applications

#### Recruiter/Admin Role
- **Access**: All student features plus admin dashboard
- **Actions**:
  - Create and manage companies
  - Post, edit, delete job listings
  - View and manage job applicants
  - Access admin dashboard
- **Protected Routes**: All admin routes require recruiter role

### Data Flow Architecture

#### Frontend Data Flow
1. **Redux Store**: Centralized state management with persistence
2. **API Integration**: Axios for HTTP requests with credentials
3. **Hooks Pattern**: Custom hooks for data fetching and state management
4. **Component Hierarchy**: Modular component structure with shared utilities

#### Backend Data Flow
1. **Middleware Chain**: Request → CORS → Body Parsing → Authentication → Controller
2. **Database Operations**: Mongoose models with validation and relationships
3. **Error Handling**: Centralized error handling with proper HTTP status codes
4. **File Upload**: Multer middleware with Cloudinary storage

## Component Relationships

### Main Layout Components
- **Navbar**: Navigation with authentication status
- **Footer**: Site footer
- **Home**: Landing page with hero section and job listings

### Authentication Components
- **Login/Signup**: Authentication forms
- **ProtectedRoute**: Route wrapper for authenticated access

### Job Management Components
- **Jobs**: Job listings with filtering
- **JobDescription**: Detailed job view
- **Browse**: Advanced job browsing
- **SavedJobs**: User's saved job listings

### Admin Components
- **Companies**: Company management dashboard
- **AdminJobs**: Job management for recruiters
- **PostJob/EditJob**: Job posting/editing forms
- **Applicants**: Job applicant management

### State Management
- **authSlice**: User authentication and profile data
- **jobSlice**: Job listings and search functionality
- **companySlice**: Company data
- **applicationSlice**: Job application data
- **savedJobSlice**: User's saved jobs

## Key Features

1. **Dual User System**: Separate flows for job seekers and recruiters
2. **File Upload**: Resume and profile photo upload with Cloudinary
3. **Search and Filter**: Job search with keyword filtering
4. **Application Management**: Complete job application workflow
5. **Saved Jobs**: Job bookmarking functionality
6. **Admin Dashboard**: Recruiter-specific management interface
7. **Responsive Design**: Mobile-friendly interface
8. **Real-time Updates**: Redux state management for dynamic updates

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Role-based Access Control**: Different permissions for different user types
3. **Input Validation**: Server-side validation for all inputs
4. **File Upload Security**: File type and size restrictions
5. **CORS Configuration**: Controlled cross-origin resource sharing
6. **Cookie Security**: HTTP-only cookies for JWT tokens

This architecture provides a scalable, secure, and user-friendly job portal with clear separation of concerns and modern development practices.