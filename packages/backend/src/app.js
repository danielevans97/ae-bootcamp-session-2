const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create todos table
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    due_date TEXT,
    priority TEXT NOT NULL DEFAULT 'Medium',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert sample data
const insertStmt = db.prepare(
  'INSERT INTO todos (title, completed, due_date, priority, notes) VALUES (?, ?, ?, ?, ?)'
);

insertStmt.run('Buy groceries', 0, null, 'Low', null);
insertStmt.run('Finish project report', 0, new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 'High', 'Include Q1 metrics');
insertStmt.run('Call dentist', 1, null, 'Medium', null);

console.log('In-memory database initialized with sample todos');

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// GET /api/todos — sorted by due_date ASC, nulls last
app.get('/api/todos', (req, res) => {
  try {
    const todos = db.prepare(`
      SELECT * FROM todos
      ORDER BY
        CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
        due_date ASC,
        created_at ASC
    `).all();
    // Convert SQLite integer booleans to JS booleans
    const result = todos.map(t => ({ ...t, completed: t.completed === 1 }));
    res.json(result);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// POST /api/todos
app.post('/api/todos', (req, res) => {
  try {
    const { title, due_date = null, priority = 'Medium', notes = null } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Todo title is required' });
    }

    const VALID_PRIORITIES = ['Low', 'Medium', 'High'];
    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: 'Priority must be Low, Medium, or High' });
    }

    const result = insertStmt.run(title.trim(), 0, due_date, priority, notes);
    const newTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ ...newTodo, completed: newTodo.completed === 1 });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// PUT /api/todos/:id
app.put('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const { title, completed, due_date, priority, notes } = req.body;

    const VALID_PRIORITIES = ['Low', 'Medium', 'High'];
    const newPriority = priority !== undefined ? priority : existing.priority;
    if (!VALID_PRIORITIES.includes(newPriority)) {
      return res.status(400).json({ error: 'Priority must be Low, Medium, or High' });
    }

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    if (!updatedTitle) {
      return res.status(400).json({ error: 'Todo title is required' });
    }

    const updatedCompleted = completed !== undefined ? (completed ? 1 : 0) : existing.completed;
    const updatedDueDate = due_date !== undefined ? due_date : existing.due_date;
    const updatedNotes = notes !== undefined ? notes : existing.notes;

    db.prepare(`
      UPDATE todos SET title = ?, completed = ?, due_date = ?, priority = ?, notes = ?
      WHERE id = ?
    `).run(updatedTitle, updatedCompleted, updatedDueDate, newPriority, updatedNotes, id);

    const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json({ ...updated, completed: updated.completed === 1 });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /api/todos/:id
app.delete('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const result = db.prepare('DELETE FROM todos WHERE id = ?').run(id);

    if (result.changes > 0) {
      res.json({ message: 'Todo deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = { app, db, insertStmt };