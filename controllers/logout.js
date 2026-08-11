// Importamos el enrutador de Express para manejar la ruta de cierre de sesión.
const logoutRouter = require("express").Router();

// Creamos una función reutilizable que maneja la lógica tanto para peticiones GET como POST de cierre de sesión.
const handleLogout = (req, res) => {
  const tokenName = "access_token"; // Definimos el nombre de la cookie que guarda la sesión del usuario.
  const hasToken = req.cookies?.[tokenName]; // Verificamos si la cookie de acceso existe en la petición.

  // Si el usuario no tiene la cookie de sesión (no está logueado), respondemos con un código 401 (No autorizado).
  if (!hasToken) {
    return res.sendStatus(401);
  }

  // Si la cookie existe, le ordenamos al navegador que la borre limpiándola de forma segura.
  res.clearCookie(tokenName, {
    path: "/", // Aseguramos que se borre en toda la aplicación.
    secure: process.env.NODE_ENV === "production", // Solo requiere HTTPS si estamos en producción.
    httpOnly: true, // Protege la cookie para que JavaScript del lado del cliente no pueda leerla.
  });

  // Respondemos con un código 204 (Sin contenido), indicando que la operación de cierre de sesión fue exitosa.
  return res.sendStatus(204);
};

// Registramos la función para que responda tanto a solicitudes de tipo GET como POST en la ruta de logout.
logoutRouter.get("/", handleLogout);
logoutRouter.post("/", handleLogout);

// Exportamos el enrutador para poder montarlo en el servidor principal de Express.
module.exports = logoutRouter;