import { Languages, Vote, LogOut, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  stats?: { 
    activeVoters?: number;
    totalVotes?: number;
    activePolls?: number;
  };
}

export default function Header({ stats }: HeaderProps) {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: t('auth.logout_success', 'Logged out successfully'),
      description: t('auth.logout_message', 'You have been logged out'),
    });
  };
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-nepal-red rounded-lg flex items-center justify-center">
                <Vote className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">{t('header.app_name')}</h1>
            </div>
            
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`text-gray-700 hover:text-nepal-red transition-colors${location === "/" ? " font-bold text-nepal-red" : ""}`}>
              {t('header.nav.home')}
            </Link>
            {/* Only show admin link if user is authenticated and has admin role */}
            {isAuthenticated && user?.role === 'admin_user' && (
              <Link href="/admin" className={`text-gray-700 hover:text-nepal-red transition-colors${location === "/admin" ? " font-bold text-nepal-red" : ""}`}>
                {t('header.nav.admin')}
              </Link>
            )}
          </nav>
          
          {/* Right side - Auth section */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-nepal-red rounded-full flex items-center justify-center">
                    {user?.photo ? (
                      <img 
                        src={user.photo} 
                        alt={user.name || 'User'} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700 hidden sm:block">
                    {user?.name || user?.email || 'User'}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-red-600 hover:border-red-300"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  {t('header.nav.logout', 'Logout')}
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="text-nepal-red border-nepal-red hover:bg-nepal-red hover:text-white">
                  {t('header.nav.login', 'Login')}
                </Button>
              </Link>
            )}
          </div>
          {/* <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="w-3 h-3 bg-nepal-red rounded-full"></span>
              <span className="text-gray-600">{stats?.activeVoters ?? 0}</span>
              <span className="text-gray-500">{t('header.status.secure')}</span>
              <span className="w-3 h-3 bg-green-500 rounded-full ml-2"></span>
              <span className="text-gray-600">{t('header.status.verified')}</span>
            </div>
          </div> */}
        </div>
      </div>
    </header>
  );
}
