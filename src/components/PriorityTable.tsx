import { ArrowUpDown } from 'lucide-react';
import type { WaterObject } from '../types/database';

interface PriorityTableProps {
  objects: WaterObject[];
  onObjectClick: (object: WaterObject) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
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

export function PriorityTable({ objects, onObjectClick, sortBy, sortOrder, onSort }: PriorityTableProps) {
  const getPriorityLevel = (priority: number | null) => {
    if (priority === null) return { label: 'Н/Д', className: 'bg-gray-100 text-gray-700' };
    if (priority >= 12) return { label: 'Высокий', className: 'bg-red-100 text-red-800' };
    if (priority >= 6) return { label: 'Средний', className: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Низкий', className: 'bg-green-100 text-green-800' };
  };

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 hover:text-blue-600 transition"
    >
      {children}
      <ArrowUpDown className="w-4 h-4" />
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Приоритет проверок</h2>
        <p className="text-sm text-gray-600 mt-1">
          Всего объектов: {objects.length}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                <SortButton field="name">Название</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                <SortButton field="region">Область</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                <SortButton field="resource_type">Тип</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                <SortButton field="technical_condition">Состояние</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                <SortButton field="priority">Приоритет</SortButton>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {objects.map((obj) => (
              <tr
                key={obj.id}
                onClick={() => onObjectClick(obj)}
                className="hover:bg-blue-50 cursor-pointer transition"
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {obj.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {obj.region}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {resourceTypeLabels[obj.resource_type]}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    obj.technical_condition === 5 ? 'bg-red-100 text-red-800' :
                    obj.technical_condition === 4 ? 'bg-orange-100 text-orange-800' :
                    obj.technical_condition === 3 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    Категория {obj.technical_condition}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {(() => {
                    const level = getPriorityLevel(obj.priority as number | null);
                    return (
                      <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${level.className}`}>
                        {level.label}
                        {obj.priority !== null && <span className="ml-2 text-gray-500">({obj.priority})</span>}
                      </span>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
