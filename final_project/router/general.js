const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/**
 * (TASK 10 Helper)
 */
const getBooks = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (books) {
        resolve(books);
      } else {
        reject({ status: 404, message: "No books found" });
      }
    }, 600);
  });
};

/**
 * (TASK 11 Helper)
 */
const getBookByIsbn = (isbn) => {
  return new Promise((resolve, reject) => {
    // Simulate a network delay
    setTimeout(() => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
      }
    }, 600);
  });
};

/**
 * (TASK 12 Helper)
 */
const getBooksByAuthor = (requestedAuthor) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const bookValues = Object.values(books);
      const booksByAuthor = bookValues.filter((book) => {
        return book.author.toLowerCase() === requestedAuthor.toLowerCase();
      });

      if (booksByAuthor.length > 0) {
        resolve({ books: booksByAuthor });
      } else {
        reject({
          status: 404,
          message: `No books found for the author: ${requestedAuthor}`,
        });
      }
    }, 600);
  });
};

/**
 * (TASK 13 Helper)
 */
const getBookByTitle = (requestedTitle) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const bookValues = Object.values(books);
      const bookByTitle = bookValues.find((book) => {
        return book.title.toLowerCase() === requestedTitle.toLowerCase();
      });

      if (bookByTitle) {
        resolve(bookByTitle);
      } else {
        reject({
          status: 404,
          message: `No book found with title: ${requestedTitle}`,
        });
      }
    }, 600);
  });
};

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Unable to register. Username and password are required",
    });
  }

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    return res
      .status(409)
      .json({ message: "Username already exists. Please login" });
  }

  users.push({ username, password });
  return res
    .status(201)
    .json({ message: "User successfully registered. You can now log in" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  getBooks()
    .then((bookList) => {
      return res.status(200).json(bookList);
    })
    .catch((error) => {
      const status = error.status || 500;
      return res.status(status).json({
        message: `Failed to fetch book list: ${
          error.message || "Internal Server Error"
        }`,
      });
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  getBookByIsbn(isbn)
    .then((bookDetails) => {
      return res.status(200).json(bookDetails);
    })
    .catch((error) => {
      const status = error.status || 500;
      return res
        .status(status)
        .json({ message: error.message || "Internal Server Error" });
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const requestedAuthor = req.params.author;
  getBooksByAuthor(requestedAuthor)
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((error) => {
      const status = error.status || 500;
      return res
        .status(status)
        .json({ message: error.message || "Internal Server Error" });
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const requestedTitle = req.params.title;
  getBookByTitle(requestedTitle)
    .then((bookDetails) => {
      return res.status(200).json(bookDetails);
    })
    .catch((error) => {
      const status = error.status || 500;
      return res
        .status(status)
        .json({ message: error.message || "Internal Server Error" });
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const bookByIsbn = books[isbn];

  if (bookByIsbn) {
    return res.status(200).json(bookByIsbn.reviews);
  } else {
    return res
      .status(404)
      .json({ message: `No book found with ISBN: ${isbn}` });
  }
});

module.exports.general = public_users;
