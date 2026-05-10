# AlloProf CI

AlloProf CI est une plateforme web de mise en relation entre parents d'élèves et enseignants à domicile en Côte d'Ivoire.

L'application permet aux parents de rechercher un enseignant, d'envoyer une demande de cours, de suivre les contrats, puis de noter l'enseignant. Les enseignants peuvent gérer leur profil, recevoir des demandes, accepter ou refuser des contrats. Un espace administrateur permet de superviser les utilisateurs et les relations créées sur la plateforme.

## Fonctionnalités

### Parents

- Création de compte parent.
- Connexion avec e-mail ou numéro de téléphone.
- Recherche d'enseignants par matière, ville et niveau.
- Consultation des profils enseignants avec photo, niveau, matières, tarifs et note.
- Envoi d'une demande de cours à un enseignant.
- Possibilité d'ajouter plusieurs classes dans une même demande.
- Définition du nombre d'élèves par classe.
- Suivi des demandes et contrats dans l'espace parent.
- Contacts de l'enseignant masqués tant que le contrat n'est pas accepté.
- Notation de l'enseignant après acceptation du contrat.
- Restriction : un parent ne peut pas recontacter le même enseignant avant un délai d'un mois.

### Enseignants

- Création de compte enseignant.
- Photo de profil obligatoire à l'inscription.
- Choix du niveau ou diplôme : Baccalauréat, BTS/DUT, Licence, Master, Doctorat.
- Ajout des matières enseignées avec prix mensuel.
- Ajout de matières personnalisées.
- Modification complète du profil : nom, e-mail, téléphone, ville, niveau, description, matières, tarifs et photo.
- Consultation des demandes reçues.
- Acceptation ou refus des contrats.
- Affichage des revenus mensuels estimés à partir des contrats actifs.

### Administrateur

- Accès à un tableau de bord admin.
- Consultation des parents inscrits.
- Consultation des enseignants inscrits.
- Consultation de toutes les relations ou contrats.
- Statistiques générales de la plateforme.
- Suppression ou bannissement d'utilisateurs.

## Technologies

### Frontend

- React
- Vite
- React Router
- Lucide React
- CSS personnalisé
- Tailwind configuré

### Backend

- Node.js
- Express
- PostgreSQL
- JWT pour l'authentification
- bcryptjs pour le hachage des mots de passe
- Multer pour la gestion des fichiers
- Vercel Blob pour les photos de profil
- Nodemailer pour les notifications par e-mail

## Structure du projet

```text
CouursAdoIvoire/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── utils/
│   ├── database_postgres.sql
│   ├── migrations.sql
│   └── server.js
├── public/
├── src/
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

## Installation

Installer les dépendances du frontend :

```bash
npm install
```

Installer les dépendances du backend :

```bash
cd backend
npm install
```

## Configuration backend

Créer un fichier `backend/.env` avec les variables suivantes :

```env
PORT=5000
POSTGRES_URL="votre_url_postgres"
BLOB_READ_WRITE_TOKEN="votre_token_vercel_blob"
JWT_SECRET="votre_secret_jwt"
```

Le fichier `.env` ne doit pas être publié sur GitHub, car il contient les accès à la base de données et aux services externes.

## Base de données

Le schéma PostgreSQL principal se trouve dans :

```text
backend/database_postgres.sql
```

Il crée les tables :

- `users`
- `teachers_profile`
- `contracts`

## Lancement en développement

Depuis la racine du projet :

```bash
npm run dev
```

Cette commande lance :

- le frontend Vite sur `http://localhost:5173`
- le backend Express sur `http://localhost:5000`

## Scripts disponibles

```bash
npm run dev
```

Lance le frontend et le backend en même temps.

```bash
npm run build
```

Génère le build de production du frontend.

```bash
npm run lint
```

Vérifie le code avec ESLint.

```bash
npm run preview
```

Prévisualise le build frontend.

## Routes principales

### Frontend

- `/` : page d'accueil
- `/teachers` : recherche d'enseignants
- `/login` : connexion
- `/register` : inscription
- `/dashboard/parent` : espace parent
- `/dashboard/teacher` : espace enseignant
- `/dashboard/admin` : espace administrateur

### API backend

- `POST /api/auth/register` : inscription
- `POST /api/auth/login` : connexion
- `GET /api/teachers` : liste des enseignants
- `GET /api/contracts` : contrats de l'utilisateur connecté
- `POST /api/contracts` : création d'une demande de cours
- `PATCH /api/contracts/:id` : acceptation ou refus d'un contrat
- `POST /api/contracts/:id/rate` : notation d'un enseignant
- `GET /api/users/profile` : profil utilisateur
- `PUT /api/users/profile` : modification du profil
- `GET /api/admin/users` : liste des utilisateurs
- `DELETE /api/admin/users/:id` : suppression d'un utilisateur
- `GET /api/admin/contracts` : liste des contrats

## Notes de sécurité

- Les contacts entre parent et enseignant restent masqués tant que le contrat n'est pas accepté.

## Vérification du projet

Avant de publier une modification, lancer :

```bash
npm run lint
npm run build
```
