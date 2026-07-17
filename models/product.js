const mongoose = require("mongoose");

//modelos o esquemas de la base de datos
const productSchema = new mongoose.Schema({
    //id unico del producto en el local/negocio
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  pictures: {
    type: [String],
    default: [],
  },
  specs: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

productSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;