const Order = require("../models/Order");

const createOrder = async (req, res) => {
  try {
    const { user_id, items } = req.body;

    let montoTotal = 0;

    items.forEach((item) => {
      monto_total += item.unit_price * item.product_quantity;
    });

    const newOrder = new Order({
      user_id,
      items,
      monto_total,
    });
    res.status(201).json({
      message: "¡Pedido creado y mensaje listo para WhatsApp!",
      order: savedOrder,
    });
    const savedOrder = await newOrder.save();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
