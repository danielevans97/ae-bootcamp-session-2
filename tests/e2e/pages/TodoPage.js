/**
 * Page Object Model for the Todo App.
 * Encapsulates all selectors and interactions with the UI.
 */
class TodoPage {
  constructor(page) {
    this.page = page;

    // Form
    this.titleInput = page.getByLabel('Task title');
    this.addButton = page.getByRole('button', { name: /add task/i });

    // Tabs
    this.allTab = page.getByRole('tab', { name: /^all$/i });
    this.activeTab = page.getByRole('tab', { name: /^active$/i });
    this.completedTab = page.getByRole('tab', { name: /^completed$/i });
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /** Add a task with just a title (uses default priority/no due date). */
  async addTask(title) {
    await this.titleInput.fill(title);
    await this.addButton.click();
    // Wait for the task card to appear
    await this.page.getByText(title).waitFor({ state: 'visible' });
  }

  /** Click the complete toggle for a task by its title. */
  async toggleTask(title) {
    const card = this.page.locator('[class*="MuiCard"]').filter({ hasText: title });
    await card.getByRole('checkbox').click();
  }

  /** Click the delete button for a task by its title. */
  async deleteTask(title) {
    const card = this.page.locator('[class*="MuiCard"]').filter({ hasText: title });
    await card.getByRole('button', { name: /delete/i }).click();
    await this.page.getByText(title).waitFor({ state: 'hidden' });
  }

  /** Click the edit button for a task by its title. */
  async openEditDialog(title) {
    const card = this.page.locator('[class*="MuiCard"]').filter({ hasText: title });
    await card.getByRole('button', { name: /edit/i }).click();
    await this.page.getByRole('dialog').waitFor({ state: 'visible' });
  }

  /** Save the currently open edit dialog. */
  async saveEditDialog() {
    await this.page.getByRole('button', { name: /^save$/i }).click();
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' });
  }

  /** Returns the title field inside an open edit dialog. */
  editTitleInput() {
    return this.page.getByLabel('Edit task title');
  }

  /** Returns all visible task card titles as an array of strings. */
  async getVisibleTaskTitles() {
    const cards = await this.page.locator('[class*="MuiCard-root"]').all();
    const titles = [];
    for (const card of cards) {
      const titleEl = card.locator('[class*="MuiTypography-body1"]').first();
      if (await titleEl.isVisible()) {
        titles.push(await titleEl.innerText());
      }
    }
    return titles;
  }
}

module.exports = { TodoPage };
