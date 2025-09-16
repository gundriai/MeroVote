import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Check if user is authenticated and has admin role
    if (!isAuthenticated || user?.role !== 'admin_user') {
      // Show error message in Nepali
      toast({
        title: 'Access Denied',
        description: 'चतुर नबन',
        variant: 'destructive',
      });

      // Redirect to home after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  }, [isAuthenticated, user?.role, isLoading, navigate, toast]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-nepal-red mb-4"></div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // Show access denied message if not admin
  if (!isAuthenticated || user?.role !== 'admin_user') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">चतुर नबन</h2>
          <p className="text-gray-600 mb-4">Access denied. Redirecting to home...</p>
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-nepal-red"></div>
        </div>
      </div>
    );
  }

  // Render admin content if user is admin
  return <>{children}</>;
}
