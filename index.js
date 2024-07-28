import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});