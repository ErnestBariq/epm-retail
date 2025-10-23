import React, { useEffect, useState } from 'react';
import { Filter, Download } from 'lucide-react';
import Consolidation from "./tabs/Consolidation";
// import Kpis from "./tabs/Kpis";
import Budget from "./tabs/Budget";
import Scenarios from "./tabs/Scenarios";
import Analyse from "./tabs/Analyse";
import Dashboard from "./tabs/Dashboard";

// Hook global pour récupérer les données de l'API
export const useStorePerformance = () => {
  const [data, setData] = useState({
    storePerformance: [],
    monthlyTrend: [],
    categoryData: [],
    budgetData: [],
    kpis: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3131/api/store-performance")
      .then(res => {
        if (!res.ok) throw new Error("Erreur API");
        return res.json();
      })
      .then(json => setData(json))
      .catch(err => setError(err.message || "Failed to fetch"))
      .finally(() => setLoading(false));
  }, []);

  return { ...data, loading, error };
};

const TABS = {
  dashboard: { label: "Tableau de Bord", component: Dashboard },
  consolidation: { label: "Consolidation", component: Consolidation },
  budget: { label: "Budget & Prévisions", component: Budget },
  scenarios: { label: "Scénarios What-If", component: Scenarios },
  analyse: { label: "Analyse Détaillée", component: Analyse },
};

const EPMRetailDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('Q4-2024');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const { storePerformance, monthlyTrend, categoryData, budgetData, kpis, loading, error } = useStorePerformance();

  const [scenario, setScenario] = useState({
    promo: 15,
    nouveauxMagasins: 2,
    coutPersonnel: 0
  });

  const calculateImpact = () => {
    const baseCA = 3800;
    const promoImpact = baseCA * (scenario.promo / 100);
    const newStoresImpact = scenario.nouveauxMagasins * 600;
    const costImpact = scenario.coutPersonnel;
    return {
      ca: baseCA + promoImpact + newStoresImpact,
      marge: 27 - (scenario.promo * 0.3) - (costImpact * 0.02)
    };
  };

  const impact = calculateImpact();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white p-8 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-3 tracking-tight">EPM Retail Platform</h1>
          <p className="text-blue-100 text-lg">Pilotage de la Performance en Temps Reel</p>
        </div>
      </div>

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {['dashboard', 'consolidation', 'budget', 'scenarios', 'analyse'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'dashboard' && 'Tableau de Bord'}
                {tab === 'consolidation' && 'Consolidation'}
                {tab === 'budget' && 'Budget & Previsions'}
                {tab === 'scenarios' && 'Scenarios What-If'}
                {tab === 'analyse' && 'Analyse Detaillee'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-4 items-center">
          <Filter className="text-gray-400" size={20} />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Q1-2024</option>
            <option>Q2-2024</option>
            <option>Q3-2024</option>
            <option>Q4-2024</option>
          </select>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les regions</option>
            <option value="idf">Ile-de-France</option>
            <option value="sud">Sud</option>
            <option value="nord">Nord</option>
          </select>
          <button className="ml-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download size={16} />
            Exporter
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {error && (
          <div className="text-red-600 mb-4">
            Erreur : {error}
          </div>
        )}

        {activeTab === 'dashboard' && <Dashboard data={{ storePerformance, monthlyTrend, categoryData, budgetData, kpis, loading, error }} />}
        {activeTab === 'consolidation' && <Consolidation />}
        {activeTab === 'budget' && <Budget />}
        {activeTab === 'scenarios' && <Scenarios />}
        {activeTab === 'analyse' && <Analyse />}
      </div>
    </div>
  );
};

export default EPMRetailDashboard;
