import React, { useState } from 'react';
import { AdminTask, Conversation } from '../types';
import { CheckSquare, Square, Trash2, Plus, Calendar, Clock, Briefcase, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface TaskManagerProps {
    tasks: AdminTask[];
    conversations: Conversation[];
    onAddTask: (title: string, description?: string, relatedClientId?: string) => void;
    onToggleTask: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, conversations, onAddTask, onToggleTask, onDeleteTask }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title.trim()) return;

        onAddTask(title, description, selectedClientId || undefined);
        setTitle('');
        setDescription('');
        setSelectedClientId('');
    };

    const filteredTasks = tasks.filter(t => activeTab === 'pending' ? !t.isCompleted : t.isCompleted);
    const completedCount = tasks.filter(t => t.isCompleted).length;
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    return (
        <div className="max-w-5xl mx-auto h-full flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6 h-full">
                
                {/* Left Column: Input Form */}
                <div className="w-full md:w-1/3 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Plus className="text-blue-600" size={20} /> New Daily Task
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Task Title</label>
                                <input 
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="What needs to be done?"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description (Optional)</label>
                                <textarea 
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                    placeholder="Add details..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Related Client (Optional)</label>
                                <select 
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={selectedClientId}
                                    onChange={e => setSelectedClientId(e.target.value)}
                                >
                                    <option value="">-- General Task --</option>
                                    {conversations.map(c => (
                                        <option key={c.psid} value={c.psid}>{c.userName}</option>
                                    ))}
                                </select>
                            </div>
                            <button 
                                type="submit" 
                                disabled={!title.trim()}
                                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add to List
                            </button>
                        </form>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-6 text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2">Today's Progress</h3>
                        <div className="flex justify-between text-sm font-medium opacity-90 mb-2">
                            <span>{completedCount} / {tasks.length} Completed</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
                            <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-xs mt-4 opacity-80 leading-relaxed">
                            "Focus on being productive instead of busy."
                        </p>
                    </div>
                </div>

                {/* Right Column: Task List */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setActiveTab('pending')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'pending' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Pending
                            </button>
                            <button 
                                onClick={() => setActiveTab('completed')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Completed
                            </button>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                            {filteredTasks.length} Tasks
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => (
                                <div 
                                    key={task.id}
                                    className={`bg-white p-4 rounded-xl border transition-all flex items-start gap-4 group ${task.isCompleted ? 'border-emerald-100 opacity-70' : 'border-slate-200 hover:border-blue-300 shadow-sm'}`}
                                >
                                    <button 
                                        onClick={() => onToggleTask(task.id)}
                                        className={`mt-1 transition-colors ${task.isCompleted ? 'text-emerald-500' : 'text-slate-300 hover:text-blue-500'}`}
                                    >
                                        {task.isCompleted ? <CheckSquare size={24} /> : <Square size={24} />}
                                    </button>
                                    
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`font-bold text-base ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                                {task.title}
                                            </h4>
                                            <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap ml-2">
                                                {format(task.createdAt, 'h:mm a')}
                                            </span>
                                        </div>
                                        
                                        {task.description && (
                                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                                {task.description}
                                            </p>
                                        )}
                                        
                                        {task.relatedClientName && (
                                            <div className="mt-3 flex items-center gap-2">
                                                <div className="bg-violet-50 text-violet-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-violet-100">
                                                    <Briefcase size={12} />
                                                    {task.relatedClientName}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => onDeleteTask(task.id)}
                                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                                        title="Delete Task"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <Filter size={24} className="opacity-30" />
                                </div>
                                <p className="font-medium">No {activeTab} tasks found.</p>
                                {activeTab === 'pending' && <p className="text-sm mt-1">Great job! You're all caught up.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskManager;