'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Brain, Calendar, PlusCircle, CheckCircle } from 'lucide-react';

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

interface KanbanBoardProps {
  todos: Todo[];
  onUpdateTodo: (todoId: string, updatedFields: any) => Promise<void>;
  onCreateTodo: (title: string, priority: 'High' | 'Medium' | 'Low') => Promise<void>;
}

interface Column {
  id: 'todo' | 'inprogress' | 'done';
  title: string;
  color: string;
  accent: string;
  tasks: Todo[];
}

export default function KanbanBoard({ todos, onUpdateTodo, onCreateTodo }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Record<string, Column>>({
    todo: { id: 'todo', title: 'To Do', color: 'border-indigo-500/50', accent: '#6366f1', tasks: [] },
    inprogress: { id: 'inprogress', title: 'In Progress', color: 'border-amber-500/50', accent: '#f59e0b', tasks: [] },
    done: { id: 'done', title: 'Done', color: 'border-green-500/50', accent: '#10b981', tasks: [] },
  });
  
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Synchronize todos prop to column states
  useEffect(() => {
    const todoTasks = todos.filter((t) => t.status === 'todo');
    const inProgressTasks = todos.filter((t) => t.status === 'inprogress');
    const doneTasks = todos.filter((t) => t.status === 'done');

    setColumns({
      todo: { id: 'todo', title: 'To Do', color: 'border-indigo-500/30', accent: 'hsl(var(--primary))', tasks: todoTasks },
      inprogress: { id: 'inprogress', title: 'In Progress', color: 'border-amber-500/30', accent: '#f59e0b', tasks: inProgressTasks },
      done: { id: 'done', title: 'Done', color: 'border-green-500/30', accent: '#10b981', tasks: doneTasks },
    });
  }, [todos]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const startColId = source.droppableId;
    const endColId = destination.droppableId;

    // Perform optimistic local UI update
    const startColumn = columns[startColId];
    const endColumn = columns[endColId];

    if (startColId === endColId) {
      const newTasks = Array.from(startColumn.tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [startColId]: { ...startColumn, tasks: newTasks }
      });
      return;
    }

    const startTasks = Array.from(startColumn.tasks);
    const [movedTask] = startTasks.splice(source.index, 1);
    
    // Update task fields locally
    const updatedTask = {
      ...movedTask,
      status: endColId as 'todo' | 'inprogress' | 'done',
      done: endColId === 'done'
    };

    const endTasks = Array.from(endColumn.tasks);
    endTasks.splice(destination.index, 0, updatedTask);

    setColumns({
      ...columns,
      [startColId]: { ...startColumn, tasks: startTasks },
      [endColId]: { ...endColumn, tasks: endTasks }
    });

    // Save changes to database API
    try {
      await onUpdateTodo(draggableId, {
        status: endColId,
        done: endColId === 'done'
      });
    } catch (err) {
      console.error('Failed to save drag drop state:', err);
    }
  };

  const handleAddTaskSubmit = async (colId: 'todo' | 'inprogress' | 'done') => {
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      // Map column to priority (e.g. Medium default)
      await onCreateTodo(newTitle, 'Medium');
      setNewTitle('');
      setShowAddForm(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[550px] w-full">
        {(Object.keys(columns) as Array<keyof typeof columns>).map((key) => {
          const column = columns[key];
          const isAdding = showAddForm === column.id;

          return (
            <div
              key={column.id}
              className={`flex-1 flex flex-col glass-card border-t-4 rounded-2xl bg-white/3 border border-white/10 overflow-hidden backdrop-blur-md`}
              style={{ borderTopColor: column.accent }}
            >
              {/* Column Header */}
              <div className="p-4 flex items-center justify-between border-b border-white/10 bg-white/2">
                <h3 className="font-bold text-white text-sm">{column.title}</h3>
                <span className="text-[10px] uppercase font-bold bg-white/10 px-2 py-0.5 rounded-full text-white/70">
                  {column.tasks.length}
                </span>
              </div>

              {/* Tasks droppable container */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-4 flex flex-col gap-3 min-h-[250px] transition-colors duration-200 ${
                      snapshot.isDraggingOver ? 'bg-white/5' : 'bg-transparent'
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, draggableSnapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 transition-all shadow-md flex flex-col justify-between group ${
                              draggableSnapshot.isDragging
                                ? 'rotate-1 shadow-2xl ring-2 ring-indigo-500/50 bg-white/10'
                                : ''
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <span className={`text-xs font-semibold text-white/95 leading-relaxed ${task.done ? 'line-through opacity-40' : ''}`}>
                                  {task.title}
                                </span>
                              </div>
                              {task.subtasks.length > 0 && (
                                <p className="text-[10px] text-white/40 mb-3">
                                  {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} subtasks completed
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-[10px] font-semibold text-muted-foreground">
                              <span
                                className={`px-2 py-0.5 rounded-md border text-[9px] ${
                                  task.priority === 'High'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    : task.priority === 'Medium'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}
                              >
                                {task.priority}
                              </span>

                              <div className="flex items-center gap-3">
                                {task.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                                <span className="flex items-center gap-0.5 text-indigo-400 font-bold">
                                  <Brain className="w-3 h-3" />
                                  {task.aiScore}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* Inline Task Form */}
                    {isAdding ? (
                      <div className="p-3 border border-indigo-500/30 rounded-xl bg-white/5 flex flex-col gap-2 mt-2">
                        <input
                          type="text"
                          autoFocus
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Task title..."
                          className="bg-transparent border-none text-white text-xs outline-none focus:ring-0"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddTaskSubmit(column.id);
                            if (e.key === 'Escape') setShowAddForm(null);
                          }}
                        />
                        <div className="flex justify-end gap-2 mt-1">
                          <button
                            onClick={() => setShowAddForm(null)}
                            className="px-2.5 py-1 text-[10px] font-bold text-white/55 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAddTaskSubmit(column.id)}
                            disabled={isCreating || !newTitle.trim()}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold disabled:opacity-50"
                          >
                            {isCreating ? 'Adding...' : 'Add'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setNewTitle('');
                          setShowAddForm(column.id);
                        }}
                        className="mt-2 flex items-center justify-center gap-1.5 p-3 border border-dashed border-white/10 hover:border-white/20 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/3 transition-all w-full text-xs font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Task
                      </button>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
