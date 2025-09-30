import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Store, Package, DollarSign, Users, Calendar, Target, AlertCircle, Download, Filter } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('Q4-2024');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const storePerformance = [
    { name: 'Paris Centre', ca: 850, objectif: 800, marge: 28, stock: 92 },
    { name: 'Lyon Part-Dieu', ca: 720, objectif: 750, marge: 25, stock: 88 },
    { name: 'Marseille', ca: 650, objectif: 700, marge: 22, stock: 95 },
    { name: 'Bordeaux', ca: 580, objectif: 600, marge: 26, stock: 85 },
    { name: 'Lille', ca: 540, objectif: 550, marge: 24, stock: 90 },
  ];

  const monthlyTrend = [
    { mois: 'Jan', ca: 3200, prevision: 3100, marge: 24 },
    { mois: 'Fev', ca: 2800, prevision: 2900, marge: 23 },
    { mois: 'Mar', ca: 3400, prevision: 3300, marge: 25 },
    { mois: 'Avr', ca: 3100, prevision: 3200, marge: 24 },
    { mois: 'Mai', ca: 3600, prevision: 3500, marge: 26 },
    { mois: 'Jun', ca: 3800, prevision: 3700, marge: 27 },
  ];

  const categoryData = [
    { name: 'Vetements', value: 35, color: '#3b82f6' },
    { name: 'Accessoires', value: 25, color: '#8b5cf6' },
    { name: 'Chaussures', value: 20, color: '#ec4899' },
    { name: 'Electronique', value: 15, color: '#10b981' },
    { name: 'Autres', value: 5, color: '#f59e0b' },
  ];

  const budgetData = [
    { categorie: 'Marketing', budget: 500, reel: 480, ecart: -20 },
    { categorie: 'Personnel', budget: 1200, reel: 1250, ecart: 50 },
    { categorie: 'Loyers', budget: 800, reel: 800, ecart: 0 },
    { categorie: 'Logistique', budget: 350, reel: 370, ecart: 20 },
    { categorie: 'IT', budget: 200, reel: 185, ecart: -15 },
  ];

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

  const kpis = [
    { label: 'CA Total', value: '3.8M EUR', evolution: '+12%', icon: DollarSign, color: 'bg-blue-500' },
    { label: 'Magasins Actifs', value: '28', evolution: '+2', icon: Store, color: 'bg-purple-500' },
    { label: 'Marge Moyenne', value: '25.8%', evolution: '+1.2%', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Taux de Stock', value: '90%', evolution: '-3%', icon: Package, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">EPM Retail Platform</h1>
          <p className="text-blue-100">Pilotage de la Performance en Temps Reel</p>
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
          <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download size={16} />
            Exporter
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                  <div key={idx} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${kpi.color} p-3 rounded-lg`}>
                        <Icon className="text-white" size={24} />
                      </div>
                      <span className={`text-sm font-semibold ${kpi.evolution.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {kpi.evolution}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-1">{kpi.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Evolution CA vs Previsions</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mois" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
                    <Legend />
                    <Line type="monotone" dataKey="ca" stroke="#3b82f6" strokeWidth={2} name="CA Reel (kEUR)" />
                    <Line type="monotone" dataKey="prevision" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="Prevision (kEUR)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Repartition par Categorie</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Performance par Magasin</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={storePerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
                  <Legend />
                  <Bar dataKey="ca" fill="#3b82f6" name="CA Reel (kEUR)" />
                  <Bar dataKey="objectif" fill="#8b5cf6" name="Objectif (kEUR)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'consolidation' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">Consolidation Multi-Magasins</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Magasin</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">CA (kEUR)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Objectif (kEUR)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ecart %</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Marge %</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock %</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {storePerformance.map((store, idx) => {
                    const ecart = ((store.ca - store.objectif) / store.objectif * 100).toFixed(1);
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{store.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{store.ca}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">{store.objectif}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${parseFloat(ecart) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {ecart > 0 ? '+' : ''}{ecart}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{store.marge}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{store.stock}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${parseFloat(ecart) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {parseFloat(ecart) >= 0 ? 'Objectif atteint' : 'En dessous'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td className="px-6 py-4 text-gray-900">TOTAL</td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {storePerformance.reduce((sum, s) => sum + s.ca, 0)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {storePerformance.reduce((sum, s) => sum + s.objectif, 0)}
                    </td>
                    <td className="px-6 py-4 text-right text-green-600">+4.2%</td>
                    <td className="px-6 py-4 text-right text-gray-900">25.8%</td>
                    <td className="px-6 py-4 text-right text-gray-900">90%</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-900">Suivi Budgetaire</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categorie</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget (kEUR)</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reel (kEUR)</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ecart (kEUR)</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">% Realise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {budgetData.map((item, idx) => {
                      const pct = ((item.reel / item.budget) * 100).toFixed(1);
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.categorie}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{item.budget}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{item.reel}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${item.ecart <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.ecart > 0 ? '+' : ''}{item.ecart}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${parseFloat(pct) <= 100 ? 'bg-green-500' : 'bg-red-500'}`}
                                  style={{ width: `${Math.min(parseFloat(pct), 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 border border-blue-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-600 mt-1" size={24} />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Alertes Budgetaires</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>Personnel : Depassement de 4.2% - Revision recommandee</li>
                    <li>Logistique : Depassement de 5.7% - Analyser les couts de transport</li>
                    <li>Marketing : Economie de 4% - Possibilite de reinvestir</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-900">Simulateur What-If</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taux de promotion (%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={scenario.promo}
                    onChange={(e) => setScenario({ ...scenario, promo: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-center mt-2 text-2xl font-bold text-blue-600">{scenario.promo}%</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveaux magasins
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={scenario.nouveauxMagasins}
                    onChange={(e) => setScenario({ ...scenario, nouveauxMagasins: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-center mt-2 text-2xl font-bold text-purple-600">{scenario.nouveauxMagasins}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variation cout personnel (%)
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={scenario.coutPersonnel}
                    onChange={(e) => setScenario({ ...scenario, coutPersonnel: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-center mt-2 text-2xl font-bold text-green-600">
                    {scenario.coutPersonnel > 0 ? '+' : ''}{scenario.coutPersonnel}%
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Impact Previsionnel</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">CA Previsionnel</p>
                    <p className="text-3xl font-bold text-green-600">{impact.ca.toFixed(0)}kEUR</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {impact.ca > 3800 ? '+' : ''}{(impact.ca - 3800).toFixed(0)}kEUR vs actuel
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Marge Previsionnelle</p>
                    <p className="text-3xl font-bold text-blue-600">{impact.marge.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {impact.marge > 27 ? '+' : ''}{(impact.marge - 27).toFixed(1)}% vs actuel
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analyse' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-900">Analyse Multi-Dimensions</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Top 5 Produits</h4>
                  <div className="space-y-3">
                    {[
                      { nom: 'Sneakers Air Max', ventes: 2340, marge: 32 },
                      { nom: 'Jean Slim Fit', ventes: 1890, marge: 28 },
                      { nom: 'Veste Cuir', ventes: 1650, marge: 35 },
                      { nom: 'Sac a Main Premium', ventes: 1420, marge: 42 },
                      { nom: 'Montre Connectee', ventes: 1280, marge: 25 }
                    ].map((prod, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{prod.nom}</p>
                          <p className="text-sm text-gray-500">{prod.ventes} unites vendues</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{prod.marge}%</p>
                          <p className="text-xs text-gray-500">marge</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Alertes Stock</h4>
                  <div className="space-y-3">
                    {[
                      { produit: 'T-Shirt Blanc M', stock: 12, statut: 'critique' },
                      { produit: 'Chaussures Running
