const express = require("express");
const paypalRouter = express.Router();
const axios = require("axios");
const Product = require("../models/Product"); 
const Order = require("../models/Order");     

// Función privada para pedir permiso secreto a PayPal y obtener la llave temporal (token)
async function getPayPalAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET;
    
    if (!clientId || !clientSecret) {
        console.error("Faltan las credenciales de PayPal en el archivo .env");
        throw new Error("Faltan credenciales de PayPal configuradas en el servidor");
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    try {
        const response = await axios.post(
            "https://api-m.sandbox.paypal.com/v1/oauth2/token",
            "grant_type=client_credentials",
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("Error obteniendo token de PayPal:", error.response?.data || error.message);
        throw new Error("No se pudo autenticar con PayPal");
    }
}

// 1. Endpoint para crear una orden de pago en PayPal
paypalRouter.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!amount) {
            return res.status(400).json({ error: "El monto es obligatorio" });
        }

        const accessToken = await getPayPalAccessToken();

        const response = await axios.post(
            "https://api-m.sandbox.paypal.com/v2/checkout/orders",
            {
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD",
                            value: amount.toString(),
                        },
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.json({ id: response.data.id });
    } catch (err) {
        console.error("DETALLE DEL ERROR EN PAYPAL:", err.response?.data || err.message);
        res.status(500).json({ error: err.response?.data?.message || err.message });
    }
});

// 2. Endpoint para confirmar, capturar el pago, guardar el pedido y actualizar el stock
paypalRouter.post("/capture-order", async (req, res) => {
    console.log("--- LLEGÓ UNA PETICIÓN A /capture-order ---");
    console.log("BODY RECIBIDO:", req.body);
    try {
        const { orderID, cart } = req.body;

        if (!orderID || !Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({ error: "Datos de orden incompletos" });
        }

        const accessToken = await getPayPalAccessToken();

        // Llamada a PayPal para confirmar y cobrar
        const response = await axios.post(
            `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const captureData = response.data;
        const paymentStatus = captureData.status;

        if (paymentStatus !== "COMPLETED") {
            return res.status(400).json({ error: "El pago no se completó correctamente", details: captureData });
        }

        const purchasedItems = cart.map((item) => ({
            product_id: item.product_id || item._id || item.id,
            product_quantity: item.product_quantity,
            unit_price: item.unit_price,
        }));

        // Actualizamos el stock de cada producto en MongoDB y validamos existencia
        for (const item of purchasedItems) {
            if (!item.product_id) {
                return res.status(400).json({ error: "Producto sin ID en el carrito" });
            }

            const updatedProduct = await Product.findOneAndUpdate(
                { _id: item.product_id },
                { $inc: { stock: -item.product_quantity } },
                { new: true },
            );

            if (!updatedProduct) {
                return res.status(404).json({ error: `No se encontró el producto con ID ${item.product_id}` });
            }
        }

        const montoTotal = purchasedItems.reduce(
            (acc, item) => acc + item.unit_price * item.product_quantity,
            0,
        );

        const captureRecord =
            captureData.purchase_units?.[0]?.payments?.captures?.[0] || {};

        const nuevoPedido = new Order({
            user_id: req.user?.id || null,
            items: purchasedItems,
            monto_total: montoTotal,
            payment_info: {
                paypal_order_id: orderID,
                capture_id: captureRecord.id || null,
                status: captureRecord.status || paymentStatus,
                amount: captureRecord.amount || captureData.purchase_units?.[0]?.amount,
                payer: captureData.payer || {},
                raw: captureData,
            },
        });

        const pedidoGuardado = await nuevoPedido.save();
        console.log("¡Pago exitoso! Pedido guardado en MongoDB con ID:", pedidoGuardado._id);

        res.status(201).json({
            message: "Pago completado con éxito y pedido guardado",
            order: pedidoGuardado,
            payment: captureData,
        });
    } catch (err) {
        console.error("ERROR DETALLADO AL CAPTURAR / GUARDAR:", err.response?.data || err.errors || err.message || err);
        const errorMessage = err.response?.data?.message || err.message || "Error desconocido";
        res.status(500).json({ error: errorMessage });
    }
});

module.exports = paypalRouter;