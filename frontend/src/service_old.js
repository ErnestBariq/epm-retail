// src/api.js

// Simulation de récupération depuis une API / DB
export async function fetchDashboard() {
    const res = await fetchDashboardData();
  return [
    { label: "CA Total", value: "3.8M EUR", evolution: "+12%", icon: "DollarSign", color: "bg-blue-500" },
    { label: "Magasins Actifs", value: "28", evolution: "+2", icon: "Store", color: "bg-purple-500" },
    { label: "Marge Moyenne", value: "25.8%", evolution: "+1.2%", icon: "TrendingUp", color: "bg-green-500" },
    { label: "Taux de Stock", value: "90%", evolution: "-3%", icon: "Package", color: "bg-orange-500" },
  ];
}

// 📊 Récupération des données pour le tableau de bord
export const fetchDashboardData = async () => {
  const res = await fetch(`${API_BASE}/api/kpis`);
  if (!res.ok) throw new Error("Erreur lors de la récupération des données du tableau de bord");
  return res.json();
};

export async function fetchStorePerformance() {
  return [
    { name: 'Paris Centre', ca: 850, objectif: 800, marge: 28, stock: 92 },
    { name: 'Lyon Part-Dieu', ca: 720, objectif: 750, marge: 25, stock: 88 },
    { name: 'Marseille', ca: 650, objectif: 700, marge: 22, stock: 95 },
    { name: 'Bordeaux', ca: 580, objectif: 600, marge: 26, stock: 85 },
    { name: 'Lille', ca: 540, objectif: 550, marge: 24, stock: 90 },
  ];
}

export async function fetchCategoryData() {
  return [
    { name: 'Vetements', value: 35, color: '#3b82f6' },
    { name: 'Accessoires', value: 25, color: '#8b5cf6' },
    { name: 'Chaussures', value: 20, color: '#ec4899' },
    { name: 'Electronique', value: 15, color: '#10b981' },
    { name: 'Autres', value: 5, color: '#f59e0b' },
  ];
}

export async function fetchMonthlyTrend() {
  return [
    { mois: 'Jan', ca: 3200, prevision: 3100, marge: 24 },
    { mois: 'Fev', ca: 2800, prevision: 2900, marge: 23 },
    { mois: 'Mar', ca: 3400, prevision: 3300, marge: 25 },
    { mois: 'Avr', ca: 3100, prevision: 3200, marge: 24 },
    { mois: 'Mai', ca: 3600, prevision: 3500, marge: 26 },
    { mois: 'Jun', ca: 3800, prevision: 3700, marge: 27 },
  ];
}

export async function fetchConsolidationData() {
  return [
    { name: "Magasin A", ca: 1300, objectif: 1100, marge: 26.5, stock: 85 },
    { name: "Magasin B", ca: 950, objectif: 1000, marge: 24.1, stock: 92 },
    { name: "Magasin C", ca: 700, objectif: 750, marge: 27.0, stock: 88 },
  ];
}

export async function fetchBudgetData() {
  return [
    { categorie: 'Marketing', budget: 500, reel: 480, ecart: -20 },
    { categorie: 'Personnel', budget: 1200, reel: 1250, ecart: 50 },
    { categorie: 'Loyers', budget: 800, reel: 800, ecart: 0 },
    { categorie: 'Logistique', budget: 350, reel: 370, ecart: 20 },
    { categorie: 'IT', budget: 200, reel: 185, ecart: -15 },
  ];
}

export async function fetchScenariosData() {
  return [
    { scenario: "Optimiste", ca: 4_200_000, marge: 28.0 },
    { scenario: "Réel", ca: 3_800_000, marge: 25.8 },
    { scenario: "Pessimiste", ca: 3_400_000, marge: 23.5 },
  ];
}

export async function fetchAnalyseData() {
  return {
    tendances: [
      { mois: "Janvier", ca: 300000 },
      { mois: "Février", ca: 320000 },
      { mois: "Mars", ca: 340000 },
    ],
    insights: [
      "Hausse du CA sur 3 mois consécutifs",
      "Marge stable malgré la hausse des coûts",
    ],
  };
}



const API_BASE = "http://localhost:3131/api";

// // 📊 Récupération des données de consolidation
// export const fetchConsolidationData = async () => {
//   const res = await fetch(`${API_BASE}/consolidation`);
//   if (!res.ok) throw new Error("Erreur lors de la récupération des données de consolidation");
//   return res.json();
// };

// // 📈 Récupération des KPIs
// export const fetchKpisData = async () => {
//   const res = await fetch(`${API_BASE}/kpis`);
//   if (!res.ok) throw new Error("Erreur lors de la récupération des KPIs");
//   return res.json();
// };

// // 💰 Récupération des données de budget
// export const fetchBudgetData = async () => {
//   const res = await fetch(`${API_BASE}/budget`);
//   if (!res.ok) throw new Error("Erreur lors de la récupération des données de budget");
//   return res.json();
// };

// // 🔮 Récupération des scénarios
// export const fetchScenariosData = async () => {
//   const res = await fetch(`${API_BASE}/scenarios`);
//   if (!res.ok) throw new Error("Erreur lors de la récupération des scénarios");
//   return res.json();
// };

// // 🧠 Récupération des données d’analyse
// export const fetchAnalyseData = async () => {
//   const res = await fetch(`${API_BASE}/analyse`);
//   if (!res.ok) throw new Error("Erreur lors de la récupération des données d’analyse");
//   return res.json();
// };

