import { useState, useEffect } from 'react';
import { fetchUsers, insertUser, deleteUser, updateUserRole, updateUser } from '../lib/api';
import { UserPlus, Trash2, Edit2, Shield, Users as UsersIcon } from 'lucide-react';
import type { User as DBUser } from '../types/database';

interface ExtendedUser extends DBUser {
  last_login?: string;
}

export function Users() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ login: '', password: '', role: 'guest' as 'guest' | 'expert' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await fetchUsers();
      if (error) throw error;
      setUsers((data || []) as ExtendedUser[]);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.login || !newUser.password) return;

    try {
      const { error } = await insertUser({ login: newUser.login, password_hash: newUser.password, role: newUser.role });
      if (error) throw error;

      setNewUser({ login: '', password: '', role: 'guest' });
      setShowAddForm(false);
      loadUsers();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      const { error } = await deleteUser(userId);
      if (error) {
        console.error('Error deleting user:', error);
        // show visible error to the user
        alert('Ошибка при удалении пользователя: ' + (error.message || JSON.stringify(error)));
        return;
      }
      // success
      console.log('User deleted:', userId);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user (catch):', error);
      const msg = (error as any)?.message ? (error as any).message : String(error);
      alert('Ошибка при удалении пользователя: ' + msg);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'guest' | 'expert') => {
    try {
      const { error } = await updateUserRole(userId, newRole);
      if (error) throw error;
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Edit user modal
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null);
  const [editForm, setEditForm] = useState({ login: '', password: '', role: 'guest' as 'guest' | 'expert' });

  const openEdit = (u: ExtendedUser) => {
    setEditingUser(u);
    setEditForm({ login: u.login, password: '', role: u.role });
  };

  const closeEdit = () => {
    setEditingUser(null);
    setEditForm({ login: '', password: '', role: 'guest' });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const payload: any = { login: editForm.login, role: editForm.role };
      if (editForm.password) payload.password_hash = editForm.password;
      const { error } = await updateUser(editingUser.id, payload);
      if (error) throw error;
      closeEdit();
      loadUsers();
    } catch (err) {
      console.error('Error saving user edit:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-600">Загрузка пользователей...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление пользователями</h1>
          <p className="text-gray-600">Всего пользователей: {users.length}</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Добавить пользователя</span>
        </button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Новый пользователь</h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Логин"
                value={newUser.login}
                onChange={(e) => setNewUser({ ...newUser, login: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="password"
                placeholder="Пароль"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'guest' | 'expert' })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="guest">Гость</option>
                <option value="expert">Эксперт</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Создать
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Логин</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Роль</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Создано</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                        {user.login[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{user.login}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value as 'guest' | 'expert')}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="guest">Гость</option>
                      <option value="expert">Эксперт</option>
                    </select>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEdit(user)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <UsersIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Нет пользователей</p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Редактировать пользователя</h3>
              <button onClick={closeEdit} className="text-gray-600 hover:text-gray-900">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input value={editForm.login} onChange={(e) => setEditForm({ ...editForm, login: e.target.value })} className="px-4 py-2 border rounded" />
                <input placeholder="Новый пароль (оставьте пустым чтобы не менять)" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className="px-4 py-2 border rounded" />
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'guest' | 'expert' })} className="px-4 py-2 border rounded">
                  <option value="guest">Гость</option>
                  <option value="expert">Эксперт</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeEdit} className="px-4 py-2 border rounded">Отмена</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Всего пользователей</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Экспертов</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter((u) => u.role === 'expert').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Гостей</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter((u) => u.role === 'guest').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-orange-600 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
