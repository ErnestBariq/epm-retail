// src/tabs/Consolidation.jsx
import React, { useEffect, useState } from "react";
import { fetchConsolidationData } from "../service";

export default function Consolidation() {
  const [storePerformance, setStorePerformance] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchConsolidationData();
        setStorePerformance(data);
      } catch (error) {
        console.error(error);
      }
    }
    loadData();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">
        Consolidation Multi-Magasins
      </h3>
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
                  <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${parseFloat(ecart) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {ecart > 0 ? "+" : ""}{ecart}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{store.marge}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{store.stock}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${parseFloat(ecart) >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {parseFloat(ecart) >= 0 ? "Objectif atteint" : "En dessous"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
