const mongoose = require("mongoose");

//modelos o esquemas de la base de datos
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },

  //identificador del id unico de cada producto 

  slug: {
    type: String,
    required: true,
    unique: true,
  },
});

categorySchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;