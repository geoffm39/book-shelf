import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const app = express();

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

db.connect();

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/add", (req, res) => {
    res.render("book-form.ejs");
});

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server running on port ${process.env.SERVER_PORT}`);
});