const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createTodo = async (title = 'Temp Todo') => {
  const response = await request(app)
    .post('/api/todos')
    .send({ title })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /', () => {
    it('should return a health check response', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok', message: 'Backend server is running' });
    });
  });

  describe('GET /api/todos', () => {
    it('should return all todos', async () => {
      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const todo = response.body[0];
      expect(todo).toHaveProperty('id');
      expect(todo).toHaveProperty('title');
      expect(todo).toHaveProperty('completed');
      expect(todo).toHaveProperty('priority');
      expect(todo).toHaveProperty('created_at');
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo with just a title', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Test Todo' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Todo');
      expect(response.body.completed).toBe(false);
      expect(response.body.priority).toBe('Medium');
      expect(response.body).toHaveProperty('created_at');
    });

    it('should create a todo with all optional fields', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Full Todo', due_date: '2026-12-31', priority: 'High', notes: 'Some note' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.due_date).toBe('2026-12-31');
      expect(response.body.priority).toBe('High');
      expect(response.body.notes).toBe('Some note');
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Todo title is required');
    });

    it('should return 400 if title is empty', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Todo title is required');
    });

    it('should return 400 if priority is invalid', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Bad Priority', priority: 'Critical' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Priority must be Low, Medium, or High');
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update the title of an existing todo', async () => {
      const todo = await createTodo('Original Title');
      const response = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({ title: 'Updated Title' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
    });

    it('should toggle completed status', async () => {
      const todo = await createTodo('Toggle Me');
      expect(todo.completed).toBe(false);

      const toggled = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({ completed: true })
        .set('Accept', 'application/json');

      expect(toggled.status).toBe(200);
      expect(toggled.body.completed).toBe(true);
    });

    it('should update due_date, priority, and notes', async () => {
      const todo = await createTodo('Update Fields');
      const response = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({ due_date: '2026-06-01', priority: 'Low', notes: 'Updated note' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.due_date).toBe('2026-06-01');
      expect(response.body.priority).toBe('Low');
      expect(response.body.notes).toBe('Updated note');
    });

    it('should return 404 for a non-existent todo', async () => {
      const response = await request(app)
        .put('/api/todos/999999')
        .send({ title: 'Ghost' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Todo not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app)
        .put('/api/todos/abc')
        .send({ title: 'Bad ID' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid todo ID is required');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete an existing todo', async () => {
      const todo = await createTodo('Todo To Be Deleted');

      const deleteResponse = await request(app).delete(`/api/todos/${todo.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Todo deleted successfully', id: todo.id });

      const deleteAgain = await request(app).delete(`/api/todos/${todo.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Todo not found');
    });

    it('should return 404 when todo does not exist', async () => {
      const response = await request(app).delete('/api/todos/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Todo not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/todos/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid todo ID is required');
    });
  });
});