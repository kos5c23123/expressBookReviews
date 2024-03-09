const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getAllbook = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => books ? resolve(books) : reject(new Error("Error getting all books.")), 1000);
    });
};

function getBookwithISBN(ISBN) {
    return new Promise((resolve, reject) => {
        setTimeout(() => books[ISBN] ? resolve(books[ISBN]) : reject(new Error(`Book with isbn ${ISBN} not found.`)), 1000);
    });
}


async function handleBookRequest(res, param, value) {
    try {
      const booksData = await getBooksByParam(param, value);
      const responseObj = { [param.toLowerCase()]: booksData };
      res.status(200).send(JSON.stringify(responseObj, null, 4));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: `Error getting books by ${param}.` });
    }
  }
  
  function getBooksByParam(param, value) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!books) {
          reject(new Error(`Error getting books by ${param}.`));
        }
  
        const booksFound = Object.entries(books)
          .filter(([isbn, bookDetails]) => bookDetails[param] === value)
          .map(([isbn, bookDetails]) => ({ isbn, ...getFieldsByParam(bookDetails, param) }));
  
        resolve(booksFound);
      }, 1000);
    });
  }
  
  function getFieldsByParam(data, param) {
    const { author, title, reviews } = data;
    switch (param) {
      case "author":
        return { title, reviews };
      case "title":
        return { author, reviews };
      default:
        return { author, title, reviews };
    }
  }

public_users.post("/register", (req, res) => {
    //Write your code here
    const userName = req.body.username;
    const password = req.body.password;

    if (!userName || !password) {
        return res.status(400).json({
            message: "Both username and password are required for registration.",
        });
    }

    // Assuming isValid is a function that checks if the username already exists
    if (!isValid(userName)) {
        return res.status(400).json({ message: "Username already exists." });
    }

    // Store the user in the 'users' array
    users.push({ username: userName, password: password });
    console.log("users: ", users);

    return res.status(200).json({ message: "User successfully registered. You can now login." });
});

// Get the book list available in the shop
public_users.get("/", async (req, res) => {
    try {
        const books = await getAllbook();
        res.status(200).send(JSON.stringify(books, null, 4));
    } catch (error) {
        console.error("Error getting all books. ", error);
        res.status(500).json({ message: "Error getting the book list." });
    }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const bookDetail = await getBookwithISBN(isbn);
        res.status(200).send(JSON.stringify(bookDetail, null, 4));
    } catch (error) {
        console.error(error);
        res.status(400).send(`Book with isbn ${isbn} not found.`);
    }
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
    const authorName = req.params.author;
    handleBookRequest(res, "author", authorName);
  });

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  const bookTitle = req.params.title;
  handleBookRequest(res, "title", bookTitle);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    //Write your code here
    const isbn = req.params.isbn;

    if (!isbn) {
        return res.status(400).json({ message: "ISBN not provided!" });
    }

    const bookReview = books[isbn]?.reviews || [];
    return res.status(200).json(bookReview);
});

module.exports.general = public_users;
