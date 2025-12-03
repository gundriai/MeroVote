import { Languages, Vote, LogOut, User, MoreVertical, ShieldCheck, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  stats?: {
    activeVoters?: number;
    totalVotes?: number;
    activePolls?: number;
  };
}

export default function Header({ stats }: HeaderProps) {
  const [location] = useLocation();
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: t('auth.logout_success', 'Logged out successfully'),
      description: t('auth.logout_message', 'You have been logged out'),
    });
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-16">

          {/* Left Side: Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src="/assets/icons/android-chrome-512x512.png" alt="MeroVote Logo" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 hidden md:block">{t('header.app_name')}</h1>
              </div>
            </Link>
          </div>

          {/* Center (Mobile) / Left (Desktop): Nav Links */}
          <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:transform-none md:ml-6 flex items-center space-x-4 md:space-x-6">
            <Link href="/" className={`text-sm md:text-base text-gray-700 hover:text-nepal-red transition-colors${location === "/" ? " font-bold text-nepal-red" : ""}`}>
              {t('header.nav.home')}
            </Link>
            <Link href="/revolution-journey" className={`text-sm md:text-base text-gray-700 hover:text-nepal-red transition-colors${location === "/revolution-journey" || location === "/martyrs-wall" ? " font-bold text-nepal-red" : ""}`}>
              {t('header.nav.martyrs_wall', 'सहिद पर्खाल')}
            </Link>
          </nav>

          {/* Right Side: Desktop Menu & Mobile Menu Button */}
          <div className="flex items-center">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Admin Link */}
              {isAuthenticated && user?.role === 'admin_user' && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className={`text-gray-700 hover:text-nepal-red${location === "/admin" ? " text-nepal-red font-bold" : ""}`}>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {t('header.nav.admin')}
                  </Button>
                </Link>
              )}

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
                    <span className="text-sm text-gray-700 hidden lg:block">
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

            {/* Mobile Menu (Three Dots) */}
            <div className="md:hidden flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <MoreVertical className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{isAuthenticated ? (user?.name || 'My Account') : 'Menu'}</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={toggleLanguage}>
                    <Languages className="mr-2 h-4 w-4" />
                    <span>{i18n.language === 'en' ? 'नेपाली' : 'English'}</span>
                  </DropdownMenuItem>

                  {isAuthenticated && user?.role === 'admin_user' && (
                    <Link href="/admin">
                      <DropdownMenuItem>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>{t('header.nav.admin')}</span>
                      </DropdownMenuItem>
                    </Link>
                  )}

                  <DropdownMenuSeparator />

                  {isAuthenticated ? (
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('header.nav.logout', 'Logout')}</span>
                    </DropdownMenuItem>
                  ) : (
                    <Link href="/login">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>{t('header.nav.login', 'Login')}</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
