
# ScoreDesk Project Knowledge Base

## Project Overview
ScoreDesk is a comprehensive school management system built with React, TypeScript, Vite, Tailwind CSS, and Supabase. It provides role-based access control for managing students, results, and school administration.

## Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** as the build tool
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **React Router** for navigation
- **Tanstack Query** for data fetching and caching
- **Supabase JS Client** for backend integration

### Backend (Supabase)
- **PostgreSQL** database with Row Level Security (RLS)
- **Supabase Auth** for authentication
- **Supabase Storage** for file uploads
- **Database Functions** for custom logic
- **Real-time subscriptions** capability

## Authentication System

### User Registration Flow
1. Users sign up via `/signup` route
2. Users registering from `/signup` get `is_super_admin: true` in metadata
3. Super admin emails (`deepmindfx01@gmail.com`, `aleeyuwada01@gmail.com`) get automatic Principal role
4. Other users get roles assigned by Principals through User Management

### Role-Based Access Control
Four user roles with specific permissions:

#### Principal (Super Admin)
- Full access to all features
- User management
- School branding
- Settings management
- Analytics dashboard

#### Exam Officer
- Student management
- Class/Subject setup
- Result approval
- Position & ranking
- Report card designer
- Scratch card generator
- Analytics dashboard

#### Form Teacher
- Dashboard access
- Student management (limited)

#### Subject Teacher
- Dashboard access
- Result upload only

### Authentication Hooks
- `useAuth()` - Main authentication hook with login/logout/signup
- `useUserRole()` - Role-based permissions and access control

## Database Schema

### Tables

#### `profiles`
```sql
- id (uuid, references auth.users)
- full_name (text, nullable)
- school_name (text, nullable) 
- avatar_url (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```
**Purpose**: Store additional user profile information
**RLS**: Basic policies for user access

#### `user_roles`
```sql
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- role (text, check constraint for valid roles)
- created_at (timestamp)
```
**Purpose**: Store user role assignments
**RLS**: Only Principals can manage roles
**Constraint**: UNIQUE(user_id) - one role per user

### Database Functions

#### `get_user_role(user_id_param UUID)`
**Purpose**: Centralized role determination logic
**Logic**:
1. Check if user has `is_super_admin` metadata → return 'Principal'
2. Check hardcoded super admin emails → return 'Principal'  
3. Query `user_roles` table → return assigned role
4. Return NULL if no role found

**Security**: SECURITY DEFINER to bypass RLS

#### `handle_new_user()`
**Purpose**: Trigger function to create profile on user registration
**Trigger**: Fires after INSERT on auth.users
**Action**: Creates corresponding profile record

## File Structure

### Core Hooks
- `src/hooks/use-auth.tsx` - Authentication management (213 lines - needs refactoring)
- `src/hooks/use-user-role.tsx` - Role-based access control

### Pages Structure
```
src/pages/
├── LoginPage.tsx - Login form
├── SignupPage.tsx - Registration form  
├── Dashboard.tsx - Main dashboard
├── users/UserManagement.tsx - User management (needs refactoring)
├── students/StudentManagement.tsx - Student management
├── classes/ClassSubjectManagement.tsx - Class/subject setup
├── results/
│   ├── ResultEntry.tsx - Result upload (Subject Teachers only)
│   └── ResultApproval.tsx - Result approval
├── ranking/ClassRanking.tsx - Position & ranking
├── reportcards/ReportCardDesigner.tsx - Report card design
├── branding/SchoolBranding.tsx - School branding
├── scratchcards/ScratchCards.tsx - Scratch card generator
├── analytics/AnalyticsDashboard.tsx - Analytics
└── settings/SettingsPage.tsx - Settings
```

### Layout Components
- `src/components/layout/MainLayout.tsx` - Main app layout with sidebar
- `src/components/layout/Sidebar.tsx` - Navigation sidebar with role-based menu
- `src/components/layout/MainNav.tsx` - Top navigation

### Utility Components
- `src/components/RoleLabel.tsx` - Role display component
- `src/components/UserStatusBadge.tsx` - User status indicator

## Permission Matrix

The role permission system is defined in `src/types/user.ts`:

```typescript
export const rolePermissionMatrix = [
  { name: "Dashboard", principal: true, examOfficer: true, formTeacher: true, subjectTeacher: true },
  { name: "User Management", principal: true, examOfficer: false, formTeacher: false, subjectTeacher: false },
  { name: "Student Management", principal: true, examOfficer: true, formTeacher: true, subjectTeacher: false },
  { name: "Class/Subject Setup", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "Result Upload", principal: false, examOfficer: false, formTeacher: false, subjectTeacher: true },
  { name: "Result Approval", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "Position & Ranking", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "Report Card Designer", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "School Branding", principal: true, examOfficer: false, formTeacher: false, subjectTeacher: false },
  { name: "Scratch Card Generator", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "Analytics Dashboard", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "Settings", principal: true, examOfficer: false, formTeacher: false, subjectTeacher: false },
];
```

## Navigation Flow

### Public Routes
- `/` - Landing page
- `/login` - Login page  
- `/signup` - Registration page (grants super admin privileges)

### Protected Routes (require authentication)
All routes under `/` are protected and use `MainLayout`:
- `/dashboard` - Main dashboard
- `/users` - User management (Principal only)
- `/students` - Student management 
- `/classes` - Class/subject setup
- `/results/entry` - Result upload (Subject Teachers only)
- `/results/approval` - Result approval
- `/ranking` - Position & ranking
- `/reportcards` - Report card designer
- `/branding` - School branding (Principal only)
- `/scratchcards` - Scratch card generator  
- `/analytics` - Analytics dashboard
- `/settings` - Settings (Principal only)

## Key Features Implementation

### User Management
- View all users with roles and status
- Create new users and assign roles
- Edit existing user roles
- Import users via CSV
- Role-based access restrictions

### Authentication Features
- Email/password authentication
- Automatic super admin assignment for signup route
- Session persistence with localStorage
- Protected route handling
- Role-based navigation menu

### Data Security
- Row Level Security (RLS) on all tables
- User isolation through auth.uid() checks
- Super admin bypass mechanisms
- Secure role assignment policies

## Development Patterns

### Error Handling
- Toast notifications for user feedback
- Console logging for debugging
- Graceful fallbacks for missing data
- Permission-based UI hiding

### State Management
- React hooks for local state
- Tanstack Query for server state
- Custom hooks for auth and roles
- Supabase real-time subscriptions ready

### Code Organization
- Feature-based folder structure
- Reusable UI components
- Custom hooks for business logic
- TypeScript for type safety

## Common Issues & Solutions

### "Cannot access before initialization"
- Function declaration order matters in components
- Use function expressions or move declarations up

### "User creation not allowed"  
- Usually RLS policy issues
- Check user_roles table exists and has proper policies
- Verify Principal role has INSERT permissions

### Role not showing correctly
- Check get_user_role function logic
- Verify user_roles table has correct data
- Check metadata flags (is_super_admin)

### Authentication redirects
- Set proper Site URL and Redirect URLs in Supabase
- Configure emailRedirectTo in signup options

## Supabase Configuration

### Required Settings
- **Site URL**: Set to app domain (e.g., https://yourapp.lovable.app)
- **Redirect URLs**: Include all domains where auth happens
- **Email Templates**: Customize for school branding
- **RLS**: Enabled on all tables with proper policies

### Storage Setup
- Avatars bucket for profile images
- Public read access with authenticated write
- File size limits and MIME type restrictions

## Performance Considerations

### Data Fetching
- Use Tanstack Query for caching
- Implement pagination for large datasets
- Avoid N+1 queries with proper joins

### UI/UX
- Loading states for all async operations  
- Optimistic updates where appropriate
- Error boundaries for crash prevention
- Responsive design with Tailwind

## Deployment Notes

### Environment Setup
- Supabase project URL and anon key in client config
- No .env files used (client-side only)
- All secrets managed through Supabase dashboard

### Security Checklist
- RLS enabled on all tables
- Proper role-based policies
- Super admin access controlled
- File upload restrictions in place

## Future Enhancements

### Suggested Improvements
- Refactor large components (UserManagement.tsx, use-auth.tsx)
- Add real-time features using Supabase subscriptions
- Implement file storage for documents
- Add email notifications for role changes
- Create audit logs for admin actions

### Technical Debt
- Component size optimization needed
- Better error handling throughout
- More comprehensive TypeScript types
- Unit tests for critical functions

---

This knowledge base should be updated whenever major changes are made to the authentication system, database schema, or core functionality.
