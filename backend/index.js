const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// GET: listar tarefas (fixadas primeiro)
app.get('/tasks', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tasks ORDER BY fixed DESC, id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST: criar nova tarefa
app.post('/tasks', async (req, res) => {
  const { description } = req.body;

  if (!description || description.trim() === '') {
    return res.status(400).json({ error: 'Descrição é obrigatória' });
  }

  try {
    const result = await db.query(
      'INSERT INTO tasks (description) VALUES ($1) RETURNING *',
      [description.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error.message);
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

// PUT: editar tarefa
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  if (!description || description.trim() === '') {
    return res.status(400).json({ error: 'Descrição é obrigatória' });
  }

  try {
    const result = await db.query(
      'UPDATE tasks SET description = $1 WHERE id = $2 RETURNING *',
      [description.trim(), id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao editar tarefa:', error.message);
    res.status(500).json({ error: 'Erro ao editar tarefa' });
  }
});

// DELETE: excluir tarefa
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error.message);
    res.status(500).json({ error: 'Erro ao excluir tarefa' });
  }
});

// PATCH: fixar tarefa
app.patch('/tasks/:id/fix', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'UPDATE tasks SET fixed = true WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao fixar tarefa:', error.message);
    res.status(500).json({ error: 'Erro ao fixar tarefa' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});
