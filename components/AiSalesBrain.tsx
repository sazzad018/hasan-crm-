
import React, { useState } from 'react';
import { AiKnowledgeItem, AiSettings, AiMode } from '../types';
import { BrainCircuit, Save, Plus, Trash2, Bot, Sparkles, MessageSquare, BookOpen, AlertCircle, Eye, EyeOff, Power, Zap, Gem, User, Settings, ToggleLeft, ToggleRight } from 'lucide-react';

interface AiSalesBrainProps {
    aiKnowledgeBase: AiKnowledgeItem[];
    onAddAiKnowledge: (item: AiKnowledgeItem) => void;
    onDeleteAiKnowledge: (id: string) => void;
    aiPersona: string;
    setAiPersona: (persona: string) => void;
    aiSettings: AiSettings;
    setAiSettings: (settings: AiSettings) => void;
}

const AiSalesBrain: React.FC<AiSalesBrainProps> = ({ 
    aiKnowledgeBase, onAddAiKnowledge, onDeleteAiKnowledge, aiPersona, setAiPersona, aiSettings, setAiSettings
}) => {
    
    // Local state for new Q&A
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');
    const [category, setCategory] = useState('General');
    const [showKey, setShowKey] = useState(false);
    
    // Configuration Panel Tab
    const [configTab, setConfigTab] = useState<'paid' | 'free'>('paid');

    const handleAdd = () => {
        if(!newQuestion || !newAnswer) return;
        onAddAiKnowledge({
            id: Date.now().toString(),
            question: newQuestion,
            answer: newAnswer,
            category: category
        });
        setNewQuestion('');
        setNewAnswer('');
    };

    // Helper to update specific mode settings
    const updateConfig = (type: 'paid' | 'free', field: string, value: string | number) => {
        if (type === 'paid') {
            setAiSettings({
                ...aiSettings,
                paidConfig: { ...aiSettings.paidConfig, [field]: value }
            });
        } else {
            setAiSettings({
                ...aiSettings,
                freeConfig: { ...aiSettings.freeConfig, [field]: value }
            });
        }
    };

    // Determine active config based on tab
    const currentConfig = configTab === 'paid' ? aiSettings.paidConfig : aiSettings.freeConfig;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <BrainCircuit size={32} className="text-purple-200" />
                        AI Sales Brain (এআই সেলস ব্রেইন)
                    </h1>
                    <p className="text-purple-100 mt-2 max-w-2xl">
                        আপনার হাইব্রিড এআই সিস্টেম কনফিগার করুন। জটিল সেলস এর জন্য প্রিমিয়াম (Paid) অথবা সাধারণ কাজের জন্য এফিসিয়েন্সি (Free) মডেল ব্যবহার করুন। অথবা ম্যানুয়ালি নিজেই রিপ্লাই দিন।
                    </p>
                </div>
                <Bot size={180} className="absolute -right-6 -bottom-6 text-white opacity-10" />
            </div>

            {/* 1. MAIN CONTROL PANEL (MODE SWITCHER) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* PAID MODE CARD */}
                <div 
                    onClick={() => setAiSettings({...aiSettings, activeMode: 'paid'})}
                    className={`cursor-pointer relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${aiSettings.activeMode === 'paid' ? 'border-violet-500 bg-violet-50 shadow-xl ring-2 ring-violet-300' : 'border-slate-200 bg-white hover:border-violet-300'}`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className={`p-3 rounded-xl ${aiSettings.activeMode === 'paid' ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <Gem size={24} />
                        </div>
                        {aiSettings.activeMode === 'paid' && <div className="px-3 py-1 bg-violet-200 text-violet-800 text-xs font-bold rounded-full uppercase">Active</div>}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Premium AI (Paid)</h3>
                    <p className="text-xs text-slate-500 mt-1">সবচেয়ে শক্তিশালী মডেল (GPT-4 / Gemini Pro)। জটিল নেগোসিয়েশন এবং সেলস এর জন্য সেরা।</p>
                </div>

                {/* FREE MODE CARD */}
                <div 
                    onClick={() => setAiSettings({...aiSettings, activeMode: 'free'})}
                    className={`cursor-pointer relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${aiSettings.activeMode === 'free' ? 'border-emerald-500 bg-emerald-50 shadow-xl ring-2 ring-emerald-300' : 'border-slate-200 bg-white hover:border-emerald-300'}`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className={`p-3 rounded-xl ${aiSettings.activeMode === 'free' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <Zap size={24} />
                        </div>
                        {aiSettings.activeMode === 'free' && <div className="px-3 py-1 bg-emerald-200 text-emerald-800 text-xs font-bold rounded-full uppercase">Active</div>}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Efficiency AI (Free)</h3>
                    <p className="text-xs text-slate-500 mt-1">দ্রুত এবং সাশ্রয়ী মডেল (Gemini Flash)। সাধারণ প্রশ্নের উত্তরের জন্য ভালো।</p>
                </div>

                {/* MANUAL MODE CARD */}
                <div 
                    onClick={() => setAiSettings({...aiSettings, activeMode: 'manual'})}
                    className={`cursor-pointer relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${aiSettings.activeMode === 'manual' ? 'border-slate-500 bg-slate-100 shadow-xl ring-2 ring-slate-300' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className={`p-3 rounded-xl ${aiSettings.activeMode === 'manual' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <User size={24} />
                        </div>
                        {aiSettings.activeMode === 'manual' && <div className="px-3 py-1 bg-slate-300 text-slate-800 text-xs font-bold rounded-full uppercase">Active</div>}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Manual Mode</h3>
                    <p className="text-xs text-slate-500 mt-1">AI সম্পূর্ণ বন্ধ থাকবে। আপনি নিজে কাস্টমারদের রিপ্লাই দিবেন।</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: DETAILED CONFIGURATION */}
                <div className="lg:col-span-1 space-y-6">
                    
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                         <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                             <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                 <Settings size={16} className="text-slate-500" /> 
                                 Model Configuration
                             </h2>
                         </div>
                         
                         {/* CONFIG TABS */}
                         <div className="flex border-b border-slate-100">
                             <button 
                                onClick={() => setConfigTab('paid')}
                                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${configTab === 'paid' ? 'border-b-2 border-violet-500 text-violet-600 bg-violet-50' : 'text-slate-500 hover:bg-slate-50'}`}
                             >
                                 <Gem size={14} /> Premium Setup
                             </button>
                             <button 
                                onClick={() => setConfigTab('free')}
                                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${configTab === 'free' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:bg-slate-50'}`}
                             >
                                 <Zap size={14} /> Free/Basic Setup
                             </button>
                         </div>

                         <div className="p-6 space-y-4">
                             <div className={`text-xs p-3 rounded border mb-2 ${configTab === 'paid' ? 'bg-violet-50 text-violet-800 border-violet-100' : 'bg-emerald-50 text-emerald-800 border-emerald-100'}`}>
                                 নিচে আপনার <strong>{configTab === 'paid' ? 'Premium' : 'Efficiency'}</strong> AI সেটিংস কনফিগার করুন। উপরে মোড সিলেক্ট করলে এই সেটিংসটি কাজ করবে।
                             </div>

                             <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase mb-1">Provider</label>
                                 <select 
                                    value={currentConfig.provider}
                                    onChange={(e) => updateConfig(configTab, 'provider', e.target.value)}
                                    className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-slate-200"
                                 >
                                     <option value="gemini">Google Gemini</option>
                                     <option value="openai">OpenAI (GPT-4)</option>
                                 </select>
                             </div>
                             
                             <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase mb-1">API Key</label>
                                 <div className="relative">
                                     <input 
                                         type={showKey ? "text" : "password"}
                                         value={currentConfig.apiKey}
                                         onChange={(e) => updateConfig(configTab, 'apiKey', e.target.value)}
                                         placeholder={configTab === 'paid' ? "sk-..." : "Free tier key..."}
                                         className="w-full text-sm border border-slate-200 rounded-lg p-2.5 pr-8 outline-none font-mono focus:ring-2 focus:ring-slate-200"
                                     />
                                     <button 
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                                     >
                                         {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                                     </button>
                                 </div>
                             </div>

                             <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase mb-1">Model Name</label>
                                 <input 
                                     value={currentConfig.model}
                                     onChange={(e) => updateConfig(configTab, 'model', e.target.value)}
                                     className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-slate-200"
                                     placeholder={configTab === 'paid' ? "gemini-3-pro-preview" : "gemini-2.5-flash"}
                                 />
                                 <p className="text-[10px] text-slate-400 mt-1">
                                     {configTab === 'paid' ? 'সুপারিশ: gemini-3-pro-preview অথবা gpt-4o' : 'সুপারিশ: gemini-2.5-flash'}
                                 </p>
                             </div>
                         </div>
                    </div>

                    {/* PERSONA EDITOR */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-fit">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Bot size={20} className="text-slate-600" /> Agent Persona (চরিত্র)
                        </h2>
                        <p className="text-xs text-slate-500 mb-4">
                            এখানে লিখে দিন AI নিজেকে কে মনে করবে এবং কিভাবে কথা বলবে। এটি Paid এবং Free উভয় মোডেই কাজ করবে।
                        </p>
                        
                        <div className="flex-1 flex flex-col">
                            <textarea 
                                value={aiPersona}
                                onChange={(e) => setAiPersona(e.target.value)}
                                className="w-full h-64 border border-slate-200 rounded-xl p-4 text-sm leading-relaxed focus:ring-2 focus:ring-slate-200 outline-none resize-none bg-slate-50 focus:bg-white transition-colors"
                            />
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100">
                             <button className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-black transition-all flex justify-center items-center gap-2">
                                 <Save size={14} /> Update Persona
                             </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: KNOWLEDGE BASE */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Add New Knowledge */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Sparkles size={20} className="text-orange-500" /> Add Knowledge (নতুন তথ্য)
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">কাস্টমারের প্রশ্ন / Trigger</label>
                                    <input 
                                        value={newQuestion}
                                        onChange={(e) => setNewQuestion(e.target.value)}
                                        placeholder="যেমন: গোল্ড প্যাকেজের দাম কত?"
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ক্যাটাগরি</label>
                                    <select 
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                                    >
                                        <option>General</option>
                                        <option>Pricing</option>
                                        <option>Services</option>
                                        <option>Objection Handling</option>
                                        <option>Closing</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">AI এর উত্তর (বাংলায়)</label>
                                <textarea 
                                    value={newAnswer}
                                    onChange={(e) => setNewAnswer(e.target.value)}
                                    placeholder="যেমন: আমাদের গোল্ড প্যাকেজ ৫০০ টাকা/মাস এবং এতে আছে..."
                                    className="w-full h-24 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-200 outline-none resize-none"
                                />
                            </div>
                            <button 
                                onClick={handleAdd}
                                disabled={!newQuestion || !newAnswer}
                                className="bg-orange-500 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-orange-600 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <Plus size={18} /> Add to Brain
                            </button>
                        </div>
                    </div>

                    {/* Existing Knowledge List */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <BookOpen size={18} className="text-blue-600" /> Training Data
                            </h3>
                            <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded-full text-slate-600">
                                {aiKnowledgeBase.length} Items
                            </span>
                        </div>
                        
                        <div className="divide-y divide-slate-100">
                            {aiKnowledgeBase.length > 0 ? (
                                aiKnowledgeBase.map(item => (
                                    <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                                                    {item.category || 'General'}
                                                </span>
                                                <h4 className="font-bold text-slate-800 text-sm">Q: {item.question}</h4>
                                            </div>
                                            <button 
                                                onClick={() => onDeleteAiKnowledge(item.id)}
                                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="pl-2 border-l-2 border-slate-200 ml-1">
                                            <p className="text-sm text-slate-600">
                                                <span className="font-bold text-slate-400 text-xs mr-1">AI SHOULD SAY:</span>
                                                {item.answer}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-slate-400">
                                    <AlertCircle size={48} className="mx-auto mb-2 opacity-20" />
                                    <p>No training data added yet.</p>
                                    <p className="text-sm">Add questions above to train your AI.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AiSalesBrain;
