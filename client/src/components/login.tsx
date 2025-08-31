import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Chrome, Facebook } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authProvider, setAuthProvider] = useState<'google' | 'facebook' | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setAuthProvider('google');
      // Redirect to backend OAuth endpoint
      window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3300'}/auth/google`;
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('login_failed'),
        variant: 'destructive',
      });
      setIsLoading(false);
      setAuthProvider(null);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      setAuthProvider('facebook');
      window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3300'}/auth/facebook`;
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('login_failed'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setAuthProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">MV</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MeroVote</h1>
          <p className="text-gray-600">Welcome back! Please sign in to continue</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
            <p className="text-gray-600 text-sm">Choose your preferred sign-in method</p>
          </CardHeader>
          
          <CardContent className="space-y-4 px-8 pb-8">
            {/* Google Login Button */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 font-medium text-base"
            >
              {isLoading && authProvider === 'google' ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <Chrome className="w-5 h-5 mr-3 text-red-500" />
              )}
              {isLoading && authProvider === 'google' ? 'Signing in...' : 'Continue with Google'}
            </Button>

            {/* Facebook Login Button */}
            <Button
              onClick={handleFacebookLogin}
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white border-0 transition-all duration-200 font-medium text-base"
            >
              {isLoading && authProvider === 'facebook' ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <Facebook className="w-5 h-5 mr-3" />
              )}
              {isLoading && authProvider === 'facebook' ? 'Signing in...' : 'Continue with Facebook'}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Guest Access */}
            <Button
              variant="outline"
              className="w-full h-12 border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
              onClick={() => window.location.href = '/'}
            >
              Continue as Guest
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a> and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
