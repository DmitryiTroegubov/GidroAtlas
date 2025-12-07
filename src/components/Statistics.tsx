import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import type { WaterObject } from '../types/database';

export function Statistics() {
  const [objects, setObjects] = useState<WaterObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadObjects();
  }, []);

  const loadObjects = async () => {
    try {
      const { data } = await supabase.from('water_objects').select('*');
      setObjects(data || []);
    } catch (error) {
      console.error('Error loading objects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: objects.length,
      byType: {
        lake: objects.filter((o) => o.resource_type === 'lake').length,
        canal: objects.filter((o) => o.resource_type === 'canal').length,
        reservoir: objects.filter((o) => o.resource_type === 'reservoir').length,
      },
      byWaterType: {
        fresh: objects.filter((o) => o.water_type === 'fresh').length,
        nonFresh: objects.filter((o) => o.water_type === 'non-fresh').length,
      },
      withFauna: objects.filter((o) => o.fauna).length,
      avgCondition:
        objects.length > 0
          ? (
              objects.reduce((sum, o) => sum + o.technical_condition, 0) /
              objects.length
            ).toFixed(1)
          : 0,
      byRegion: Array.from(
        new Set(objects.map((o) => o.region))
      ).length,
      goodCondition: objects.filter((o) => o.technical_condition >= 4).length,
      poorCondition: objects.filter((o) => o.technical_condition <= 2).length,
    };
  }, [objects]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-600">Загрузка статистики...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Статистика водных объектов</h1>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          title="Всего объектов"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={<AlertCircle className="w-6 h-6" />}
          title="Регионов"
          value={stats.byRegion}
          color="purple"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Среднее состояние"
          value={`${stats.avgCondition}/5`}
          color="green"
        />
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="С фауной"
          value={stats.withFauna}
          color="orange"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Resource Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">По типам ресурсов</h2>
          <div className="space-y-4">
            <StatRow label="Озера" value={stats.byType.lake} total={stats.total} />
            <StatRow label="Каналы" value={stats.byType.canal} total={stats.total} />
            <StatRow label="Водохранилища" value={stats.byType.reservoir} total={stats.total} />
          </div>
        </div>

        {/* By Water Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">По типам воды</h2>
          <div className="space-y-4">
            <StatRow label="Пресная" value={stats.byWaterType.fresh} total={stats.total} />
            <StatRow label="Соленая" value={stats.byWaterType.nonFresh} total={stats.total} />
          </div>
        </div>

        {/* By Condition */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">По техническому состоянию</h2>
          <div className="space-y-4">
            <StatRow label="Хорошее (4-5)" value={stats.goodCondition} total={stats.total} />
            <StatRow label="Плохое (1-2)" value={stats.poorCondition} total={stats.total} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className={`${colorClasses[color]} rounded-lg p-3 w-fit mb-4`}>
        {icon}
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

function StatRow({ label, value, total }: { label: string; value: number; total: number }) {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-700 text-sm font-medium">{label}</span>
        <span className="text-gray-900 font-semibold">
          {value} ({percentage}%)
        </span>
      </div>
      <div className="bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 rounded-full h-2 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
