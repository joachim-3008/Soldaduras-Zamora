// Cargamos las variables de entorno desde un archivo .env al inicio de la aplicación.
require("dotenv").config();
// Importamos el enrutador de Express para manejar la ruta de inicio de sesión.
const loginRouter = require("express").Router();
// Importamos el modelo de Usuario de Mongoose para buscar en la base de datos.
const User = require("../models/User");
// Importamos bcrypt para comparar de forma segura la contraseña ingresada con la encriptada.
const bcrypt = require("bcrypt");
// Importamos jsonwebtoken para generar el token de sesión (JWT).
const jwt = require("jsonwebtoken");

// Definimos la ruta POST para procesar el inicio de sesión.
loginRouter.post("/", async (req, res) => {
  try {
    // Extraemos el correo y la contraseña enviados desde el cuerpo de la petición.
    const { email, password } = req.body;

    // Buscamos si existe un usuario registrado con ese correo electrónico.
    const userExist = await User.findOne({ email });

    // Si el usuario no existe, respondemos con un error 400 (Datos inválidos por seguridad).
    if (!userExist) {
      return res.status(400).json({ error: "email o contraseña invalidos" });
    }

    // Verificamos si el usuario ya ha verificado su correo electrónico.
    if (!userExist.verified) {
      return res.status(400).json({ error: "email no verificado" });
    }

    // Comparamos la contraseña ingresada con la contraseña encriptada (hash) almacenada en la base de datos.
    const isCorrect = await bcrypt.compare(password, userExist.password_hash);

    // Si la contraseña no coincide, respondemos con un error 400.
    if (!isCorrect) {
      return res.status(400).json({ error: "email o contraseña invalidos" });
    }

    // Creamos un objeto ligero con la información esencial (payload) que irá dentro del token.
    const userForToken = {
      id: userExist.id,
      roles: userExist.roles || [],
    };

    // Firmamos y generamos el token JWT utilizando una clave secreta y configurando una duración de 1 día.
    const accessToken = jwt.sign(
      userForToken,
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1d",
      },
    );

    // Guardamos el token de acceso dentro de una cookie HTTP-only de manera segura.
    res.cookie("access_token", accessToken, {
      path: "/", // Disponible en toda la aplicación.
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // Expira en 24 horas.
      secure: process.env.NODE_ENV === "production", // Requiere HTTPS solo si estamos en producción.
      httpOnly: true, // Impide que JavaScript del lado del cliente acceda a la cookie, protegiéndola contra ataques XSS.
    });

    // Imprimimos un mensaje de éxito en la consola del servidor con el correo del usuario.
    console.log(
      `[SUCCESS]: Login exitoso para ${email}. Cookie 'access_token' generada.\n`,
    );
    // Respondemos con un código 200 (OK) indicando que el inicio de sesión fue exitoso.
    return res.sendStatus(200);
  } catch (error) {
    // Si ocurre un error inesperado, lo registramos en la consola y respondemos con un error 500 (Servidor).
    console.error("Error en el login:", error);
    return res
      .status(500)
      .json({ error: "Ocurrió un error interno en el servidor." });
  }
});

// Exportamos el enrutador para montarlo en el servidor principal de Express.
module.exports = loginRouter;