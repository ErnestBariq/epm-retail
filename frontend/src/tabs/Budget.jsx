// src/tabs/Budget.jsx
import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { fetchBudgetData } from "../service";

export default function Budget() {
  const [budgetData, setBudgetData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await fetchBudgetData();
      setBudgetData(data);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Suivi Budgétaire */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">Suivi Budgétaire</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget (kEUR)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Réel (kEUR)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Écart (kEUR)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">% Réalisé</th>
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
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${item.ecart <= 0 ? "text-green-600" : "text-red-600"}`}>
                      {item.ecart > 0 ? "+" : ""}{item.ecart}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${parseFloat(pct) <= 100 ? "bg-green-500" : "bg-red-500"}`}
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

      {/* Alertes Budgétaires */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 border border-blue-100">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 mt-1" size={24} />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Alertes Budgétaires</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Personnel : Dépassement de 4.2% - Révision recommandée</li>
              <li>Logistique : Dépassement de 5.7% - Analyser les coûts de transport</li>
              <li>Marketing : Économie de 4% - Possibilité de réinvestir</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
