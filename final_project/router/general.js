const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username or password missing.",
    });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "Username already registered" });
  }

  const user = { username, password };
  users.push(user);
  return res.status(201).json({
    message: `User ${username} successfully registered. You can now log in`,
  });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000");
    res.status(200).json({ books: response.data });
  } catch (error) {
    res.status(500).json({
      message: "An error happened while fetching the books list",
      error: error.message,
    });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({
      message: "No book found",
      error: error.message,
    });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res
      .status(404)
      .json({ message: "No author found", error: error.message });
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get(
      `http://localhost/title/${encodeURIComponent(title)}`
    );
    return res.status(200).json(response.data);
  } catch (error) {
    return res
      .status(404)
      .json({ message: "No title found", error: error.message });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const bookByIsbn = books[isbn];
  if (!bookByIsbn) {
    return res
      .status(404)
      .json({ message: `No book found with ISBN: ${isbn}` });
  } else {
    const reviews = bookByIsbn.reviews;
    return res.status(200).json(reviews);
  }
});

module.exports.general = public_users;
