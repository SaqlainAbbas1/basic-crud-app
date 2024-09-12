const express = require('express');
const cors = require('cors');
const path = require('path');
const pg = require('pg');
const bodyParser = require('body-parser');

const app = express();

app.use(express.json())
app.use(cors())
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));


const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: 'test_crud',
    password: 'admin123',
    port: 5432
});

db.connect();

// Creating the table for students
app.post('/students', async (req, res) => {
    const { name, f_name, field, contact, address, nationality, email } = req.body;
    try {
        const result = await db.query('INSERT INTO students (name, f_name, field, contact, address, nationality, email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, f_name, field, contact, address, nationality, email]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json(error);
        console.log(`You are facing the error: ${error}`);
    }
});

// Read all from students
app.get('/students', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM students');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json(error);
        console.log(`You are facing the error: ${error}`);
    }
});

// Updating students
app.put('/students/:id', async (req, res) => {
    const { id } = req.params;
    const { name, f_name, field, contact, address, nationality, email } = req.body;
    try {
        const result = await db.query('UPDATE students SET name=$1, f_name=$2, field=$3, contact=$4, address=$5, nationality=$6, email=$7 WHERE id=$8 RETURNING *',
            [name, f_name, field, contact, address, nationality, email, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json(error);
        console.log(`You are facing the error: ${error}`);
    }
});
// Fetch student by email
app.get('/students/email/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const result = await db.query('SELECT * FROM students WHERE email=$1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json(error);
        console.log(`You are facing the error: ${error}`);
    }
});


// Deleting students
app.delete('/students', async (req, res) => {
    const { email } = req.body;
    try {
        const result = await db.query('DELETE FROM students WHERE email=$1 RETURNING *', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.status(200).json({ message: 'Student deleted' });
    } catch (error) {
        res.status(500).json(error);
        console.log(`You are facing the error: ${error}`);
    }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html', '/styles/main.css'));
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
