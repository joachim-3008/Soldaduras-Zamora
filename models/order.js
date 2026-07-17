const mongoose = require("mongoose");

//sub-esquema para cada item del pedido
const itemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    product_quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit_price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

//modelos o esquemas de la base de datos
const pedidoSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: {
    type: [itemSchema],
    default: [],
  },
  monto_total: {
    type: Number,
    required: true,
    default: 0,
  },
});

pedidoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Order = mongoose.model("Order", pedidoSchema);

module.exports = Order;