const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.cookies["access-token"];
    if (!token) {
        return res
            .status(401)
            .json({
                message: "Acceso denegado. Token no proporcionado.",
                code: "E401",
            });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: "Token inválido." });
    }
};

module.exports = { verifyToken };