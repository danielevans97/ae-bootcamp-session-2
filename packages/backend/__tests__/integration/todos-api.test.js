const request = require('supertest');
const { app, db } = require('../../src/app');

afterAll(() => {
  if (db) db.close();
});

// Helper to create a todo and return it
const createTodo = async (fields = {}) => {
  const response = await request(app)
    .post('/api/todos')
    .send({ title: 'Integration Todo', ...fields })
    .set('Accept', 'application/json');
  expect(response.status).toBe(201);
  return response.body;
};

describe('Todos API — Integration', () => {
  describe('Full CRUD lifecycle', () => {
    it('creates, reads, updates, and deletes a todo', async () => {
      // Create
      const created = await createTodo({ title: 'Lifecycle Todo', priority: 'High', due_date: '2026-12-01' });
      expect(created.title).toBe('Lifecycle Todo');
      expect(created.completed).toBe(false);
      expect(created.priority).toBe('High');

      // Read — should appear in list
      const listRes = await request(app).get('/api/todos');
      expect(listRes.status).toBe(200);
      const found = listRes.body.find((t) => t.id === created.id);
      expect(found).toBeDefined();
      expect(found.title).toBe('Lifecycle Todo');

      // Update — mark complete and add notes
      const updateRes = await request(app)
        .put(`/api/todos/${created.id}`)
        .send({ completed: true, notes: 'Done!' })
        .set('Accept', 'application/json');
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.completed).toBe(true);
      expect(updateRes.body.notes).toBe('Done!');

      // Delete
      const deleteRes = await request(app).delete(`/api/todos/${created.id}`);
      expect(deleteRes.status).toBe(200);

      // Confirm deletion
      const afterDelete = await request(app).get('/api/todos');
      const stillThere = afterDelete.body.find((t) => t.id === created.id);
      expect(stillThere).toBeUndefined();
    });
  });

  describe('Sorting', () => {
    it('returns todos sorted by due_date ascending with nulls last', async () => {
      const later = await createTodo({ title: 'Later', due_date: '2027-06-01' });
      const sooner = await createTodo({ title: 'Sooner', due_date: '2026-07-01' });
      const noDue = await createTodo({ title: 'No Due Date', due_date: null });

      const res = await request(app).get('/api/todos');
      expect(res.status).toBe(200);

      const ids = res.body.map((t) => t.id);
      const soonerIdx = ids.indexOf(sooner.id);
      const laterIdx = ids.indexOf(later.id);
      const noDueIdx = ids.indexOf(noDue.id);

      expect(soonerIdx).toBeLessThan(laterIdx);
      expect(noDueIdx).toBeGreaterThan(laterIdx);

      // cleanup
      await request(app).delete(`/api/todos/${later.id}`);
      await request(app).delete(`/api/todos/${sooner.id}`);
      await request(app).delete(`/api/todos/${noDue.id}`);
    });
  });

  describe('Validation', () => {
    it('rejects a todo with an empty title', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: '   ' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Todo title is required');
    });

    it('rejects an invalid priority value', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: 'Bad', priority: 'Urgent' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Priority must be Low, Medium, or High');
    });

    it('returns 404 when updating a non-existent todo', async () => {
      const res = await request(app)
        .put('/api/todos/999999')
        .send({ title: 'Ghost' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(404);
    });

    it('returns 404 when deleting a non-existent todo', async () => {
      const res = await request(app).delete('/api/todos/999999');
      expect(res.status).toBe(404);
    });
  });
});
