const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Enregistrement utilisateur
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis." });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Nom d'utilisateur déjà utilisé." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "Utilisateur enregistré avec succès." });
});

// Tâche 1 - Liste des livres (sync)
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Tâche 2 - Détail par ISBN (sync)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Livre non trouvé pour cet ISBN." });
  }
});

// Tâche 3 - Détail par auteur (sync)
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const matchingBooks = Object.values(books).filter(book => book.author.toLowerCase() === author);

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "Aucun livre trouvé pour cet auteur." });
  }
});

// Tâche 4 - Détail par titre (sync)
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const matchingBooks = Object.values(books).filter(book => book.title.toLowerCase() === title);

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "Aucun livre trouvé avec ce titre." });
  }
});

// Critiques
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Aucune critique trouvée pour ce livre." });
  }
});


// 🔁 Version async/await avec Axios

// Tâche 1 - Get all books (async)
public_users.get('/books-async', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).json({
      message: "Liste des livres (via async-await)",
      books: response.data
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la récupération des livres", error: error.message });
  }
});

// Tâche 2 - Get book by ISBN (async)
public_users.get('/isbn-async/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return res.status(200).json({
      message: `Détails pour ISBN ${isbn} (via async-await)`,
      book: response.data
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ message: "Livre non trouvé." });
    }
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Tâche 3 - Get books by author (async)
public_users.get('/author-async/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
    return res.status(200).json({
      message: `Livres de l'auteur ${author} (via async-await)`,
      books: response.data
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ message: "Auteur non trouvé." });
    }
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Tâche 4 - Get books by title (async)
public_users.get('/title-async/:title', async (req, res) => {
  const title = req.params.title.toLowerCase();
  try {
    const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
    return res.status(200).json({
      message: `Livres avec le titre '${title}' (via async-await)`,
      books: response.data
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ message: "Titre non trouvé." });
    }
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

module.exports.general = public_users;
