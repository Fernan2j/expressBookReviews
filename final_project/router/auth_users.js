const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

//Secret key
const JWT_SECRET_KEY = "super_secret_jwt_key_987654";

let users = [];

const isValid = (username) => {
  const doesUsernameExist = users.find((user) => user.username === username);
  return !!doesUsernameExist;
};

const authenticatedUser = (username, password) => {
  const matchingUser = users.find(
    (user) => user.username === username && user.password === password
  );

  return !!matchingUser;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Can not log in. Password and username are required." });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { data: { username: username } },
      JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    req.session.authorization = {
      accessToken,
      username,
    };

    return res
      .status(200)
      .json({ message: "User successfully logged in.", token: accessToken });
  } else {
    return res
      .status(401)
      .json({ message: "Invalid credentials. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Review content is required." });
  }

  const book = books[isbn];

  if (!book) {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found.` });
  }

  if (book.reviews[username]) {
    book.reviews[username] = review;
    return res.status(200).json({
      message: `Review for ISBN ${isbn} successfully modified for user ${username}.`,
      reviews: book.reviews,
    });
  } else {
    book.reviews[username] = review;
    return res.status(201).json({
      message: `Review for ISBN ${isbn} successfully added by user ${username}.`,
      reviews: book.reviews,
    });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  const book = books[isbn];

  if (!book) {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found.` });
  }

  if (book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({
      message: `Review for ISBN ${isbn} successfully deleted by user ${username}.`,
      reviews: book.reviews,
    });
  } else {
    return res.status(404).json({
      message: `No review found from user ${username} for ISBN ${isbn}.`,
    });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
