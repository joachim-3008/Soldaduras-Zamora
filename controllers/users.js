const bcrypt = require("bcrypt");
const User = require("../models/User"); // Asegúrate de que la ruta a tu modelo sea correcta
const { validateEmail } = require("../utils/emailValidator"); // Importa la herramienta de verificación

const registerUser = async (req, res) => {
  try {
    const { email, password, profile } = req.body;

    // 1. Validaciones de presencia de datos básicos
    if (!email || !password || !profile || !profile.name) {
      return res.status(400).json({ 
        error: "Todos los campos (nombre, correo y contraseña) son obligatorios." 
      });
    }

    // 2. Ejecutar la validación del correo mediante Abstract API
    const emailCheck = await validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ 
        error: emailCheck.error 
      });
    }

    // 3. Verificar si el usuario ya existe en la Base de Datos
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: "El correo electrónico ya está registrado." 
      });
    }

    // 4. Encriptar la contraseña (Hash)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const isVerified = emailCheck.valid;

    // 5. Instanciar el nuevo usuario conforme al Schema
    const newUser = new User({
      email,
      password_hash: passwordHash,
      profile: {
        name: profile.name
      },
      verified: isVerified
    });

    // 6. Almacenar el documento en MongoDB
    const savedUser = await newUser.save();

    // 7. Responder exitosamente (el Schema de mongoose se encargará de purgar password_hash con su toJSON)
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: savedUser
    });

  } catch (error) {
    console.error("Error en el registro del usuario:", error);
    res.status(500).json({ 
      error: "Ocurrió un error interno en el servidor." 
    });
  }
};

module.exports = {
  registerUser
};