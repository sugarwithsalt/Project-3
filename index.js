require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;
app.set('view engine', 'ejs');

const pool = new Pool({
    user: process.env.PSQL_USER,
    host: process.env.PSQL_HOST,
    database: process.env.PSQL_DATABASE,
    password: process.env.PSQL_PASSWORD,
    port: Number(process.env.PSQL_PORT),
    ssl: { rejectUnauthorized: false }
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database connection failed');
    }
});

process.on('SIGINT', async () => {
    await pool.end();
    process.exit(0);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

app.get('/menu', async (req, res) => {
    let menuitems = [];

    pool
        .query('SELECT * FROM MenuItem;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++) {
                menuitems.push(query_res.rows[i]);
            }
            const data = {menuitems: menuitems};
            console.log(menuitems);
            res.render('menu', data);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Database query failed');
        });
});