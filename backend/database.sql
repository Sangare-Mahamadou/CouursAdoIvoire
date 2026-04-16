-- ==============================================
-- 1. Copier tout ce texte.
-- 2. Ouvrir phpMyAdmin (http://localhost/phpmyadmin)
-- 3. Cliquer sur l'onglet "SQL".
-- 4. Coller le texte et cliquer sur "Exécuter".
-- ==============================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS educours_ci;
USE educours_ci;

-- Table des utilisateurs (Parents et Enseignants)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('parent', 'teacher') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des profils enseignants (liée à users)
CREATE TABLE IF NOT EXISTS teachers_profile (
    user_id INT PRIMARY KEY,
    diploma_level VARCHAR(50) NOT NULL,
    hourly_rate INT NOT NULL,
    subjects VARCHAR(255) DEFAULT '',
    description TEXT,
    rating DECIMAL(3, 1) DEFAULT 0.0,
    reviews_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des contrats (entre parents et enseignants)
CREATE TABLE IF NOT EXISTS contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    teacher_id INT NOT NULL,
    child_name VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    hours_per_week INT NOT NULL,
    hourly_rate INT NOT NULL,
    status ENUM('pending', 'active', 'rejected', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- L'utilisateur de test sera créé plus tard via l'API.
