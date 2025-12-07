import { Search, X } from 'lucide-react';

export interface FilterState {
  region: string;
  resourceType: string;
  waterType: string;
  fauna: string;
  technicalCondition: string;
  passportDateFrom?: string;
  passportDateTo?: string;
  searchQuery: string;
}

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  regions: string[];
  isExpert: boolean;
}

export function Filters({ filters, onFiltersChange, regions, isExpert }: FiltersProps) {
  const handleChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      region: '',
      resourceType: '',
      waterType: '',
      fauna: '',
      technicalCondition: '',
      searchQuery: '',
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) =>
    key !== 'searchQuery' && value !== '' && value !== undefined
  );

  

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Фильтры</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Очистить
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={filters.searchQuery}
          onChange={(e) => handleChange('searchQuery', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Область
        </label>
        <select
          value={filters.region}
          onChange={(e) => handleChange('region', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Все области</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Тип ресурса
        </label>
        <select
          value={filters.resourceType}
          onChange={(e) => handleChange('resourceType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Все типы</option>
          <option value="lake">Озеро</option>
          <option value="canal">Канал</option>
          <option value="reservoir">Водохранилище</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Тип воды
        </label>
        <select
          value={filters.waterType}
          onChange={(e) => handleChange('waterType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Все типы</option>
          <option value="fresh">Пресная</option>
          <option value="non-fresh">Непресная</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Наличие фауны
        </label>
        <select
          value={filters.fauna}
          onChange={(e) => handleChange('fauna', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Все</option>
          <option value="true">Да</option>
          <option value="false">Нет</option>
        </select>
      </div>

      {/* Date range - expert only */}
      {isExpert && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Дата паспорта (от)</label>
            <input
              type="date"
              value={filters.passportDateFrom || ''}
              onChange={(e) => handleChange('passportDateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Дата паспорта (до)</label>
            <input
              type="date"
              value={filters.passportDateTo || ''}
              onChange={(e) => handleChange('passportDateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {isExpert && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Техническое состояние
          </label>
          <select
            value={filters.technicalCondition}
            onChange={(e) => handleChange('technicalCondition', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все категории</option>
            <option value="1">Категория 1 (отличное)</option>
            <option value="2">Категория 2 (хорошее)</option>
            <option value="3">Категория 3 (удовлетворительное)</option>
            <option value="4">Категория 4 (плохое)</option>
            <option value="5">Категория 5 (критическое)</option>
          </select>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded-full"></span>
            <span>1-2</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
            <span>3</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-orange-400 rounded-full"></span>
            <span>4</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-500 rounded-full"></span>
            <span>5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
