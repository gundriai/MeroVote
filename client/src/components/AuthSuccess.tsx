import { useLocation } from "wouter";
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
export default function AuthSuccess() {
  const { login } = useAuth();
  const { toast } = useToast();
const [, navigate] = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log('Url parameters fetched from service',urlParams);
    const accessToken = urlParams.get('access_token');

    if (!accessToken) {
      toast({
        title: 'Error',
        description: 'Missing access token',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    // Save token & fetch user profile
    (async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3300'}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const user = await response.json();

        login(user, accessToken);

        toast({
          title: 'Success',
          description: 'Login successful!',
        });

        navigate('/');
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'Login failed',
          variant: 'destructive',
        });
        navigate('/login');
      }
    })();
  }, [login,]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="text-lg text-gray-600">Authenticating...</span>
    </div>
  );
}
