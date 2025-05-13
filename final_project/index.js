const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Initialisation de la session pour les routes /customer
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Middleware d'authentification pour toutes les routes /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        const token = req.session.authorization.accessToken;
        jwt.verify(token, "fingerprint_customer", (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "Utilisateur non authentifié" });
            }
        });
    } else {
        return res.status(403).json({ message: "Utilisateur non connecté" });
    }
});

// Routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Démarrage du serveur
const PORT = 5000;
app.listen(PORT, () => console.log("Server is running"));
