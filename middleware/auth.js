const jwt = require('jsonwebtoken');

const userExtractor = (req, res, next) => {
    // 1. Leer la cookie donde guardamos el token
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).json({ error: 'Falta el token de autenticación o ha expirado' });
    }

    try {
        // 2. Verificar el token usando la misma clave secreta del .env
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decodedToken.id) {
            return res.status(401).json({ error: 'Token inválido o mal estructurado' });
        }

        // 3. Inyectar el ID del usuario en el objeto req para que el controlador lo use
        req.userId = decodedToken.id;

        // 4. Continuar al siguiente paso (el controlador de la ruta)
        next();

    } catch (error) {
        console.error('[AUTH ERROR]:', error.message);
        return res.status(401).json({ error: 'Token inválido o vencido' });
    }
};

module.exports = userExtractor;