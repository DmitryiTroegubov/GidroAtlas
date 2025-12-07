import { useState, useEffect } from 'react';
import { fetchHardware, updateHardware } from '../lib/api';
import type { Hardware as HardwareType } from '../types/database';
import { Thermometer, Droplets, ToggleLeft, AlertCircle } from 'lucide-react';

export default function Hardware() {
  const [hardware, setHardware] = useState<HardwareType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadHardware();
  }, []);

  const loadHardware = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await fetchHardware();
    if (error) {
      setError(error.message || 'Не удалось загрузить данные оборудования');
      console.error('Ошибка загрузки оборудования:', error);
    } else {
      setHardware(data);
    }
    setLoading(false);
  };

  const handleRemoteControlChange = async (newValue: number) => {
    if (!hardware) return;

    setUpdating(true);
    setError(null);

    const { data, error } = await updateHardware({ remote_control: newValue });
    if (error) {
      setError(error.message || 'Не удалось обновить дистанционное управление');
      console.error('Ошибка обновления оборудования:', error);
    } else if (data) {
      setHardware(data);
    }
    setUpdating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Датчики оборудования и управление</h1>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-slate-600">Загрузка данных оборудования...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && hardware && (
          <div className="space-y-6">
            {/* Humidity Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Droplets className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-slate-600 font-medium">Влажность</p>
                    <p className="text-3xl font-bold text-slate-800">{hardware.humidity}%</p>
                  </div>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>ID: {hardware.id}</p>
                </div>
              </div>
            </div>

            {/* Temperature Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-slate-600 font-medium">Температура</p>
                    <p className="text-3xl font-bold text-slate-800">{hardware.temperature}°C</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Remote Control Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ToggleLeft className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-slate-600 font-medium">Дистанционное управление</p>
                    <p className="text-slate-500 text-sm">Текущее значение: {hardware.remote_control}</p>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleRemoteControlChange(1)}
                  disabled={updating || hardware.remote_control === 1}
                  className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                    hardware.remote_control === 1
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50'
                  }`}
                >
                  ВКЛ
                </button>
                <button
                  onClick={() => handleRemoteControlChange(0)}
                  disabled={updating || hardware.remote_control === 0}
                  className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                    hardware.remote_control === 0
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50'
                  }`}
                >
                  ВЫКЛ
                </button>
                <button
                  onClick={() => handleRemoteControlChange(-1)}
                  disabled={updating || hardware.remote_control === -1}
                  className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                    hardware.remote_control === -1
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50'
                  }`}
                >
                  АВТО
                </button>
              </div>

              {updating && (
                <p className="mt-4 text-center text-sm text-slate-500">Обновление...</p>
              )}
            </div>

            {/* Metadata */}
            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
              <p>Последнее обновление: {new Date(hardware.updated_at).toLocaleString('ru-RU')}</p>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadHardware}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            >
              Обновить данные
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
