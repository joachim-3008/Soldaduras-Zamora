const bcrypt = require("bcrypt");
const User = require("../models/User");
const { validateEmail } = require("../utils/emailValidator");

const registerUser = async (req, res) => {
  try {
    const { email, password, profile } = req.body;

    if (!email || !password || !profile || !profile.name) {
      return res.status(400).json({
        error:
          "Todos los campos (nombre, correo y contraseña) son obligatorios.",
      });
    }

    const emailCheck = await validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({
        error: emailCheck.error,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "El correo electrónico ya está registrado.",
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const isVerified = emailCheck.valid;

    const newUser = new User({
      email,
      password_hash: passwordHash,
      profile: {
        name: profile.name,
      },
      verified: isVerified,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: savedUser,
    });
  } catch (error) {
    console.error("Error en el registro del usuario:", error);
    res.status(500).json({
      error: "Ocurrió un error interno en el servidor.",
    });
  }
};

module.exports = {
  registerUser,
};
