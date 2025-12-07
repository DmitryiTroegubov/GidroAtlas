import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Moon, Globe, Lock } from 'lucide-react';

export function Settings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('ru');
  const [savedMessage, setSavedMessage] = useState('');

  const handleSave = (section: string) => {
    setSavedMessage(`${section} сохранены`);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Настройки</h1>
        <p className="text-gray-600">Управление параметрами вашего аккаунта</p>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          ✓ {savedMessage}
        </div>
      )}

      {/* Profile Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Профиль</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Логин</label>
            <input
              type="text"
              value={user?.login || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Роль</label>
            <input
              type="text"
              value={user?.role === 'expert' ? 'Эксперт' : 'Гость'}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ID пользователя</label>
            <input
              type="text"
              value={user?.id || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <span>Уведомления</span>
        </h2>

        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700">Получать уведомления об обновлениях объектов</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-gray-700">Уведомления об объектах в критическом состоянии</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-gray-700">Еженедельная сводка</span>
          </label>

          <button
            onClick={() => handleSave('Уведомления')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Сохранить
          </button>
        </div>
      </div>

      {/* Display Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Moon className="w-5 h-5 text-blue-600" />
          <span>Отображение</span>
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Темная тема</span>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Язык</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
              <option value="kk">Қазақ</option>
            </select>
          </div>

          <button
            onClick={() => handleSave('Параметры отображения')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Сохранить
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Lock className="w-5 h-5 text-blue-600" />
          <span>Безопасность</span>
        </h2>

        <div className="space-y-4">
          <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-3 rounded-lg transition-colors text-left font-medium">
            Изменить пароль
          </button>

          <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-3 rounded-lg transition-colors text-left font-medium">
            Активные сессии
          </button>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Две-факторная аутентификация позволяет защитить ваш аккаунт
            </p>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg transition-colors font-medium">
              Включить 2FA
            </button>
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <span>Регион</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Часовой пояс</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>UTC+6 (Алматы)</option>
              <option>UTC+6 (Нур-Султан)</option>
              <option>UTC+5 (Западный Казахстан)</option>
            </select>
          </div>

          <button
            onClick={() => handleSave('Региональные параметры')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
