# Student Achievement Management System

A comprehensive, role-based platform for managing and tracking student achievements across departments and programs.

## System Overview

This system provides centralized achievement management for educational institutions with support for:
- **Admin**: Full system configuration and user management
- **HOD (Head of Department)**: Department-level analytics and reporting
- **Class Advisors**: Achievement verification and class-level reports
- **Students**: Achievement submission and tracking

## Features

### Core Features
- **Role-Based Access Control (RBAC)**: 4 user roles with distinct permissions
- **Modular Architecture**: Separated services, components, and utilities
- **Pagination & Lazy Loading**: Efficient data handling with intelligent pagination
- **Advanced Analytics**: Department, class-wise, and semester-based reporting
- **Achievement Verification**: Workflow for reviewing and approving submissions
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Theme UI**: Professional gradient-based interface

### Administrative Features
- Department management (create, edit, view)
- Program creation (UG, PG, M.Tech, MCA)
- Division and batch management
- Academic structure configuration
- Achievement category management
- User role assignment

### HOD Dashboard
- Department-wide analytics
- Class-wise achievement reports
- Semester-based analysis
- Achievement verification
- PDF/Excel report generation

### Student Features
- Achievement submission with categories
- Real-time status tracking
- Certificate upload support
- Personal achievement analytics
- Search and filter capabilities

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── admin/          # Admin-specific components
│   ├── hod/            # HOD-specific components
│   ├── student/        # Student-specific components
│   ├── Analytics/      # Analytics components
│   └── ...             # Shared components
├── pages/              # Page components (dashboards)
├── services/           # API service layer
│   ├── api.js         # Mock API client
│   ├── authService.js # Authentication logic
│   ├── achievementService.js
│   └── reportService.js
├── context/           # React Context (Auth)
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── styles/            # CSS files
└── index.jsx          # App entry point
```

## Key Technologies

- **React 18**: UI library with hooks
- **Tailwind CSS v4**: Utility-first styling
- **Axios**: HTTP client (configured, using mock data)
- **Vite**: Build tool and dev server
- **Custom Hooks**: usePagination, useAsync, useLazyLoad, useDebounce

## Authentication

### Demo Credentials

Login with any of these accounts:

```
Admin:          admin@university.edu / admin123
HOD:            hod@university.edu / hod123
Class Advisor:  advisor@university.edu / advisor123
Student:        student@university.edu / student123
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open at http://localhost:5173

### Build

```bash
npm run build
```

## API Integration

The system uses a mock API client that reads from `public/mock-data.json`. To connect to a real backend:

1. Update `src/services/api.js` to make actual HTTP requests using Axios
2. Replace mock data calls with real API endpoints
3. Update authentication flow to use real tokens

## Data Flow

### Achievement Submission
```
Student Form → Service Layer → Mock API → State Update → UI
```

### Verification Workflow
```
Advisor Review → Service Update → Database → Analytics Update
```

### Report Generation
```
Filter Criteria → Service Processing → Format (PDF/Excel) → Download
```

## Pagination Implementation

The system implements smart pagination with:
- Configurable page sizes (5, 10, 20, 50 items)
- Ellipsis for large page ranges
- Previous/Next buttons
- Direct page navigation
- Total items count display

## Lazy Loading

Two lazy loading strategies:
1. **Intersection Observer**: Infinite scroll via `useLazyLoad` hook
2. **Pagination**: Traditional page-based loading with controls

## Analytics Features

- **Real-time Dashboard**: Live statistics and trends
- **Category Distribution**: Breakdown by achievement type
- **Timeline View**: Monthly achievement trends
- **Role-wise Distribution**: User count by role
- **Verification Metrics**: Success rates and pending items

## Performance Optimizations

- Debounced search (300ms delay)
- Memoized page number generation
- Lazy loading with intersection observer
- Component-level error boundaries
- Optimized re-renders with hooks

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance
- Focus management

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "dev"]
```

## Future Enhancements

- Real database integration (PostgreSQL/MongoDB)
- OAuth authentication
- File upload to cloud storage
- Email notifications
- Advanced search with filters
- Mobile app (React Native)
- Dark/Light theme toggle
- Multi-language support
- Automated achievement suggestions
- Integration with academic management systems

## Troubleshooting

### Page not loading
- Clear browser cache
- Restart dev server
- Check browser console for errors

### Authentication issues
- Verify demo credentials
- Check localStorage for user data
- Clear cookies and try again

### Missing styles
- Ensure Tailwind CSS is properly configured
- Check that globals.css is imported
- Rebuild the project

## Support

For issues or questions, please check the documentation or create an issue in the repository.

## License

MIT License - feel free to use this project for educational purposes.
