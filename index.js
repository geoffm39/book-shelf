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

const API_URL = "https://openlibrary.org"

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

app.get("/", async (req, res) => {
    res.render("index.ejs");
});

app.get("/search", async (req, res) => {
    const searchQuery = req.query.search;
    if (searchQuery) {
        try {
            const result = await axios.get(`${API_URL}/search.json`, {
                params: {
                    q: searchQuery,
                    limit: 20
                }
            });
            return res.render("search.ejs", {
                results: result.data.docs
            });
        } catch (error) {
            console.log(error.response.data);
            return res.render("search.ejs", {
                error: `${error.response.status} Error: Please try again later.`
            });
        }
    }
    res.render("search.ejs");
});

app.get("/add", (req, res) => {
    res.render("book-form.ejs");
});

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server running on port ${process.env.SERVER_PORT}`);
});