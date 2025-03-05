const express = require("express");

const app = express();
app.use(express.json());

// Sample API route
app.get("/", (req, res) => {
    res.send("Hello, Vercel!");
});

// Listen on port provided by Vercel
module.exports = app;
