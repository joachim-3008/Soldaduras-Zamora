// IMPORTACIONES
require('dotenv').config();
const loginRouter = require('express').Router(); 
const User = require('../models/User'); // Corregido: 'User' con U mayúscula
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
// RUTA POST PARA EL LOG IN
loginRouter.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Busca en la base de datos un usuario que coincida con el email ingresado
        const userExist = await User.findOne({ email });

        // Si el usuario NO existe, detiene la ejecución y responde con error 400
        if (!userExist) {
            return res.status(400).json({ error: 'email o contraseña invalidos' });
        }

        // Si el usuario existe pero aun no ha verificado su cuenta/email
        if (!userExist.verified) {
            return res.status(400).json({ error: 'email no verificado' });
        }

        // Compara la contraseña usando "password_hash" (campo de tu registro)
        const isCorrect = await bcrypt.compare(password, userExist.password_hash);

        if (!isCorrect) {
            return res.status(400).json({ error: 'email o contraseña invalidos' });
        }

        // CREACION Y FIRMA DEL TOKEN (JWT)
        const userForToken = {
            id: userExist.id,
        };

        const accessToken = jwt.sign(userForToken, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1d'
        });

        // RESPUESTA AL CLIENTE (COOKIE)
        res.cookie('access_token', accessToken, { // Corregido a 'access_token' con doble 's'
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true
        });

        // Envía un estado 200 de éxito
        console.log(`[SUCCESS]: Login exitoso para ${email}. Cookie 'access_token' generada.\n`);
        return res.sendStatus(200);

    } catch (error) {
        console.error("Error en el login:", error);
        return res.status(500).json({ error: "Ocurrió un error interno en el servidor." });
    }
});

module.exports = loginRouter;