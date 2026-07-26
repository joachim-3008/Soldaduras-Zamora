require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const { registerUser } = require("./controllers/users");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const loginRouter = require("./controllers/loginUser");
const productsRouter = require("./controllers/products");
const categoriesRouter = require("./controllers/categories");
const { userExtractor } = require("./middleware/auth");

const dns = require("dns");
const { MONGO_URI } = require("./config");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Conexión a la base de datos establecida");
  } catch (error) {
    console.error("Error al conectar a la BD:", error);
  }
})();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("src"));
app.use(express.static("views"));
app.use(cookieParser());

app.use("/", express.static(path.resolve("views", "home")));
app.use("/signup", express.static(path.resolve("views", "signup")));
app.use("/login", express.static(path.resolve("views", "login")));
app.use(
  "/terms",
  express.static(path.resolve("views", "termsAndConditions", "terms.html")),
);
app.use(
  "/privacy",
  express.static(path.resolve("views", "termsAndConditions", "privacy.html")),
);
app.use("/catalogo", express.static(path.resolve("views", "catalogo")));

app.post("/api/signup", registerUser);
app.use("/api/login", loginRouter);
app.get("/api/me", userExtractor, (req, res) => {
  res.json(req.user);
});
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);

module.exports = app;
