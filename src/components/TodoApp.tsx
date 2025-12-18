/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025 Vahid Rafiei
 */


import React, { useEffect, useState } from "react";
import type { Todo } from "../lib/api";
import { fetchTodos, createTodo, updateTodo, deleteTodo } from "../lib/api";

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  async function loadTodos() {
    try {
      setLoading(true);
      const data = await fetchTodos();
      setTodos(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load todos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTodos();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      setSaving(true);
      await createTodo(newTitle.trim());
      setNewTitle("");
      await loadTodos();
    } catch (err: any) {
      setError(err.message || "Failed to create todo");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(todo: Todo) {
    try {
      await updateTodo(todo.id, {
        title: todo.title,
        completed: !todo.completed,
      });
      await loadTodos();
    } catch (err: any) {
      setError(err.message || "Failed to update todo");
    }
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  }

  async function saveEdit(todo: Todo) {
    if (!editingTitle.trim()) return;
    try {
      await updateTodo(todo.id, {
        title: editingTitle.trim(),
        completed: todo.completed,
      });
      setEditingId(null);
      setEditingTitle("");
      await loadTodos();
    } catch (err: any) {
      setError(err.message || "Failed to update todo");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this todo?")) return;
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id)); // optimistic
    } catch (err: any) {
      setError(err.message || "Failed to delete todo");
    }
  }

  return (
    <div className="w-full max-w-xl">
      <h1 className="text-3xl font-bold mb-4">Todo App</h1>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          className="flex-1 px-3 py-2 rounded-md bg-slate-800 border border-slate-700 focus:outline-none focus:ring focus:ring-sky-500"
          type="text"
          placeholder="What needs to be done?"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button
          type="submit"
          disabled={saving || !newTitle.trim()}
          className="px-4 py-2 rounded-md bg-sky-600 disabled:bg-sky-900"
        >
          {saving ? "Adding..." : "Add"}
        </button>
      </form>

      {loading && <p className="mb-2 text-sm text-slate-300">Loading todos...</p>}
      {error && <p className="mb-2 text-sm text-red-400">Error: {error}</p>}

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between px-3 py-2 bg-slate-800 rounded-md"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo)}
              />
              {editingId === todo.id ? (
                <input
                  className="px-2 py-1 rounded bg-slate-900 border border-slate-600 text-sm"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void saveEdit(todo);
                    } else if (e.key === "Escape") {
                      setEditingId(null);
                      setEditingTitle("");
                    }
                  }}
                />
              ) : (
                <span
                  className={
                    "text-sm " +
                    (todo.completed ? "line-through text-slate-400" : "")
                  }
                  onDoubleClick={() => startEdit(todo)}
                >
                  {todo.title}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {editingId === todo.id && (
                <button
                  className="text-xs text-sky-400 hover:text-sky-300"
                  onClick={() => void saveEdit(todo)}
                >
                  Save
                </button>
              )}
              <button
                className="text-xs text-red-400 hover:text-red-300"
                onClick={() => void handleDelete(todo.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {!loading && todos.length === 0 && (
          <li className="text-sm text-slate-400">
            No todos yet. Add your first one!
          </li>
        )}
      </ul>
    </div>
  );
}
