const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

function environment() {
    let clientId = process.env.PAYPAL_CLIENT_ID;
    let clientSecret = process.env.PAYPAL_SECRET;
    
    // Entorno de pruebas (Sandbox). Cuando pases a producción, cámbialo a LiveEnvironment
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };