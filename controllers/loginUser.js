require("dotenv").config();
const loginRouter = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

loginRouter.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExist = await User.findOne({ email });

    if (!userExist) {
      return res.status(400).json({ error: "email o contraseña invalidos" });
    }

    if (!userExist.verified) {
      return res.status(400).json({ error: "email no verificado" });
    }

    const isCorrect = await bcrypt.compare(password, userExist.password_hash);

    if (!isCorrect) {
      return res.status(400).json({ error: "email o contraseña invalidos" });
    }

    const userForToken = {
      id: userExist.id,
      roles: userExist.roles || [],
    };

    const accessToken = jwt.sign(
      userForToken,
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("access_token", accessToken, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });

    console.log(
      `[SUCCESS]: Login exitoso para ${email}. Cookie 'access_token' generada.\n`,
    );
    return res.sendStatus(200);
  } catch (error) {
    console.error("Error en el login:", error);
    return res
      .status(500)
      .json({ error: "Ocurrió un error interno en el servidor." });
  }
});

module.exports = loginRouter;
