import { Languages, Vote } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "./LanguageSwitcher";

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
            <Link href="/admin" className={`text-gray-700 hover:text-nepal-red transition-colors${location === "/admin" ? " font-bold text-nepal-red" : ""}`}>
              {t('header.nav.admin')}
            </Link>
            <Link href="/login" className={`text-gray-700 hover:text-nepal-red transition-colors${location === "/login" ? " font-bold text-nepal-red" : ""}`}>
              {t('header.nav.login')}
            </Link>
          </nav>
          {/* <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="w-3 h-3 bg-nepal-red rounded-full"></span>
              <span className="text-gray-600">{stats?.activeVoters ?? 0}</span>
              <span className="text-gray-500">{t('header.status.secure')}</span>
              <span className="w-3 h-3 bg-green-500 rounded-full ml-2"></span>
              <span className="text-gray-600">{t('header.status.verified')}</span>
            </div>
          </div> */}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
