'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Brain,
  Calendar,
  CheckSquare,
  Square,
} from 'lucide-react';

type Priority = 'High' | 'Medium' | 'Low';
type Status = 'todo' | 'inprogress' | 'done';

interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

interface Todo {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  aiScore: number;
  subtasks: Subtask[];
  done: boolean;
}

const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
  High: { label: '🔴 High', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  Medium: { label: '🟡 Medium', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  Low: { label: '🟢 Low', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
};

const initialTodos: Todo[] = [
  {
    id: '1',
    title: 'Implement OAuth2 login flow',
    priority: 'High',
    status: 'todo',
    dueDate: '2025-06-05',
    aiScore: 94,
    done: false,
    subtasks: [
      { id: 's1', title: 'Setup NextAuth configuration', done: true },
      { id: 's2', title: 'Configure GitHub/Google providers', done: true },
      { id: 's3', title: 'Test callback URLs in staging', done: false },
      { id: 's4', title: 'Handle error states gracefully', done: false },
      { id: 's5', title: 'Write auth middleware', done: false },
    ],
  },
  {
    id: '2',
    title: 'Build Kanban drag-and-drop UI',
    priority: 'High',
    status: 'inprogress',
    dueDate: '2025-06-02',
    aiScore: 91,
    done: false,
    subtasks: [
      { id: 's6', title: 'Install @hello-pangea/dnd', done: true },
      { id: 's7', title: 'Implement DragDropContext', done: true },
      { id: 's8', title: 'Add layout animations', done: false },
    ],
  },
  {
    id: '3',
    title: 'Integrate GitHub webhooks',
    priority: 'Medium',
    status: 'inprogress',
    dueDate: '2025-06-10',
    aiScore: 82,
    done: false,
    subtasks: [
      { id: 's9', title: 'Setup webhook endpoint', done: true },
      { id: 's10', title: 'Parse push events', done: false },
      { id: 's11', title: 'Store events in database', done: false },
    ],
  },
  {
    id: '4',
    title: 'Design database schema',
    priority: 'Medium',
    status: 'todo',
    dueDate: '2025-06-08',
    aiScore: 77,
    done: false,
    subtasks: [
      { id: 's12', title: 'Define project entities', done: false },
      { id: 's13', title: 'Create ERD diagram', done: false },
    ],
  },
  {
    id: '5',
    title: 'Deploy to Vercel production',
    priority: 'High',
    status: 'done',
    dueDate: '2025-05-30',
    aiScore: 99,
    done: true,
    subtasks: [
      { id: 's14', title: 'Configure environment variables', done: true },
      { id: 's15', title: 'Setup CI/CD pipeline', done: true },
      { id: 's16', title: 'Run smoke tests', done: true },
    ],
  },
  {
    id: '6',
    title: 'Write unit tests for AI scoring',
    priority: 'Low',
    status: 'todo',
    dueDate: '2025-06-15',
    aiScore: 55,
    done: false,
    subtasks: [
      { id: 's17', title: 'Setup Jest configuration', done: false },
      { id: 's18', title: 'Write scoring tests', done: false },
    ],
  },
  {
    id: '7',
    title: 'Add dark mode toggle',
    priority: 'Low',
    status: 'done',
    dueDate: '2025-05-28',
    aiScore: 63,
    done: true,
    subtasks: [
      { id: 's19', title: 'Implement theme context', done: true },
    ],
  },
];

type SortKey = 'priority' | 'dueDate' | 'aiScore';
type FilterKey = 'all' | 'High' | 'inprogress' | 'done';

const priorityOrder: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [sortBy, setSortBy] = useState<SortKey>('aiScore');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggleExpand = (id: string) =>
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleTodo = (id: string) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  const toggleSubtask = (todoId: string, subtaskId: string) =>
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, done: !s.done } : s
              ),
            }
          : t
      )
    );

  const filtered = todos.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'High') return t.priority === 'High';
    if (filter === 'inprogress') return t.status === 'inprogress';
    if (filter === 'done') return t.done;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
    if (sortBy === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (sortBy === 'aiScore') return b.aiScore - a.aiScore;
    return 0;
  });

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'High', label: '🔴 High Priority' },
    { key: 'inprogress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
  ];

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'aiScore', label: 'AI Score' },
    { key: 'priority', label: 'Priority' },
    { key: 'dueDate', label: 'Due Date' },
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                filter === f.key
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-tertiary)]">Sort by:</span>
          {sortOptions.map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                sortBy === s.key
                  ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40'
                  : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Todo Rows */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sorted.map((todo) => {
            const pc = priorityConfig[todo.priority];
            const isExpanded = expanded.includes(todo.id);
            const completedSubs = todo.subtasks.filter((s) => s.done).length;

            return (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--border-hover)] transition-all duration-200"
              >
                {/* Main row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="flex-shrink-0 transition-transform hover:scale-110"
                  >
                    {todo.done ? (
                      <CheckSquare className="w-5 h-5 text-[var(--accent-primary)]" />
                    ) : (
                      <Square className="w-5 h-5 text-[var(--text-tertiary)]" />
                    )}
                  </button>

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <motion.span
                      animate={{ opacity: todo.done ? 0.5 : 1 }}
                      className={`text-sm font-semibold text-[var(--text-primary)] block truncate ${
                        todo.done ? 'line-through text-[var(--text-tertiary)]' : ''
                      }`}
                    >
                      {todo.title}
                    </motion.span>
                    {todo.subtasks.length > 0 && (
                      <span className="text-xs text-[var(--text-tertiary)] mt-0.5 block">
                        {completedSubs}/{todo.subtasks.length} subtasks
                      </span>
                    )}
                  </div>

                  {/* Priority */}
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap ${pc.color} ${pc.bg}`}
                  >
                    {pc.label}
                  </span>

                  {/* Due date */}
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(todo.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>

                  {/* AI Score */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <Brain className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    <span className="font-bold text-[var(--accent-primary)]">{todo.aiScore}</span>
                  </div>

                  {/* Expand */}
                  {todo.subtasks.length > 0 && (
                    <button
                      onClick={() => toggleExpand(todo.id)}
                      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-[var(--text-tertiary)]"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Subtasks expanded */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[var(--border)] px-5 py-3 space-y-2.5 bg-[var(--bg-secondary)]/30">
                        {todo.subtasks.map((sub) => (
                          <div key={sub.id} className="flex items-center gap-3">
                            <button
                              onClick={() => toggleSubtask(todo.id, sub.id)}
                              className="flex-shrink-0 transition-transform hover:scale-110"
                            >
                              {sub.done ? (
                                <CheckSquare className="w-4 h-4 text-[var(--accent-primary)]" />
                              ) : (
                                <Square className="w-4 h-4 text-[var(--text-tertiary)]" />
                              )}
                            </button>
                            <span
                              className={`text-sm transition-all ${
                                sub.done
                                  ? 'line-through text-[var(--text-tertiary)]'
                                  : 'text-[var(--text-secondary)]'
                              }`}
                            >
                              {sub.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
