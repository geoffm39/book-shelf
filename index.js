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

function entryExists(error) {
    return error.code === '23505';
}

async function createAuthor(authorOLID) {
    if (!authorOLID) {
        return null;
    }
    try {
        const result = await axios.get(`${API_URL}/${authorOLID}.json`);
        try {
            const newAuthor = await db.query(
                "INSERT INTO author (api_id, photo_id, name, bio) VALUES ($1, $2, $3, $4) RETURNING *",
                [
                    authorOLID,
                    result.data.photos[0] || null,
                    result.data.name,
                    result.data.bio || null
                ]);
            return newAuthor.rows[0];
        } catch (error) {
            console.log(error);
            return null;
        }
    } catch (error) {
        console.log(error.response.data);
        return null;
    }
}

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
                    lang: "en",
                    limit: 20
                }
            });
            return res.render("search.ejs", {
                results: result.data.docs,
                search: searchQuery
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

app.get("/add", async (req, res) => {
    const bookOLID = req.query.bookId;
    try {
        const result = await axios.get(`${API_URL}${bookOLID}.json`);
        return res.render("book-form.ejs", { 
            newBook: result.data, 
            author: req.query.author,
            search: req.query.search
        });
    } catch (error) {
        console.log(error.response.data);
        return res.render("book-form.ejs", {
            error: `${error.response.status} Error: Please try again later.`
        });
    }
});

app.post("/add", async (req, res) => {
    const authorId = req.body.authorOLID;
    const author = await createAuthor(authorId);
    console.log(author);
    res.redirect("/");
});

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server running on port ${process.env.SERVER_PORT}`);
});