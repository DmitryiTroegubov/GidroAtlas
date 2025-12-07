import { X } from 'lucide-react';
import { useState } from 'react';
import { insertWaterObject } from '../lib/api';
import type { WaterObject } from '../types/database';

interface AddObjectModalProps {
  onClose: () => void;
  onCreated: (obj: WaterObject) => void;
}

export function AddObjectModal({ onClose, onCreated }: AddObjectModalProps) {
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [resourceType, setResourceType] = useState<'lake' | 'canal' | 'reservoir'>('lake');
  const [waterType, setWaterType] = useState<'fresh' | 'non-fresh'>('fresh');
  const [fauna, setFauna] = useState(false);
  const [passportDate, setPassportDate] = useState('');
  const [technicalCondition, setTechnicalCondition] = useState<number>(3);
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !region || latitude === '' || longitude === '') {
      setError('Заполните обязательные поля');
      return;
    }

    setIsSubmitting(true);
    try {
      const insertObj: any = {
        name,
        region,
        resource_type: resourceType,
        water_type: waterType,
        fauna,
        passport_date: passportDate || null,
        technical_condition: technicalCondition,
        latitude: Number(latitude),
        longitude: Number(longitude),
        pdf_url: pdfUrl || null,
      };
      const { data, error: insertError } = await insertWaterObject(insertObj as Partial<WaterObject>);
      if (insertError) throw insertError;

      onCreated(data as WaterObject);
      onClose();
    } catch (err: any) {
      console.error('Error creating object:', err);
      setError(err?.message || 'Ошибка при создании объекта');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Добавить водный объект</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition"><X className="w-6 h-6 text-gray-600"/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">{error}</div>}

          <div>
            <label className="block text-sm text-gray-700 mb-1">Название *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded" required />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Область *</label>
            <input value={region} onChange={(e) => setRegion(e.target.value)} className="w-full px-3 py-2 border rounded" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Тип ресурса</label>
              <select value={resourceType} onChange={(e) => setResourceType(e.target.value as any)} className="w-full px-3 py-2 border rounded">
                <option value="lake">Озеро</option>
                <option value="canal">Канал</option>
                <option value="reservoir">Водохранилище</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Тип воды</label>
              <select value={waterType} onChange={(e) => setWaterType(e.target.value as any)} className="w-full px-3 py-2 border rounded">
                <option value="fresh">Пресная</option>
                <option value="non-fresh">Непресная</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Фауна</label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={fauna} onChange={(e) => setFauna(e.target.checked)} /> Есть
              </label>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Дата паспорта</label>
              <input type="date" value={passportDate} onChange={(e) => setPassportDate(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Техническое состояние</label>
              <select value={technicalCondition} onChange={(e) => setTechnicalCondition(Number(e.target.value))} className="w-full px-3 py-2 border rounded">
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Широта *</label>
              <input value={latitude === '' ? '' : String(latitude)} onChange={(e) => setLatitude(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 border rounded" required />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Долгота *</label>
              <input value={longitude === '' ? '' : String(longitude)} onChange={(e) => setLongitude(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 border rounded" required />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Ссылка на PDF (опционально)</label>
            <input value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Отмена</button>
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded">{isSubmitting ? 'Сохранение...' : 'Создать'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
