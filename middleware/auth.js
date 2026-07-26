const jwt = require("jsonwebtoken");

const userExtractor = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res
      .status(401)
      .json({ error: "Falta el token de autenticación o ha expirado" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken.id) {
      return res
        .status(401)
        .json({ error: "Token inválido o mal estructurado" });
    }

    req.user = {
      id: decodedToken.id,
      roles: decodedToken.roles || [],
    };

    next();
  } catch (error) {
    console.error("[AUTH ERROR]:", error.message);
    return res.status(401).json({ error: "Token inválido o vencido" });
  }
};

const isAdmin = (req, res, next) => {
  if (
    !req.user ||
    !Array.isArray(req.user.roles) ||
    !req.user.roles.includes("admin")
  ) {
    return res.status(403).json({
      error: "Acceso Denegado",
    });
  }
  next();
};

module.exports = {
  userExtractor,
  isAdmin,
};
