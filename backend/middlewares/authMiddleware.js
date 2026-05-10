const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Récupérer le token depuis le header d'autorisation (Bearer Token)
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: "Accès refusé, token manquant." });
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
        // Vérifier la validité du token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        // Ajouter les infos de l'utilisateur (id, role, name) à la requête
        req.user = verified;
        next(); // Passer à l'étape suivante (le contrôleur)
    } catch {
        res.status(401).json({ message: "Token invalide." });
    }
};
