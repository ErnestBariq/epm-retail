import React, { useEffect, useState } from "react";
import {
  Line,
  Pie,
  Doughnut,
  Bar,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler, // ✅ Import du plugin manquant
} from "chart.js";
import {
  fetchDashboard,
  fetchMonthlyTrend,
  fetchCategoryData,
  fetchStorePerformance,
  fetchRegionalPerformance,
} from "../service";
import { DollarSign, Store, TrendingUp, Package } from "lucide-react";

// Enregistrement des modules Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler // ✅ Enregistrement du plugin Filler
);

export default function Dashboard() {
  const [kpis, setKpis] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [storePerformanceData, setStorePerformance] = useState([]);
  const [regionalPerformance, setRegionalPerformance] = useState([]);

  // Chargement des données au montage   
  useEffect(() => {
    async function loadData() {
      try {
        // 🔹 KPIs
        const kpiData = await fetchDashboard();
        const formattedKpis = kpiData.map((kpi, index) => ({
          ...kpi,
          // optionnel : formater la valeur et l'évolution
          displayValue:
            typeof kpi.value === "number"
              ? kpi.label.includes("CA")
                ? kpi.value.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })
                : kpi.value.toLocaleString("fr-FR")
              : kpi.value,
          displayEvolution:
            typeof kpi.evolution === "number" ? `+${kpi.evolution}%` : kpi.evolution || "+0%",
          cardClass: `metric-card-${index + 1}`,
          iconClass:
            kpi.icon === "DollarSign"
              ? "fas fa-euro-sign"
              : kpi.icon === "TrendingUp"
              ? "fas fa-percentage"
              : kpi.icon === "Store"
              ? "fas fa-store"
              : "fas fa-sync",
        }));
        setKpis(formattedKpis);

        // 🔹 Graphiques
        setMonthlyTrend(await fetchMonthlyTrend());
        setCategoryData(await fetchCategoryData());
        
        setRegionalPerformance(await fetchRegionalPerformance());

        const perfs = await fetchStorePerformance();

        const storePerformance = {
        labels: perfs.data.map((p) => p.name),
        datasets: [
          {
            label: "CA (k€)",
            data: perfs.data.map((p) => p.ca),
            backgroundColor: "#667eea",
          },
          {
            label: "Objectif (k€)",
            data: perfs.data.map((p) => p.objectif),
            backgroundColor: "#764ba2",
          },
        ],
      };

        setStorePerformance(storePerformance);

      } catch (err) {
        console.error("Erreur Dashboard:", err);
      }
    }
    loadData();
  }, []);

  // Options Chart.js
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Evolution CA vs Objectif" },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Performance par Magasin" },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "right" },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: "Inter",
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                return {
                  text: `${label}: ${value}% (${data.datasets[0].shops[i]} magasins)`,
                  fillStyle: [
                            '#667eea',
                            '#764ba2',
                            '#f093fb',
                            '#f5576c',
                            '#4facfe',
                            '#43e97b'
                        ][i],
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed}% des magasins`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* =================== KPIs =================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className={`${kpi.cardClass} text-white p-6 rounded-xl card-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{kpi.label}</p>
                <p className="text-2xl font-bold">{kpi.displayValue}</p>
                <p className="text-white/80 text-xs">{kpi.displayEvolution} vs mois précédent</p>
              </div>
              <i className={`${kpi.iconClass} text-3xl opacity-80`}></i>
            </div>
          </div>
        ))}
      </div>

      {/* =================== Evolution CA =================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Evolution CA vs Prévisions
          </h3>
          <div className="h-[300px]">
            {monthlyTrend?.datasets?.length ? (
              <Line data={monthlyTrend} options={lineOptions} />
            ) : (
              <p className="text-gray-400 text-center">Chargement...</p>
            )}
          </div>
        </div>

        {/* =================== Performance Régionale =================== */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Répartition par Région
          </h3>
          <div className="h-[300px] flex justify-center">
            {regionalPerformance.length > 0 ? (
              <Doughnut 
                data={{
                  labels: regionalPerformance.map((c) => c.name),
                  datasets: [
                    {
                      data: regionalPerformance.map((c) => c.percentage),
                      shops: regionalPerformance.map((c) => c.nb_magasins),
                      backgroundColor: [
                            '#667eea',
                            '#764ba2',
                            '#f093fb',
                            '#f5576c',
                            '#4facfe',
                            '#43e97b'
                        ],
                    },
                  ],
                }}
                options={doughnutOptions}
              />
            ) : (
              <p className="text-gray-400 text-center">Chargement...</p>
            )}
          </div>
        </div>
      </div>

      {/* =================== Performance par Magasin =================== */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Performance par Magasin
        </h3>
        <div className="h-[300px]">
          {storePerformanceData?.datasets?.length ? (
            <Bar data={storePerformanceData} options={barOptions} />
          ) : (
            <p className="text-gray-400 text-center">Chargement...</p>
          )}
        </div>
      </div>
      
      {/* =================== Répartition par Catégorie =================== */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Répartition par Catégorie
        </h3>
        <div className="h-[300px] flex justify-center">
          {categoryData?.datasets?.length ? (
            <Pie data={categoryData} options={pieOptions} />
          ) : (
            <p className="text-gray-400 text-center">Chargement...</p>
          )}
        </div>
      </div>

    </div>
  );
}
