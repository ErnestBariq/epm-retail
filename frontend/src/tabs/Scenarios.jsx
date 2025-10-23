import React, { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Play, Save, Download, Plus, Eye, Copy, Trash2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import scenariosService from "../service";

const API_BASE = "http://localhost:3131/api";

// // Créer une promotion
// const promo = await scenariosService.createPromotionScenario({
//   name: "Black Friday",
//   discount: 30,
//   marketing_budget: 100000,
//   traffic_increase: 40,
//   period: "3_months"
// });


export default function Scenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [currentSimulation, setCurrentSimulation] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    simulationType: "promotion",
    period: "6_months",
    parameters: {}
  });

  useEffect(() => {
    loadSavedScenarios();
  }, []);

  const loadSavedScenarios = async () => {
    try {
      // Liste tous les scénarios
      const scenarios = await scenariosService.getScenarios();

      // Scénarios actifs uniquement
      const activeScenarios = await scenariosService.getActiveScenarios();
      setScenarios(scenarios);
    } catch (error) {
      console.error('Erreur chargement scénarios:', error);
    }
  };

  const loadPreset = (presetName) => {
    const presets = {
      black_friday: {
        name: "Black Friday 2024",
        simulationType: "promotion",
        parameters: {
          promo_type: "percentage",
          discount: 30,
          marketing_budget: 100000,
          traffic_increase: 40
        }
      },
      new_store: {
        name: "Nouveau magasin Lyon",
        simulationType: "new_store",
        parameters: {
          city: "Lyon",
          surface: 350,
          investment: 300000,
          monthly_revenue: 140000
        }
      },
      cost_reduction: {
        name: "Optimisation coûts opérationnels",
        simulationType: "cost_optimization",
        parameters: {
          cost_type: "operational",
          cost_reduction: 5,
          implementation_cost: 30000,
          service_impact: "minimal"
        }
      }
    };

    const preset = presets[presetName];
    if (preset) {
      setFormData({
        ...formData,
        name: preset.name,
        simulationType: preset.simulationType,
        parameters: preset.parameters
      });
    }
  };

const runSimulation = async () => {
  if (!formData.name.trim()) {
    alert('Veuillez saisir un nom de scénario');
    return;
  }

  setLoading(true);

  try {
    // ✅ S'assurer que "parameters" est bien un objet (pas une string JSON)
    const parameters =
      typeof formData.parameters === 'string'
        ? JSON.parse(formData.parameters)
        : formData.parameters;

    const data = await scenariosService.api.post('/simulations', {
      name: formData.name,
      description: formData.description,
      scenario_type: 'what_if',
      simulation_type: formData.simulationType,
      period: formData.period,
      parameters, // 👈 objet bien typé
      created_by: 'user',
      revenue_impact: 0, // facultatif, ton backend peut l’ignorer
    });

    if (!data) {
      alert('Erreur lors de la création de la simulation');
      return;
    }

    // ✅ Restructurer les données pour correspondre au format attendu
    const simulation = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      scenario_type: 'what_if',
      simulation_type: formData.simulationType,
      period: formData.period,
      parameters,
      created_by: 'user',
      created_at: new Date().toISOString(),
      status: data.status,
      
      // 👇 Mettre les résultats dans un objet "results"
      results: {
        revenue_impact: parseFloat(data.results.revenue_impact || 0),
        cost_impact: parseFloat(data.results.cost_impact || 0),
        margin_impact: parseFloat(data.results.margin_impact || 0),
        revenue_percent: parseFloat(data.results.ca_impact || 0),
        margin_percent: parseFloat(data.results.marge_impact || 0),
        cost_percent: 0, // À calculer si nécessaire
        roi: data.results.margin_impact ? (data.results.margin_impact / Math.abs(data.results.cost_impact || 1)) * 100 : 0,
        probability: data.results.probability || 0.75,

        // Scénarios optimiste/réaliste/pessimiste
        optimistic_revenue: parseFloat(data.results.ca_prevu || 0) * 1.2,
        optimistic_margin: parseFloat(data.results.marge_prevue || 0) * 1.2,
        realistic_revenue: parseFloat(data.results.ca_prevu || 0),
        realistic_margin: parseFloat(data.results.marge_prevue || 0),
        pessimistic_revenue: parseFloat(data.results.ca_prevu || 0) * 0.85,
        pessimistic_margin: parseFloat(data.results.marge_prevue || 0) * 0.85,
      },
      
      // 👇 Données pour les graphiques (génération exemple)
      evolution_data: data.evolution_data,
      store_impact: data.store_impact,
    };

    console.log('Simulation créée:', simulation);
    console.log('Type de data:', typeof simulation);
    console.log('Data reçue:', JSON.stringify(simulation, null, 2));
    console.log('Data est null?', simulation === null);
    console.log('Data est undefined?', simulation === undefined);
    console.log('Clés de data:', Object.keys(simulation));

    setCurrentSimulation(simulation);
    setShowResults(true);

    await loadSavedScenarios();
  } catch (error) {
    console.error('Erreur simulation:', error);
    alert('Erreur lors de la simulation');
  } finally {
    setLoading(false);
  }
};

const saveScenario = async () => {
  if (!currentScenario) return;
  alert('Scénario sauvegardé avec succès');
  await loadSavedScenarios();
};

  const duplicateScenario = async (scenarioId) => {
    try {
      const response = await fetch(API_BASE + `/scenarios/${scenarioId}/duplicate`, {
        method: 'POST'
      });
      await loadSavedScenarios();
      alert('Scénario dupliqué avec succès');
    } catch (error) {
      console.error('Erreur duplication:', error);
    }
  };

  const deleteScenario = async (scenarioId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce scénario ?')) return;
    
    try {
      await fetch(API_BASE + `/scenarios/${scenarioId}`, { method: 'DELETE' });
      await loadSavedScenarios();
      alert('Scénario supprimé');
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const renderParameterFields = () => {
    const { simulationType } = formData;

    switch (simulationType) {
      case "price_change":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie de produits
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, category: e.target.value }
                })}
              >
                <option value="all">Tous les produits</option>
                <option value="vetements">Vêtements</option>
                <option value="chaussures">Chaussures</option>
                <option value="maroquinerie">Maroquinerie</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Changement de prix (%)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="-10"
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, price_change: parseFloat(e.target.value) }
                })}
              />
            </div>
          </div>
        );

      case "promotion":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de promotion
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.parameters.promo_type || "percentage"}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, promo_type: e.target.value }
                })}
              >
                <option value="percentage">Réduction pourcentage</option>
                <option value="fixed">Montant fixe</option>
                <option value="buy_get">Achetez X, obtenez Y</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valeur de réduction
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="20"
                value={formData.parameters.discount || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, discount: parseFloat(e.target.value) }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget marketing (€)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="50000"
                value={formData.parameters.marketing_budget || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, marketing_budget: parseFloat(e.target.value) }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Augmentation trafic attendue (%)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="25"
                value={formData.parameters.traffic_increase || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, traffic_increase: parseFloat(e.target.value) }
                })}
              />
            </div>
          </div>
        );

      case "new_store":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Lille"
                value={formData.parameters.city || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, city: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Surface (m²)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="300"
                value={formData.parameters.surface || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, surface: parseFloat(e.target.value) }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investissement initial (€)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="250000"
                value={formData.parameters.investment || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, investment: parseFloat(e.target.value) }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CA mensuel attendu (€)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="120000"
                value={formData.parameters.monthly_revenue || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, monthly_revenue: parseFloat(e.target.value) }
                })}
              />
            </div>
          </div>
        );

      case "cost_optimization":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de coûts</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.parameters.cost_type || "operational"}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, cost_type: e.target.value }
                })}
              >
                <option value="operational">Coûts opérationnels</option>
                <option value="staff">Personnel</option>
                <option value="marketing">Marketing</option>
                <option value="rent">Loyers</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Réduction des coûts (%)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="5"
                value={formData.parameters.cost_reduction || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, cost_reduction: parseFloat(e.target.value) }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coût de mise en œuvre (€)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="25000"
                value={formData.parameters.implementation_cost || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, implementation_cost: parseFloat(e.target.value) }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impact sur service client
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.parameters.service_impact || "none"}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, service_impact: e.target.value }
                })}
              >
                <option value="none">Aucun</option>
                <option value="minimal">Minimal</option>
                <option value="moderate">Modéré</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Simulation Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">
          Créer une Simulation What-If
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Nom du scénario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du scénario
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: Promotion Black Friday"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Description */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnel)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="2"
                placeholder="Décrivez votre scénario..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div> */}

            {/* Type et période */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  *Type de simulation
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.simulationType}
                  onChange={(e) => setFormData({
                    ...formData,
                    simulationType: e.target.value,
                    parameters: {}
                  })}
                >
                  <option value="price_change">Changement de prix</option>
                  <option value="promotion">Campagne promotionnelle</option>
                  <option value="new_store">Ouverture nouveau magasin</option>
                  <option value="cost_optimization">Optimisation des coûts</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  *Période d'impact
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                >
                  <option value="1_month">1 mois</option>
                  <option value="3_months">3 mois</option>
                  <option value="6_months">6 mois</option>
                  <option value="12_months">12 mois</option>
                </select>
              </div>
            </div>

            {/* Paramètres dynamiques */}
            <div className="space-y-4">
              {renderParameterFields()}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-gray-50 rounded-lg p-4 h-fit">
            <h4 className="font-medium mb-3 text-gray-900">Actions rapides</h4>
            <div className="space-y-2">
              <button
                onClick={() => loadPreset('black_friday')}
                className="w-full text-left px-3 py-2 text-sm bg-white border rounded hover:bg-gray-50 transition-colors"
              >
                Black Friday -30%
              </button>
              <button
                onClick={() => loadPreset('new_store')}
                className="w-full text-left px-3 py-2 text-sm bg-white border rounded hover:bg-gray-50 transition-colors"
              >
                Nouveau magasin Lyon
              </button>
              <button
                onClick={() => loadPreset('cost_reduction')}
                className="w-full text-left px-3 py-2 text-sm bg-white border rounded hover:bg-gray-50 transition-colors"
              >
                Réduction coûts -5%
              </button>
            </div>

            <div className="mt-4 pt-4 border-t">
              <button
                onClick={runSimulation}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play size={16} />
                {loading ? 'Simulation en cours...' : 'Lancer Simulation'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Résultats de simulation */}
      {showResults && currentSimulation && (
        <div className="space-y-6">
          {/* Impact Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">
              Résultats de la Simulation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {currentSimulation.results.revenue_impact >= 0 ? '+' : ''}
                  {formatCurrency(currentSimulation.results.revenue_impact)}
                </div>
                <div className="text-sm text-blue-600 font-medium">Impact CA</div>
                <div className="text-xs text-gray-500 mt-1">
                  {currentSimulation.results.revenue_percent >= 0 ? '+' : ''}
                  {currentSimulation.results.revenue_percent.toFixed(1)}%
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {currentSimulation.results.margin_impact >= 0 ? '+' : ''}
                  {formatCurrency(currentSimulation.results.margin_impact)}
                </div>
                <div className="text-sm text-green-600 font-medium">Impact Marge</div>
                <div className="text-xs text-gray-500 mt-1">
                  {currentSimulation.results.margin_percent >= 0 ? '+' : ''}
                  {currentSimulation.results.margin_percent.toFixed(1)}%
                </div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {currentSimulation.results.cost_impact >= 0 ? '+' : ''}
                  {formatCurrency(currentSimulation.results.cost_impact)}
                </div>
                <div className="text-sm text-orange-600 font-medium">Impact Coûts</div>
                <div className="text-xs text-gray-500 mt-1">
                  {currentSimulation.results.cost_percent >= 0 ? '+' : ''}
                  {currentSimulation.results.cost_percent.toFixed(1)}%
                </div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {currentSimulation.results.roi.toFixed(0)}%
                </div>
                <div className="text-sm text-purple-600 font-medium">ROI</div>
                <div className="text-xs text-gray-500 mt-1">Retour investissement</div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evolution Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-900">
                Évolution vs Baseline
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentSimulation.evolution_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="#9CA3AF"
                    strokeDasharray="5 5"
                    name="Baseline"
                  />
                  <Line
                    type="monotone"
                    dataKey="with_simulation"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    name="Avec simulation"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Store Impact Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-900">
                Impact par Magasin
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={currentSimulation.store_impact}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="store" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="impact" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Impact CA (€)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Analyse de Risque</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Optimiste */}
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <TrendingUp size={18} />
                  Scénario Optimiste (+20%)
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>CA:</span>
                    <span className="font-medium">
                      {formatCurrency(currentSimulation.results.optimistic_revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marge:</span>
                    <span className="font-medium">
                      {formatCurrency(currentSimulation.results.optimistic_margin)}
                    </span>
                  </div>
                  <div className="text-xs text-green-600 mt-2">Probabilité: 30%</div>
                </div>
              </div>

              {/* Réaliste */}
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <CheckCircle size={18} />
                  Scénario Réaliste (Base)
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>CA:</span>
                    <span className="font-medium">
                      {formatCurrency(currentSimulation.results.realistic_revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marge:</span>
                    <span className="font-medium">
                      {formatCurrency(currentSimulation.results.realistic_margin)}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 mt-2">Probabilité: 50%</div>
                </div>
              </div>

              {/* Pessimiste */}
              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <h5 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                  <TrendingDown size={18} />
                  Scénario Pessimiste (-15%)
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>CA:</span>
                    <span className="font-medium">
                      {formatCurrency(currentSimulation.results.pessimistic_revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marge:</span>
                    <span className="font-medium">
                      {formatCurrency(currentSimulation.results.pessimistic_margin)}
                    </span>
                  </div>
                  <div className="text-xs text-red-600 mt-2">Probabilité: 20%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Recommandations</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h5 className="font-medium text-green-800">Action recommandée</h5>
                  <p className="text-sm text-green-700">
                    La simulation montre un impact positif significatif avec un ROI de{' '}
                    {currentSimulation.results.roi.toFixed(0)}%. Recommandation: Procéder à l'implémentation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h5 className="font-medium text-yellow-800">Points d'attention</h5>
                  <p className="text-sm text-yellow-700">
                    Surveiller l'impact sur la marge globale et s'assurer que les stocks sont
                    suffisants pour absorber l'augmentation de demande.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Lightbulb className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h5 className="font-medium text-blue-800">Optimisations suggérées</h5>
                  <p className="text-sm text-blue-700">
                    Considérer une approche graduelle en commençant par les magasins les plus
                    performants pour minimiser les risques.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={saveScenario}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Sauvegarder Scénario
              </button>
              <button
                onClick={() => alert('Export en cours...')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Export Rapport
              </button>
              <button
                onClick={() => {
                  setShowResults(false);
                  setCurrentScenario(null);
                  setFormData({
                    name: "",
                    description: "",
                    simulationType: "promotion",
                    period: "6_months",
                    parameters: {}
                  });
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Nouvelle Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Scenarios Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">Scénarios Sauvegardés</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Scénario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Impact CA
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  ROI
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Probabilité
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {scenarios.map((scenario) => (
                <tr key={scenario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{scenario.name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(scenario.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {scenario.simulation_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    {scenario.revenue_impact !== 0
                      ? formatCurrency(scenario.revenue_impact)
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-green-600">
                    {scenario.revenue_impact !== 0 && scenario.cost_impact !== 0
                      ? `${((scenario.margin_impact / Math.abs(scenario.cost_impact)) * 100).toFixed(0)}%`
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {scenario.probability.toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <button
                      onClick={async () => {
                        const response = await scenariosService.api.get(`/scenarios/${scenario.id}`);
                        const data = await response.json();
                        setCurrentScenario(data);
                        setShowResults(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Voir"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => duplicateScenario(scenario.id)}
                      className="text-green-600 hover:text-green-800 mr-3"
                      title="Dupliquer"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      onClick={() => deleteScenario(scenario.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {scenarios.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aucun scénario sauvegardé. Créez votre première simulation ci-dessus.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}