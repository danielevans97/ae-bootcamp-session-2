import React, { useState, useEffect, useMemo } from 'react';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  Container,
  Typography,
  Box,
  Stack,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Checkbox,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const theme = createTheme({
  palette: {
    primary: { main: '#1976D2' },
    secondary: { main: '#9C27B0' },
    background: { default: '#F5F5F5' },
    error: { main: '#D32F2F' },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const PRIORITY_COLORS = { Low: 'success', Medium: 'warning', High: 'error' };
const PRIORITIES = ['Low', 'Medium', 'High'];

const isOverdue = (dueDate, completed) => {
  if (!dueDate || completed) return false;
  return dayjs(dueDate).isBefore(dayjs(), 'day');
};

function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState('Medium');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onAdd({
      title: title.trim(),
      due_date: dueDate ? dueDate.format('YYYY-MM-DD') : null,
      priority,
      notes: notes.trim() || null,
    });
    setTitle('');
    setDueDate(null);
    setPriority('Medium');
    setNotes('');
  };

  return (
    <Card elevation={1} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Add New Task</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              size="small"
              required
              inputProps={{ 'aria-label': 'Task title' }}
            />
            <Stack direction="row" spacing={2}>
              <DatePicker
                label="Due date"
                value={dueDate}
                onChange={setDueDate}
                slotProps={{ textField: { size: 'small', fullWidth: true, 'aria-label': 'Due date' } }}
              />
              <FormControl size="small" fullWidth>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(e.target.value)}
                  inputProps={{ 'aria-label': 'Priority' }}
                >
                  {PRIORITIES.map((p) => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <TextField
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
              inputProps={{ 'aria-label': 'Notes' }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              disabled={!title.trim()}
              aria-label="Add task"
            >
              Add Task
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

function EditTaskDialog({ todo, open, onClose, onSave }) {
  const [title, setTitle] = useState(todo.title);
  const [dueDate, setDueDate] = useState(todo.due_date ? dayjs(todo.due_date) : null);
  const [priority, setPriority] = useState(todo.priority);
  const [notes, setNotes] = useState(todo.notes || '');

  useEffect(() => {
    setTitle(todo.title);
    setDueDate(todo.due_date ? dayjs(todo.due_date) : null);
    setPriority(todo.priority);
    setNotes(todo.notes || '');
  }, [todo]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      due_date: dueDate ? dueDate.format('YYYY-MM-DD') : null,
      priority,
      notes: notes.trim() || null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="edit-dialog-title">
      <DialogTitle id="edit-dialog-title">Edit Task</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            size="small"
            required
            inputProps={{ 'aria-label': 'Edit task title' }}
          />
          <Stack direction="row" spacing={2}>
            <DatePicker
              label="Due date"
              value={dueDate}
              onChange={setDueDate}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel id="edit-priority-label">Priority</InputLabel>
              <Select
                labelId="edit-priority-label"
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <TextField
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" aria-label="Cancel edit">Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!title.trim()} aria-label="Save task">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

function TaskCard({ todo, onToggle, onDelete, onEdit }) {
  const overdue = isOverdue(todo.due_date, todo.completed);

  return (
    <Card
      elevation={1}
      sx={{
        borderLeft: overdue ? '4px solid #FF5722' : '4px solid transparent',
        opacity: todo.completed ? 0.75 : 1,
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <Checkbox
            checked={todo.completed}
            onChange={() => onToggle(todo)}
            icon={<RadioButtonUncheckedIcon />}
            checkedIcon={<CheckCircleIcon />}
            color="primary"
            inputProps={{ 'aria-label': `Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}` }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#757575' : 'inherit',
                wordBreak: 'break-word',
              }}
            >
              {todo.title}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" sx={{ mt: 0.5 }}>
              <Chip
                label={todo.priority}
                color={PRIORITY_COLORS[todo.priority]}
                size="small"
                aria-label={`Priority: ${todo.priority}`}
              />
              {todo.due_date && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {overdue && (
                    <Tooltip title="Overdue">
                      <WarningIcon fontSize="small" sx={{ color: '#FF5722' }} aria-label="Overdue" />
                    </Tooltip>
                  )}
                  <Typography
                    variant="caption"
                    sx={{ color: overdue ? '#FF5722' : 'text.secondary' }}
                  >
                    Due {todo.due_date}
                  </Typography>
                </Stack>
              )}
            </Stack>
            {todo.notes && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                {todo.notes}
              </Typography>
            )}
          </Box>
          <Stack direction="row">
            <IconButton
              size="small"
              onClick={() => onEdit(todo)}
              aria-label={`Edit "${todo.title}"`}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(todo.id)}
              color="error"
              aria-label={`Delete "${todo.title}"`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [editingTodo, setEditingTodo] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos');
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      setTodos(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add task');
      const newTodo = await response.json();
      setTodos((prev) => {
        const updated = [...prev, newTodo];
        return sortTodos(updated);
      });
      setError(null);
    } catch (err) {
      setError('Error adding task: ' + err.message);
    }
  };

  const handleToggle = async (todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!response.ok) throw new Error('Failed to update task');
      const updated = await response.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setError(null);
    } catch (err) {
      setError('Error updating task: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete task');
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setError(null);
    } catch (err) {
      setError('Error deleting task: ' + err.message);
    }
  };

  const handleSaveEdit = async (data) => {
    try {
      const response = await fetch(`/api/todos/${editingTodo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update task');
      const updated = await response.json();
      setTodos((prev) => {
        const mapped = prev.map((t) => (t.id === updated.id ? updated : t));
        return sortTodos(mapped);
      });
      setEditingTodo(null);
      setError(null);
    } catch (err) {
      setError('Error updating task: ' + err.message);
    }
  };

  const sortTodos = (list) => {
    return [...list].sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });
  };

  const filteredTodos = useMemo(() => {
    if (filter === 'Active') return todos.filter((t) => !t.completed);
    if (filter === 'Completed') return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700} color="primary">
            To Do App
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Keep track of your tasks
          </Typography>

          <AddTaskForm onAdd={handleAdd} />

          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }} role="alert">
              {error}
            </Typography>
          )}

          <Tabs
            value={filter}
            onChange={(_, v) => setFilter(v)}
            sx={{ mb: 2 }}
            aria-label="Filter tasks"
          >
            <Tab label="All" value="All" />
            <Tab label="Active" value="Active" />
            <Tab label="Completed" value="Completed" />
          </Tabs>

          {loading ? (
            <Typography color="text.secondary">Loading tasks...</Typography>
          ) : filteredTodos.length === 0 ? (
            <Typography color="text.secondary">
              {filter === 'All' ? 'No tasks yet. Add one above!' : `No ${filter.toLowerCase()} tasks.`}
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {filteredTodos.map((todo) => (
                <TaskCard
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={setEditingTodo}
                />
              ))}
            </Stack>
          )}
        </Container>

        {editingTodo && (
          <EditTaskDialog
            todo={editingTodo}
            open
            onClose={() => setEditingTodo(null)}
            onSave={handleSaveEdit}
          />
        )}
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;