/**
 * TodoApp Component
 * =================
 *
 * The main component for the Todo application. This component manages the entire
 * todo list state and provides CRUD operations through the API.
 *
 * Features:
 * - Create new todos with an input form
 * - Toggle todo completion status
 * - Inline editing of todo titles
 * - Delete todos with confirmation
 * - Filter todos by status (All, Active, Completed)
 * - Loading states and error handling
 *
 * Architecture:
 * - Uses React hooks for state management
 * - Separates concerns with dedicated handler functions
 * - Implements optimistic UI updates for better UX
 *
 * @author (C) Vahid Rafiei
 * @version 1.0.0
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import type { Todo } from "../lib/api";
import { fetchTodos, createTodo, updateTodo, deleteTodo } from "../lib/api";

/**
 * Filter type for todo display options
 * - 'all': Show all todos
 * - 'active': Show only incomplete todos
 * - 'completed': Show only completed todos
 */
type FilterType = 'all' | 'active' | 'completed';

/**
 * SVG Icon Components
 * -------------------
 * Inline SVG icons for better performance and styling flexibility.
 * Using Heroicons (heroicons.com) design system for consistency.
 */

/**
 * Plus icon for the add button
 * Represents the action of creating a new todo
 */
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true" // Hidden from screen readers as it's decorative
  >
    <path
      fillRule="evenodd"
      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Trash icon for delete buttons
 * Represents the action of removing a todo
 */
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Pencil/Edit icon for edit buttons
 * Represents the action of modifying a todo
 */
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

/**
 * Check icon for save/confirm actions
 * Represents successful completion or confirmation
 */
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * X icon for cancel/close actions
 * Represents cancellation or dismissal
 */
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Loading Spinner Component
 * -------------------------
 * A reusable loading spinner with customizable size.
 * Uses CSS animation for smooth rotation.
 *
 * @param size - The size of the spinner ('sm' | 'md' | 'lg')
 */
const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  // Size mapping for different spinner sizes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} text-violet-500`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      {/* Background circle (faded) */}
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      {/* Spinning arc */}
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

/**
 * Empty State Component
 * ---------------------
 * Displayed when there are no todos to show.
 * Provides visual feedback and encouragement to add todos.
 */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    {/* Decorative illustration - clipboard icon */}
    <div className="w-16 h-16 mb-4 rounded-full bg-violet-500/10 flex items-center justify-center">
      <svg
        className="w-8 h-8 text-violet-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    </div>
    {/* Empty state message */}
    <h3 className="text-lg font-medium text-slate-200 mb-1">
      No todos yet
    </h3>
    <p className="text-sm text-slate-400 text-center">
      Add your first task above to get started!
    </p>
  </div>
);

/**
 * Error Alert Component
 * ---------------------
 * Displays error messages with a dismiss button.
 * Uses red color scheme to indicate error state.
 *
 * @param message - The error message to display
 * @param onDismiss - Callback function to dismiss the error
 */
const ErrorAlert = ({
  message,
  onDismiss
}: {
  message: string;
  onDismiss: () => void;
}) => (
  <div
    className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-between animate-fade-in"
    role="alert" // ARIA role for accessibility
  >
    <div className="flex items-center gap-3">
      {/* Error icon */}
      <div className="flex-shrink-0">
        <svg
          className="h-5 w-5 text-red-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {/* Error message text */}
      <p className="text-sm text-red-300">{message}</p>
    </div>
    {/* Dismiss button */}
    <button
      onClick={onDismiss}
      className="text-red-400 hover:text-red-300 transition-colors"
      aria-label="Dismiss error"
    >
      <XIcon />
    </button>
  </div>
);

/**
 * Todo Item Component
 * -------------------
 * Renders a single todo item with all its interactions.
 * Supports viewing, editing, toggling completion, and deletion.
 *
 * @param todo - The todo object to display
 * @param isEditing - Whether this todo is currently being edited
 * @param editingTitle - The current value of the editing input
 * @param onToggle - Handler for toggling completion status
 * @param onEdit - Handler for starting edit mode
 * @param onSave - Handler for saving edits
 * @param onCancel - Handler for canceling edits
 * @param onDelete - Handler for deleting the todo
 * @param onEditingTitleChange - Handler for updating the editing input value
 */
const TodoItem = ({
  todo,
  isEditing,
  editingTitle,
  onToggle,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onEditingTitleChange,
}: {
  todo: Todo;
  isEditing: boolean;
  editingTitle: string;
  onToggle: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onEditingTitleChange: (value: string) => void;
}) => (
  <li
    className={`
      group relative flex items-center gap-4 p-4 
      rounded-xl glass
      transition-all duration-200 ease-out
      hover:bg-white/5
      ${todo.completed ? 'opacity-60' : ''}
      animate-slide-up
    `}
  >
    {/*
      Custom Checkbox
      ---------------
      A visually enhanced checkbox that shows completion status.
      Uses a hidden native checkbox for accessibility with a custom visual overlay.
    */}
    <label className="relative flex-shrink-0 cursor-pointer">
      {/* Hidden native checkbox for accessibility */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={onToggle}
        className="sr-only peer" // Screen reader only, visually hidden
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
      />
      {/* Custom checkbox visual */}
      <div className={`
        w-6 h-6 rounded-full border-2 
        transition-all duration-200
        flex items-center justify-center
        ${todo.completed 
          ? 'bg-gradient-to-br from-violet-500 to-purple-600 border-transparent' 
          : 'border-slate-500 hover:border-violet-400'
        }
      `}>
        {/* Checkmark icon - only visible when completed */}
        {todo.completed && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </label>

    {/*
      Todo Content Area
      -----------------
      Shows either the editing input or the todo title text.
      Double-click on title to enter edit mode.
    */}
    <div className="flex-1 min-w-0">
      {isEditing ? (
        /* Editing Mode - Show input field */
        <input
          type="text"
          value={editingTitle}
          onChange={(e) => onEditingTitleChange(e.target.value)}
          onKeyDown={(e) => {
            // Save on Enter key
            if (e.key === "Enter") {
              e.preventDefault();
              onSave();
            // Cancel on Escape key
            } else if (e.key === "Escape") {
              onCancel();
            }
          }}
          className="
            w-full px-3 py-1.5
            bg-slate-800/50
            border border-violet-500/50
            rounded-lg
            text-slate-100
            focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent
            transition-all duration-200
          "
          placeholder="Enter todo title..."
          autoFocus // Automatically focus when entering edit mode
        />
      ) : (
        /* View Mode - Show todo title */
        <span
          className={`
            block truncate text-slate-100
            ${todo.completed ? 'line-through text-slate-400' : ''}
            cursor-pointer
          `}
          onDoubleClick={onEdit}
          title="Double-click to edit" // Tooltip hint for users
        >
          {todo.title}
        </span>
      )}
    </div>

    {/*
      Action Buttons
      --------------
      Context-sensitive buttons that appear on hover or when editing.
      Different buttons shown based on editing state.
    */}
    <div className={`
      flex items-center gap-1.5
      ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      transition-opacity duration-200
    `}>
      {isEditing ? (
        /* Editing Mode Actions: Save and Cancel */
        <>
          {/* Save button - confirms the edit */}
          <button
            onClick={onSave}
            className="
              p-2 rounded-lg
              text-green-400 hover:text-green-300
              hover:bg-green-500/10
              transition-all duration-200
            "
            aria-label="Save changes"
            title="Save (Enter)"
          >
            <CheckIcon />
          </button>
          {/* Cancel button - discards the edit */}
          <button
            onClick={onCancel}
            className="
              p-2 rounded-lg
              text-slate-400 hover:text-slate-300
              hover:bg-slate-500/10
              transition-all duration-200
            "
            aria-label="Cancel editing"
            title="Cancel (Escape)"
          >
            <XIcon />
          </button>
        </>
      ) : (
        /* View Mode Actions: Edit and Delete */
        <>
          {/* Edit button - enters edit mode */}
          <button
            onClick={onEdit}
            className="
              p-2 rounded-lg
              text-slate-400 hover:text-violet-400
              hover:bg-violet-500/10
              transition-all duration-200
            "
            aria-label={`Edit "${todo.title}"`}
            title="Edit"
          >
            <EditIcon />
          </button>
          {/* Delete button - removes the todo */}
          <button
            onClick={onDelete}
            className="
              p-2 rounded-lg
              text-slate-400 hover:text-red-400
              hover:bg-red-500/10
              transition-all duration-200
            "
            aria-label={`Delete "${todo.title}"`}
            title="Delete"
          >
            <TrashIcon />
          </button>
        </>
      )}
    </div>
  </li>
);

/**
 * Filter Button Component
 * -----------------------
 * A button for the filter bar that shows active state.
 *
 * @param label - The text label for the button
 * @param isActive - Whether this filter is currently active
 * @param onClick - Handler for button click
 * @param count - Optional count to display next to the label
 */
const FilterButton = ({
  label,
  isActive,
  onClick,
  count,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-lg text-sm font-medium
      transition-all duration-200
      ${isActive 
        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
      }
    `}
    aria-pressed={isActive} // ARIA attribute for toggle buttons
  >
    {label}
    {/* Show count badge if provided */}
    {typeof count === 'number' && (
      <span className={`
        ml-2 px-1.5 py-0.5 rounded text-xs
        ${isActive ? 'bg-violet-400/30' : 'bg-slate-600/50'}
      `}>
        {count}
      </span>
    )}
  </button>
);

/**
 * Main TodoApp Component
 * ----------------------
 * The root component that orchestrates the entire todo application.
 * Manages state, handles API calls, and composes child components.
 */
export default function TodoApp() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  /**
   * Core todo data state
   * Stores the array of all todos fetched from the API
   */
  const [todos, setTodos] = useState<Todo[]>([]);

  /**
   * New todo input state
   * Controlled input value for creating new todos
   */
  const [newTitle, setNewTitle] = useState("");

  /**
   * Loading states
   * - loading: Initial data fetch in progress
   * - saving: Create operation in progress
   */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /**
   * Error state
   * Stores the current error message, null when no error
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * Editing states
   * - editingId: The ID of the todo being edited, null when not editing
   * - editingTitle: The current value of the editing input
   */
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  /**
   * Filter state
   * Controls which todos are displayed based on completion status
   */
  const [filter, setFilter] = useState<FilterType>('all');

  // ============================================
  // COMPUTED VALUES (MEMOIZED)
  // ============================================

  /**
   * Filtered todos based on the current filter selection
   * Memoized to prevent unnecessary recalculations
   */
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  /**
   * Statistics about todos for display in the UI
   * Memoized for performance optimization
   */
  const todoStats = useMemo(() => ({
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  }), [todos]);

  // ============================================
  // API HANDLERS
  // ============================================

  /**
   * Fetches all todos from the backend API
   * Updates loading state and handles errors appropriately
   *
   * @useCallback - Memoized to prevent unnecessary re-renders
   */
  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTodos();
      setTodos(data);
      setError(null); // Clear any previous errors on success
    } catch (err: any) {
      // Extract error message or use fallback
      setError(err.message || "Failed to load todos");
    } finally {
      setLoading(false); // Always reset loading state
    }
  }, []);

  /**
   * Load todos on component mount
   * Empty dependency array ensures this runs only once
   */
  useEffect(() => {
    void loadTodos();
  }, [loadTodos]);

  /**
   * Handles form submission for creating a new todo
   * Validates input, calls API, and refreshes the list
   *
   * @param e - Form submit event
   */
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); // Prevent default form submission

    // Validate: don't create empty todos
    if (!newTitle.trim()) return;

    try {
      setSaving(true);
      await createTodo(newTitle.trim());
      setNewTitle(""); // Clear input on success
      await loadTodos(); // Refresh the list
    } catch (err: any) {
      setError(err.message || "Failed to create todo");
    } finally {
      setSaving(false);
    }
  }

  /**
   * Toggles the completion status of a todo
   * Sends update to API and refreshes the list
   *
   * @param todo - The todo to toggle
   */
  async function handleToggle(todo: Todo) {
    try {
      await updateTodo(todo.id, {
        title: todo.title,
        completed: !todo.completed, // Toggle the current value
      });
      await loadTodos();
    } catch (err: any) {
      setError(err.message || "Failed to update todo");
    }
  }

  /**
   * Initiates edit mode for a specific todo
   * Sets the editing ID and populates the editing input
   *
   * @param todo - The todo to start editing
   */
  function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  }

  /**
   * Cancels the current edit operation
   * Clears editing state without saving changes
   */
  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  }

  /**
   * Saves the current edit to the backend
   * Validates input, updates via API, and clears editing state
   *
   * @param todo - The todo being edited (for its ID and completion status)
   */
  async function saveEdit(todo: Todo) {
    // Validate: don't save empty titles
    if (!editingTitle.trim()) return;

    try {
      await updateTodo(todo.id, {
        title: editingTitle.trim(),
        completed: todo.completed,
      });
      // Clear editing state on success
      setEditingId(null);
      setEditingTitle("");
      await loadTodos();
    } catch (err: any) {
      setError(err.message || "Failed to update todo");
    }
  }

  /**
   * Deletes a todo after user confirmation
   * Implements optimistic UI update for better perceived performance
   *
   * @param id - The ID of the todo to delete
   */
  async function handleDelete(id: number) {
    // Confirm before deletion to prevent accidents
    if (!confirm("Are you sure you want to delete this todo?")) return;

    try {
      // Optimistic update: remove from UI immediately
      setTodos((prev) => prev.filter((t) => t.id !== id));
      await deleteTodo(id);
    } catch (err: any) {
      setError(err.message || "Failed to delete todo");
      // On error, reload todos to restore the deleted item
      await loadTodos();
    }
  }

  /**
   * Clears all completed todos
   * Useful for cleaning up the list after completing tasks
   */
  async function clearCompleted() {
    const completedTodos = todos.filter(t => t.completed);
    if (completedTodos.length === 0) return;

    if (!confirm(`Delete ${completedTodos.length} completed todo(s)?`)) return;

    try {
      // Delete all completed todos in parallel
      await Promise.all(completedTodos.map(t => deleteTodo(t.id)));
      await loadTodos();
    } catch (err: any) {
      setError(err.message || "Failed to clear completed todos");
    }
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      {/*
        Header Section
        --------------
        Contains the app title and subtitle.
        Uses gradient text for visual appeal.
      */}
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
          Todo App
        </h1>
        <p className="text-slate-400 text-sm">
          Organize your tasks, boost your productivity
        </p>
      </header>

      {/*
        Error Alert
        -----------
        Conditionally rendered when there's an error to display.
      */}
      {error && (
        <ErrorAlert
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/*
        Create Todo Form
        ----------------
        Input field and button for adding new todos.
        Uses glassmorphism effect for modern appearance.
      */}
      <form
        onSubmit={handleCreate}
        className="flex gap-3 mb-6"
      >
        {/* Text input for new todo title */}
        <div className="relative flex-1">
          <input
            className="
              w-full px-5 py-4
              rounded-xl glass
              text-slate-100 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent
              transition-all duration-200
            "
            type="text"
            placeholder="What needs to be done?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={saving}
            aria-label="New todo title"
          />
        </div>

        {/* Submit button with loading state */}
        <button
          type="submit"
          disabled={saving || !newTitle.trim()}
          className="
            px-6 py-4
            rounded-xl
            bg-gradient-to-r from-violet-500 to-purple-600
            hover:from-violet-600 hover:to-purple-700
            disabled:opacity-50 disabled:cursor-not-allowed
            text-white font-medium
            shadow-lg shadow-violet-500/25
            hover:shadow-xl hover:shadow-violet-500/30
            transition-all duration-200
            flex items-center gap-2
          "
          aria-label="Add new todo"
        >
          {saving ? (
            /* Show spinner when saving */
            <LoadingSpinner size="sm" />
          ) : (
            /* Show plus icon when ready */
            <PlusIcon />
          )}
          <span className="hidden sm:inline">Add</span>
        </button>
      </form>

      {/*
        Filter Bar
        ----------
        Buttons to filter todos by completion status.
        Also shows counts for each category.
      */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        {/* Filter buttons group */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-800/50">
          <FilterButton
            label="All"
            isActive={filter === 'all'}
            onClick={() => setFilter('all')}
            count={todoStats.total}
          />
          <FilterButton
            label="Active"
            isActive={filter === 'active'}
            onClick={() => setFilter('active')}
            count={todoStats.active}
          />
          <FilterButton
            label="Completed"
            isActive={filter === 'completed'}
            onClick={() => setFilter('completed')}
            count={todoStats.completed}
          />
        </div>

        {/* Clear completed button - only shown when there are completed todos */}
        {todoStats.completed > 0 && (
          <button
            onClick={clearCompleted}
            className="
              text-sm text-slate-400 hover:text-red-400
              transition-colors duration-200
            "
          >
            Clear completed
          </button>
        )}
      </div>

      {/*
        Todo List
        ---------
        The main content area displaying all todos.
        Shows different states: loading, empty, or list of todos.
      */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          /* Loading State - centered spinner with message */
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-sm text-slate-400">Loading your todos...</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          /* Empty State - different message based on filter */
          filter === 'all' ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <p className="text-sm text-slate-400">
                No {filter} todos to show
              </p>
            </div>
          )
        ) : (
          /* Todo List - renders each todo item */
          <ul className="divide-y divide-slate-700/50">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                isEditing={editingId === todo.id}
                editingTitle={editingTitle}
                onToggle={() => handleToggle(todo)}
                onEdit={() => startEdit(todo)}
                onSave={() => saveEdit(todo)}
                onCancel={cancelEdit}
                onDelete={() => handleDelete(todo.id)}
                onEditingTitleChange={setEditingTitle}
              />
            ))}
          </ul>
        )}
      </div>

      {/*
        Footer Statistics
        -----------------
        Shows a summary of remaining tasks.
        Only displayed when there are todos.
      */}
      {todos.length > 0 && (
        <footer className="mt-4 text-center text-sm text-slate-400">
          <p>
            {todoStats.active === 0
              ? "🎉 All tasks completed!"
              : `${todoStats.active} task${todoStats.active !== 1 ? 's' : ''} remaining`
            }
          </p>
        </footer>
      )}
    </div>
  );
}
