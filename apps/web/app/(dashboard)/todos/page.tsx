'use client';

import { useState } from 'react';
import KanbanBoard from '@/components/todos/KanbanBoard';
import VoiceInput from '@/components/todos/VoiceInput';
import TodoList from '@/components/todos/TodoList';
import FocusMode from '@/components/todos/FocusMode';

export default function TodosPage() {
  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'focus'>('kanban');

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span>✅</span> Smart TODO Engine
        </h1>
        <div className="flex items-center gap-4">
          <VoiceInput />
          <div className="bg-input p-1 rounded-lg flex gap-1 border border-border">
            <button 
              className={`px-4 py-1.5 rounded-md text-sm transition-colors ${activeTab === 'kanban' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('kanban')}
            >
              Kanban
            </button>
            <button 
              className={`px-4 py-1.5 rounded-md text-sm transition-colors ${activeTab === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('list')}
            >
              List
            </button>
            <button 
              className={`px-4 py-1.5 rounded-md text-sm transition-colors ${activeTab === 'focus' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('focus')}
            >
              ⏱ Focus Mode
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1">
        {activeTab === 'kanban' && <KanbanBoard />}
        {activeTab === 'list' && <TodoList />}
        {activeTab === 'focus' && <FocusMode onExit={() => setActiveTab('kanban')} />}
      </div>
    </div>
  );
}
