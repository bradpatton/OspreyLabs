# Admin Authentication System

This document describes the secure admin authentication system implemented for the Osprey Labs website.

## Overview

The admin authentication system provides secure access to administrative functions including article management, chat logs, contact submissions, and more. All admin pages are protected by server-side key validation.

## Security Features

### 1. **Server-Side Validation**
- Admin keys are validated against the server on every access attempt
- No client-side only authentication
- Keys are verified using environment variables

### 2. **Automatic Key Validation**
- Stored admin keys are re-validated on page load
- Invalid or expired keys are automatically removed
- Users are redirected to login if validation fails

### 3. **Secure Storage**
- Admin keys are stored in browser localStorage
- Keys are cleared on logout or validation failure
- No sensitive data exposed in client code

### 4. **Protected Routes**
- All `/admin/*` routes require valid authentication
- Consistent authentication across all admin pages
- Centralized authentication logic

## Components

### AdminAuth Component (`src/components/AdminAuth.tsx`)
The main authentication wrapper that protects admin pages.

**Features:**
- Validates admin keys on component mount
- Provides login form for unauthenticated users
- Handles logout functionality
- Includes admin navigation
- Shows loading states during validation

**Usage:**
```tsx
import AdminAuth from '@/components/AdminAuth';

export default function AdminPage() {
  return (
    <AdminAuth>
      {/* Your admin page content */}
    </AdminAuth>
  );
}
```

### AdminNav Component (`src/components/AdminNav.tsx`)
Navigation component for admin pages.

**Features:**
- Tab-style navigation between admin sections
- Active page highlighting
- Responsive design
- Icon-based navigation

### API Validation Endpoint (`src/app/api/auth/validate/route.ts`)
Server endpoint for validating admin keys.

**Endpoint:** `POST /api/auth/validate`
**Headers:** `x-admin-key: your-admin-key`
**Response:** `{ valid: true }` or `401 Unauthorized`

## Configuration

### Environment Variables

Add to your `.env.local` file:

```env
ADMIN_API_KEY=your-secure-admin-key-here
```

**Important:** Use a strong, unique key for production environments.

### Recommended Admin Key Format
- Minimum 20 characters
- Mix of letters, numbers, and special characters
- Example: `osprey-admin-2024-secure-key-xyz789`

## Admin Pages

### 1. **Dashboard** (`/admin`)
- Overview of all admin sections
- Quick navigation to different areas
- Statistics placeholder (for future implementation)

### 2. **Articles** (`/admin/articles`)
- Create, edit, and delete articles
- Manage article status (draft/published)
- Rich content editing with markdown support

### 3. **Chat Logs** (`/admin/chat-logs`)
- View chat conversations
- Export chat threads
- Analyze user interactions

### 4. **Contact Submissions** (`/admin/contact-submissions`)
- Review contact form submissions
- Manage customer inquiries

### 5. **Job Applications** (`/admin/job-applications`)
- Review job applications
- Manage candidate information

### 6. **API Documentation** (`/admin/api-docs`)
- View API documentation
- Endpoint reference

## Usage Instructions

### For Administrators

1. **Initial Access:**
   - Navigate to any `/admin/*` URL
   - Enter the admin key when prompted
   - Key will be remembered for future sessions

2. **Navigation:**
   - Use the top navigation tabs to switch between sections
   - Dashboard provides overview and quick access
   - Logout button is available in the top-right corner

3. **Session Management:**
   - Keys are automatically validated on page load
   - Invalid keys are cleared and require re-login
   - Logout clears the stored key

### For Developers

1. **Adding New Admin Pages:**
   ```tsx
   import AdminAuth from '@/components/AdminAuth';
   
   export default function NewAdminPage() {
     return (
       <AdminAuth>
         <div className="container py-8">
           {/* Your admin content */}
         </div>
       </AdminAuth>
     );
   }
   ```

2. **Making Authenticated API Calls:**
   ```tsx
   const getAdminKey = () => localStorage.getItem('adminKey') || '';
   
   const response = await fetch('/api/your-endpoint', {
     headers: {
       'x-admin-key': getAdminKey(),
     },
   });
   ```

3. **Adding to Navigation:**
   Update `src/components/AdminNav.tsx` to include new pages in the navigation.

## Security Best Practices

### 1. **Key Management**
- Use environment variables for admin keys
- Never commit keys to version control
- Rotate keys regularly in production
- Use different keys for different environments

### 2. **Access Control**
- Limit admin key distribution
- Monitor admin access logs
- Implement key expiration if needed
- Use HTTPS in production

### 3. **Development**
- Use different keys for development/staging/production
- Test authentication flows thoroughly
- Validate all admin endpoints require authentication

## API Integration

### Protecting API Endpoints

All admin API endpoints should include authentication:

```typescript
// Example API route protection
import { NextResponse } from 'next/server';

function verifyAdminKey(request: Request): boolean {
  const adminKey = request.headers.get('x-admin-key');
  const expectedKey = process.env.ADMIN_API_KEY;
  return adminKey === expectedKey;
}

export async function POST(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Your protected logic here
}
```

### Client-Side API Calls

```typescript
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const adminKey = localStorage.getItem('adminKey');
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'x-admin-key': adminKey || '',
    },
  });
};
```

## Troubleshooting

### Common Issues

1. **"Unauthorized" Error:**
   - Check that `ADMIN_API_KEY` is set in `.env.local`
   - Verify the key matches what you're entering
   - Restart the development server after changing environment variables

2. **Login Form Keeps Appearing:**
   - Clear browser localStorage: `localStorage.removeItem('adminKey')`
   - Check browser console for validation errors
   - Verify the API validation endpoint is working

3. **Navigation Not Working:**
   - Ensure all admin pages use the `AdminAuth` component
   - Check that the `AdminNav` component is properly imported

### Development Tips

1. **Testing Authentication:**
   ```bash
   # Test the validation endpoint
   curl -X POST http://localhost:3000/api/auth/validate \
     -H "x-admin-key: your-admin-key"
   ```

2. **Debugging:**
   - Check browser Network tab for failed requests
   - Look for console errors in browser DevTools
   - Verify environment variables are loaded

## Future Enhancements

### Planned Features
- [ ] Role-based access control
- [ ] Session expiration
- [ ] Activity logging
- [ ] Multi-factor authentication
- [ ] Admin user management
- [ ] Audit trails

### Database Integration
Currently using file-based storage. Consider migrating to:
- PostgreSQL for production
- User management system
- Session management
- Audit logging

## Migration Guide

### From Individual Authentication
If you have existing admin pages with their own authentication:

1. Remove individual authentication logic
2. Wrap pages with `AdminAuth` component
3. Update API calls to use `getAdminKey()` helper
4. Remove duplicate login forms
5. Test all admin functionality

### Example Migration
```tsx
// Before
export default function OldAdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  // ... authentication logic
  
  if (!isAuth) return <LoginForm />;
  return <AdminContent />;
}

// After
export default function NewAdminPage() {
  return (
    <AdminAuth>
      <AdminContent />
    </AdminAuth>
  );
}
```

## Support

For issues or questions about the admin authentication system:
1. Check this documentation
2. Review the troubleshooting section
3. Check browser console for errors
4. Verify environment configuration

The admin authentication system provides a secure, user-friendly way to protect administrative functions while maintaining a consistent experience across all admin pages. 