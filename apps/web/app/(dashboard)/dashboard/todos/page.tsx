'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CheckSquare, Loader2, AlertCircle, Mic, Sparkles } from 'lucide-react';
import KanbanBoard from '@/components/todos/KanbanBoard';
import TodoList from '@/components/todos/TodoList';
import FocusMode from '@/components/todos/FocusMode';
import VoiceInput from '@/components/todos/VoiceInput';
import { getTodos, createTodo, updateTodo, deleteTodo, createSubtask, updateSubtask } from '@/lib/api-client';

export default function TodosPage() {
  const { data: session } = useSession();
  const [todos, setTodos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'focus'>('kanban');
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllTodos = async (token: string) => {
    try {
      setLoading(true);
      const list = await getTodos(token);
      setTodos(list);
    } catch (err: any) {
      console.error(err);
      setError('Failed to sync tasks from database server. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchAllTodos(session.accessToken);
    }
  }, [session?.accessToken]);

  const handleCreateTodo = async (title: string, priority: 'High' | 'Medium' | 'Low' = 'Medium') => {
    if (!session?.accessToken) return;
    try {
      const newTodo = await createTodo(
        {
          title,
          priority: priority,
          status: 'todo',
          tags: ['general'],
        },
        session.accessToken
      );
      setTodos((prev) => [newTodo, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTodo = async (todoId: string, updatedFields: any) => {
    if (!session?.accessToken) return;
    try {
      const updated = await updateTodo(todoId, updatedFields, session.accessToken);
      setTodos((prev) => prev.map((t) => (t.id === todoId ? updated : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (!session?.accessToken) return;
    try {
      await deleteTodo(todoId, session.accessToken);
      setTodos((prev) => prev.filter((t) => t.id !== todoId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubtask = async (todoId: string, title: string) => {
    if (!session?.accessToken) return;
    try {
      const subtask = await createSubtask(todoId, { title }, session.accessToken);
      setTodos((prev) =>
        prev.map((t) => {
          if (t.id === todoId) {
            return {
              ...t,
              subtasks: [...t.subtasks, subtask],
            };
          }
          return t;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubtask = async (todoId: string, subtaskId: string, completed: boolean) => {
    if (!session?.accessToken) return;
    try {
      const subtask = await updateSubtask(todoId, subtaskId, { completed }, session.accessToken);
      setTodos((prev) =>
        prev.map((t) => {
          if (t.id === todoId) {
            return {
              ...t,
              subtasks: t.subtasks.map((s: any) => (s.id === subtaskId ? subtask : s)),
            };
          }
          return t;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (!session?.accessToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-muted-foreground text-sm">Authenticating session...</p>
      </div>
    );
  }

  if (loading && todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
        </div>
        <p className="text-indigo-400 text-sm font-semibold animate-pulse">Syncing smart task matrix...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 max-w-md mx-auto text-center mt-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Smart TODO Sync Failure</h3>
        <p className="text-sm text-white/60 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto h-full pb-12">
      {/* Header toolbar */}
      <div className="flex items-center justify-between shrink-0 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            <CheckSquare className="w-8 h-8 text-indigo-400" />
            Smart TODO Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Task boards with Gemini auto-prioritization, subtask auto-generators, and voice inputs.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowVoiceInput(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/25 rounded-xl text-xs font-bold text-indigo-400 shadow-md transition-all"
          >
            <Mic className="w-3.5 h-3.5" />
            Voice Add
          </button>
          
          <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10">
            <button
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'kanban' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/55 hover:text-white'
              }`}
              onClick={() => setActiveTab('kanban')}
            >
              Kanban
            </button>
            <button
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/55 hover:text-white'
              }`}
              onClick={() => setActiveTab('list')}
            >
              List
            </button>
            <button
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'focus' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/55 hover:text-white'
              }`}
              onClick={() => setActiveTab('focus')}
            >
              ⏱️ Focus Mode
            </button>
          </div>
        </div>
      </div>

      {/* Main views content */}
      <div className="flex-1 min-h-0">
        {activeTab === 'kanban' && (
          <KanbanBoard todos={todos} onUpdateTodo={handleUpdateTodo} onCreateTodo={handleCreateTodo} />
        )}
        {activeTab === 'list' && (
          <TodoList
            todos={todos}
            onUpdateTodo={handleUpdateTodo}
            onDeleteTodo={handleDeleteTodo}
            onAddSubtask={handleAddSubtask}
            onToggleSubtask={handleToggleSubtask}
          />
        )}
        {activeTab === 'focus' && <FocusMode todos={todos} onExit={() => setActiveTab('kanban')} />}
      </div>

      {/* Voice input modal */}
      {showVoiceInput && (
        <VoiceInput
          onClose={() => setShowVoiceInput(false)}
          onAddTask={(title, priority) => {
            handleCreateTodo(title, priority);
            setShowVoiceInput(false);
          }}
        />
      )}
    </div>
  );
}
