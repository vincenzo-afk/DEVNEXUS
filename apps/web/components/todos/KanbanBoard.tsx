'use client';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  aiScore: number;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

const initialData: Record<string, Column> = {
  todo: {
    id: 'todo',
    title: 'To Do',
    color: 'border-indigo-500/50',
    tasks: [
      { id: 't1', title: 'Implement Auth', priority: 'high', aiScore: 92 },
      { id: 't2', title: 'Setup DB Schema', priority: 'high', aiScore: 88 },
    ],
  },
  inProgress: {
    id: 'inProgress',
    title: 'In Progress',
    color: 'border-amber-500/50',
    tasks: [
      { id: 't3', title: 'Design Dashboard', priority: 'medium', aiScore: 75 },
    ],
  },
  done: {
    id: 'done',
    title: 'Done',
    color: 'border-green-500/50',
    tasks: [
      { id: 't4', title: 'Project Initialization', priority: 'low', aiScore: 40 },
    ],
  },
};

export default function KanbanBoard() {
  const [columns, setColumns] = useState(initialData);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const startColumn = columns[source.droppableId];
    const endColumn = columns[destination.droppableId];

    if (startColumn === endColumn) {
      const newTasks = Array.from(startColumn.tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [startColumn.id]: {
          ...startColumn,
          tasks: newTasks,
        },
      });
      return;
    }

    // Moving from one list to another
    const startTasks = Array.from(startColumn.tasks);
    const [removed] = startTasks.splice(source.index, 1);
    const newStart = {
      ...startColumn,
      tasks: startTasks,
    };

    const endTasks = Array.from(endColumn.tasks);
    endTasks.splice(destination.index, 0, removed);
    const newEnd = {
      ...endColumn,
      tasks: endTasks,
    };

    setColumns({
      ...columns,
      [newStart.id]: newStart,
      [newEnd.id]: newEnd,
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 h-full min-h-[500px]">
        {Object.values(columns).map((column) => (
          <div key={column.id} className={`flex-1 flex flex-col glass-card border-t-4 ${column.color}`}>
            <div className="p-4 flex items-center justify-between border-b border-border">
              <h3 className="font-bold text-foreground">{column.title}</h3>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                {column.tasks.length}
              </span>
            </div>
            
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 p-4 flex flex-col gap-3 min-h-[150px]"
                >
                  {column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-4 rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-shadow ${snapshot.isDragging ? 'rotate-2 shadow-lg ring-2 ring-primary/50' : ''}`}
                        >
                          <div className="font-medium text-sm mb-2">{task.title}</div>
                          <div className="flex items-center justify-between mt-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                              task.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                              task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-green-500/20 text-green-500'
                            }`}>
                              {task.priority}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              🤖 {task.aiScore}
                            </span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  <button className="mt-2 flex items-center justify-center gap-2 p-2 border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all w-full text-sm">
                    <Plus size={16} /> Add Task
                  </button>
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
