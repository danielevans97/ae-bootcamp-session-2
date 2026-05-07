import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const sampleTodos = [
  { id: 1, title: 'Test Task 1', completed: false, due_date: null, priority: 'Medium', notes: null, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 2, title: 'Test Task 2', completed: true, due_date: '2026-06-01', priority: 'High', notes: 'Some note', created_at: '2026-01-02T00:00:00.000Z' },
];

const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(sampleTodos));
  }),

  rest.post('/api/todos', (req, res, ctx) => {
    const { title } = req.body;
    if (!title || title.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Todo title is required' }));
    }
    return res(
      ctx.status(201),
      ctx.json({ id: 3, title, completed: false, due_date: null, priority: 'Medium', notes: null, created_at: new Date().toISOString() })
    );
  }),

  rest.put('/api/todos/:id', (req, res, ctx) => {
    const { id } = req.params;
    const todo = sampleTodos.find((t) => t.id === parseInt(id));
    if (!todo) return res(ctx.status(404), ctx.json({ error: 'Todo not found' }));
    return res(ctx.status(200), ctx.json({ ...todo, ...req.body }));
  }),

  rest.delete('/api/todos/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Todo deleted successfully', id: parseInt(req.params.id) }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the app heading', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByRole('heading', { name: /to do app/i })).toBeInTheDocument();
  });

  test('shows loading state then displays tasks', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    const input = screen.getByLabelText('Task title');
    await act(async () => {
      await user.type(input, 'New Test Task');
    });

    const addButton = screen.getByRole('button', { name: /add task/i });
    await act(async () => {
      await user.click(addButton);
    });

    await waitFor(() => {
      expect(screen.getByText('New Test Task')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch tasks/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no tasks exist', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    });
  });

  test('filters tasks by Completed tab', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const completedTab = screen.getByRole('tab', { name: /completed/i });
    await act(async () => {
      await user.click(completedTab);
    });

    expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
  });
});