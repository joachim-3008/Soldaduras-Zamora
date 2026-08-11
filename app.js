// Cargamos las variables secretas que tenemos guardadas en el archivo .env
require("dotenv").config(); 

const express = require("express");
const app = express();

const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dns = require("dns");
const { MONGO_URI } = require("./config");

// Importamos los enrutadores
const { registerUser } = require("./controllers/users");
const loginRouter = require("./controllers/loginUser");
const productsRouter = require("./controllers/products");
const categoriesRouter = require("./controllers/categories");
const logoutRouter = require('./controllers/logout');
const paypalRouter = require("./controllers/paypal"); 
const { userExtractor } = require("./middleware/auth");


// Forzamos a Node.js a usar los servidores DNS seguros de Google
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Conexión automática a MongoDB
(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Conexión a la base de datos establecida");
  } catch (error) {
    console.error("Error al conectar a la BD:", error);
  }
})();

// === CONFIGURACIÓN DE MIDDLEWARES GLOBALES ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("views"));
app.use(express.static("src"));
app.use(cookieParser());

// === RUTAS DE ARCHIVOS ESTÁTICOS ===
app.use('/', paypalRouter);
app.use("/", express.static(path.resolve("views", "home")));
app.use("/nuevoProd", express.static(path.resolve("views", "nuevoProd")));
app.use("/signup", express.static(path.resolve("views", "signup")));
app.use("/login", express.static(path.resolve("views", "login")));
app.use("/terms", express.static(path.resolve("views", "termsAndConditions", "terms.html")));
app.use("/privacy", express.static(path.resolve("views", "termsAndConditions", "privacy.html")));
app.use("/catalogo", express.static(path.resolve("views", "catalogo")));
app.use("/cart", express.static(path.resolve("views", "cart")));

// === RUTAS DE API ===
app.post("/api/signup", registerUser);
app.use("/api/login", loginRouter);
app.use('/api/logout', logoutRouter);
app.get("/api/me", userExtractor, (req, res) => {
  res.json(req.user);
});
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);

// === ENDPOINTS DE LA PASARELA DE PAGOS PAYPAL (Montados limpiamente desde el router) ===
app.use("/", paypalRouter); // Esto habilitará /create-order y /capture-order automáticamente

// Exportamos nuestro servidor
module.exports = app;