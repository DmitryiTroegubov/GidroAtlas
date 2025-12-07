import { BarChart3, Droplets, FileText, Settings, Users, LogOut, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Page = 'dashboard' | 'statistics' | 'reports' | 'settings' | 'users' | 'objects' | 'chatbot' | 'hardware';

interface NavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Droplets className="w-7 h-7" />
            <span className="font-bold text-lg">ГидроАтлас</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink
              icon={<BarChart3 className="w-3 h-3" />}
              label="Обзор"
              active={currentPage === 'dashboard'}
              onClick={() => onPageChange('dashboard')}
            />
            <NavLink
              icon={<FileText className="w-3 h-3" />}
              label="Статистика"
              active={currentPage === 'statistics'}
              onClick={() => onPageChange('statistics')}
            />
            <NavLink
              icon={<BarChart3 className="w-3 h-3" />}
              label="Отчеты"
              active={currentPage === 'reports'}
              onClick={() => onPageChange('reports')}
            />
            {user?.role === 'expert' && (
              <>
                <NavLink
                  icon={<Users className="w-3 h-3" />}
                  label="Пользователи"
                  active={currentPage === 'users'}
                  onClick={() => onPageChange('users')}
                />
                <NavLink
                  icon={<Droplets className="w-3 h-3" />}
                  label="Объекты"
                  active={currentPage === 'objects'}
                  onClick={() => onPageChange('objects')}
                />
                <NavLink
                  icon={<BarChart3 className="w-3 h-3" />}
                  label="Оборудование"
                  active={currentPage === 'hardware'}
                  onClick={() => onPageChange('hardware')}
                />
              </>
            )}
            <NavLink
              icon={<Settings className="w-3 h-3" />}
              label="Настройки"
              active={currentPage === 'settings'}
              onClick={() => onPageChange('settings')}
            />
            <NavLink
              icon={<MessageCircle className="w-3 h-3" />}
              label="Чат"
              active={currentPage === 'chatbot'}
              onClick={() => onPageChange('chatbot')}
            />
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1">
              <div className="w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
                {user?.login?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-medium">{user?.login}</p>
                <p className="text-[10px] text-blue-100">
                  {user?.role === 'expert' ? 'Эксперт' : 'Гость'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 text-white px-2 py-1 rounded-lg flex items-center space-x-1 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline text-xs">Выход</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-1 pb-2 overflow-x-auto">
          <MobileNavLink
            icon={<BarChart3 className="w-3 h-3" />}
            label="Обзор"
            active={currentPage === 'dashboard'}
            onClick={() => onPageChange('dashboard')}
          />
          <MobileNavLink
            icon={<FileText className="w-3 h-3" />}
            label="Статистика"
            active={currentPage === 'statistics'}
            onClick={() => onPageChange('statistics')}
          />
          <MobileNavLink
            icon={<BarChart3 className="w-3 h-3" />}
            label="Отчеты"
            active={currentPage === 'reports'}
            onClick={() => onPageChange('reports')}
          />
          {user?.role === 'expert' && (
            <MobileNavLink
              icon={<Users className="w-3 h-3" />}
              label="Пользователи"
              active={currentPage === 'users'}
              onClick={() => onPageChange('users')}
            />
          )}
          <MobileNavLink
            icon={<Settings className="w-3 h-3" />}
            label="Настройки"
            active={currentPage === 'settings'}
            onClick={() => onPageChange('settings')}
          />
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors ${
        active ? 'bg-blue-700' : 'hover:bg-blue-500'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function MobileNavLink({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg text-[10px] whitespace-nowrap transition-colors ${
        active ? 'bg-blue-700' : 'hover:bg-blue-500'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}