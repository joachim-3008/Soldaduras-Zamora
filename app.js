const express = require('express');
const app = express();
const path = require('path');

app.use(express.static('src'));
app.use(express.static('views'));

app.use('/', express.static(path.resolve('views', 'home')));
app.use('/signup', express.static(path.resolve('views', 'signup')));
app.use('/login', express.static(path.resolve('views', 'login')));
app.use('/terms', express.static(path.resolve('views', 'termsAndConditions', 'terms.html')));
app.use('/privacy', express.static(path.resolve('views', 'termsAndConditions', 'privacy.html')));

module.exports = app;