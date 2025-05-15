const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ... tes autres routes ici ...

// Route synchrone classique pour auteur (existante)
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const matchingBooks = Object.values(books).filter(book => book.author.toLowerCase() === author);

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "Aucun livre trouvé pour cet auteur." });
  }
});

// Route async-await avec Axios pour récupérer les livres par auteur
public_users.get('/author-async/:author', async (req, res) => {
  const author = req.params.author.toLowerCase();

  try {
    // On appelle la route synchrone locale /author/:author
    const response = await axios.get(`http://localhost:5000/author/${author}`);

    // Renvoie les livres trouvés
    return res.status(200).json({
      message: `Livres trouvés pour l'auteur '${author}' (via async-await + Axios)`,
      books: response.data
    });
  } catch (error) {
    // Gestion erreur 404 ou autre
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: `Aucun livre trouvé pour l'auteur '${author}'.` });
    }
    return res.status(500).json({ message: "Erreur lors de la récupération des livres.", error: error.message });
  }
});

module.exports.general = public_users;
