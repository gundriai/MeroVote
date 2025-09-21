# Login System Documentation

## Overview
This login system provides Google and Facebook authentication for the MeroVote application with a clean, modern UI design.

## Features
- ✅ Google OAuth integration (ready for implementation)
- ✅ Facebook OAuth integration (ready for implementation)
- ✅ Beautiful Material Design-inspired UI
- ✅ Mobile-responsive design
- ✅ Local storage token management
- ✅ Toast notifications for user feedback
- ✅ Internationalization support (English & Nepali)
- ✅ Clean, maintainable code structure

## File Structure
```
client/src/
├── components/
│   └── login.tsx              # Main login component
├── hooks/
│   └── use-auth.ts            # Authentication hook
├── lib/
│   └── api.ts                 # API configuration & utilities
└── locales/
    ├── en/translation.json    # English translations
    └── ne/translation.json    # Nepali translations
```

## How It Works

### 1. API Configuration (`lib/api.ts`)
- **Centralized endpoints** for all authentication operations
- **Type-safe API responses** with TypeScript interfaces
- **Error handling** and HTTP status management
- **Local storage utilities** for token management
- **OAuth redirect handling** for backend integration

### 2. Authentication Hook (`hooks/use-auth.ts`)
- **Manages authentication state** across the application
- **Provides login/logout functions** for components
- **Handles token storage** and user data management
- **Auto-checks authentication** on app startup

### 3. Login Component (`components/login.tsx`)
- **Beautiful UI** with gradient backgrounds and modern design
- **Google & Facebook login buttons** with loading states
- **Responsive design** that works on all devices
- **Toast notifications** for success/error feedback
- **OAuth redirect flow** that integrates with NestJS backend
- **Callback handling** for OAuth completion

## Usage

### Basic Implementation
```tsx
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (isAuthenticated) {
    return <div>Welcome, {user?.name}!</div>;
  }
  
  return <div>Please log in</div>;
}
```

### Route Protection
```tsx
// In your App.tsx or router
<Route path="/protected" component={ProtectedComponent} />

// Protected component
function ProtectedComponent() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <div>Protected content</div>;
}
```

## API Endpoints

### Authentication Endpoints
- `GET /auth/google` - Google OAuth login (redirects to Google)
- `GET /auth/facebook` - Facebook OAuth login (redirects to Facebook)
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/facebook/callback` - Facebook OAuth callback
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token

### OAuth Flow
1. **User clicks login button** → Frontend redirects to backend OAuth endpoint
2. **Backend handles OAuth** → Redirects user to Google/Facebook
3. **User authenticates** → Google/Facebook redirects back to backend callback
4. **Backend processes callback** → Redirects to frontend with tokens
5. **Frontend stores tokens** → User is logged in and redirected to home

### Response Format
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "avatar": "avatar_url"
    }
  }
}
```

## Environment Variables
```env
REACT_APP_API_URL=https://merovotebackend-app-hxb0g6deh8auc5gh.centralindia-01.azurewebsites.net/api
```

## Next Steps for Production

### 1. OAuth Integration
- **Google OAuth**: Implement Google Sign-In SDK
- **Facebook OAuth**: Implement Facebook Login SDK
- **Token validation**: Verify OAuth tokens on backend

### 2. Security Enhancements
- **HTTPS only**: Ensure all API calls use HTTPS
- **Token expiration**: Implement proper JWT expiration handling
- **Refresh token rotation**: Implement secure token refresh

### 3. Additional Features
- **Remember me**: Persistent login functionality
- **Two-factor authentication**: Enhanced security
- **Social profile sync**: Import profile data from providers

## Styling
The login page uses:
- **Tailwind CSS** for responsive design
- **Custom gradients** for modern aesthetics
- **Lucide React icons** for consistent iconography
- **Shadcn/ui components** for consistent UI patterns

## Browser Support
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Testing
```bash
# Run the development server
npm run dev

# Visit the login page
http://localhost:5173/login
```

## Troubleshooting

### Common Issues
1. **CORS errors**: Ensure backend allows frontend origin
2. **Token not saved**: Check localStorage permissions
3. **API errors**: Verify endpoint URLs and backend status

### Debug Mode
Enable console logging by adding:
```tsx
console.log('Auth response:', response);
```

## Contributing
When modifying the login system:
1. **Update types** in `lib/api.ts`
2. **Add translations** for new text
3. **Test on mobile devices**
4. **Update this documentation**
