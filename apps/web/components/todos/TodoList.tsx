'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Brain, Calendar, CheckSquare, Square, Trash2, Plus, Sparkles } from 'lucide-react';

interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'todo' | 'inprogress' | 'done';
  dueDate?: string;
  aiScore: number;
  subtasks: Subtask[];
  done: boolean;
}

interface TodoListProps {
  todos: Todo[];
  onUpdateTodo: (todoId: string, updatedFields: any) => Promise<void>;
  onDeleteTodo: (todoId: string) => Promise<void>;
  onAddSubtask: (todoId: string, title: string) => Promise<void>;
  onToggleSubtask: (todoId: string, subtaskId: string, completed: boolean) => Promise<void>;
}

type SortKey = 'priority' | 'dueDate' | 'aiScore';
type FilterKey = 'all' | 'High' | 'inprogress' | 'done';

const priorityOrder: Record<'High' | 'Medium' | 'Low', number> = { High: 0, Medium: 1, Low: 2 };

export default function TodoList({
  todos,
  onUpdateTodo,
  onDeleteTodo,
  onAddSubtask,
  onToggleSubtask,
}: TodoListProps) {
  const [sortBy, setSortBy] = useState<SortKey>('aiScore');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<{ [todoId: string]: string }>({});
  const [subtaskCreating, setSubtaskCreating] = useState<{ [todoId: string]: boolean }>({});

  const toggleExpand = (id: string) =>
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleToggleTodo = async (todo: Todo) => {
    try {
      const newStatus = todo.status === 'done' ? 'todo' : 'done';
      await onUpdateTodo(todo.id, {
        status: newStatus,
        done: newStatus === 'done',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubtaskSubmit = async (todoId: string) => {
    const title = newSubtaskTitle[todoId]?.trim();
    if (!title) return;
    
    setSubtaskCreating((prev) => ({ ...prev, [todoId]: true }));
    try {
      await onAddSubtask(todoId, title);
      setNewSubtaskTitle((prev) => ({ ...prev, [todoId]: '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setSubtaskCreating((prev) => ({ ...prev, [todoId]: false }));
    }
  };

  const filtered = todos.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'High') return t.priority === 'High';
    if (filter === 'inprogress') return t.status === 'inprogress';
    if (filter === 'done') return t.done;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
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
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                filter === f.key
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white/3 border border-white/10 text-white/60 hover:text-white hover:border-white/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold">Sort by:</span>
          {sortOptions.map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                sortBy === s.key
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-white/3 border border-white/10 text-white/55 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Todo List Rows */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sorted.length === 0 ? (
            <div className="glass-card p-12 text-center text-muted-foreground bg-white/2 border border-white/8 rounded-2xl">
              No tasks match current filter.
            </div>
          ) : (
            sorted.map((todo) => {
              const isExpanded = expanded.includes(todo.id);
              const completedSubs = todo.subtasks.filter((s) => s.done).length;

              return (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-200"
                >
                  {/* Main row */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleTodo(todo)}
                      className="flex-shrink-0 transition-transform hover:scale-115 text-indigo-400"
                    >
                      {todo.done ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5 text-white/30" />
                      )}
                    </button>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm font-semibold text-white block truncate ${
                          todo.done ? 'line-through text-white/30 font-medium' : ''
                        }`}
                      >
                        {todo.title}
                      </span>
                      {todo.subtasks.length > 0 && (
                        <span className="text-[10px] text-white/40 mt-0.5 block">
                          {completedSubs}/{todo.subtasks.length} subtasks completed
                        </span>
                      )}
                    </div>

                    {/* Priority Badge */}
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                        todo.priority === 'High'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : todo.priority === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {todo.priority}
                    </span>

                    {/* Due date */}
                    {todo.dueDate && (
                      <div className="flex items-center gap-1.5 text-xs text-white/50 whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(todo.dueDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    )}

                    {/* AI Score */}
                    <div className="flex items-center gap-1 text-indigo-400 text-xs">
                      <Brain className="w-3.5 h-3.5" />
                      <span className="font-bold">{todo.aiScore}</span>
                    </div>

                    {/* Delete Icon */}
                    <button
                      onClick={() => onDeleteTodo(todo.id)}
                      className="p-1.5 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Expand Subtasks */}
                    <button
                      onClick={() => toggleExpand(todo.id)}
                      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/40"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Subtasks Expanded Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-white/1 border-t border-white/5"
                      >
                        <div className="px-5 py-3 space-y-2.5">
                          {todo.subtasks.map((sub) => (
                            <div key={sub.id} className="flex items-center gap-3">
                              <button
                                onClick={() => onToggleSubtask(todo.id, sub.id, !sub.done)}
                                className="flex-shrink-0 text-indigo-400 hover:scale-110 transition-transform"
                              >
                                {sub.done ? (
                                  <CheckSquare className="w-4 h-4" />
                                ) : (
                                  <Square className="w-4 h-4 text-white/30" />
                                )}
                              </button>
                              <span
                                className={`text-xs transition-all ${
                                  sub.done
                                    ? 'line-through text-white/30 font-medium'
                                    : 'text-white/70'
                                }`}
                              >
                                {sub.title}
                              </span>
                            </div>
                          ))}

                          {/* Inline Subtask Addition */}
                          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                            <input
                              type="text"
                              placeholder="Add a subtask..."
                              value={newSubtaskTitle[todo.id] || ''}
                              onChange={(e) =>
                                setNewSubtaskTitle((prev) => ({
                                  ...prev,
                                  [todo.id]: e.target.value,
                                }))
                              }
                              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/20 focus:border-indigo-500 focus:outline-none"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddSubtaskSubmit(todo.id);
                              }}
                            />
                            <button
                              onClick={() => handleAddSubtaskSubmit(todo.id)}
                              disabled={subtaskCreating[todo.id] || !newSubtaskTitle[todo.id]?.trim()}
                              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white disabled:opacity-50 transition-all shrink-0"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
