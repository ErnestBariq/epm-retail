# 🏗️ Architecture EPM Retail Platform

## 📐 Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         UTILISATEURS                            │
│                  (Directeurs, Managers, Analystes)             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COUCHE PRÉSENTATION                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Frontend React + Vite                       │  │
│  │  • Tableau de bord interactif                           │  │
│  │  • Consolidation multi-magasins                         │  │
│  │  • Simulateur What-If                                   │  │
│  │  • Analyses & Rapports                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / REST API
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COUCHE APPLICATION                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              API FastAPI (Python)                        │  │
│  │  • Endpoints REST                                       │  │
│  │  • Logique métier                                       │  │
│  │  • Validation données                                   │  │
│  │  • Cache & Optimisations                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ asyncpg
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COUCHE DONNÉES                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           PostgreSQL 16                                  │  │
│  │  • Tables transactionnelles                             │  │
│  │  • Vues matérialisées                                   │  │
│  │  • Fonctions PL/pgSQL                                   │  │
│  │  • Triggers & Contraintes                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Redis (Cache)                                  │  │
│  │  • Cache requêtes fréquentes                            │  │
│  │  • Sessions utilisateurs                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de Données

### 1. Consultation du Dashboard

```
Utilisateur → Frontend → API → Cache Redis?
                         │       │ Hit
                         │       └──────────────→ Response
                         │ Miss
                         ↓
                    PostgreSQL
                         │
                    Agrégation
                         │
                         ↓
                    Cache Redis ← Store
                         │
                         ↓
                     Response
```

### 2. Simulation What-If

```
Utilisateur → Frontend → API
                         │
                    ┌────┴────┐
                    │         │
              Paramètres  Données actuelles
               Scénario    (PostgreSQL)
                    │         │
                    └────┬────┘
                         │
                  Calculs Métier
                         │
                    Résultats
                         │
                    Frontend
```

### 3. Import de Données

```
Système externe → API → Validation
                         │
                    ┌────┴────┐
                    │         │
              Transformation Logs
                    │         │
                    ↓         ↓
              PostgreSQL   Monitoring
                    │
               Triggers
                    │
           Vues matérialisées
```

---

## 🗄️ Modèle de Données (Simplifié)

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   RÉGIONS    │──┐   │   MAGASINS   │──┐   │  CATÉGORIES  │
├──────────────┤  │   ├──────────────┤  │   ├──────────────┤
│ id           │  │   │ id           │  │   │ id           │
│ code         │  └──→│ region_id    │  │   │ code         │
│ nom          │      │ nom          │  │   │ nom          │
└──────────────┘      │ objectif_ca  │  │   └──────────────┘
                      └──────────────┘  │          │
                             │          │          │
                             │          │          ↓
                             │          │   ┌──────────────┐
                             │          │   │  PRODUITS    │
                             │          │   ├──────────────┤
                             │          └──→│ categorie_id │
                             │              │ sku          │
                             │              │ prix_achat   │
                             │              │ prix_vente   │
                             │              └──────────────┘
                             │                     │
                             ↓                     │
                      ┌──────────────┐            │
                      │    VENTES    │            │
                      ├──────────────┤            │
                      │ id           │            │
                      │ magasin_id   │            │
                      │ client_id    │            │
                      │ date_vente   │            │
                      │ montant_ttc  │            │
                      └──────────────┘            │
                             │                     │
                             │                     │
                             ↓                     │
                      ┌──────────────┐            │
                      │LIGNES_VENTES │←───────────┘
                      ├──────────────┤
                      │ vente_id     │
                      │ produit_id   │
                      │ quantite     │
                      │ prix_unitaire│
                      └──────────────┘
```

---

## 🔐 Architecture de Sécurité

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET                              │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   Reverse Proxy      │
         │   (Nginx/Traefik)    │
         │   • SSL/TLS          │
         │   • Rate Limiting    │
         └──────────┬───────────┘
                    │
         ┌──────────┴───────────┐
         │                      │
         ▼                      ▼
┌──────────────┐      ┌──────────────┐
│   Frontend   │      │   API        │
│   (Public)   │      │   (Protected)│
└──────────────┘      └──────┬───────┘
                             │
                      ┌──────┴────────┐
                      │ Authentification│
                      │ JWT + RBAC     │
                      └──────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ PostgreSQL   │    │   Redis      │    │  Services    │
│ (Firewall)   │    │   (Cache)    │    │  Externes    │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 🚀 Architecture de Déploiement

### Environnement Docker (Développement)

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Host                           │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Frontend    │  │   API        │  │  PostgreSQL  │  │
│  │  Container   │  │  Container   │  │  Container   │  │
│  │  :5173       │  │  :8000       │  │  :5432       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│         └─────────────────┼─────────────────┘           │
│                           │                             │
│  ┌──────────────┐  ┌──────┴───────┐  ┌──────────────┐  │
│  │   Redis      │  │  pgAdmin     │  │  Prometheus  │  │
│  │  Container   │  │  Container   │  │  Container   │  │
│  │  :6379       │  │  :5050       │  │  :9090       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Docker Network (epm_network)            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Environnement Production (Cloud)

```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer                           │
│                    (HTTPS Termination)                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │   Web    │  │   Web    │  │   Web    │
    │ Server 1 │  │ Server 2 │  │ Server 3 │
    └────┬─────┘  └────┬─────┘  └────┬─────┘
         │             │             │
         └─────────────┼─────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │   API    │ │   API    │ │   API    │
    │ Server 1 │ │ Server 2 │ │ Server 3 │
    └────┬─────┘ └────┬─────┘ └────┬─────┘
         │            │            │
         └────────────┼────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │ Primary │  │Replica  │  │Replica  │
    │   DB    │→→│   DB    │  │   DB    │
    └─────────┘  └─────────┘  └─────────┘
         │
         ▼
    ┌─────────┐
    │ Backup  │
    │ Storage │
    └─────────┘
```

---

## ⚡ Performance & Optimisation

### Stratégie de Cache

```
┌──────────────────────────────────────────────────────┐
│                    REQUÊTE                            │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   Cache L1 (React)   │ ← État local
         │   TTL: Session       │
         └──────────┬───────────┘
                    │ Miss
                    ▼
         ┌──────────────────────┐
         │   Cache L2 (Redis)   │ ← Partage entre users
         │   TTL: 5-60 min      │
         └──────────┬───────────┘
                    │ Miss
                    ▼
         ┌──────────────────────┐
         │   Vues Matérialisées │ ← Pré-agrégation
         │   Refresh: Horaire   │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   Tables Normalisées │ ← Source de vérité
         └──────────────────────┘
```

### Optimisation des Requêtes

```sql
-- Mauvais: N+1 queries
SELECT * FROM magasins;
for each magasin:
    SELECT * FROM ventes WHERE magasin_id = ?

-- Bon: JOIN avec agrégation
SELECT 
    m.*,
    SUM(v.montant_ttc) as total_ca
FROM magasins m
LEFT JOIN ventes v ON m.id = v.magasin_id
GROUP BY m.id

-- Excellent: Vue matérialisée
SELECT * FROM mv_ca_magasin_mensuel
WHERE annee = 2024 AND mois = 9
```

---

## 🔄 CI/CD Pipeline

```
┌──────────────┐
│  Git Push    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  GitHub      │
│  Actions     │
└──────┬───────┘
       │
       ├────────────────┐
       │                │
       ▼                ▼
┌──────────────┐ ┌──────────────┐
│  Lint &      │ │  Tests       │
│  Format      │ │  Unitaires   │
└──────┬───────┘ └──────┬───────┘
       │                │
       └────────┬───────┘
                │
                ▼
         ┌──────────────┐
         │  Build       │
         │  Docker      │
         └──────┬───────┘
                │
                ▼
         ┌──────────────┐
         │  Security    │
         │  Scan        │
         └──────┬───────┘
                │
                ▼
         ┌──────────────┐
         │  Deploy      │
         │  Staging     │
         └──────┬───────┘
                │
                ▼
         ┌──────────────┐
         │  Tests E2E   │
         └──────┬───────┘
                │
                ▼
         ┌──────────────┐
         │  Deploy      │
         │  Production  │
         └──────────────┘
```

---

## 📊 Monitoring & Observabilité

```
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Frontend │  │   API    │  │    DB    │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │             │             │                     │
│       │ Métriques   │ Métriques   │ Métriques          │
│       ↓             ↓             ↓                     │
└───────┼─────────────┼─────────────┼─────────────────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │     Prometheus         │
         │  • Collecte métriques  │
         │  • Stockage TSDB       │
         └────────┬───────────────┘
                  │
       ┌──────────┼──────────┐
       │          │          │
       ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Grafana  │ │AlertMngr │ │  Logs    │
│Dashboard │ │ Alertes  │ │  Loki    │
└──────────┘ └──────────┘ └──────────┘
```

---

## 🎯 Décisions d'Architecture

### Pourquoi FastAPI ?
✅ Performance native async  
✅ Documentation auto (OpenAPI)  
✅ Validation automatique (P
