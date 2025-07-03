const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/tasks', async (req, res) => {
  const result = await db.query('SELECT * FROM tasks ORDER BY id ASC');
  res.json(result.rows);
});

app.post('/tasks', async (req, res) => {
  const { description } = req.body;
  const result = await db.query('INSERT INTO tasks (description) VALUES ($1) RETURNING *', [description]);
  res.json(result.rows[0]);
});

app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM tasks WHERE id = $1', [id]);
  res.sendStatus(204);
});

app.listen(5000, () => console.log('Backend rodando na porta 5000'));
