import { useState, useEffect, useMemo } from 'react';
import { LogOut, Droplets } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MapView } from './MapView';
import { Filters, FilterState } from './Filters';
import { PriorityTable } from './PriorityTable';
import { ObjectCard } from './ObjectCard';
import { PdfViewer } from './PdfViewer';
import { AddObjectModal } from './AddObjectModal';
import type { WaterObject } from '../types/database';
import { fetchWaterObjects } from '../lib/api';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [objects, setObjects] = useState<WaterObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<WaterObject | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<FilterState>({
    region: '',
    resourceType: '',
    waterType: '',
    fauna: '',
    technicalCondition: '',
    searchQuery: '',
  });

  const isExpert = user?.role === 'expert';
  const [showLakes, setShowLakes] = useState(true);
  const [showCanals, setShowCanals] = useState(true);
  const [showReservoirs, setShowReservoirs] = useState(true);
  const [showAddObjectModal, setShowAddObjectModal] = useState(false);

  useEffect(() => {
    loadObjects();
  }, []);

  const loadObjects = async () => {
    try {
      const { data: typedData, error } = await fetchWaterObjects();
      const typed = (typedData || []) as WaterObject[];

      // Compute priority on the client using the formula:
      // PriorityScore = (6 - technical_condition) * 3 + age_in_years
      const now = new Date();
      const computePriority = (obj: WaterObject): number | null => {
        if (!obj.passport_date) return null;
        const pd = new Date(obj.passport_date);
        if (isNaN(pd.getTime())) return null;
        const ageYears = Math.floor((now.getTime() - pd.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const condition = obj.technical_condition || 1;
        const score = (6 - condition) * 3 + Math.max(0, ageYears);
        return score;
      };

      const withPriority = typed.map((o) => ({ ...o, priority: o.priority ?? computePriority(o) }));

      console.log(`✓ Loaded ${withPriority.length} water objects`);
      if (withPriority.length > 0) {
        console.log('First object sample:', withPriority[0]);
      }
      setObjects(withPriority);
    } catch (error) {
      console.error('Error loading objects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recalcPriorities = () => {
    const now = new Date();
    const computePriority = (obj: WaterObject): number | null => {
      if (!obj.passport_date) return null;
      const pd = new Date(obj.passport_date);
      if (isNaN(pd.getTime())) return null;
      const ageYears = Math.floor((now.getTime() - pd.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      const condition = obj.technical_condition || 1;
      return (6 - condition) * 3 + Math.max(0, ageYears);
    };

    setObjects((prev) => prev.map((o) => ({ ...o, priority: computePriority(o) })));
  };

  const handleObjectCreated = (obj: WaterObject) => {
    // Append new object and recalc priority
    setObjects((prev) => {
      const now = new Date();
      const pd = obj.passport_date ? new Date(obj.passport_date) : null;
      const ageYears = pd && !isNaN(pd.getTime()) ? Math.floor((now.getTime() - pd.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
      const condition = obj.technical_condition || 1;
      const priority = (6 - condition) * 3 + Math.max(0, ageYears);
      return [{ ...obj, priority }, ...prev];
    });
  };

  const regions = useMemo(() => {
    return Array.from(new Set(objects.map((obj) => obj.region))).sort();
  }, [objects]);

  const filteredObjects = useMemo(() => {
    let filtered = [...objects];

    if (filters.region) {
      filtered = filtered.filter((obj) => obj.region === filters.region);
    }

    if (filters.resourceType) {
      filtered = filtered.filter((obj) => obj.resource_type === filters.resourceType);
    }

    if (filters.waterType) {
      filtered = filtered.filter((obj) => obj.water_type === filters.waterType);
    }

    if (filters.fauna !== '') {
      const faunaValue = filters.fauna === 'true';
      filtered = filtered.filter((obj) => obj.fauna === faunaValue);
    }

    if (filters.technicalCondition) {
      const condition = parseInt(filters.technicalCondition);
      filtered = filtered.filter((obj) => obj.technical_condition === condition);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((obj) =>
        obj.name.toLowerCase().includes(query)
      );
    }

    // Passport date range filtering (if provided)
    if (filters.passportDateFrom) {
      const from = new Date(filters.passportDateFrom);
      filtered = filtered.filter((obj) => new Date(obj.passport_date) >= from);
    }

    if (filters.passportDateTo) {
      const to = new Date(filters.passportDateTo);
      filtered = filtered.filter((obj) => new Date(obj.passport_date) <= to);
    }

    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof WaterObject];
      let bVal: any = b[sortBy as keyof WaterObject];

      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [objects, filters, sortBy, sortOrder]);

  // Apply layer toggles (lakes/canals/reservoirs)
  const layerFilteredObjects = useMemo(() => {
    return filteredObjects.filter((o) => {
      if (o.resource_type === 'lake' && !showLakes) return false;
      if (o.resource_type === 'canal' && !showCanals) return false;
      if (o.resource_type === 'reservoir' && !showReservoirs) return false;
      return true;
    });
  }, [filteredObjects, showLakes, showCanals, showReservoirs]);

  const highlightedObject = useMemo(() => {
    if (!filters.searchQuery) return null;
    return filteredObjects.find((obj) =>
      obj.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
    );
  }, [filteredObjects, filters.searchQuery]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleViewPdf = (url: string | null) => {
    setPdfUrl(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Droplets className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-md z-10">
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">ГидроАтлас</h1>
              <p className="text-sm text-gray-600">Мониторинг водных ресурсов Казахстана</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user?.login}</p>
              <p className="text-xs text-gray-600">
                {isExpert ? 'Эксперт' : 'Гость'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Объектов: {layerFilteredObjects.length} / {objects.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <label className={`px-2 py-1 rounded-md text-sm cursor-pointer ${showLakes ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>
                  <input type="checkbox" checked={showLakes} onChange={() => setShowLakes((v) => !v)} className="hidden" /> Озера
                </label>
                <label className={`px-2 py-1 rounded-md text-sm cursor-pointer ${showCanals ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>
                  <input type="checkbox" checked={showCanals} onChange={() => setShowCanals((v) => !v)} className="hidden" /> Каналы
                </label>
                <label className={`px-2 py-1 rounded-md text-sm cursor-pointer ${showReservoirs ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>
                  <input type="checkbox" checked={showReservoirs} onChange={() => setShowReservoirs((v) => !v)} className="hidden" /> Водохранилища
                </label>
              </div>

              {isExpert && (
                <>
                  <button
                    onClick={() => setShowAddObjectModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm mr-2"
                    title="Добавить объект"
                  >
                    Добавить объект
                  </button>

                  <button
                    onClick={recalcPriorities}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm"
                    title="Пересчитать приоритеты"
                  >
                    Пересчитать приоритеты
                  </button>
                </>
              )}

              <button
                onClick={logout}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Выйти"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto p-4">
          <Filters
            filters={filters}
            onFiltersChange={setFilters}
            regions={regions}
            isExpert={isExpert}
          />
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative">
            <MapView
              objects={layerFilteredObjects}
              onObjectClick={setSelectedObject}
              highlightedObject={highlightedObject}
            />
          </div>

          {isExpert && (
            <div className="h-80 overflow-hidden border-t border-gray-200">
              <div className="h-full overflow-y-auto">
                <PriorityTable
                  objects={layerFilteredObjects}
                  onObjectClick={setSelectedObject}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedObject && (
        <ObjectCard
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
          onViewPdf={handleViewPdf}
        />
      )}

      {showAddObjectModal && (
        <AddObjectModal
          onClose={() => setShowAddObjectModal(false)}
          onCreated={handleObjectCreated}
        />
      )}

      {pdfUrl !== null && (
        <PdfViewer url={pdfUrl} onClose={() => setPdfUrl(null)} />
      )}
    </div>
  );
}
