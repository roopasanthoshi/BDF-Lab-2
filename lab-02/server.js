
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, 'college.db');

let db = null;

const PORT = process.env.PORT || 3000;

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        console.log('Database connected successfully');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();

// GET all books
app.get('/books/', async (req, res) => {
    const books = await db.all('SELECT * FROM books');
    res.send(books);
});

// GET a single book
app.get('/books/:bookId/', async (req, res) => {
    const { bookId } = req.params;

    const book = await db.get(
        'SELECT * FROM books WHERE id = ?',
        [bookId]
    );

    if (book === undefined) {
        res.status(404).send('Book not found');
    } else {
        res.send(book);
    }
});

// POST a new book
app.post('/books/', async (req, res) => {
    const { title, author, price, pages } = req.body;

    await db.run(
        `INSERT INTO books (title, author, price, pages)
         VALUES (?, ?, ?, ?)`,
        [title, author, price, pages]
    );

    res.status(201).send('Book added successfully');
});

// PUT update a book
app.put('/books/:bookId/', async (req, res) => {
    const { bookId } = req.params;
    const { title, author, price, pages } = req.body;

    const result = await db.run(
        `UPDATE books
         SET title = ?, author = ?, price = ?, pages = ?
         WHERE id = ?`,
        [title, author, price, pages, bookId]
    );

    if (result.changes === 0) {
        res.status(404).send('Book not found');
    } else {
        res.send('Book updated successfully');
    }
});

// DELETE a book
app.delete('/books/:bookId/', async (req, res) => {
    const { bookId } = req.params;

    const result = await db.run(
        'DELETE FROM books WHERE id = ?',
        [bookId]
    );

    if (result.changes === 0) {
        res.status(404).send('Book not found');
    } else {
        res.send('Book deleted successfully');
    }
});
