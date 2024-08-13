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
                    result.data.photos ? result.data.photos[0] : null,
                    result.data.name,
                    result.data.bio ? result.data.bio : null
                ]);
            return newAuthor.rows[0];
        } catch (error) {
            if (entryExists(error)) {
                try {
                    const existingAuthor = await db.query("SELECT * FROM author WHERE api_id=$1", [authorOLID]);
                    return existingAuthor.rows[0];
                } catch (error) {
                    console.log(error);
                    return null;
                }
            }
            console.log(error);
            return null;
        }
    } catch (error) {
        console.log(error.response.data);
        return null;
    }
}

app.get("/", async (req, res) => {
    try {
        const books = await db.query(`SELECT book.id, book.cover_id, book.title, book.description, book.date_read, book.rating, book.notes, author.name AS author, author.id AS author_id
            FROM book LEFT JOIN author ON book.author_id = author.id ORDER BY book.title`);
        res.render("index.ejs", { books: books.rows });
    } catch (error) {
        console.log(error);
        res.render("index.ejs", {
            error: `Error: Please try again later.`
        });
    }
});

app.get("/author/:authorId", async (req, res) => {
    try {
        const author = await db.query(`SELECT * FROM author WHERE id=$1`, [req.params.authorId]);
        res.render("author.ejs", { author: author.rows[0] });
    } catch (error) {
        console.log(error);
        res.render("index.ejs", {
            error: `Error: Please try again later.`
        });
    }
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
            res.render("search.ejs", {
                results: result.data.docs,
                search: searchQuery
            });
        } catch (error) {
            console.log(error);
            res.render("search.ejs", {
                error: `Error: Please try again later.`
            });
        }
    }
    res.render("search.ejs");
});

app.get("/add", async (req, res) => {
    const bookOLID = req.query.bookId;
    try {
        const result = await axios.get(`${API_URL}${bookOLID}.json`);
        res.render("book-form.ejs", { 
            newBook: result.data, 
            author: req.query.author,
            search: req.query.search
        });
    } catch (error) {
        console.log(error);
        res.render("book-form.ejs", {
            error: `Error: Please try again later.`
        });
    }
});

app.post("/add", async (req, res) => {
    const authorId = req.body.authorOLID;
    const author = await createAuthor(authorId);
    let coverId = req.body.coverId;
    if (coverId.trim() === '') {
        coverId = null;
    }
    try {
        await db.query(`INSERT INTO book (api_id, cover_id, title, description, date_read, notes, rating, author_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
            req.body.bookOLID,
            coverId,
            req.body.title,
            req.body.description,
            req.body.date,
            req.body.notes,
            req.body.rating,
            author ? author.id : null
        ]);
        res.redirect("/");
    } catch (error) {
        if (entryExists(error)) {
            return res.render("book-form.ejs", {
                error: `Book already in your collection.`
            });
        }
        console.log(error);
        res.render("book-form.ejs", {
            error: `Error: Please try again later.`
        });
    }
});

app.get("/edit/:bookId", async (req, res) => {
    try {
        const book = await db.query(`SELECT book.id, book.cover_id, book.title, book.description, book.date_read, book.rating, book.notes, author.name AS author, author.id AS author_Id
            FROM book LEFT JOIN author ON book.author_id = author.id WHERE book.id = $1`, [req.params.bookId]);
        res.render("book-form.ejs", { currentBook: book.rows[0] });
    } catch (error) {
        console.log(error);
        res.render("book-form.ejs", {
            error: `Error: Please try again later.`
        });
    }
});

app.post("/edit/:bookId", async (req, res) => {
    try {
        await db.query(`UPDATE book
            SET date_read = $1, description = $2, rating = $3, notes = $4
            WHERE id = $5`, [
                req.body.date,
                req.body.description,
                req.body.rating,
                req.body.notes,
                req.params.bookId
            ]);
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.render("book-form.ejs", {
            error: `Error: Error updating book in database.`
        });
    }
});

app.delete("/delete/:bookId", async (req, res) => {
    try {
        await db.query("DELETE FROM book WHERE id = $1", [req.params.bookId]);
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.render("index.ejs", {
            error: `Error: Error deleting book from database.`
        });
    }
})

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server running on port ${process.env.SERVER_PORT}`);
});