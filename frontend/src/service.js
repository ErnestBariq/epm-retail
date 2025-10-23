// src/api.js
// API synchronisée avec le backend Node.js

const API_BASE = "http://localhost:3131/api";

// =============================================
// UTILITAIRES
// =============================================

/**
 * Gestion des erreurs API
 */
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(error.error || error.details || `Erreur HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Fonction générique de fetch avec gestion d'erreur
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Erreur API ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Helpers spécifiques par méthode HTTP
 */
export const api = {
  get: (endpoint, options = {}) =>
    fetchAPI(endpoint, { method: 'GET', ...options }),

  post: (endpoint, data = {}, options = {}) =>
    fetchAPI(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    }),

  put: (endpoint, data = {}, options = {}) =>
    fetchAPI(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    }),

  delete: (endpoint, options = {}) =>
    fetchAPI(endpoint, { method: 'DELETE', ...options }),
};

// =============================================
// DASHBOARD - KPIs PRINCIPAUX
// =============================================

/**
 * Récupère les KPIs principaux du dashboard
 * @returns {Promise<Array>} KPIs avec label, value, evolution, icon, color
 */
export async function fetchDashboard() {
  try {
    const kpis = await fetchAPI('/kpis');
    
    // Le backend retourne déjà le bon format
    if (Array.isArray(kpis)) {
      return kpis;
    }
    
    // Si le format est différent, on le transforme
    return [
      { 
        label: "CA Total", 
        value: kpis.revenue?.value || "0M EUR", 
        evolution: kpis.revenue?.change || "+0%", 
        icon: "DollarSign", 
        color: "bg-blue-500" 
      },
      { 
        label: "Magasins Actifs", 
        value: kpis.stores?.value || "0", 
        evolution: kpis.stores?.change || "+0", 
        icon: "Store", 
        color: "bg-purple-500" 
      },
      { 
        label: "Marge Moyenne", 
        value: kpis.margin?.value || "0%", 
        evolution: kpis.margin?.change || "+0%", 
        icon: "TrendingUp", 
        color: "bg-green-500" 
      },
      { 
        label: "Taux de Stock", 
        value: kpis.rotation?.value || "0%", 
        evolution: kpis.rotation?.change || "0%", 
        icon: "Package", 
        color: "bg-orange-500" 
      },
    ];
  } catch (error) {
    console.error("Erreur fetchDashboard:", error);
    // Retourner des valeurs par défaut en cas d'erreur
    return [
      { label: "CA Total", value: "N/A", evolution: "N/A", icon: "DollarSign", color: "bg-blue-500" },
      { label: "Magasins Actifs", value: "N/A", evolution: "N/A", icon: "Store", color: "bg-purple-500" },
      { label: "Marge Moyenne", value: "N/A", evolution: "N/A", icon: "TrendingUp", color: "bg-green-500" },
      { label: "Taux de Stock", value: "N/A", evolution: "N/A", icon: "Package", color: "bg-orange-500" },
    ];
  }
}

/**
 * Alias pour fetchDashboard
 */
export const fetchDashboardData = fetchDashboard;

// =============================================
// PERFORMANCE PAR MAGASIN
// =============================================

/**
 * Récupère la performance des magasins
 * @returns {Promise<Array>} Liste des magasins avec ca, objectif, marge, stock
 */
export async function fetchStorePerformance() {
  try {
    const response = await fetchAPI('/store-performance');
    return response; // ✅ il est déjà parsé
  } catch (error) {
    console.error("Erreur fetchStorePerformance:", error);
    return [];
  }
}

// =============================================
// ÉVOLUTION MENSUELLE
// =============================================

/**
 * Récupère l'évolution mensuelle du CA
 * @returns {Promise<Array>} Données mensuelles avec mois, ca, prevision, marge
 */
export async function fetchMonthlyTrend() {
  try {
    const response = await fetchAPI('/monthly-trend');
    return response; // ✅ il est déjà parsé
  } catch (error) {
    console.error("Erreur fetchMonthlyTrend:", error);
    return [];
  }
}

// =============================================
// RÉPARTITION PAR CATÉGORIE
// =============================================

/**
 * Récupère la répartition par catégorie
 * @returns {Promise<Array>} Catégories avec name, value, color
 */
export async function fetchCategoryData() {
  try {
    const response = await fetchAPI('/category-data');
    return response; // ✅ il est déjà parsé
  } catch (error) {
    console.error("Erreur fetchCategoryData:", error);
    return [];
  }
}
export async function fetchRegionalPerformance() {
  try {
    const response = await fetchAPI('/regional-performance');
    return response; // ✅ il est déjà parsé
  } catch (error) {
    console.error("Erreur fetchRegionalPerformance:", error);
    return [];
  }
}
// =============================================
// BUDGET
// =============================================

/**
 * Récupère les données de budget
 * @returns {Promise<Array>} Budget par catégorie avec budget, reel, ecart
 */
export async function fetchBudgetData() {
  try {
    return await fetchAPI('/budget-data');
  } catch (error) {
    console.error("Erreur fetchBudgetData:", error);
    return [];
  }
}

// =============================================
// CONSOLIDATION
// =============================================

/**
 * Récupère les données de consolidation par magasin
 * @returns {Promise<Array>} Données détaillées par magasin
 */
export async function fetchConsolidationData() {
  try {
    return await fetchAPI('/consolidation-data');
  } catch (error) {
    console.error("Erreur fetchConsolidationData:", error);
    return [];
  }
}

// =============================================
// TOP PRODUITS
// =============================================

/**
 * Récupère les produits les plus vendus
 * @param {number} limit - Nombre de produits à retourner
 * @returns {Promise<Array>} Top produits
 */
export async function fetchTopProduits(limit = 10) {
  try {
    return await fetchAPI(`/produits/top?limit=${limit}`);
  } catch (error) {
    console.error("Erreur fetchTopProduits:", error);
    return [];
  }
}

// =============================================
// ALERTES STOCK
// =============================================

/**
 * Récupère les alertes stock
 * @param {number} magasinId - ID du magasin (optionnel)
 * @returns {Promise<Array>} Alertes stock
 */
export async function fetchAlertesStock(magasinId = null) {
  try {
    const endpoint = magasinId 
      ? `/stock/alertes?magasin_id=${magasinId}`
      : '/stock/alertes';
    return await fetchAPI(endpoint);
  } catch (error) {
    console.error("Erreur fetchAlertesStock:", error);
    return [];
  }
}

// =============================================
// CLIENTS ACTIFS
// =============================================

/**
 * Récupère les statistiques clients
 * @returns {Promise<Object>} Stats clients (clients_actifs, panier_moyen, ca_par_client)
 */
export async function fetchClientsActifs() {
  try {
    return await fetchAPI('/clients/actifs');
  } catch (error) {
    console.error("Erreur fetchClientsActifs:", error);
    return {
      clients_actifs: 0,
      panier_moyen: 0,
      ca_par_client: 0
    };
  }
}

// =============================================
// SCÉNARIOS WHAT-IF
// =============================================
/**
 * Récupérer tous les scénarios
 * @param {string} status - Filtrer par statut (optionnel): 'draft', 'active', 'archived'
 * @returns {Promise<Array>} Liste des scénarios
 */
export const getScenariosService = async (status = null) => {
  try {
    return status 
    ? fetchAPI(`/scenarios?status=${status}`)
    : fetchAPI('/scenarios');

  } catch (error) {
    console.error('Erreur lors de la récupération des scénarios:', error);
    return [];
  }
};

/**
 * Récupérer un scénario spécifique avec tous les détails
 * @param {string} scenarioId - ID du scénario
 * @returns {Promise<Object>} Détails complets du scénario
 */
export const getScenarioByIdService = async (scenarioId) => {
  try {
    return await fetchAPI(`/scenarios?status=${scenarioId}`)
  } catch (error) {
    console.error("Erreur lors de la récupération du scénario:", error);
    return [];
  }
};

/**
 * Créer et simuler un nouveau scénario
 * @param {Object} scenarioData - Données du scénario
 * @param {string} scenarioData.name - Nom du scénario
 * @param {string} scenarioData.description - Description (optionnel)
 * @param {string} scenarioData.scenario_type - Type: 'what_if', 'budget', 'forecast', 'stress_test'
 * @param {string} scenarioData.simulation_type - Type de simulation: 'price_change', 'promotion', 'new_store', 'cost_optimization'
 * @param {string} scenarioData.period - Période: '1_month', '3_months', '6_months', '12_months'
 * @param {Object} scenarioData.parameters - Paramètres spécifiques selon le type
 * @param {string} scenarioData.created_by - Auteur (optionnel)
 * @returns {Promise<Object>} Scénario créé avec résultats de simulation
 */
export const createScenarioService = async (scenarioData) => {
  try {
    const response = await fetch(`${API_BASE}/scenarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scenarioData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Erreur HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la création du scénario:', error);
    throw error;
  }
};

/**
 * Mettre à jour un scénario existant
 * @param {string} scenarioId - ID du scénario
 * @param {Object} updateData - Données à mettre à jour
 * @param {string} updateData.name - Nouveau nom (optionnel)
 * @param {string} updateData.description - Nouvelle description (optionnel)
 * @param {string} updateData.status - Nouveau statut (optionnel): 'draft', 'active', 'archived'
 * @param {Object} updateData.parameters - Nouveaux paramètres (optionnel)
 * @returns {Promise<Object>} Scénario mis à jour
 */
export const updateScenarioService = async (scenarioId, updateData) => {
  try {
    const response = await fetch(`${API_BASE}/scenarios/${scenarioId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Scénario non trouvé');
      }
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Erreur HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour du scénario:', error);
    throw error;
  }
};

/**
 * Supprimer un scénario (soft delete)
 * @param {string} scenarioId - ID du scénario
 * @returns {Promise<Object>} Message de confirmation
 */
export const deleteScenarioService = async (scenarioId) => {
  try {
    const response = await fetch(`${API_BASE}/scenarios/${scenarioId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Scénario non trouvé');
      }
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la suppression du scénario:', error);
    throw error;
  }
};

/**
 * Dupliquer un scénario existant
 * @param {string} scenarioId - ID du scénario à dupliquer
 * @returns {Promise<Object>} Nouveau scénario dupliqué
 */
export const duplicateScenarioService = async (scenarioId) => {
  try {
    const response = await fetch(`${API_BASE}/scenarios/${scenarioId}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Scénario non trouvé');
      }
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la duplication du scénario:', error);
    throw error;
  }
};

// ============================================
// Fonctions utilitaires pour les scénarios
// ============================================

/**
 * Archiver un scénario (change le statut en 'archived')
 * @param {string} scenarioId - ID du scénario
 * @returns {Promise<Object>} Scénario archivé
 */
export const archiveScenarioService = async (scenarioId) => {
  return await updateScenarioService(scenarioId, { status: 'archived' });
};

/**
 * Activer un scénario (change le statut en 'active')
 * @param {string} scenarioId - ID du scénario
 * @returns {Promise<Object>} Scénario activé
 */
export const activateScenarioService = async (scenarioId) => {
  return await updateScenarioService(scenarioId, { status: 'active' });
};

/**
 * Récupérer uniquement les scénarios actifs
 * @returns {Promise<Array>} Liste des scénarios actifs
 */
export const getActiveScenariosService = async () => {
  return await getScenariosService('active');
};

/**
 * Récupérer uniquement les scénarios archivés
 * @returns {Promise<Array>} Liste des scénarios archivés
 */
export const getArchivedScenariosService = async () => {
  return await getScenariosService('archived');
};

/**
 * Créer un scénario de promotion
 * @param {Object} params - Paramètres de la promotion
 * @param {string} params.name - Nom du scénario
 * @param {string} params.description - Description
 * @param {string} params.promo_type - Type: 'percentage', 'fixed', 'buy_get'
 * @param {number} params.discount - Valeur de la réduction
 * @param {number} params.marketing_budget - Budget marketing
 * @param {number} params.traffic_increase - Augmentation trafic attendue (%)
 * @param {string} params.period - Période d'impact
 * @returns {Promise<Object>} Scénario créé
 */
export const createPromotionScenarioService = async (params) => {
  return await createScenarioService({
    name: params.name,
    description: params.description || '',
    scenario_type: 'what_if',
    simulation_type: 'promotion',
    period: params.period || '6_months',
    parameters: {
      promo_type: params.promo_type,
      discount: params.discount,
      marketing_budget: params.marketing_budget,
      traffic_increase: params.traffic_increase,
    },
    created_by: params.created_by || 'user',
  });
};

/**
 * Créer un scénario de nouveau magasin
 * @param {Object} params - Paramètres du nouveau magasin
 * @param {string} params.name - Nom du scénario
 * @param {string} params.description - Description
 * @param {string} params.city - Ville
 * @param {number} params.surface - Surface en m²
 * @param {number} params.investment - Investissement initial
 * @param {number} params.monthly_revenue - CA mensuel attendu
 * @param {string} params.period - Période d'impact
 * @returns {Promise<Object>} Scénario créé
 */
export const createNewStoreScenarioService = async (params) => {
  return await createScenarioService({
    name: params.name,
    description: params.description || '',
    scenario_type: 'what_if',
    simulation_type: 'new_store',
    period: params.period || '12_months',
    parameters: {
      city: params.city,
      surface: params.surface,
      investment: params.investment,
      monthly_revenue: params.monthly_revenue,
    },
    created_by: params.created_by || 'user',
  });
};

/**
 * Créer un scénario d'optimisation des coûts
 * @param {Object} params - Paramètres de l'optimisation
 * @param {string} params.name - Nom du scénario
 * @param {string} params.description - Description
 * @param {string} params.cost_type - Type: 'operational', 'staff', 'marketing', 'rent'
 * @param {number} params.cost_reduction - Réduction des coûts (%)
 * @param {number} params.implementation_cost - Coût de mise en œuvre
 * @param {string} params.service_impact - Impact sur service: 'none', 'minimal', 'moderate'
 * @param {string} params.period - Période d'impact
 * @returns {Promise<Object>} Scénario créé
 */
export const createCostOptimizationScenarioService = async (params) => {
  return await createScenarioService({
    name: params.name,
    description: params.description || '',
    scenario_type: 'what_if',
    simulation_type: 'cost_optimization',
    period: params.period || '6_months',
    parameters: {
      cost_type: params.cost_type,
      cost_reduction: params.cost_reduction,
      implementation_cost: params.implementation_cost,
      service_impact: params.service_impact,
    },
    created_by: params.created_by || 'user',
  });
};

/**
 * Créer un scénario de changement de prix
 * @param {Object} params - Paramètres du changement de prix
 * @param {string} params.name - Nom du scénario
 * @param {string} params.description - Description
 * @param {string} params.category - Catégorie: 'all', 'vetements', 'chaussures', 'maroquinerie'
 * @param {number} params.price_change - Changement de prix (%)
 * @param {string} params.period - Période d'impact
 * @returns {Promise<Object>} Scénario créé
 */
export const createPriceChangeScenarioService = async (params) => {
  return await createScenarioService({
    name: params.name,
    description: params.description || '',
    scenario_type: 'what_if',
    simulation_type: 'price_change',
    period: params.period || '3_months',
    parameters: {
      category: params.category,
      price_change: params.price_change,
    },
    created_by: params.created_by || 'user',
  });
};

// ============================================
// ORG FAKE
// ============================================


/**
 * Simule un scénario what-if
 * @param {Object} params - Paramètres du scénario
 * @param {number} params.promo - Pourcentage de promotion
 * @param {number} params.nouveauxMagasins - Nombre de nouveaux magasins
 * @param {number} params.coutPersonnel - Variation du coût personnel (%)
 * @returns {Promise<Object>} Résultats de la simulation
 */
export async function simulateScenario(params) {
  try {
    return await fetchAPI('/scenarios', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch (error) {
    console.error("Erreur simulateScenario:", error);
    return {
      ca_prevu: "0",
      ca_impact: "0",
      marge_prevue: "0",
      marge_impact: "0",
      details: {}
    };
  }
}



/**
 * Récupère les scénarios prédéfinis
 * @returns {Promise<Array>} Liste des scénarios
 */
export async function fetchScenariosData() {
  // Pour l'instant, retourner des scénarios statiques
  // À terme, pourrait être calculé dynamiquement par le backend
  return [
    { scenario: "Optimiste", ca: 4_200_000, marge: 28.0 },
    { scenario: "Réel", ca: 3_800_000, marge: 25.8 },
    { scenario: "Pessimiste", ca: 3_400_000, marge: 23.5 },
  ];
}

// =============================================
// ANALYSE & INSIGHTS
// =============================================

/**
 * Récupère les données d'analyse
 * @returns {Promise<Object>} Tendances et insights
 */
export async function fetchAnalyseData() {
  try {
    // Si un endpoint /analyse existe dans le backend
    return await fetchAPI('/analyse');
  } catch (error) {
    console.error("Erreur fetchAnalyseData:", error);
    // Retourner une structure par défaut
    return {
      tendances: [],
      insights: [
        "Connectez-vous au backend pour voir les insights en temps réel"
      ],
    };
  }
}

// =============================================
// HEALTH CHECK
// =============================================

/**
 * Vérifie la connexion au backend
 * @returns {Promise<Object>} Statut de l'API
 */
export async function checkAPIHealth() {
  try {
    return await fetchAPI('/health');
  } catch (error) {
    console.error("Erreur checkAPIHealth:", error);
    return { status: "ERROR", database: "disconnected" };
  }
}

// =============================================
// EXPORT PAR DÉFAUT
// =============================================

export default {
  // Dashboard
  fetchDashboard,
  fetchDashboardData,
  
  // Performance
  fetchStorePerformance,
  fetchMonthlyTrend,
  fetchCategoryData,
  
  // Budget & Consolidation
  fetchBudgetData,
  fetchConsolidationData,
  
  // Produits & Stock
  fetchTopProduits,
  fetchAlertesStock,
  
  // Clients
  fetchClientsActifs,
  
  // Scénarios
  // CRUD de base
  getScenarios: getScenariosService,
  getScenarioById: getScenarioByIdService,
  createScenario: createScenarioService,
  updateScenario: updateScenarioService,
  deleteScenario: deleteScenarioService,
  duplicateScenario: duplicateScenarioService,
  
  // Utilitaires
  archiveScenario: archiveScenarioService,
  activateScenario: activateScenarioService,
  getActiveScenarios: getActiveScenariosService,
  getArchivedScenarios: getArchivedScenariosService,
  
  // Création par type
  createPromotionScenario: createPromotionScenarioService,
  createNewStoreScenario: createNewStoreScenarioService,
  createCostOptimizationScenario: createCostOptimizationScenarioService,
  createPriceChangeScenario: createPriceChangeScenarioService,
  //ORG FAKE
  simulateScenario,
  fetchScenariosData,
  
  // Analyse
  fetchAnalyseData,
  
  // Utilitaires
  checkAPIHealth,
  api
};