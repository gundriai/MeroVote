import { Vote } from "lucide-react";
import { Link, useLocation } from "wouter";

interface HeaderProps {
  stats?: { activeVoters?: number };
}

export default function Header({ stats }: HeaderProps) {
  const [location] = useLocation();
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-nepal-red rounded-lg flex items-center justify-center">
                <Vote className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">MeroVote</h1>
            </div>
            <span className="text-sm text-gray-600 font-english">गुणस्तर मतदान</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`text-gray-700 hover:text-nepal-red transition-colors${location === "/" ? " font-bold text-nepal-red" : ""}`}>
              होम
            </Link>
            <Link href="/admin" className={`text-gray-700 hover:text-nepal-red transition-colors${location === "/admin" ? " font-bold text-nepal-red" : ""}`}>
              एडमिन
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="w-3 h-3 bg-nepal-red rounded-full"></span>
              <span className="text-gray-600">{stats?.activeVoters ?? 0}</span>
              <span className="text-gray-500">सुरक्षित</span>
              <span className="w-3 h-3 bg-green-500 rounded-full ml-2"></span>
              <span className="text-gray-600">सत्यापित</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
