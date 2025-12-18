# Todo Frontend

> A modern, reactive Todo application frontend built with Astro, React, and Tailwind CSS.

---

## Design Document

### Metadata

| Field          | Value                                      |
|----------------|--------------------------------------------|
| **Author**     | Vahid Rafiei                               |
| **Created**    | 2025                                       |
| **Status**     | Active                                     |
| **License**    | MIT                                        |

---

## 1. Overview

### 1.1 Objective

Build a lightweight, performant, and user-friendly Todo application frontend that communicates with a backend REST API. The application allows users to create, read, update, and delete (CRUD) todo items with a modern, responsive UI.

### 1.2 Goals

- **Performance**: Leverage Astro's partial hydration (`client:load`) to minimize JavaScript payload
- **Developer Experience**: Use TypeScript for type safety and better IDE support
- **Modern UI**: Implement a clean, dark-themed interface using Tailwind CSS
- **Maintainability**: Keep a simple, well-organized codebase with clear separation of concerns

### 1.3 Non-Goals

- Offline support / Service Workers
- User authentication / multi-user support
- Server-side rendering of dynamic content (uses client-side hydration instead)

---

## 2. Architecture

### 2.1 High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Astro Page                          │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │           React TodoApp Component               │  │  │
│  │  │  ┌─────────────┐  ┌──────────────────────────┐  │  │  │
│  │  │  │ State Mgmt  │  │      UI Components       │  │  │  │
│  │  │  │  (useState) │  │  - Form Input            │  │  │  │
│  │  │  └──────┬──────┘  │  - Todo List             │  │  │  │
│  │  │         │         │  - Todo Item (edit/del)  │  │  │  │
│  │  │         ▼         └──────────────────────────┘  │  │  │
│  │  │  ┌─────────────┐                                │  │  │
│  │  │  │  API Layer  │ ◄─────── src/lib/api.ts       │  │  │
│  │  │  └──────┬──────┘                                │  │  │
│  │  └─────────┼───────────────────────────────────────┘  │  │
│  └────────────┼──────────────────────────────────────────┘  │
└───────────────┼─────────────────────────────────────────────┘
                │
                ▼  HTTP (REST)
┌───────────────────────────────────────────────────────────────┐
│                    Backend API Server                         │
│                  (Go / localhost:8080)                        │
│                                                               │
│   Endpoints:                                                  │
│     GET    /api/todos      - List all todos                   │
│     POST   /api/todos      - Create a new todo                │
│     PUT    /api/todos/:id  - Update a todo                    │
│     DELETE /api/todos/:id  - Delete a todo                    │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer         | Technology                | Purpose                              |
|---------------|---------------------------|--------------------------------------|
| Framework     | Astro 5.x                 | Static site generation, routing      |
| UI Library    | React 19.x                | Interactive component rendering      |
| Styling       | Tailwind CSS 4.x          | Utility-first CSS framework          |
| Language      | TypeScript                | Type-safe JavaScript                 |
| Build Tool    | Vite (via Astro)          | Fast HMR and bundling                |

---

## 3. Detailed Design

### 3.1 Project Structure

```
todo-frontend/
├── astro.config.mjs      # Astro configuration (React + Tailwind plugins)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── LICENSE               # MIT License
├── public/
│   └── favicon.svg       # Static favicon asset
└── src/
    ├── components/
    │   └── TodoApp.tsx   # Main React component (CRUD operations)
    ├── lib/
    │   └── api.ts        # API client (fetch wrapper with error handling)
    ├── pages/
    │   └── index.astro   # Entry point / main page
    └── styles/
        └── global.css    # Global styles (Tailwind import)
```

### 3.2 Component Design

#### 3.2.1 TodoApp Component (`src/components/TodoApp.tsx`)

The main React component handling all todo operations.

**State Management:**

| State Variable  | Type              | Description                          |
|-----------------|-------------------|--------------------------------------|
| `todos`         | `Todo[]`          | List of todo items                   |
| `newTitle`      | `string`          | Input value for new todo             |
| `loading`       | `boolean`         | Loading state for initial fetch      |
| `saving`        | `boolean`         | Saving state for create operation    |
| `error`         | `string \| null`  | Error message display                |
| `editingId`     | `number \| null`  | ID of todo being edited              |
| `editingTitle`  | `string`          | Temporary title during edit          |

**Key Features:**

- **Create**: Form submission creates new todo via POST request
- **Read**: Fetches all todos on component mount via `useEffect`
- **Update**: Toggle completion status or edit title inline
- **Delete**: Remove todo with confirmation dialog (optimistic UI update)
- **Inline Editing**: Double-click to edit, Enter to save, Escape to cancel

#### 3.2.2 API Layer (`src/lib/api.ts`)

A typed API client providing:

```typescript
interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// Functions
fetchTodos(): Promise<Todo[]>
createTodo(title: string): Promise<Todo>
updateTodo(id: number, payload: { title: string; completed: boolean }): Promise<Todo>
deleteTodo(id: number): Promise<void>
```

**Configuration:**
- Base URL configurable via `PUBLIC_API_BASE_URL` environment variable
- Defaults to `http://localhost:8080`

**Error Handling:**
- Unified `handleResponse<T>()` function for all API responses
- Extracts error messages from JSON body when available
- Throws descriptive `Error` objects for UI display

### 3.3 Styling

The application uses a **dark theme** with Tailwind CSS:

| Element        | Color          | Tailwind Class          |
|----------------|----------------|-------------------------|
| Background     | Dark slate     | `bg-slate-900`          |
| Text           | Light slate    | `text-slate-100`        |
| Cards/Inputs   | Medium slate   | `bg-slate-800`          |
| Primary action | Sky blue       | `bg-sky-600`            |
| Error text     | Red            | `text-red-400`          |
| Completed text | Muted slate    | `text-slate-400`        |

---

## 4. API Specification

### 4.1 Endpoints

| Method | Endpoint           | Request Body                              | Response              |
|--------|--------------------|--------------------------------------------|----------------------|
| GET    | `/api/todos`       | -                                          | `Todo[]`             |
| POST   | `/api/todos`       | `{ title: string }`                        | `Todo`               |
| PUT    | `/api/todos/:id`   | `{ title: string, completed: boolean }`    | `Todo`               |
| DELETE | `/api/todos/:id`   | -                                          | `204 No Content`     |

### 4.2 Todo Object Schema

```json
{
  "id": 1,
  "title": "Buy groceries",
  "completed": false,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

---

## 5. Configuration

### 5.1 Environment Variables

| Variable              | Default                   | Description                |
|-----------------------|---------------------------|----------------------------|
| `PUBLIC_API_BASE_URL` | `http://localhost:8080`   | Backend API base URL       |

### 5.2 Build Configuration

**Astro Config (`astro.config.mjs`):**
- React integration for JSX/TSX support
- Tailwind CSS via Vite plugin

**TypeScript Config (`tsconfig.json`):**
- Extends `astro/tsconfigs/strict`
- Configured for React JSX transform

---

## 6. Development

### 6.1 Prerequisites

- Node.js 18+
- npm or pnpm
- Backend API server running on `localhost:8080`

### 6.2 Commands

| Command           | Description                                    |
|-------------------|------------------------------------------------|
| `npm install`     | Install dependencies                           |
| `npm run dev`     | Start development server at `localhost:4321`   |
| `npm run build`   | Build production bundle to `./dist/`           |
| `npm run preview` | Preview production build locally               |

### 6.3 Local Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Open http://localhost:4321 in your browser
```

---

## 7. Future Considerations

### 7.1 Potential Enhancements

- [ ] Add drag-and-drop reordering
- [ ] Implement filtering (All / Active / Completed)
- [ ] Add due dates and priority levels
- [ ] Implement keyboard navigation
- [ ] Add bulk operations (delete all completed)

### 7.2 Performance Optimizations

- [ ] Implement optimistic updates for all operations
- [ ] Add request debouncing for rapid updates
- [ ] Consider SWR or React Query for caching

### 7.3 Testing

- [ ] Unit tests with Vitest
- [ ] Component tests with Testing Library
- [ ] E2E tests with Playwright

---

## 8. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 9. References

- [Astro Documentation](https://docs.astro.build)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
