const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    //write code to check is the username is valid
    return !users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => { //returns boolean
    //write code to check if username and password match the one we have in records.
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    //Write your code here
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Error logging in, both username and password are required.",
        });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid login. Check username and password." });
    }

    const user = users.find((user) => user.username === username);

    const accessToken = jwt.sign(
        { username: user.username, },
        "login",
        { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
        accessToken,
        username: user.username,
    };

    return res.status(200).send("User successfully logged in");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.query;
    const username = req.session.authorization?.username;
    const book = books[isbn];

    if (!isbn || !review || !username) {
        return res.status(400).json({
            message: "Invalid request. Make sure to provide the ISBN and review correctly.",
        });
    }

    if (!book) {
        return res.status(404).json({
            message: "Book not found. Make sure the ISBN provided is correct and try again.",
        });
    }
    if (book.reviews && book.reviews.hasOwnProperty(username)) {
        return res.status(400).json({
            message: "You have already submitted a review for this book. Use the update route if needed.",
        });
    }

    book.reviews = book.reviews || {};
    book.reviews[username] = review;

    return res.status(200).json({ message: "Review successfully added or updated.", book });
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (!isbn || !books[isbn]) {
        return res.status(400).json({
            message: "Error finding book details by ISBN. Provide a correct/valid ISBN.",
        });
    }

    if (!username || !books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({
            message: "Review not found. Make sure the review exists for the specified book and user.",
        });
    }

    delete books[isbn].reviews[username];
    return res.status(200).json({
        message: `Book review made by ${username} was successfully deleted.`,
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;