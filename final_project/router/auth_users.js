const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Vérifie si un nom d'utilisateur est valide (déjà utilisé)
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Vérifie que le nom d'utilisateur et le mot de passe correspondent
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Connexion utilisateur
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect." });
  }

  const accessToken = jwt.sign({ username: username }, "fingerprint_customer", { expiresIn: '1h' });

  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({ message: "Connexion réussie.", token: accessToken });
});

// Ajouter ou modifier une critique de livre
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;

  if (!review) {
    return res.status(400).json({ message: "La critique est requise." });
  }

  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "Non autorisé. Veuillez vous connecter." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Livre non trouvé pour cet ISBN." });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Critique ajoutée ou mise à jour avec succès.",
    reviews: books[isbn].reviews
  });
});

// Supprimer une critique de livre
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "Non autorisé. Veuillez vous connecter." });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Livre non trouvé pour cet ISBN." });
  }

  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "Aucune critique trouvée à supprimer pour cet utilisateur." });
  }

  // Supprime la critique de l'utilisateur
  delete book.reviews[username];

  return res.status(200).json({
    message: "Critique supprimée avec succès.",
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
