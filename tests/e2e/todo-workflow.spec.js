const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

// Each test creates uniquely-named tasks to remain isolated even if
// the backend keeps state across tests within the same server process.
const unique = (label) => `${label} ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

test.describe('Todo Workflow', () => {
  test('app loads and displays the heading', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();

    await expect(page.getByRole('heading', { name: /to do app/i })).toBeVisible();
    await expect(todoPage.addButton).toBeDisabled(); // empty title → button disabled
  });

  test('user can add a new task', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();

    const title = unique('Buy milk');
    await todoPage.addTask(title);

    await expect(page.getByText(title)).toBeVisible();
  });

  test('user can complete a task', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();

    const title = unique('Finish report');
    await todoPage.addTask(title);

    await todoPage.toggleTask(title);

    // The task title should gain line-through styling on completion
    const titleEl = page.getByText(title);
    await expect(titleEl).toHaveCSS('text-decoration-line', 'line-through');
  });

  test('user can delete a task', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();

    const title = unique('Task to delete');
    await todoPage.addTask(title);
    await todoPage.deleteTask(title);

    await expect(page.getByText(title)).toHaveCount(0);
  });

  test('filter tabs show only appropriate tasks', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();

    const activeTitle = unique('Active task');
    const completedTitle = unique('Completed task');

    await todoPage.addTask(activeTitle);
    await todoPage.addTask(completedTitle);
    await todoPage.toggleTask(completedTitle);

    // Active tab should show active task, not completed
    await todoPage.activeTab.click();
    await expect(page.getByText(activeTitle)).toBeVisible();
    await expect(page.getByText(completedTitle)).toHaveCount(0);

    // Completed tab should show completed task, not active
    await todoPage.completedTab.click();
    await expect(page.getByText(completedTitle)).toBeVisible();
    await expect(page.getByText(activeTitle)).toHaveCount(0);

    // All tab restores both
    await todoPage.allTab.click();
    await expect(page.getByText(activeTitle)).toBeVisible();
    await expect(page.getByText(completedTitle)).toBeVisible();
  });

  test('user can edit a task title', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();

    const original = unique('Original title');
    const updated = unique('Updated title');

    await todoPage.addTask(original);
    await todoPage.openEditDialog(original);

    const editInput = todoPage.editTitleInput();
    await editInput.fill(updated);
    await todoPage.saveEditDialog();

    await expect(page.getByText(updated)).toBeVisible();
    await expect(page.getByText(original)).toHaveCount(0);
  });
});
