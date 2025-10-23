// src/tabs/Analyse.jsx
import React, { useState, useEffect } from "react";
import { Users, Target, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { fetchTopProduits, fetchAlertesStock, fetchClientsActifs } from "../service";

export default function Analyse() {
  // États pour les données
  const [topProduits, setTopProduits] = useState([]);
  const [alertesStock, setAlertesStock] = useState([]);
  const [indicateurs, setIndicateurs] = useState([]);
  
  // États de chargement et erreur
  const [loading, setLoading] = useState({
    produits: true,
    stock: true,
    clients: true,
  });
  const [error, setError] = useState({
    produits: null,
    stock: null,
    clients: null,
  });

  // Chargement des données au montage du composant
  useEffect(() => {
    loadAllData();
  }, []);

  /**
   * Charge toutes les données depuis l'API
   */
  const loadAllData = async () => {
    // Charger les top produits
    loadTopProduits();
    
    // Charger les alertes stock
    loadAlertesStock();
    
    // Charger les indicateurs clients
    loadIndicateursClients();
  };

  /**
   * Charge les top produits
   */
  const loadTopProduits = async () => {
    try {
      setLoading(prev => ({ ...prev, produits: true }));
      setError(prev => ({ ...prev, produits: null }));
      
      const data = await fetchTopProduits(5);
      setTopProduits(data);
    } catch (err) {
      console.error("Erreur chargement top produits:", err);
      setError(prev => ({ ...prev, produits: err.message }));
      
      // Données de fallback en cas d'erreur
      setTopProduits([
        { nom: "Données non disponibles", quantite_vendue: 0, marge: 0 }
      ]);
    } finally {
      setLoading(prev => ({ ...prev, produits: false }));
    }
  };

  /**
   * Charge les alertes stock
   */
  const loadAlertesStock = async () => {
    try {
      setLoading(prev => ({ ...prev, stock: true }));
      setError(prev => ({ ...prev, stock: null }));
      
      const data = await fetchAlertesStock();
      setAlertesStock(data);
    } catch (err) {
      console.error("Erreur chargement alertes stock:", err);
      setError(prev => ({ ...prev, stock: err.message }));
      
      // Données de fallback
      setAlertesStock([]);
    } finally {
      setLoading(prev => ({ ...prev, stock: false }));
    }
  };

  /**
   * Charge les indicateurs clients
   */
  const loadIndicateursClients = async () => {
    try {
      setLoading(prev => ({ ...prev, clients: true }));
      setError(prev => ({ ...prev, clients: null }));
      
      const data = await fetchClientsActifs();
      
      // Construire les indicateurs avec les données API
      const indicateursData = [
        {
          icone: <Users size={24} />,
          titre: "Clients Actifs",
          valeur: data.clients_actifs?.toLocaleString() || "0",
          variation: "+8%", // TODO: calculer depuis l'API
          couleur: "green",
        },
        {
          icone: <Target size={24} />,
          titre: "Panier Moyen",
          valeur: `${data.panier_moyen?.toFixed(2) || "0"} €`,
          variation: "+5%", // TODO: calculer depuis l'API
          couleur: "green",
        },
        {
          icone: <Calendar size={24} />,
          titre: "CA par Client",
          valeur: `${data.ca_par_client?.toFixed(2) || "0"} €`,
          variation: "+12%", // TODO: calculer depuis l'API
          couleur: "green",
        },
      ];
      
      setIndicateurs(indicateursData);
    } catch (err) {
      console.error("Erreur chargement indicateurs clients:", err);
      setError(prev => ({ ...prev, clients: err.message }));
      
      // Indicateurs par défaut
      setIndicateurs([
        {
          icone: <Users size={24} />,
          titre: "Clients Actifs",
          valeur: "N/A",
          variation: "N/A",
          couleur: "gray",
        },
        {
          icone: <Target size={24} />,
          titre: "Panier Moyen",
          valeur: "N/A",
          variation: "N/A",
          couleur: "gray",
        },
        {
          icone: <Calendar size={24} />,
          titre: "CA par Client",
          valeur: "N/A",
          variation: "N/A",
          couleur: "gray",
        },
      ]);
    } finally {
      setLoading(prev => ({ ...prev, clients: false }));
    }
  };

  /**
   * Composant pour afficher l'état de chargement
   */
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="animate-spin text-blue-500" size={32} />
    </div>
  );

  /**
   * Composant pour afficher une erreur
   */
  const ErrorMessage = ({ message }) => (
    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
      <AlertTriangle size={20} />
      <span>{message}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton de rafraîchissement */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analyse Multi-Dimensions</h2>
        <button
          onClick={loadAllData}
          disabled={Object.values(loading).some(l => l)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {Object.values(loading).some(l => l) ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              Chargement...
            </span>
          ) : (
            "Rafraîchir"
          )}
        </button>
      </div>

      {/* Analyse Multi-Dimensions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Produits */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Top 5 Produits</h4>
            
            {loading.produits ? (
              <LoadingSpinner />
            ) : error.produits ? (
              <ErrorMessage message={error.produits} />
            ) : topProduits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun produit trouvé
              </div>
            ) : (
              <div className="space-y-3">
                {topProduits.map((prod, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{prod.nom}</p>
                      <p className="text-sm text-gray-500">
                        {prod.quantite_vendue?.toLocaleString() || 0} unités vendues
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {prod.marge ? `${parseFloat(prod.marge).toFixed(1)}%` : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">marge</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alertes Stock */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              Alertes Stock
              {!loading.stock && alertesStock.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({alertesStock.length} alerte{alertesStock.length > 1 ? 's' : ''})
                </span>
              )}
            </h4>
            
            {loading.stock ? (
              <LoadingSpinner />
            ) : error.stock ? (
              <ErrorMessage message={error.stock} />
            ) : alertesStock.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="font-medium text-green-600">✓ Aucune alerte stock</p>
                <p className="text-sm mt-2">Tous les produits sont bien approvisionnés</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alertesStock.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border-l-4 ${
                      item.niveau_alerte === "critique"
                        ? "bg-red-50 border-red-500"
                        : "bg-yellow-50 border-yellow-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.produit}</p>
                        <p className="text-sm text-gray-600">
                          {item.magasin && <span className="font-medium">{item.magasin} - </span>}
                          Stock: {item.disponible || item.quantite} unités
                          {item.stock_minimum && ` / Seuil: ${item.stock_minimum}`}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                          item.niveau_alerte === "critique"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.niveau_alerte === "critique" ? "Rupture proche" : "Attention"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Indicateurs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading.clients ? (
          <div className="col-span-3">
            <LoadingSpinner />
          </div>
        ) : error.clients ? (
          <div className="col-span-3">
            <ErrorMessage message={error.clients} />
          </div>
        ) : (
          indicateurs.map((ind, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className={`p-3 rounded-lg ${
                    ind.couleur === "green" 
                      ? "bg-green-100 text-green-600" 
                      : ind.couleur === "purple" 
                      ? "bg-purple-100 text-purple-600" 
                      : ind.couleur === "gray"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {ind.icone}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{ind.titre}</p>
                  <p className="text-2xl font-bold text-gray-900">{ind.valeur}</p>
                </div>
              </div>
              <p 
                className={`text-sm font-semibold ${
                  ind.couleur === "red" 
                    ? "text-red-600" 
                    : ind.couleur === "gray"
                    ? "text-gray-500"
                    : "text-green-600"
                }`}
              >
                {ind.variation} vs mois dernier
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}