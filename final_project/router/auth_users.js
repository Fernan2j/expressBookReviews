const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

const JWT_SECRET = "asdklfjasdfjjfja12234234jmowmdnbxu";

let users = [];

const isValid = (username) => {
  return !!users.find((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  if (!isValid(username)) {
    return false;
  } else {
    return users.find(
      (user) => user.username === username && user.password === password
    );
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!authenticatedUser(username, password)) {
    return res
      .status(401)
      .json({ message: "Not registered or incorrect credentials" });
  }

  const payload = { username: username };
  jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }, (err, encoded) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    } else {
      return res.status(200).json({
        message: "Customer successfully logged in.",
        accessToken: encoded,
      });
    }
  });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res
      .status(404)
      .json({ message: `No book found with ISBN: ${isbn}` });
  }

  const newReview = req.query.review;
  if (!newReview) {
    return res
      .status(400)
      .json({ message: "No review text added in the query" });
  }

  const user = req.user.username;
  const reviews = book.reviews;

  if (reviews[user]) {
    reviews[user] = newReview;
    return res.status(200).json({
      message: `Review in book with ISBN: ${isbn} updated by ${user}`,
    });
  } else {
    reviews[user] = newReview;
    return res.status(201).json({
      message: `New review added to book with ISBN: ${isbn} by ${user}`,
    });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res
      .status(404)
      .json({ message: `No book found with ISBN: ${isbn}` });
  }

  const user = req.user.username;
  const reviews = book.reviews;
  if (reviews[user]) {
    delete reviews[user];
    return res.status(200).json({
      message: `Review from ${user} in book with ISBN: ${isbn} successfully deleted by ${user}`,
    });
  } else {
    return res.status(404).json({
      message: `No existing reviews in book with ISBN: ${isbn} under user: ${user}`,
    });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.JWT_SECRET = JWT_SECRET;
