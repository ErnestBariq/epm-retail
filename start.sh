#!/bin/bash

# =============================================
# Script de démarrage EPM Retail Platform
# =============================================

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logo
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════╗
║                                                   ║
║     ███████╗██████╗ ███╗   ███╗                   ║
║     ██╔════╝██╔══██╗████╗ ████║                   ║
║     █████╗  ██████╔╝██╔████╔██║                   ║
║     ██╔══╝  ██╔═══╝ ██║╚██╔╝██║                   ║
║     ███████╗██║     ██║ ╚═╝ ██║                   ║
║     ╚══════╝╚═╝     ╚═╝     ╚═╝                   ║
║                                                   ║
║          RETAIL PERFORMANCE PLATFORM              ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si Docker est installé
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé"
        log_info "Installation: https://docs.docker.com/get-docker/"
        exit 1
    fi
    log_info "Docker détecté: $(docker --version)"
}

# Vérifier si Docker Compose est installé
check_docker_compose() {
    if ! command -v docker compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé"
        log_info "Installation: https://docs.docker.com/compose/install/"
        exit 1
    fi
    log_info "Docker Compose détecté: $(docker compose --version)"
}

# Créer les fichiers .env s'ils n'existent pas
create_env_files() {
    log_info "Vérification des fichiers de configuration..."
    
    # .env API
    if [ ! -f "api/.env" ]; then
        log_warning "Création de api/.env"
        cat > api/.env << EOL
DB_HOST=postgres
DB_PORT=5432
DB_NAME=epm_retail
DB_USER=postgres
DB_PASSWORD=admin
PORT=8008
SECRET_KEY=$(openssl rand -hex 32)
ALLOWED_ORIGINS=http://localhost:5173
LOG_LEVEL=INFO
EOL
    fi

    # .env Frontend
    if [ ! -f "frontend/.env" ]; then
        log_warning "Création de frontend/.env"
        cat > frontend/.env << EOL
VITE_API_URL=http://localhost:8008
VITE_APP_NAME=EPM Retail Platform
EOL
    fi

    log_info "Fichiers de configuration OK"
}

# Nettoyer les anciens conteneurs
cleanup() {
    log_info "Nettoyage des anciens conteneurs..."
    docker compose down -v 2>/dev/null || true
}

# Construire les images
build_images() {
    log_info "Construction des images Docker..."
    docker compose build --no-cache
    log_info "Images construites avec succès"
}

# Démarrer les services
start_services() {
    log_info "Démarrage des services..."
    docker compose up -d

    # Attendre que les services soient prêts
    log_info "Attente du démarrage des services..."
    sleep 10

    # Vérifier la santé des services
    log_info "Vérification de la santé des services..."

    # PostgreSQL
    if docker compose exec -T postgres pg_isready -U postgres &> /dev/null; then
        log_info "✓ PostgreSQL est prêt"
    else
        log_error "✗ PostgreSQL n'est pas prêt"
    fi

    # API
    if curl -s http://localhost:8008/health &> /dev/null; then
        log_info "✓ API FastAPI est prête"
    else
        log_warning "✗ API n'est pas encore prête (démarrage en cours...)"
    fi
    
    # Frontend
    if curl -s http://localhost:5173 &> /dev/null; then
        log_info "✓ Frontend est prêt"
    else
        log_warning "✗ Frontend n'est pas encore prêt (démarrage en cours...)"
    fi
}

# Afficher les informations de connexion
show_info() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          🎉 Démarrage réussi !                    ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📊 Application Web:${NC}        http://localhost:5173"
    echo -e "${BLUE}🔌 API Documentation:${NC}     http://localhost:8000/docs"
    echo -e "${BLUE}📈 API Health:${NC}            http://localhost:8000/health"
    echo -e "${BLUE}🗄️  pgAdmin:${NC}               http://localhost:5050"
    echo -e "${BLUE}   └─ Email:${NC}              admin@epmretail.com"
    echo -e "${BLUE}   └─ Password:${NC}           admin"
    echo ""
    echo -e "${YELLOW}📝 Commandes utiles:${NC}"
    echo -e "   ${GREEN}docker compose logs -f${NC}          Voir les logs"
    echo -e "   ${GREEN}docker compose ps${NC}               État des services"
    echo -e "   ${GREEN}docker compose down${NC}             Arrêter les services"
    echo -e "   ${GREEN}docker compose restart api${NC}      Redémarrer l'API"
    echo ""
}

# Menu principal
show_menu() {
    echo ""
    echo -e "${BLUE}Que souhaitez-vous faire ?${NC}"
    echo ""
    echo "  1) Démarrage complet (Docker)"
    echo "  2) Démarrage rapide (sans rebuild)"
    echo "  3) Arrêter tous les services"
    echo "  4) Voir les logs"
    echo "  5) Nettoyer et redémarrer"
    echo "  6) Installation locale (sans Docker)"
    echo "  0) Quitter"
    echo ""
    read -p "Votre choix: " choice
    
    case $choice in
        1)
            check_docker
            check_docker_compose
            create_env_files
            cleanup
            build_images
            start_services
            show_info
            ;;
        2)
            check_docker
            check_docker_compose
            docker-compose up -d
            show_info
            ;;
        3)
            log_info "Arrêt des services..."
            docker compose down
            log_info "Services arrêtés"
            ;;
        4)
            docker compose logs -f
            ;;
        5)
            cleanup
            build_images
            start_services
            show_info
            ;;
        6)
            install_local
            ;;
        0)
            log_info "Au revoir !"
            exit 0
            ;;
        *)
            log_error "Choix invalide"
            show_menu
            ;;
    esac
}

# Installation locale (sans Docker)
install_local() {
    log_info "Installation locale..."

    # Vérifier Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 n'est pas installé"
        exit 1
    fi

    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi

    # Installation API
    log_info "Installation de l'API..."
    cd api
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt

    log_info "Démarrage de l'API en arrière-plan..."
    nohup uvicorn main:app --reload --port 8000 > api.log 2>&1 &
    API_PID=$!
    echo $API_PID > api.pid
    cd ..

    # Installation Frontend
    log_info "Installation du Frontend..."
    cd frontend
    npm install

    log_info "Démarrage du Frontend en arrière-plan..."
    nohup npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
    cd ..

    log_info "Services démarrés localement"
    log_info "API PID: $API_PID"
    log_info "Frontend PID: $FRONTEND_PID"

    show_info

    log_warning "Pour arrêter les services:"
    echo "  kill \$(cat api/api.pid)"
    echo "  kill \$(cat frontend/frontend.pid)"
}

# Point d'entrée
main() {
    if [ $# -eq 0 ]; then
        show_menu
    else
        case $1 in
            start)
                check_docker
                check_docker_compose
                create_env_files
                start_services
                show_info
                ;;
            stop)
                docker compose down
                ;;
            restart)
                docker compose restart
                ;;
            logs)
                docker compose logs -f
                ;;
            clean)
                cleanup
                ;;
            *)
                log_error "Commande inconnue: $1"
                echo "Usage: $0 {start|stop|restart|logs|clean}"
                exit 1
                ;;
        esac
    fi
}

# Exécution
main "$@"
