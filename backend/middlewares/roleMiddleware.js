exports.requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Acces refuse" });
        }

        next();
    };
};

exports.requireAdmin = exports.requireRole('admin');
