# UI Guidelines

## Component Library

- Use **Material UI (MUI)** components throughout the app. Do not build custom components when an MUI equivalent exists.
- Use MUI's `ThemeProvider` and a custom theme to enforce consistent styling globally.

## Color Palette

| Role        | Color     |
|-------------|-----------|
| Primary     | `#1976D2` (MUI Blue 700) |
| Secondary   | `#9C27B0` (MUI Purple 500) |
| Background  | `#F5F5F5` (Grey 100) |
| Surface     | `#FFFFFF` |
| Error       | `#D32F2F` (MUI Red 700) |
| Overdue     | `#FF5722` (Deep Orange 500) |
| Completed   | `#757575` (Grey 600, muted text) |

## Typography

- Font family: `Roboto` (loaded via MUI default theme).
- Task titles use `body1` variant; metadata (due date, priority) use `body2` or `caption`.
- Completed task titles are rendered with `text-decoration: line-through`.

## Button Styles

- Primary actions (e.g., "Add Task", "Save"): MUI `Button` with `variant="contained"` and `color="primary"`.
- Destructive actions (e.g., "Delete"): MUI `IconButton` with a `DeleteIcon`; confirm before executing.
- Cancel / secondary actions: MUI `Button` with `variant="outlined"`.

## Layout

- The app is single-column, centered, with a max-width of `600px`.
- Use MUI `Container` for the page wrapper and `Stack` or `List` for task layout.
- Task items use MUI `Card` with subtle elevation (`elevation={1}`).

## Forms & Inputs

- Use MUI `TextField` for all text inputs with `fullWidth` and `size="small"`.
- Due date input uses MUI `DatePicker` from `@mui/x-date-pickers`.
- Priority is selected via a MUI `Select` (dropdown), not radio buttons.

## Accessibility

- All interactive elements must have descriptive `aria-label` attributes.
- Color alone must not convey meaning — pair color cues with icons or text labels (e.g., overdue badge + icon).
- Keyboard navigation must work end-to-end: adding, completing, editing, and deleting tasks.
- Minimum contrast ratio of **4.5:1** for normal text (WCAG AA).

## Icons

- Use `@mui/icons-material` for all icons.
- Common icons: `AddCircleOutline` (add), `Delete` (delete), `Edit` (edit), `CheckCircle` / `RadioButtonUnchecked` (complete toggle), `Warning` (overdue).
