const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Acceso denegado. Token no proporcionado.", code: "E401" });
    }

    try {

        const tokenValue = token.split(" ")[1];
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token inválido o expirado.", code: "E403" });
    }
};
