import { X, FileText } from 'lucide-react';
import type { WaterObject } from '../types/database';

interface ObjectCardProps {
  object: WaterObject;
  onClose: () => void;
  onViewPdf: (url: string | null) => void;
}

const resourceTypeLabels: Record<string, string> = {
  lake: 'Озеро',
  canal: 'Канал',
  reservoir: 'Водохранилище',
};

const waterTypeLabels: Record<string, string> = {
  fresh: 'Пресная',
  'non-fresh': 'Непресная',
};

const conditionColors: Record<number, string> = {
  1: 'bg-green-500',
  2: 'bg-green-400',
  3: 'bg-yellow-400',
  4: 'bg-orange-400',
  5: 'bg-red-500',
};

export function ObjectCard({ object, onClose, onViewPdf }: ObjectCardProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">{object.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Область</p>
              <p className="font-medium text-gray-800">{object.region}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Тип ресурса</p>
              <p className="font-medium text-gray-800">
                {resourceTypeLabels[object.resource_type]}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Тип воды</p>
              <p className="font-medium text-gray-800">
                {waterTypeLabels[object.water_type]}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Наличие фауны</p>
              <p className="font-medium text-gray-800">
                {object.fauna ? 'Да' : 'Нет'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Дата паспорта</p>
              <p className="font-medium text-gray-800">
                {new Date(object.passport_date).toLocaleDateString('ru-RU')}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Техническое состояние</p>
              <div className="flex items-center gap-2">
                <span
                  className={`w-8 h-8 rounded-full ${conditionColors[object.technical_condition]} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {object.technical_condition}
                </span>
                <span className="text-sm text-gray-600">Категория {object.technical_condition}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Координаты</p>
              <p className="font-medium text-gray-800 text-sm">
                {object.latitude.toFixed(6)}, {object.longitude.toFixed(6)}
              </p>
            </div>

            {object.priority !== null && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Приоритет проверки</p>
                <p className="font-medium text-gray-800">
                  {object.priority >= 12 ? '🔴 Высокий' : object.priority >= 6 ? '🟡 Средний' : '🟢 Низкий'}
                  {' '}({object.priority})
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => onViewPdf(object.pdf_url)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Открыть паспорт
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
