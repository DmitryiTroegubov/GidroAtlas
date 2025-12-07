import { useState, useEffect } from 'react';
import { fetchWaterObjects, deleteWaterObject, updateWaterObject } from '../lib/api';
import { Trash2, Edit2, Droplets } from 'lucide-react';
import type { WaterObject } from '../types/database';

export function Objects() {
  const [objects, setObjects] = useState<WaterObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingObject, setEditingObject] = useState<WaterObject | null>(null);
  const [editForm, setEditForm] = useState<Partial<WaterObject>>({});

  useEffect(() => {
    loadObjects();
  }, []);

  const loadObjects = async () => {
    try {
      const { data, error } = await fetchWaterObjects();
      if (error) throw error;
      setObjects((data || []) as WaterObject[]);
    } catch (error) {
      console.error('Error loading objects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteObject = async (objectId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот объект?')) return;

    try {
      const { error } = await deleteWaterObject(objectId);
      if (error) {
        console.error('Error deleting object:', error);
        alert('Ошибка при удалении объекта: ' + (error?.message || JSON.stringify(error)));
        return;
      }
      console.log('Object deleted:', objectId);
      loadObjects();
    } catch (error) {
      console.error('Error deleting object (catch):', error);
      const msg = (error as any)?.message ? (error as any).message : String(error);
      alert('Ошибка при удалении объекта: ' + msg);
    }
  };

  const openEdit = (obj: WaterObject) => {
    setEditingObject(obj);
    setEditForm(obj);
  };

  const closeEdit = () => {
    setEditingObject(null);
    setEditForm({});
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingObject) return;
    try {
      const payload: any = {
        name: editForm.name,
        region: editForm.region,
        resource_type: editForm.resource_type,
        water_type: editForm.water_type,
        fauna: editForm.fauna,
        technical_condition: editForm.technical_condition,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        pdf_url: editForm.pdf_url,
      };
      const { error } = await updateWaterObject(editingObject.id, payload);
      if (error) {
        console.error('Error updating object:', error);
        alert('Ошибка при обновлении объекта: ' + (error?.message || JSON.stringify(error)));
        return;
      }
      console.log('Object updated:', editingObject.id);
      closeEdit();
      loadObjects();
    } catch (err) {
      console.error('Error saving object edit:', err);
      const msg = (err as any)?.message ? (err as any).message : String(err);
      alert('Ошибка при обновлении объекта: ' + msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-600">Загрузка объектов...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление водными объектами</h1>
          <p className="text-gray-600">Всего объектов: {objects.length}</p>
        </div>
      </div>

      {/* Objects Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Название</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Область</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Тип</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Состояние</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Приоритет</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Действия</th>
              </tr>
            </thead>
            <tbody>
              {objects.map((obj) => (
                <tr key={obj.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{obj.name}</td>
                  <td className="px-4 py-3 text-gray-600">{obj.region}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">
                    {obj.resource_type === 'lake' ? 'Озеро' : obj.resource_type === 'canal' ? 'Канал' : 'Водохранилище'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{obj.technical_condition}/5</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{obj.priority ?? 'N/A'}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEdit(obj)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Редактировать"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteObject(obj.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Удалить"
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

        {objects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Droplets className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Нет объектов</p>
          </div>
        )}
      </div>

      {/* Edit Object Modal */}
      {editingObject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Редактировать объект</h3>
              <button onClick={closeEdit} className="text-gray-600 hover:text-gray-900 text-2xl leading-none">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Область</label>
                  <input
                    type="text"
                    value={editForm.region || ''}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тип ресурса</label>
                  <select
                    value={editForm.resource_type || 'lake'}
                    onChange={(e) => setEditForm({ ...editForm, resource_type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="lake">Озеро</option>
                    <option value="canal">Канал</option>
                    <option value="reservoir">Водохранилище</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тип воды</label>
                  <select
                    value={editForm.water_type || 'fresh'}
                    onChange={(e) => setEditForm({ ...editForm, water_type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="fresh">Пресная</option>
                    <option value="non-fresh">Непресная</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Техническое состояние</label>
                  <select
                    value={editForm.technical_condition || 3}
                    onChange={(e) => setEditForm({ ...editForm, technical_condition: Number(e.target.value) as any })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Широта</label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={editForm.latitude || ''}
                    onChange={(e) => setEditForm({ ...editForm, latitude: Number(e.target.value) as any })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Долгота</label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={editForm.longitude || ''}
                    onChange={(e) => setEditForm({ ...editForm, longitude: Number(e.target.value) as any })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Фауна</label>
                  <select
                    value={editForm.fauna ? 'true' : 'false'}
                    onChange={(e) => setEditForm({ ...editForm, fauna: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="true">Да</option>
                    <option value="false">Нет</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка на PDF</label>
                <input
                  type="text"
                  value={editForm.pdf_url || ''}
                  onChange={(e) => setEditForm({ ...editForm, pdf_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={closeEdit} className="px-4 py-2 border rounded hover:bg-gray-50">
                  Отмена
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Всего объектов</p>
              <p className="text-3xl font-bold text-gray-900">{objects.length}</p>
            </div>
            <Droplets className="w-8 h-8 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Озер</p>
              <p className="text-3xl font-bold text-gray-900">{objects.filter(o => o.resource_type === 'lake').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Каналов</p>
              <p className="text-3xl font-bold text-gray-900">{objects.filter(o => o.resource_type === 'canal').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Водохранилищ</p>
              <p className="text-3xl font-bold text-gray-900">{objects.filter(o => o.resource_type === 'reservoir').length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
