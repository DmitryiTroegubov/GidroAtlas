import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Download, FileText, Calendar } from 'lucide-react';
import type { WaterObject } from '../types/database';

export function Reports() {
  const [objects, setObjects] = useState<WaterObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState<'all' | 'critical' | 'region'>('all');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [regions, setRegions] = useState<string[]>([]);

  useEffect(() => {
    loadObjects();
  }, []);

  const loadObjects = async () => {
    try {
      const { data } = await supabase.from('water_objects').select('*');
      const typedData = (data || []) as WaterObject[];
      setObjects(typedData);
      const uniqueRegions = Array.from(new Set(typedData.map((o) => o.region))).sort();
      setRegions(uniqueRegions as string[]);
      if (uniqueRegions.length > 0) {
        setSelectedRegion(uniqueRegions[0]);
      }
    } catch (error) {
      console.error('Error loading objects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredObjects = () => {
    let filtered = objects;

    if (reportType === 'critical') {
      filtered = filtered.filter((o) => o.technical_condition <= 2);
    } else if (reportType === 'region' && selectedRegion) {
      filtered = filtered.filter((o) => o.region === selectedRegion);
    }

    return filtered;
  };

  const generatePDF = () => {
    const filtered = getFilteredObjects();
    const content = `
ОТЧЕТ ПО ВОДНЫМ ОБЪЕКТАМ
Дата: ${new Date().toLocaleDateString('ru-RU')}
Тип отчета: ${reportType === 'critical' ? 'Критическое состояние' : reportType === 'region' ? `Регион: ${selectedRegion}` : 'Все объекты'}

Количество объектов: ${filtered.length}

${filtered
  .map(
    (obj, idx) => `
${idx + 1}. ${obj.name}
   Регион: ${obj.region}
   Тип: ${obj.resource_type}
   Тип воды: ${obj.water_type}
   Техническое состояние: ${obj.technical_condition}/5
   Фауна: ${obj.fauna ? 'Да' : 'Нет'}
   Приоритет: ${obj.priority || 'N/A'}
`
  )
  .join('\n')}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `report-${new Date().getTime()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredObjects = getFilteredObjects();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-600">Загрузка отчетов...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Отчеты</h1>
        <p className="text-gray-600">Создание и загрузка отчетов по водным объектам</p>
      </div>

      {/* Report Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Параметры отчета</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Тип отчета</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as typeof reportType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все объекты</option>
              <option value="critical">Критическое состояние</option>
              <option value="region">По регионам</option>
            </select>
          </div>

          {reportType === 'region' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Регион</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={generatePDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Скачать отчет</span>
        </button>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Предпросмотр отчета</h2>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-800">
            Отчет от {new Date().toLocaleDateString('ru-RU')} - объектов: {filteredObjects.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Название</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Регион</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Тип</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Состояние</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Приоритет</th>
              </tr>
            </thead>
            <tbody>
              {filteredObjects.map((obj) => (
                <tr key={obj.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{obj.name}</td>
                  <td className="py-3 px-4 text-gray-600">{obj.region}</td>
                  <td className="py-3 px-4 text-gray-600">{obj.resource_type}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        obj.technical_condition >= 4
                          ? 'bg-green-100 text-green-800'
                          : obj.technical_condition >= 3
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {obj.technical_condition}/5
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900 font-semibold">{obj.priority || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredObjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Нет данных для отображения</p>
          </div>
        )}
      </div>
    </div>
  );
}
