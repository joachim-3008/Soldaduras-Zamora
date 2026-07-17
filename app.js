require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const { registerUser } = require('./controllers/users');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const loginRouter = require('./controllers/loginUser');

//usar cuando no agarre el DNS de la computadora, para que agarre el de Google 
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);


(async() => {

    try {
        await mongoose.connect(process.env.MONGO_URI_TEST);
        console.log('Conexión a la base de datos establecida');
    } catch (error) {
        console.error('Error al conectar a la BD:', error);
    }
})();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('src'));
app.use(express.static('views'));
app.use(cookieParser());


app.use('/', express.static(path.resolve('views', 'home')));
app.use('/signup', express.static(path.resolve('views', 'signup')));
app.use('/login', express.static(path.resolve('views', 'login')));
app.use('/terms', express.static(path.resolve('views', 'termsAndConditions', 'terms.html')));
app.use('/privacy', express.static(path.resolve('views', 'termsAndConditions', 'privacy.html')));
app.use('/catalogo', express.static(path.resolve('views', 'home', 'index2.html')));

//Rutas backend
app.post('/api/signup', registerUser);
app.use('/api/login', loginRouter);



module.exports = app;