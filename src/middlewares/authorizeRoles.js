const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(403).json({ message: "Usuario No Autorizado" });
        }

        const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
        console.log("response: ", hasRole);

        if (!hasRole) {
            return res
                .status(403)
                .json({ message: "No tienes permisos para esta acción" });
        }

        next();
    };
};

module.exports = { authorizeRoles };
