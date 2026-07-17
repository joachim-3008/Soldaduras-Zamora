const axios = require('axios');

async function validateEmail(email) {
    if (!email) {
        return { valid: false, error: 'El correo es requerido.' };
    }

    const apiKey = process.env.ABSTRACT_API_KEY;
    const url = `https://emailreputation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        // 1. Validar si el correo es temporal/desechable
        if (data.email_quality && data.email_quality.is_disposable === true) {
            return { valid: false, error: 'No se permiten correos electrónicos temporales o desechables.' };
        }

        // 2. Validar si el dominio del correo es totalmente inválido a nivel SMTP
        if (data.email_deliverability && data.email_deliverability.status === 'undeliverable') {
            return { valid: false, error: 'El correo ingresado no existe.' };
        }

        return { valid: true };

    } catch (error) {
        // Imprimir en consola de backend por qué falló Abstract (p.ej. API Key incorrecta/agotada)
        if (error.response) {
            console.error('Error devuelto por la API de Abstract (Código', error.response.status, '):', error.response.data);
        } else {
            console.error('Error con la API de Abstract:', error.message);
        }
        
        // Si la API falla por motivos externos, dejamos pasar el flujo para no romper el registro de usuarios reales
        return { valid: true }; 
    }
}

module.exports = { validateEmail };