const mongoose = require("mongoose");

//modelos o esquemas de la base de datos
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  profile: {
    name: {
      type: String,
      required: true,
    },
    fecha_registro: {
      type: Date,
      default: Date.now,
    },
  },
  roles: {
    type: [String],
    enum: ["cliente", "admin"],
    default: ["cliente"],
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password_hash;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;