-- Table pour gérer les abonnements des parents
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    plan VARCHAR(50) NOT NULL, -- 'monthly' ou 'annual'
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'cancelled'
    wave_transaction_id VARCHAR(255),
    FOREIGN KEY (parent_id) REFERENCES users(id) -- Assurez-vous que votre table utilisateur s'appelle 'users'
);

-- Table pour enregistrer les transactions entre parents et enseignants
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    teacher_id INT NOT NULL,
    montant_total DECIMAL(10, 2) NOT NULL,
    commission DECIMAL(10, 2) NOT NULL,
    net_enseignant DECIMAL(10, 2) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    wave_transaction_id VARCHAR(255),
    FOREIGN KEY (parent_id) REFERENCES users(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Ajout d'une colonne pour le mode premium dans la table des utilisateurs (parents)
ALTER TABLE users ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN trial_end_date TIMESTAMP;

-- Table pour les notifications de contrat
CREATE TABLE contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    teacher_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'refused'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);
