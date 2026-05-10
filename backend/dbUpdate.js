const pool = require('./config/db');

async function updateDatabase() {
  try {
    console.log("Mise à jour de la table contracts...");

    try {
      await pool.query('ALTER TABLE contracts DROP COLUMN child_name');
      console.log("Colonne child_name supprimée.");
    } catch {
      console.log("child_name déjà supprimée.");
    }

    try {
      await pool.query('ALTER TABLE contracts ADD COLUMN children_count INT DEFAULT 1');
      console.log("Colonne children_count ajoutée.");
    } catch {
      console.log("children_count existe déjà.");
    }

    try {
      await pool.query('ALTER TABLE contracts ADD COLUMN class_level VARCHAR(50)');
      console.log("Colonne class_level ajoutée.");
    } catch {
      console.log("class_level existe déjà.");
    }

    console.log("Terminé avec succès. Fermeture.");
    process.exit(0);
  } catch (err) {
    console.error("Erreur globale:", err);
    process.exit(1);
  }
}

updateDatabase();
