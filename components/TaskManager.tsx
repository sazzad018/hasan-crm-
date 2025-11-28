
import React, { useState } from 'react';
import { AdminTask, Conversation } from '../types';
import { CheckSquare, Square, Trash2, Plus, Calendar, Clock, Briefcase, Filter, MoreHorizontal, GripVertical } from 'lucide-react';
import { format } from 'date-fns';

interface TaskManagerProps {
    tasks: AdminTask[];
    conversations: Conversation[];
    onAddTask: (title: string, description?: string, relatedClientId?: string) => void;
    onUpdateStatus: (taskId: string, status: 'todo' | 'in_progress' | 'done') => void;
    onDeleteTask: (taskId: string) => void;
}

const UserIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

interface TaskCardProps {
    task: AdminTask;
    onUpdateStatus: (taskId: string, status: 'todo' | 'in_progress' | 'done') => void;
    onDeleteTask: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateStatus, onDeleteTask }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-2">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                task.priority === 'high' ? 'bg-red-50 text-red-600' : 
                task.priority === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
            }`}>
                {task.priority}
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                 <button onClick={() => onDeleteTask(task.id)} className="text-slate-300 hover:text-red-500">
                     <Trash2 size={14} />
                 </button>
            </div>
        </div>
        
        <h4 className={`font-bold text-slate-800 text-sm mb-1 ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
            {task.title}
        </h4>
        
        {task.description && (
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
        )}

        {task.relatedClientName && (
            <div className="flex items-center gap-1.5 mt-2 mb-3 bg-slate-50 w-fit px-2 py-1 rounded text-[10px] text-slate-600 font-medium">
                <UserIcon /> {task.relatedClientName}
            </div>
        )}

        <div className="flex justify-between items-center mt-2 border-t border-slate-100 pt-2">
             <span className="text-[10px] text-slate-400">{format(task.createdAt, 'MMM d')}</span>
             
             <div className="flex gap-1">
                 {task.status !== 'todo' && (
                     <button 
                        onClick={() => onUpdateStatus(task.id, 'todo')}
                        className="w-2 h-2 rounded-full bg-slate-200 hover:bg-slate-400" 
                        title="Move to To Do" 
                     />
                 )}
                 {task.status !== 'in_progress' && (
                     <button 
                        onClick={() => onUpdateStatus(task.id, 'in_progress')}
                        className="w-2 h-2 rounded-full bg-blue-200 hover:bg-blue-400" 
                        title="Move to In Progress" 
                     />
                 )}
                 {task.status !== 'done' && (
                     <button 
                        onClick={() => onUpdateStatus(task.id, 'done')}
                        className="w-2 h-2 rounded-full bg-emerald-200 hover:bg-emerald-400" 
                        title="Move to Done" 
                     />
                 )}
             </div>
        </div>
    </div>
);

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, conversations, onAddTask, onUpdateStatus, onDeleteTask }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title.trim()) return;

        onAddTask(title, description, selectedClientId || undefined);
        setTitle('');
        setDescription('');
        setSelectedClientId('');
    };

    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header / Input Area */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6">
                 <div className="md:w-1/4">
                     <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Briefcase className="text-[#9B7BE3]" /> Command Center
                     </h2>
                     <p className="text-sm text-slate-500 mt-1">Add tasks and manage agency workflow efficiently.</p>
                 </div>
                 
                 <form onSubmit={handleSubmit} className="flex-1 flex gap-4 items-start">
                     <div className="flex-1 space-y-3">
                         <input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#9B7BE3] outline-none"
                         />
                         <div className="flex gap-3">
                             <input 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Details..."
                                className="flex-1 bg-slate-50 border-0 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-[#9B7BE3] outline-none"
                             />
                             <select 
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                className="bg-slate-50 border-0 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#9B7BE3] outline-none text-slate-600"
                             >
                                <option value="">No Client Linked</option>
                                {conversations.map(c => <option key={c.psid} value={c.psid}>{c.userName}</option>)}
                             </select>
                         </div>
                     </div>
                     <button 
                        type="submit"
                        disabled={!title.trim()}
                        className="bg-[#9B7BE3] hover:bg-violet-600 text-white p-4 rounded-xl shadow-lg shadow-violet-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                         <Plus size={24} />
                     </button>
                 </form>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                
                {/* To Do Column */}
                <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200">
                    <div className="p-4 border-b border-slate-200 bg-white/50 backdrop-blur sticky top-0 z-10 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span> To Do
                        </h3>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{todoTasks.length}</span>
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                        {todoTasks.map(t => (
                            <TaskCard 
                                key={t.id} 
                                task={t} 
                                onDeleteTask={onDeleteTask} 
                                onUpdateStatus={onUpdateStatus} 
                            />
                        ))}
                    </div>
                </div>

                {/* In Progress Column */}
                <div className="flex flex-col h-full bg-blue-50/30 rounded-2xl border border-blue-100">
                    <div className="p-4 border-b border-blue-100 bg-white/50 backdrop-blur sticky top-0 z-10 flex justify-between items-center">
                        <h3 className="font-bold text-blue-700 text-sm uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> In Progress
                        </h3>
                        <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                        {inProgressTasks.map(t => (
                            <TaskCard 
                                key={t.id} 
                                task={t} 
                                onDeleteTask={onDeleteTask} 
                                onUpdateStatus={onUpdateStatus} 
                            />
                        ))}
                    </div>
                </div>

                {/* Done Column */}
                <div className="flex flex-col h-full bg-emerald-50/30 rounded-2xl border border-emerald-100">
                    <div className="p-4 border-b border-emerald-100 bg-white/50 backdrop-blur sticky top-0 z-10 flex justify-between items-center">
                        <h3 className="font-bold text-emerald-700 text-sm uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Done
                        </h3>
                        <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{doneTasks.length}</span>
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                        {doneTasks.map(t => (
                            <TaskCard 
                                key={t.id} 
                                task={t} 
                                onDeleteTask={onDeleteTask} 
                                onUpdateStatus={onUpdateStatus} 
                            />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TaskManager;
