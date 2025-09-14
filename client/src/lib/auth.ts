export interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// Get user from localStorage
export function getUserFromStorage(): User | null {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
  }
  return null;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const user = getUserFromStorage();
  return user !== null && !!user.userId;
}

// Get current user
export function getCurrentUser(): User | null {
  return getUserFromStorage();
}

// Get user ID
export function getUserId(): string | null {
  const user = getCurrentUser();
  return user?.userId || null;
}

// Get user name
export function getUserName(): string | null {
  const user = getCurrentUser();
  return user?.name || null;
}

// Check if user has admin role
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin_user';
}

// Logout user
export function logout(): void {
  localStorage.removeItem('user');
  // Optionally redirect to login page
  window.location.href = '/';
}
