-- =============================================
-- SCHÉMA PostgreSQL - EPM RETAIL
-- =============================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: Régions
-- =============================================
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    pays VARCHAR(50) DEFAULT 'France',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: Magasins
-- =============================================
CREATE TABLE magasins (
    id SERIAL PRIMARY KEY,
    code_magasin VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    region_id INTEGER REFERENCES regions(id),
    surface_m2 DECIMAL(10,2),
    date_ouverture DATE,
    statut VARCHAR(20) DEFAULT 'actif', -- actif, ferme, travaux
    objectif_ca_mensuel DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: Catégories de produits
-- =============================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    categorie_parent_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: Produits
-- =============================================
CREATE TABLE produits (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    categorie_id INTEGER REFERENCES categories(id),
    prix_achat DECIMAL(10,2) NOT NULL,
    prix_vente DECIMAL(10,2) NOT NULL,
    tva_taux DECIMAL(5,2) DEFAULT 20.00,
    cout_logistique DECIMAL(10,2) DEFAULT 0,
    stock_minimum INTEGER DEFAULT 10,
    stock_securite INTEGER DEFAULT 20,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: Stock
-- =============================================
CREATE TABLE stock (
    id SERIAL PRIMARY KEY,
    magasin_id INTEGER REFERENCES magasins(id) ON DELETE CASCADE,
    produit_id INTEGER REFERENCES produits(id) ON DELETE CASCADE,
    quantite INTEGER NOT NULL DEFAULT 0,
    quantite_reservee INTEGER DEFAULT 0,
    emplacement VARCHAR(50),
    derniere_reception DATE,
    derniere_sortie DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(magasin_id, produit_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_stock_magasin ON stock(magasin_id);
CREATE INDEX idx_stock_produit ON stock(produit_id);
CREATE INDEX idx_stock_quantite ON stock(quantite);

-- =============================================
-- TABLE: Clients
-- =============================================
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    numero_client VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    telephone VARCHAR(20),
    date_naissance DATE,
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    date_inscription DATE DEFAULT CURRENT_DATE,
    carte_fidelite BOOLEAN DEFAULT FALSE,
    points_fidelite INTEGER DEFAULT 0,
    segment VARCHAR(50), -- VIP, Premium, Standard, Nouveau
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour recherches rapides
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_segment ON clients(segment);

-- =============================================
-- TABLE: Ventes (transactions)
-- =============================================
CREATE TABLE ventes (
    id SERIAL PRIMARY KEY,
    numero_vente VARCHAR(30) UNIQUE NOT NULL,
    magasin_id INTEGER REFERENCES magasins(id),
    client_id INTEGER REFERENCES clients(id),
    date_vente TIMESTAMP NOT NULL,
    montant_ht DECIMAL(15,2) NOT NULL,
    montant_tva DECIMAL(15,2) NOT NULL,
    montant_ttc DECIMAL(15,2) NOT NULL,
    remise_montant DECIMAL(15,2) DEFAULT 0,
    remise_pourcentage DECIMAL(5,2) DEFAULT 0,
    mode_paiement VARCHAR(50), -- CB, Especes, Cheque, Virement
    statut VARCHAR(20) DEFAULT 'validee', -- validee, annulee, retournee
    vendeur_id INTEGER,
    campagne_promo VARCHAR(100),
    canal_vente VARCHAR(50) DEFAULT 'magasin', -- magasin, web, mobile
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour analyses temporelles et par magasin
CREATE INDEX idx_ventes_date ON ventes(date_vente);
CREATE INDEX idx_ventes_magasin ON ventes(magasin_id);
CREATE INDEX idx_ventes_client ON ventes(client_id);
CREATE INDEX idx_ventes_statut ON ventes(statut);

-- =============================================
-- TABLE: Lignes de ventes
-- =============================================
CREATE TABLE lignes_ventes (
    id SERIAL PRIMARY KEY,
    vente_id INTEGER REFERENCES ventes(id) ON DELETE CASCADE,
    produit_id INTEGER REFERENCES produits(id),
    quantite INTEGER NOT NULL,
    prix_unitaire_ht DECIMAL(10,2) NOT NULL,
    prix_unitaire_ttc DECIMAL(10,2) NOT NULL,
    tva_taux DECIMAL(5,2) NOT NULL,
    remise_ligne DECIMAL(10,2) DEFAULT 0,
    montant_total_ht DECIMAL(15,2) NOT NULL,
    montant_total_ttc DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lignes_ventes_vente ON lignes_ventes(vente_id);
CREATE INDEX idx_lignes_ventes_produit ON lignes_ventes(produit_id);

-- =============================================
-- TABLE: Achats fournisseurs
-- =============================================
CREATE TABLE fournisseurs (
    id SERIAL PRIMARY KEY,
    code_fournisseur VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    contact VARCHAR(100),
    email VARCHAR(150),
    telephone VARCHAR(20),
    adresse TEXT,
    delai_livraison_jours INTEGER DEFAULT 7,
    conditions_paiement VARCHAR(50),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE achats (
    id SERIAL PRIMARY KEY,
    numero_achat VARCHAR(30) UNIQUE NOT NULL,
    fournisseur_id INTEGER REFERENCES fournisseurs(id),
    magasin_id INTEGER REFERENCES magasins(id),
    date_commande DATE NOT NULL,
    date_livraison_prevue DATE,
    date_livraison_reelle DATE,
    montant_total_ht DECIMAL(15,2) NOT NULL,
    montant_total_ttc DECIMAL(15,2) NOT NULL,
    statut VARCHAR(20) DEFAULT 'commande', -- commande, expedie, recu, annule
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_achats_fournisseur ON achats(fournisseur_id);
CREATE INDEX idx_achats_magasin ON achats(magasin_id);
CREATE INDEX idx_achats_date ON achats(date_commande);

CREATE TABLE lignes_achats (
    id SERIAL PRIMARY KEY,
    achat_id INTEGER REFERENCES achats(id) ON DELETE CASCADE,
    produit_id INTEGER REFERENCES produits(id),
    quantite INTEGER NOT NULL,
    prix_unitaire_ht DECIMAL(10,2) NOT NULL,
    montant_total_ht DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: Budget
-- =============================================
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    annee INTEGER NOT NULL,
    trimestre INTEGER CHECK (trimestre BETWEEN 1 AND 4),
    mois INTEGER CHECK (mois BETWEEN 1 AND 12),
    magasin_id INTEGER REFERENCES magasins(id),
    categorie VARCHAR(100) NOT NULL, -- Marketing, Personnel, Loyers, Logistique, IT, etc.
    montant_prevu DECIMAL(15,2) NOT NULL,
    montant_realise DECIMAL(15,2) DEFAULT 0,
    commentaire TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(annee, trimestre, mois, magasin_id, categorie)
);

CREATE INDEX idx_budgets_periode ON budgets(annee, trimestre, mois);
CREATE INDEX idx_budgets_magasin ON budgets(magasin_id);

-- =============================================
-- TABLE: Objectifs
-- =============================================
CREATE TABLE objectifs (
    id SERIAL PRIMARY KEY,
    magasin_id INTEGER REFERENCES magasins(id),
    annee INTEGER NOT NULL,
    trimestre INTEGER CHECK (trimestre BETWEEN 1 AND 4),
    mois INTEGER CHECK (mois BETWEEN 1 AND 12),
    type_objectif VARCHAR(50), -- ca, marge, clients, conversion
    valeur_cible DECIMAL(15,2) NOT NULL,
    valeur_realisee DECIMAL(15,2) DEFAULT 0,
    unite VARCHAR(20), -- euros, pourcentage, nombre
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_objectifs_periode ON objectifs(annee, trimestre, mois);
CREATE INDEX idx_objectifs_magasin ON objectifs(magasin_id);

-- =============================================
-- TABLE: Promotions / Campagnes
-- =============================================
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    code_promo VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    type_remise VARCHAR(20), -- pourcentage, montant_fixe
    valeur_remise DECIMAL(10,2) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: Employés / Vendeurs
-- =============================================
CREATE TABLE employes (
    id SERIAL PRIMARY KEY,
    matricule VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    telephone VARCHAR(20),
    poste VARCHAR(100),
    magasin_id INTEGER REFERENCES magasins(id),
    date_embauche DATE,
    salaire_brut DECIMAL(10,2),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- VUES MATÉRIALISÉES pour analyses rapides
-- =============================================

-- Vue: CA par magasin et période
CREATE MATERIALIZED VIEW mv_ca_magasin_mensuel AS
SELECT 
    m.id as magasin_id,
    m.nom as magasin_nom,
    m.region_id,
    EXTRACT(YEAR FROM v.date_vente) as annee,
    EXTRACT(MONTH FROM v.date_vente) as mois,
    COUNT(DISTINCT v.id) as nombre_ventes,
    COUNT(DISTINCT v.client_id) as nombre_clients,
    SUM(v.montant_ttc) as ca_total,
    SUM(v.montant_ht) as ca_ht,
    AVG(v.montant_ttc) as panier_moyen
FROM ventes v
JOIN magasins m ON v.magasin_id = m.id
WHERE v.statut = 'validee'
GROUP BY m.id, m.nom, m.region_id, annee, mois;

CREATE UNIQUE INDEX idx_mv_ca_magasin ON mv_ca_magasin_mensuel(magasin_id, annee, mois);

-- Vue: Marge par produit
CREATE MATERIALIZED VIEW mv_marge_produit AS
SELECT 
    p.id as produit_id,
    p.sku,
    p.nom as produit_nom,
    c.nom as categorie,
    p.prix_achat,
    p.prix_vente,
    (p.prix_vente - p.prix_achat) as marge_unitaire,
    ROUND(((p.prix_vente - p.prix_achat) / NULLIF(p.prix_vente, 0) * 100), 2) as taux_marge,
    SUM(lv.quantite) as quantite_vendue,
    SUM(lv.montant_total_ht) as ca_genere
FROM produits p
LEFT JOIN categories c ON p.categorie_id = c.id
LEFT JOIN lignes_ventes lv ON p.id = lv.produit_id
GROUP BY p.id, p.sku, p.nom, c.nom, p.prix_achat, p.prix_vente;

CREATE UNIQUE INDEX idx_mv_marge_produit ON mv_marge_produit(produit_id);

-- Vue: Stock par magasin avec alertes
CREATE MATERIALIZED VIEW mv_stock_alertes AS
SELECT 
    m.id as magasin_id,
    m.nom as magasin_nom,
    p.id as produit_id,
    p.sku,
    p.nom as produit_nom,
    s.quantite,
    s.quantite_reservee,
    (s.quantite - s.quantite_reservee) as quantite_disponible,
    p.stock_minimum,
    p.stock_securite,
    CASE 
        WHEN (s.quantite - s.quantite_reservee) <= p.stock_minimum THEN 'critique'
        WHEN (s.quantite - s.quantite_reservee) <= p.stock_securite THEN 'attention'
        ELSE 'normal'
    END as niveau_alerte
FROM stock s
JOIN magasins m ON s.magasin_id = m.id
JOIN produits p ON s.produit_id = p.id;

CREATE INDEX idx_mv_stock_alerte ON mv_stock_alertes(niveau_alerte);

-- =============================================
-- FONCTIONS UTILITAIRES
-- =============================================

-- Fonction: Calculer le taux de rotation du stock
CREATE OR REPLACE FUNCTION calculer_rotation_stock(
    p_magasin_id INTEGER,
    p_produit_id INTEGER,
    p_periode_jours INTEGER DEFAULT 30
)
RETURNS DECIMAL AS $$
DECLARE
    v_quantite_vendue INTEGER;
    v_stock_moyen DECIMAL;
    v_rotation DECIMAL;
BEGIN
    -- Quantité vendue sur la période
    SELECT COALESCE(SUM(lv.quantite), 0)
    INTO v_quantite_vendue
    FROM lignes_ventes lv
    JOIN ventes v ON lv.vente_id = v.id
    WHERE v.magasin_id = p_magasin_id
    AND lv.produit_id = p_produit_id
    AND v.date_vente >= CURRENT_DATE - p_periode_jours
    AND v.statut = 'validee';
    
    -- Stock moyen
    SELECT COALESCE(AVG(quantite), 0)
    INTO v_stock_moyen
    FROM stock
    WHERE magasin_id = p_magasin_id
    AND produit_id = p_produit_id;
    
    -- Calcul rotation (quantité vendue / stock moyen)
    IF v_stock_moyen > 0 THEN
        v_rotation := v_quantite_vendue / v_stock_moyen;
    ELSE
        v_rotation := 0;
    END IF;
    
    RETURN v_rotation;
END;
$$ LANGUAGE plpgsql;

-- Fonction: Rafraîchir toutes les vues matérialisées
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ca_magasin_mensuel;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_marge_produit;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_stock_alertes;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger: Mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables pertinentes
CREATE TRIGGER update_magasins_updated_at BEFORE UPDATE ON magasins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produits_updated_at BEFORE UPDATE ON produits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_updated_at BEFORE UPDATE ON stock
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Mettre à jour le stock après une vente
CREATE OR REPLACE FUNCTION update_stock_after_sale()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE stock
    SET quantite = quantite - NEW.quantite,
        derniere_sortie = CURRENT_DATE,
        updated_at = CURRENT_TIMESTAMP
    WHERE magasin_id = (SELECT magasin_id FROM ventes WHERE id = NEW.vente_id)
    AND produit_id = NEW.produit_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_after_sale
AFTER INSERT ON lignes_ventes
FOR EACH ROW EXECUTE FUNCTION update_stock_after_sale();

-- =============================================
-- DONNÉES DE TEST (optionnel)
-- =============================================

-- Insertion de régions
INSERT INTO regions (code, nom) VALUES 
('IDF', 'Île-de-France'),
('ARA', 'Auvergne-Rhône-Alpes'),
('PACA', 'Provence-Alpes-Côte d''Azur'),
('NAQ', 'Nouvelle-Aquitaine'),
('HDF', 'Hauts-de-France');

-- Les autres insertions de données de test peuvent suivre...