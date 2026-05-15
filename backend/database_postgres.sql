-- Suppression des tables existantes pour repartir à zéro (à retirer en prod)
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS teachers_profile CASCADE;
DROP TABLE IF EXISTS users;

-- Table des utilisateurs (Parents, Enseignants, Admin)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('parent', 'teacher', 'admin')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des profils enseignants
CREATE TABLE IF NOT EXISTS teachers_profile (
    user_id INT PRIMARY KEY,
    diploma_level VARCHAR(50) NOT NULL,
    subjects TEXT DEFAULT '',
    description TEXT,
    availability_days INT DEFAULT 5, -- Ajout de la colonne
    rating DECIMAL(3, 1) DEFAULT 0.0,
    reviews_count INT DEFAULT 0,
    profile_picture_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des contrats (entre parents et enseignants)
CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    parent_id INT NOT NULL,
    teacher_id INT NOT NULL,
    child_name VARCHAR(255),
    children_count INT DEFAULT 1,
    class_level VARCHAR(50),
    subject VARCHAR(100) NOT NULL,
    hours_per_week INT NOT NULL,
    hourly_rate INT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'active', 'rejected', 'completed')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des avis (laissés par les parents sur les enseignants)
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    teacher_id INT NOT NULL,
    author_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (teacher_id, author_id) -- Un parent ne peut laisser qu'un seul avis par enseignant
);

-- Créer l'admin par défaut (mot de passe: sangmah)
INSERT INTO users (name, email, phone, city, password_hash, role) 
VALUES ('Administrateur', 'admin@alloprof.ci', '0000000000', 'Admin', '$2b$10$MoSARlQC9hjQYpg9AjUM2uTHlArymaB25.dLwHV3pzvCAyvfk9tMy', 'admin')
ON CONFLICT (phone) DO UPDATE SET
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    role = 'admin';

-- Table des enseignants
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subjects TEXT[],
    level VARCHAR(50),
    availability_days INT DEFAULT 5,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des avis sur la plateforme
CREATE TABLE IF NOT EXISTS platform_reviews (
    id SERIAL PRIMARY KEY,
    author_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des messages (Chat interne)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
