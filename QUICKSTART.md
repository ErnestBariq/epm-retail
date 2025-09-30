# ⚡ Démarrage Rapide - EPM Retail Platform

## 🎯 En 3 commandes

```bash
# 1. Cloner le projet
git clone https://github.com/ErnestBariq/epm-retail.git
cd epm-retail

# 2. Rendre le script exécutable et lancer
chmod +x start.sh
./start.sh

# 3. Ou utiliser le Makefile
make init
make start
```

**C'est tout !** 🎉 Votre plateforme EPM est prête.

---

## 🌐 Accès aux services

| Service | URL | Identifiants |
|---------|-----|--------------|
| 🎨 **Application Web** | http://localhost:5173 | - |
| 📊 **API Documentation** | http://localhost:8000/docs | - |
| 🗄️ **pgAdmin** | http://localhost:5050 | admin@epmretail.com / admin |
| 🔌 **API Health** | http://localhost:8000/health | - |

---

## 📁 Structure minimale requise

```
epm-retail/
├── api/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── .env
├── sql/
│   ├── schema.sql
│   └── seed.sql
├── docker-compose.yml
├── start.sh
└── Makefile
```

---

## 🚀 Commandes essentielles

### Avec le Makefile (recommandé)

```bash
make help           # Voir toutes les commandes
make start          # Démarrer
make stop           # Arrêter
make logs           # Voir les logs
make restart        # Redémarrer
make status         # État des services
make db-reset       # Réinitialiser la BDD
```

### Avec Docker Compose

```bash
docker compose up -d                    # Démarrer
docker compose down                     # Arrêter
docker compose logs -f                  # Logs
docker compose ps                       # État
docker compose restart api              # Redémarrer un service
```

### Avec le script start.sh

```bash
./start.sh          # Menu interactif
./start.sh start    # Démarrage direct
./start.sh stop     # Arrêt
./start.sh logs     # Voir les logs
```

---

## 🔧 Configuration rapide

### Variables d'environnement - API

Créer `api/.env` :

```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=epm_retail
DB_USER=postgres
DB_PASSWORD=postgres_password
PORT=8000
```

### Variables d'environnement - Frontend

Créer `frontend/.env` :

```env
VITE_API_URL=http://localhost:8000
```

---

## 📊 Tester l'API

### Via curl

```bash
# Health check
curl http://localhost:8000/health

# KPIs
curl "http://localhost:8000/api/kpis?periode=Q1-2024"

# Performance magasins
curl "http://localhost:8000/api/magasins/performance?periode=Q1-2024"
```

### Via l'interface Swagger

Ouvrez http://localhost:8000/docs et testez directement les endpoints.

---

## 🎨 Fonctionnalités principales

✅ **Tableau de bord en temps réel**
- KPIs (CA, Marge, Stock, Magasins)
- Graphiques interactifs
- Filtres par période et région

✅ **Consolidation multi-magasins**
- Vue agrégée de tous les magasins
- Comparaison objectifs vs réalisé
- Statuts en temps réel

✅ **Gestion budgétaire**
- Suivi budget vs réalisé
- Alertes automatiques
- Écarts par catégorie

✅ **Simulateur What-If**
- Impact des promotions
- Ouverture de nouveaux magasins
- Variation coûts personnel

✅ **Analyses détaillées**
- Top produits
- Alertes stock
- Clients actifs

---

## 🗄️ Base de données

### Accès direct PostgreSQL

```bash
# Via Docker
docker-compose exec postgres psql -U postgres -d epm_retail

# Voir les tables
\dt

# Exemple de requête
SELECT * FROM magasins LIMIT 5;
```

### Via pgAdmin

1. Ouvrir http://localhost:5050
2. Login: `admin@epmretail.com` / `admin`
3. Ajouter un serveur:
   - Host: `postgres`
   - Port: `5432`
   - Database: `epm_retail`
   - Username: `postgres`
   - Password: `postgres_password`

---

## 🐛 Résolution de problèmes courants

### Port déjà utilisé

```bash
# Trouver et tuer le processus
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Erreur de connexion à la BDD

```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps postgres

# Vérifier les logs
docker-compose logs postgres

# Redémarrer PostgreSQL
docker-compose restart postgres
```

### Conteneurs ne démarrent pas

```bash
# Nettoyer et redémarrer
make clean
make build
make start

# Ou avec Docker Compose
docker-compose down -v
docker-compose up -d --build
```

### Frontend ne se charge pas

```bash
# Vérifier les logs
docker-compose logs frontend

# Reconstruire
docker-compose build frontend
docker-compose restart frontend
```

---

## 📈 Données de test

Le projet inclut des données de démonstration :

- **5 régions** (Île-de-France, Auvergne-Rhône-Alpes, etc.)
- **5 magasins** avec historique de ventes
- **Produits** dans différentes catégories
- **Ventes** des 12 derniers mois
- **Budgets** et objectifs

Pour réinitialiser les données :

```bash
make db-reset
```

---

## 🔐 Sécurité

### En développement

Les mots de passe par défaut sont acceptables.

### En production

⚠️ **IMPORTANT** : Changez TOUS les mots de passe !

```env
# api/.env
DB_PASSWORD=VotreMotDePasseSecurise123!
SECRET_KEY=VotreCleSecrete_GenereeAleatoirement

# docker-compose.yml
POSTGRES_PASSWORD: VotreMotDePasseSecurise123!
PGADMIN_DEFAULT_PASSWORD: VotreMotDePassePgAdmin456!
```

Générer une clé secrète :

```bash
openssl rand -hex 32
```

---

## 📚 Ressources

- **Documentation complète** : [README.md](README.md)
- **Architecture** : [ARCHITECTURE.md](ARCHITECTURE.md)
- **API Reference** : http://localhost:8000/docs
- **Issues** : [GitHub Issues](https://github.com/votre-org/epm-retail/issues)

---

## 🎓 Prochaines étapes

1. ✅ Démarrer le projet
2. 📖 Explorer l'interface web
3. 🔍 Tester l'API avec Swagger
4. 📊 Consulter les données dans pgAdmin
5. 🛠️ Personnaliser selon vos besoins
6. 🚀 Déployer en production

---

## 💡 Tips & Astuces

### Développement rapide

```bash
# Terminal 1 : API avec hot-reload
cd api && uvicorn main:app --reload

# Terminal 2 : Frontend avec hot-reload
cd frontend && npm run dev

# Terminal 3 : Logs de la base de données
docker-compose logs -f postgres
```

### Backup automatique

Ajoutez à votre crontab :

```bash
0 2 * * * cd /path/to/epm-retail && make db-backup
```

### Monitoring simple

```bash
# Surveiller les ressources
watch -n 2 'docker stats --no-stream'

# Surveiller les logs
tail -f logs/api.log logs/frontend.log
```

---

## 🤝 Contribution

Contributions bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md)

---

**Développé avec ❤️ pour optimiser la performance retail**

---

## 🆘 Besoin d'aide ?

- 💬 [Discussions GitHub](https://github.com/votre-org/epm-retail/discussions)
- 🐛 [Signaler un bug](https://github.com/votre-org/epm-retail/issues/new)
- 📧 Email : support@epmretail.com
- 📖 [Documentation complète](https://docs.epmretail.com)

---

**Bon démarrage ! 🚀**
