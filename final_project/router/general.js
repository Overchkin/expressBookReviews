const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Enregistrement d'un nouvel utilisateur
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Vérification que les champs sont présents
  if (!username || !password) {
    return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis." });
  }

  // Vérifie si l'utilisateur existe déjà
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Nom d'utilisateur déjà utilisé." });
  }

  // Ajoute le nouvel utilisateur
  users.push({ username, password });
  return res.status(201).json({ message: `L'utilisateur "${username}" a été créé avec succès.` });
});

// Obtenir la liste des livres
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

// Obtenir un livre par ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Livre non trouvé pour cet ISBN." });
  }
});

// Obtenir des livres par auteur
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const matchingBooks = Object.values(books).filter(
    book => book.author.toLowerCase() === author
  );

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "Aucun livre trouvé pour cet auteur." });
  }
});

// Obtenir des livres par titre
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const matchingBooks = Object.values(books).filter(
    book => book.title.toLowerCase() === title
  );

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "Aucun livre trouvé pour ce titre." });
  }
});

// Obtenir les critiques d'un livre par ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Livre non trouvé pour cet ISBN." });
  }
});

module.exports.general = public_users;
