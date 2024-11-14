const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  //write code to check if username is already registered
  if (users.includes(username)) {
    return false;
  }
  return true;
}

const authenticatedUser = (username,password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({message: "Invalid request, please provide username and password"});
  }
  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).json({ message: "User successfully logged in" });
  }
  return res.status(403).json({ message: "User not authenticated" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  console.log(isbn);
  const { review } = req.body;
  if (!isbn || !review) {
    return res.status(400).json({message: "Invalid request, please provide ISBN and review"});
  }
  if (books[isbn]) {
    books[isbn].reviews[req.session.authorization.username] = review;
    return res.status(200).json({message: "Review added successfully"});
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

// delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  if (!isbn) {
    return res.status(400).json({message: "Invalid request, please provide ISBN"});
  }
  if (books[isbn]) {
    delete books[isbn].reviews[req.session.authorization.username];
    return res.status(200).json({message: "Review deleted successfully"});
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
