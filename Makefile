# =============================================
# Makefile - EPM Retail Platform
# =============================================

.PHONY: help install start stop restart logs clean test build deploy

# Couleurs
GREEN  := \033[0;32m
YELLOW := \033[1;33m
NC     := \033[0m

help: ## Afficher l'aide
	@echo "$(GREEN)EPM Retail Platform - Commandes disponibles:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

install: ## Installer toutes les dépendances
	@echo "$(GREEN)Installation des dépendances...$(NC)"
	@cd api && pip install -r requirements.txt
	@cd frontend && npm install
	@echo "$(GREEN)✓ Installation terminée$(NC)"

start: ## Démarrer tous les services (Docker)
	@echo "$(GREEN)Démarrage des services...$(NC)"
	@docker compose up -d
	@sleep 5
	@echo "$(GREEN)✓ Services démarrés$(NC)"
	@make status

stop: ## Arrêter tous les services
	@echo "$(YELLOW)Arrêt des services...$(NC)"
	@docker compose down
	@echo "$(GREEN)✓ Services arrêtés$(NC)"

restart: ## Redémarrer tous les services
	@make stop
	@make start

logs: ## Afficher les logs en temps réel
	@docker compose logs -f

logs-api: ## Logs de l'API uniquement
	@docker compose logs -f api

logs-frontend: ## Logs du frontend uniquement
	@docker compose logs -f frontend

logs-db: ## Logs de la base de données
	@docker compose logs -f postgres

status: ## Afficher l'état des services
	@echo "$(GREEN)État des services:$(NC)"
	@docker compose ps
	@echo ""
	@echo "$(GREEN)URLs:$(NC)"
	@echo "  Frontend:  http://localhost:5173"
	@echo "  API:       http://localhost:8000/docs"
	@echo "  pgAdmin:   http://localhost:5050"

clean: ## Nettoyer tous les conteneurs et volumes
	@echo "$(YELLOW)Nettoyage...$(NC)"
	@docker compose down -v
	@docker system prune -f
	@echo "$(GREEN)✓ Nettoyage terminé$(NC)"

build: ## Construire les images Docker
	@echo "$(GREEN)Construction des images...$(NC)"
	@docker compose build --no-cache
	@echo "$(GREEN)✓ Images construites$(NC)"

rebuild: clean build start ## Nettoyer, construire et démarrer

test: ## Exécuter les tests
	@echo "$(GREEN)Exécution des tests...$(NC)"
	@cd api && pytest
	@cd frontend && npm test
	@echo "$(GREEN)✓ Tests terminés$(NC)"

test-api: ## Tests API uniquement
	@cd api && pytest -v

test-frontend: ## Tests frontend uniquement
	@cd frontend && npm test

db-reset: ## Réinitialiser la base de données
	@echo "$(YELLOW)Réinitialisation de la base de données...$(NC)"
	@docker compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS epm_retail;"
	@docker compose exec postgres psql -U postgres -c "CREATE DATABASE epm_retail;"
	@docker compose exec postgres psql -U postgres -d epm_retail -f /docker-entrypoint-initdb.d/01-schema.sql
	@docker compose exec postgres psql -U postgres -d epm_retail -f /docker-entrypoint-initdb.d/02-seed.sql
	@echo "$(GREEN)✓ Base de données réinitialisée$(NC)"

db-backup: ## Sauvegarder la base de données
	@echo "$(GREEN)Sauvegarde de la base de données...$(NC)"
	@docker compose exec postgres pg_dump -U postgres epm_retail > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Sauvegarde créée$(NC)"

db-restore: ## Restaurer la base de données (usage: make db-restore FILE=backup.sql)
	@echo "$(GREEN)Restauration de la base de données...$(NC)"
	@docker compose exec -T postgres psql -U postgres epm_retail < $(FILE)
	@echo "$(GREEN)✓ Base restaurée$(NC)"

db-shell: ## Ouvrir un shell PostgreSQL
	@docker compose exec postgres psql -U postgres -d epm_retail

api-shell: ## Ouvrir un shell dans le conteneur API
	@docker compose exec api bash

frontend-shell: ## Ouvrir un shell dans le conteneur frontend
	@docker compose exec frontend sh

dev-api: ## Démarrer l'API en mode développement (local)
	@cd api && uvicorn main:app --reload --port 8000

dev-frontend: ## Démarrer le frontend en mode développement (local)
	@cd frontend && npm run dev

lint: ## Vérifier le code
	@echo "$(GREEN)Vérification du code...$(NC)"
	@cd api && flake8 .
	@cd frontend && npm run lint
	@echo "$(GREEN)✓ Vérification terminée$(NC)"

format: ## Formater le code
	@echo "$(GREEN)Formatage du code...$(NC)"
	@cd api && black .
	@cd frontend && npm run format
	@echo "$(GREEN)✓ Formatage terminé$(NC)"

deploy-prod: ## Déployer en production
	@echo "$(YELLOW)Déploiement en production...$(NC)"
	@docker compose -f docker-compose.prod.yml up -d --build
	@echo "$(GREEN)✓ Déployé en production$(NC)"

health: ## Vérifier la santé des services
	@echo "$(GREEN)Vérification de la santé...$(NC)"
	@curl -s http://localhost:8000/health | jq '.'
	@echo
