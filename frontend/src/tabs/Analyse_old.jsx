// src/tabs/Analyse.jsx
import React from "react";
import { Users, Target, Calendar } from "lucide-react";

export default function Analyse() {
  const topProduits = [
    { nom: "Sneakers Air Max", ventes: 2340, marge: 32 },
    { nom: "Jean Slim Fit", ventes: 1890, marge: 28 },
    { nom: "Veste Cuir", ventes: 1650, marge: 35 },
    { nom: "Sac a Main Premium", ventes: 1420, marge: 42 },
    { nom: "Montre Connectee", ventes: 1280, marge: 25 },
  ];

  const alertesStock = [
    { produit: "T-Shirt Blanc M", stock: 12, statut: "critique", seuil: 50 },
    { produit: "Chaussures Running 42", stock: 28, statut: "attention", seuil: 40 },
    { produit: "Casquette Logo", stock: 8, statut: "critique", seuil: 30 },
    { produit: "Pantalon Chino 38", stock: 35, statut: "attention", seuil: 45 },
  ];

  const indicateurs = [
    {
      icone: <Users size={24} />,
      titre: "Clients Actifs",
      valeur: "12,450",
      variation: "+8%",
      couleur: "green",
    },
    {
      icone: <Target size={24} />,
      titre: "Taux de Conversion",
      valeur: "3.2%",
      variation: "+0.4%",
      couleur: "green",
    },
    {
      icone: <Calendar size={24} />,
      titre: "Panier Moyen",
      valeur: "85 EUR",
      variation: "-2%",
      couleur: "red",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Analyse Multi-Dimensions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">Analyse Multi-Dimensions</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Produits */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Top 5 Produits</h4>
            <div className="space-y-3">
              {topProduits.map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{prod.nom}</p>
                    <p className="text-sm text-gray-500">{prod.ventes} unités vendues</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{prod.marge}%</p>
                    <p className="text-xs text-gray-500">marge</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alertes Stock */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Alertes Stock</h4>
            <div className="space-y-3">
              {alertesStock.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-l-4 ${
                    item.statut === "critique"
                      ? "bg-red-50 border-red-500"
                      : "bg-yellow-50 border-yellow-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.produit}</p>
                      <p className="text-sm text-gray-600">
                        Stock actuel : {item.stock} unités
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.statut === "critique"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item.statut === "critique" ? "Rupture proche" : "Attention"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Indicateurs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {indicateurs.map((ind, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-lg ${ind.couleur === "green" ? "bg-green-100" : ind.couleur === "purple" ? "bg-purple-100" : "bg-blue-100"}`}>
                {ind.icone}
              </div>
              <div>
                <p className="text-sm text-gray-600">{ind.titre}</p>
                <p className="text-2xl font-bold text-gray-900">{ind.valeur}</p>
              </div>
            </div>
            <p className={`text-sm font-semibold ${ind.couleur === "red" ? "text-red-600" : "text-green-600"}`}>
              {ind.variation} vs mois dernier
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
