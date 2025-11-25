

import React, { useState, useEffect, useRef } from 'react';
import { Conversation, FbMessage, AttachmentType, LeadStatus, SavedReply } from '../types';
import { 
  Search, Mic, Image, Send, MoreHorizontal, Phone, Video, 
  Tag, CheckCircle, User, Globe, Smartphone,
  Zap, X, Edit2, Trash2, Calendar, Sparkles, Clock,
  DollarSign, Hash, Minimize2, Maximize2, Layout, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';

interface MessengerCRMProps {
  conversations: Conversation[];
  savedReplies: SavedReply[];
  onUpdateStatus: (psid: string, status: LeadStatus) => void;
  onUpdateValue: (psid: string, value: number) => void;
  onSendMessage: (psid: string, text: string) => void;
  onAddReply: (reply: SavedReply) => void;
  onUpdateReply: (reply: SavedReply) => void;
  onDeleteReply: (id: string) => void;
  onUpdateSummary: (psid: string, summary: string) => void;
  onScheduleMeeting: (psid: string, title: string, date: Date) => void;
  onUpdateTags: (psid: string, tags: string[]) => void;
  onUpdateDealValue: (psid: string, value: number) => void;
  onUpdateNotes: (psid: string, notes: string) => void;
}

const MessengerCRM: React.FC<MessengerCRMProps> = ({ 
  conversations, 
  savedReplies,
  onUpdateStatus, 
  onUpdateValue,
  onSendMessage,
  onAddReply,
  onUpdateReply,
  onDeleteReply,
  onUpdateSummary,
  onScheduleMeeting,
  onUpdateTags,
  onUpdateDealValue,
  onUpdateNotes
}) => {
  const [selectedPsid, setSelectedPsid] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Floating Widget State
  const [isWidgetOpen, setIsWidgetOpen] = useState(true); 
  const [isWidgetMinimized, setIsWidgetMinimized] = useState(false);
  const [activeWidgetTab, setActiveWidgetTab] = useState<'templates' | 'add'>('templates');

  // Managing Scripts State inside Widget
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [newReplyLabel, setNewReplyLabel] = useState('');
  const [newReplyText, setNewReplyText] = useState('');
  
  // Editing CRM Data State
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [tempSummary, setTempSummary] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [tempNotes, setTempNotes] = useState('');

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find(c => c.psid === selectedPsid);
  const filteredConversations = conversations.filter(c => 
    c.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  useEffect(() => {
    if (selectedConversation) {
        setTempSummary(selectedConversation.aiSummary || '');
        setTempNotes(selectedConversation.notes || '');
        setIsEditingSummary(false);
    }
  }, [selectedConversation]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedPsid) return;
    onSendMessage(selectedPsid, inputText);
    setInputText('');
  };

  const getStatusColor = (status: LeadStatus) => {
    switch(status) {
        case 'new_lead': return 'bg-blue-500';
        case 'interested': return 'bg-indigo-500';
        case 'negotiation': return 'bg-orange-500';
        case 'converted': return 'bg-emerald-500';
        case 'active_client': return 'bg-violet-600';
        case 'cold': return 'bg-slate-400';
        default: return 'bg-slate-300';
    }
  };

  // Helper to generate deterministic distinct colors for tags
  const getTagStyle = (tag: string) => {
    const lower = tag.toLowerCase();
    
    // 1. Semantic Colors for common business tags
    if (lower.includes('urgent') || lower.includes('issue') || lower.includes('refund') || lower.includes('complaint')) {
        return 'bg-red-50 text-red-600 border-red-200';
    }
    if (lower.includes('vip') || lower.includes('loyal') || lower.includes('gold')) {
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (lower.includes('money') || lower.includes('budget') || lower.includes('paid') || lower.includes('deal')) {
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    }
    if (lower.includes('new') || lower.includes('cold')) {
        return 'bg-blue-50 text-blue-600 border-blue-200';
    }
    if (lower.includes('web') || lower.includes('dev') || lower.includes('design')) {
        return 'bg-violet-50 text-violet-600 border-violet-200';
    }

    // 2. Hash-based colors for everything else
    const palettes = [
        'bg-indigo-50 text-indigo-600 border-indigo-200',
        'bg-pink-50 text-pink-600 border-pink-200',
        'bg-cyan-50 text-cyan-600 border-cyan-200',
        'bg-lime-50 text-lime-600 border-lime-200',
        'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200',
        'bg-teal-50 text-teal-600 border-teal-200',
        'bg-rose-50 text-rose-600 border-rose-200',
    ];

    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return palettes[Math.abs(hash) % palettes.length];
  };

  const renderMessageBubble = (msg: FbMessage) => {
    const isMe = msg.isFromPage;
    return (
      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
        {!isMe && (
           <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-2 flex-shrink-0 text-slate-500">
             <User size={14} />
           </div>
        )}
        <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
          <div 
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
              ${isMe 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
              }`}
          >
             {msg.attachmentType === AttachmentType.TEXT && <p>{msg.messageText}</p>}
             {msg.attachmentType === AttachmentType.IMAGE && (
                 <img src={msg.attachmentUrl} alt="Attachment" className="rounded-lg max-w-full h-auto mt-1" />
             )}
             {msg.attachmentType === AttachmentType.AUDIO && (
                 <div className="flex items-center gap-2">
                     <Mic size={16} /> <span className="text-xs">Audio Message</span>
                 </div>
             )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {format(msg.createdTime, 'h:mm a')}
          </span>
        </div>
      </div>
    );
  };

  const handleSaveReply = () => {
    if(!newReplyLabel || !newReplyText) return;

    if(editingReplyId) {
        onUpdateReply({
            id: editingReplyId,
            label: newReplyLabel,
            text: newReplyText,
            status: ['all'] 
        });
    } else {
        onAddReply({
            id: Date.now().toString(),
            label: newReplyLabel,
            text: newReplyText,
            status: ['all']
        });
    }
    setEditingReplyId(null);
    setNewReplyLabel('');
    setNewReplyText('');
    setActiveWidgetTab('templates');
  };

  const startEditReply = (reply: SavedReply) => {
      setEditingReplyId(reply.id);
      setNewReplyLabel(reply.label);
      setNewReplyText(reply.text);
      setActiveWidgetTab('add');
  };

  const handleSaveSummary = () => {
      if (selectedConversation) {
          onUpdateSummary(selectedConversation.psid, tempSummary);
          setIsEditingSummary(false);
      }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && newTagInput.trim() && selectedConversation) {
          const currentTags = selectedConversation.tags || [];
          if (!currentTags.includes(newTagInput.trim())) {
              onUpdateTags(selectedConversation.psid, [...currentTags, newTagInput.trim()]);
          }
          setNewTagInput('');
      }
  };

  const removeTag = (tagToRemove: string) => {
      if(selectedConversation) {
          const currentTags = selectedConversation.tags || [];
          onUpdateTags(selectedConversation.psid, currentTags.filter(t => t !== tagToRemove));
      }
  };

  const handleNotesBlur = () => {
      if(selectedConversation && tempNotes !== selectedConversation.notes) {
          onUpdateNotes(selectedConversation.psid, tempNotes);
      }
  };

  const handleSubmitSchedule = (e: React.FormEvent) => {
      e.preventDefault();
      if(selectedConversation && scheduleTitle && scheduleDate && scheduleTime) {
          const dateObj = new Date(`${scheduleDate}T${scheduleTime}`);
          onScheduleMeeting(selectedConversation.psid, scheduleTitle, dateObj);
          setIsScheduleModalOpen(false);
          setScheduleTitle('');
          setScheduleDate('');
          setScheduleTime('');
          alert('Meeting Scheduled Successfully!');
      }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
      
      {/* 1. LEFT SIDEBAR: Conversation List */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-white">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Inbox</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or tag..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 text-slate-800 pl-10 pr-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conv => {
            const lastMsg = conv.messages[conv.messages.length - 1];
            const isSelected = selectedPsid === conv.psid;
            return (
              <div 
                key={conv.psid}
                onClick={() => setSelectedPsid(conv.psid)}
                className={`p-3 mx-2 my-1 rounded-lg cursor-pointer transition-colors flex gap-3 group
                  ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}
                `}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg">
                    {conv.userName.charAt(0)}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${getStatusColor(conv.status)}`}></div>
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`font-semibold text-sm truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                      {conv.userName}
                    </h3>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      {lastMsg ? format(lastMsg.createdTime, 'MMM d') : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                      <p className={`text-xs truncate flex-1 ${conv.unreadCount > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                        {lastMsg?.isFromPage ? `You: ${lastMsg.messageText}` : lastMsg?.messageText || 'Start conversation'}
                      </p>
                      {conv.dealValue && conv.dealValue > 0 && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded border border-emerald-100">${conv.dealValue}</span>
                      )}
                  </div>
                  {conv.tags && conv.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 overflow-hidden flex-wrap h-5">
                          {conv.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className={`text-[9px] px-1.5 py-0.5 rounded border ${getTagStyle(tag)}`}>
                                  {tag}
                              </span>
                          ))}
                          {conv.tags.length > 3 && <span className="text-[9px] text-slate-400">+{conv.tags.length - 3}</span>}
                      </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER: Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/50 relative">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                    {selectedConversation.userName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{selectedConversation.userName}</h3>
                  <div className="flex items-center gap-2">
                     <span className={`w-2 h-2 rounded-full ${getStatusColor(selectedConversation.status)}`}></span>
                     <span className="text-xs text-slate-500 capitalize">{selectedConversation.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-blue-600">
                <button className="p-2 hover:bg-blue-50 rounded-full transition-colors"><Phone size={20} /></button>
                <button className="p-2 hover:bg-blue-50 rounded-full transition-colors"><Video size={20} /></button>
                <div className="h-6 w-px bg-slate-200 mx-1"></div>
                <button onClick={() => setSelectedPsid(null)} className="p-2 hover:bg-slate-100 text-slate-400 rounded-full">
                    <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 relative">
              {selectedConversation.messages.map(msg => renderMessageBubble(msg))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
              
              {/* Quick Reply Chips */}
              <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar">
                  {savedReplies.map(reply => (
                      <button 
                        key={reply.id}
                        onClick={() => setInputText(reply.text)}
                        className="flex-shrink-0 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1"
                      >
                         <MessageSquare size={12} className="text-blue-500" />
                         {reply.label}
                      </button>
                  ))}
                  <button onClick={() => setIsWidgetOpen(true)} className="flex-shrink-0 px-3 py-1.5 bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100 rounded-full text-xs font-medium transition-colors">
                      + New
                  </button>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex gap-2 mb-2 text-blue-600">
                  <button className="p-2 hover:bg-blue-50 rounded-full"><Image size={20} /></button>
                  <button className="p-2 hover:bg-blue-50 rounded-full"><Mic size={20} /></button>
                </div>
                <div className="flex-1 bg-slate-100 rounded-2xl flex items-center p-1">
                    <input 
                      className="w-full bg-transparent px-4 py-2 text-sm outline-none text-slate-800 placeholder-slate-400"
                      placeholder="Type a message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                </div>
                <button 
                  onClick={handleSend}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md transition-all active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <MoreHorizontal size={32} />
            </div>
            <p>Select a conversation to start chatting</p>
          </div>
        )}

        {/* Floating Template Widget */}
        {isWidgetOpen && (
            <div className={`absolute bottom-36 right-4 bg-white shadow-2xl border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 z-50 flex flex-col ${isWidgetMinimized ? 'w-64 h-12' : 'w-80 h-96'}`}>
                <div className="bg-slate-800 text-white p-3 flex justify-between items-center cursor-pointer" onClick={() => setIsWidgetMinimized(!isWidgetMinimized)}>
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <Layout size={16} className="text-blue-400" />
                        Template Manager
                    </div>
                    <div className="flex items-center gap-2">
                        {isWidgetMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                        <button onClick={(e) => { e.stopPropagation(); setIsWidgetOpen(false); }} className="hover:text-red-400">
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {!isWidgetMinimized && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex border-b border-slate-100">
                            <button 
                                onClick={() => setActiveWidgetTab('templates')} 
                                className={`flex-1 py-2 text-xs font-bold ${activeWidgetTab === 'templates' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                            >
                                Saved List
                            </button>
                            <button 
                                onClick={() => setActiveWidgetTab('add')} 
                                className={`flex-1 py-2 text-xs font-bold ${activeWidgetTab === 'add' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                            >
                                {editingReplyId ? 'Edit Template' : 'Add New'}
                            </button>
                        </div>

                        {activeWidgetTab === 'templates' && (
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {savedReplies.map(reply => (
                                    <div key={reply.id} className="group p-2 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-lg transition-colors">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-xs text-slate-700">{reply.label}</span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => startEditReply(reply)}
                                                    className="p-1 text-slate-400 hover:text-blue-600"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => onDeleteReply(reply.id)}
                                                    className="p-1 text-slate-400 hover:text-red-600"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-500 truncate mb-2">{reply.text}</p>
                                        <button 
                                            onClick={() => { setInputText(reply.text); }}
                                            className="w-full bg-white border border-slate-200 text-blue-600 text-[10px] font-bold py-1 rounded hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Zap size={10} /> Use Template
                                        </button>
                                    </div>
                                ))}
                                {savedReplies.length === 0 && (
                                    <p className="text-center text-xs text-slate-400 mt-4">No templates yet.</p>
                                )}
                            </div>
                        )}

                        {activeWidgetTab === 'add' && (
                            <div className="p-3 space-y-3 bg-slate-50 flex-1">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Label</label>
                                    <input 
                                        value={newReplyLabel}
                                        onChange={(e) => setNewReplyLabel(e.target.value)}
                                        className="w-full text-xs p-2 border border-slate-200 rounded"
                                        placeholder="e.g. Intro"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Message</label>
                                    <textarea 
                                        value={newReplyText}
                                        onChange={(e) => setNewReplyText(e.target.value)}
                                        className="w-full text-xs p-2 border border-slate-200 rounded h-24"
                                        placeholder="Hello..."
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleSaveReply} 
                                        className="flex-1 bg-slate-800 text-white text-xs font-bold py-2 rounded hover:bg-black"
                                    >
                                        {editingReplyId ? 'Update' : 'Save'}
                                    </button>
                                    <button 
                                        onClick={() => { setActiveWidgetTab('templates'); setEditingReplyId(null); setNewReplyLabel(''); setNewReplyText(''); }} 
                                        className="px-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold py-2 rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}
        
        {!isWidgetOpen && (
             <button 
                onClick={() => { setIsWidgetOpen(true); setIsWidgetMinimized(false); }}
                className="absolute bottom-6 right-6 bg-slate-800 text-white p-3 rounded-full shadow-lg hover:bg-slate-700 transition-all z-40"
                title="Open Templates"
             >
                <Layout size={20} />
             </button>
        )}

      </div>

      {/* 3. RIGHT SIDEBAR: Advanced CRM */}
      {selectedConversation && (
        <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto">
          <div className="p-6 text-center border-b border-slate-100">
             <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-500 text-2xl font-bold relative">
                 {selectedConversation.userName.charAt(0)}
             </div>
             <h2 className="text-lg font-bold text-slate-800">{selectedConversation.userName}</h2>
             <p className="text-xs text-slate-400 font-mono mt-1">ID: {selectedConversation.psid}</p>
          </div>

          <div className="p-4 space-y-6">

             {/* Quick Actions */}
             <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Zap size={12} /> Quick Actions
                 </label>
                 <div className="grid grid-cols-2 gap-2">
                     <button 
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="flex flex-col items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                     >
                         <Calendar size={16} className="mb-1" />
                         <span className="text-[10px] font-bold">Schedule</span>
                     </button>
                     <button className="flex flex-col items-center justify-center p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100">
                         <CheckCircle size={16} className="mb-1" />
                         <span className="text-[10px] font-bold">Mark Done</span>
                     </button>
                     <button 
                        onClick={() => {
                            if(selectedConversation.tags.includes("Urgent")) return;
                            onUpdateTags(selectedConversation.psid, [...selectedConversation.tags, "Urgent"]);
                        }}
                        className="flex flex-col items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                     >
                         <Clock size={16} className="mb-1" />
                         <span className="text-[10px] font-bold">Urgent</span>
                     </button>
                     <button className="flex flex-col items-center justify-center p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors border border-purple-100">
                         <DollarSign size={16} className="mb-1" />
                         <span className="text-[10px] font-bold">Proposal</span>
                     </button>
                 </div>
             </div>

             {/* Deal Value */}
             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                 <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                     <DollarSign size={12} /> Deal Value
                 </label>
                 <div className="flex items-center">
                     <span className="text-slate-400 font-bold mr-1">$</span>
                     <input 
                        type="number"
                        className="w-full bg-transparent font-mono font-bold text-slate-800 outline-none"
                        placeholder="0.00"
                        value={selectedConversation.dealValue || ''}
                        onChange={(e) => onUpdateDealValue(selectedConversation.psid, parseFloat(e.target.value))}
                     />
                 </div>
             </div>

             {/* Tags System */}
             <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Hash size={12} /> Tags
                 </label>
                 <div className="flex flex-wrap gap-2 mb-2">
                     {selectedConversation.tags && selectedConversation.tags.map((tag, idx) => (
                         <span key={idx} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getTagStyle(tag)}`}>
                             {tag}
                             <button onClick={() => removeTag(tag)} className="hover:opacity-60"><X size={10} /></button>
                         </span>
                     ))}
                 </div>
                 <input 
                    className="w-full text-xs p-2 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Type tag & press Enter..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                 />
             </div>

             {/* Lead Status */}
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Tag size={12} /> Status
                </label>
                <select 
                    value={selectedConversation.status}
                    onChange={(e) => onUpdateStatus(selectedConversation.psid, e.target.value as LeadStatus)}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                    <option value="new_lead">New Lead</option>
                    <option value="interested">Interested</option>
                    <option value="negotiation">In Negotiation</option>
                    <option value="converted">Converted</option>
                    <option value="active_client">Active Client 🚀</option>
                    <option value="cold">Cold / Lost</option>
                </select>
             </div>

             {/* Contact Info */}
             <div className="bg-slate-50 rounded-lg p-3 space-y-3 border border-slate-100">
                <div className="flex items-start gap-3">
                    <Smartphone size={16} className="text-slate-400 mt-0.5" />
                    <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 uppercase">Mobile</p>
                        <p className="text-sm font-mono text-slate-700 truncate">{selectedConversation.extractedMobile || 'N/A'}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Globe size={16} className="text-slate-400 mt-0.5" />
                    <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 uppercase">Website</p>
                        {selectedConversation.extractedWebsite ? (
                            <a href={selectedConversation.extractedWebsite} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                                {selectedConversation.extractedWebsite}
                            </a>
                        ) : (
                            <p className="text-sm text-slate-700 italic">N/A</p>
                        )}
                    </div>
                </div>
             </div>

             {/* Advanced Notes */}
             <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Edit2 size={12} /> Client Notes
                 </label>
                 <textarea 
                    className="w-full h-32 text-sm p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-yellow-50/50"
                    placeholder="Add internal notes here..."
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                 />
                 <p className="text-[10px] text-slate-400 text-right mt-1">Auto-saves on blur</p>
             </div>

             {/* AI Summary Section */}
             <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-indigo-800 uppercase flex items-center gap-1.5">
                        <Sparkles size={12} className="text-indigo-600" /> AI Summary
                    </label>
                    <button 
                        onClick={() => setIsEditingSummary(!isEditingSummary)}
                        className="text-indigo-400 hover:text-indigo-600"
                    >
                        <Edit2 size={12} />
                    </button>
                 </div>
                 {isEditingSummary ? (
                     <div className="space-y-2">
                         <textarea 
                             className="w-full text-xs p-2 rounded border border-indigo-200 text-slate-700 h-20 outline-none focus:ring-1 focus:ring-indigo-500"
                             value={tempSummary}
                             onChange={(e) => setTempSummary(e.target.value)}
                         />
                         <div className="flex gap-2">
                             <button onClick={handleSaveSummary} className="flex-1 bg-indigo-600 text-white text-[10px] font-bold py-1.5 rounded">Save</button>
                             <button onClick={() => setIsEditingSummary(false)} className="px-3 bg-white text-slate-500 text-[10px] font-bold py-1.5 rounded border border-slate-200">Cancel</button>
                         </div>
                     </div>
                 ) : (
                     <p className="text-xs text-indigo-900 leading-relaxed">
                         {selectedConversation.aiSummary || "No summary available."}
                     </p>
                 )}
             </div>

          </div>
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {isScheduleModalOpen && (
          <div className="absolute inset-0 z-50 bg-slate-900/50 flex items-center justify-center animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Calendar className="text-blue-600" size={20} />
                      Schedule Meeting
                  </h3>
                  <form onSubmit={handleSubmitSchedule} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Meeting Agenda/Title</label>
                          <input 
                              required
                              className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="e.g. SEO Proposal Discussion"
                              value={scheduleTitle}
                              onChange={e => setScheduleTitle(e.target.value)}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                              <input 
                                  required
                                  type="date"
                                  className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                  value={scheduleDate}
                                  onChange={e => setScheduleDate(e.target.value)}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time</label>
                              <input 
                                  required
                                  type="time"
                                  className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                  value={scheduleTime}
                                  onChange={e => setScheduleTime(e.target.value)}
                              />
                          </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                          <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700">Set Schedule</button>
                          <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-2.5 rounded-lg hover:bg-slate-200">Cancel</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default MessengerCRM;