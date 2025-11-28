
import React, { useState, useEffect, useRef } from 'react';
import { Conversation, FbMessage, AttachmentType, LeadStatus, SavedReply, AiKnowledgeItem, AiSettings } from '../types';
import { 
  Search, Mic, Image, Send, MoreHorizontal, Phone, Video, 
  Tag, CheckCircle, User, Globe, Smartphone,
  Zap, X, Edit2, Trash2, Calendar, Sparkles, Clock,
  DollarSign, Hash, Minimize2, Maximize2, Layout, MessageSquare, RefreshCw, Bot, BrainCircuit, Wand2, Power, Plus, Gem, MousePointer2, Copy, FolderOpen, Paperclip, FileText, ScanSearch
} from 'lucide-react';
import { format } from 'date-fns';
import { GoogleGenAI } from "@google/genai";

interface MessengerCRMProps {
  conversations: Conversation[];
  savedReplies: SavedReply[];
  aiKnowledgeBase: AiKnowledgeItem[];
  aiPersona: string;
  aiSettings: AiSettings; // Updated Structure
  onUpdateStatus: (psid: string, status: LeadStatus) => void;
  onUpdateValue: (psid: string, value: number) => void;
  onSendMessage: (psid: string, text: string, attachmentType?: AttachmentType, attachmentUrl?: string) => void;
  onAddReply: (reply: SavedReply) => void;
  onUpdateReply: (reply: SavedReply) => void;
  onDeleteReply: (id: string) => void;
  onUpdateSummary: (psid: string, summary: string) => void;
  onScheduleMeeting: (psid: string, title: string, date: Date) => void;
  onUpdateTags: (psid: string, tags: string[]) => void;
  onUpdateDealValue: (psid: string, value: number) => void;
  onUpdateNotes: (psid: string, notes: string) => void;
  onFetchMessages?: (psid: string) => void;
  onToggleAi: (psid: string, enabled: boolean) => void;
  onAddAiKnowledge: (item: AiKnowledgeItem) => void;
  onUpdateAiKnowledge: (item: AiKnowledgeItem) => void;
  onDeleteAiKnowledge: (id: string) => void;
  onOpenProposal?: () => void;
}

const MessengerCRM: React.FC<MessengerCRMProps> = ({ 
  conversations, 
  savedReplies,
  aiKnowledgeBase,
  aiPersona,
  aiSettings,
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
  onUpdateNotes,
  onFetchMessages,
  onToggleAi,
  onAddAiKnowledge,
  onUpdateAiKnowledge,
  onDeleteAiKnowledge,
  onOpenProposal
}) => {
  const [selectedPsid, setSelectedPsid] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  
  // Voice & File State
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Floating Widget State
  const [isWidgetOpen, setIsWidgetOpen] = useState(true); 
  const [isWidgetMinimized, setIsWidgetMinimized] = useState(false);
  const [activeWidgetTab, setActiveWidgetTab] = useState<'templates' | 'add'>('templates');
  
  // Template Categories
  const [templateCategory, setTemplateCategory] = useState('All');
  const [templateSearch, setTemplateSearch] = useState('');

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

  const categories = ['All', 'Greeting', 'Pricing', 'Details', 'Closing', 'Follow-up'];

  // Filter Templates
  const filteredTemplates = savedReplies.filter(reply => {
      const matchesSearch = reply.label.toLowerCase().includes(templateSearch.toLowerCase()) || reply.text.toLowerCase().includes(templateSearch.toLowerCase());
      const matchesCategory = templateCategory === 'All' || (reply.status && reply.status.includes(templateCategory));
      // Note: We are reusing the 'status' field in SavedReply to store 'category' for this prototype
      return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  // Effect to handle selection, initial fetch, and auto-polling
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (selectedPsid) {
        const currentConv = conversations.find(c => c.psid === selectedPsid);
        if (currentConv) {
            setTempSummary(currentConv.aiSummary || '');
            setTempNotes(currentConv.notes || '');
        }
        setIsEditingSummary(false);

        if (onFetchMessages) {
             onFetchMessages(selectedPsid);
        }

        if (onFetchMessages) {
            intervalId = setInterval(() => {
                onFetchMessages(selectedPsid);
            }, 3000);
        }
    }

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
  }, [selectedPsid]);

  // --- GOOGLE GENAI INTEGRATION ---
  const handleGenerateAiResponse = async () => {
      // Check Mode
      if (aiSettings.activeMode === 'manual') {
          alert("AI Brain is in Manual Mode. Enable Paid or Free mode in settings to use AI drafting.");
          return;
      }

      // Select Config based on Mode
      const activeConfig = aiSettings.activeMode === 'paid' ? aiSettings.paidConfig : aiSettings.freeConfig;

      if(!selectedConversation || !activeConfig.apiKey) {
          if(!activeConfig.apiKey) alert(`API Key missing for ${aiSettings.activeMode} mode! Check AI Settings.`);
          return;
      }
      
      setIsGeneratingAi(true);
      
      try {
          // 1. Prepare Context (Last 10 messages)
          const history = selectedConversation.messages.slice(-10).map(m => 
             `${m.isFromPage ? 'Agent' : 'Customer'}: ${m.messageText}`
          ).join('\n');

          // 2. Prepare Knowledge Base Context
          const kbContext = aiKnowledgeBase.map(item => 
             `Q: ${item.question}\nA: ${item.answer}`
          ).join('\n---\n');

          // 3. Construct System Prompt using dynamic Persona
          // IMPORTANT: Modified prompt for Bengali Language
          const prompt = `
          CONTEXT:
          You are an expert Sales Agent for a Bangladeshi Digital Agency.
          Your persona is: ${aiPersona}
          
          CRITICAL INSTRUCTION:
          - The customer is Bangladeshi. 
          - You MUST reply in **Bengali (Bangla)**. 
          - You can use "Banglish" (English words written in Bangla script) if it sounds more natural for marketing terms (e.g., "Promotion", "Offer", "Reach").
          - Be professional, polite, and persuasive.
          - If the customer writes in English, you may reply in English, but prefer Bangla for better connection.
          
          KNOWLEDGE BASE (Use this strictly for specific answers):
          ${kbContext}
          
          CONVERSATION HISTORY:
          ${history}
          
          CUSTOMER: (Last message from history)
          AGENT (You - in Bangla/Banglish):
          `;

          // Using Google GenAI SDK
          if (activeConfig.provider === 'gemini') {
              const ai = new GoogleGenAI({ apiKey: activeConfig.apiKey });
              const response = await ai.models.generateContent({
                model: activeConfig.model,
                contents: prompt,
              });

              if(response.text) {
                  setInputText(response.text.trim());
              }
          } else {
              // Fallback placeholder for OpenAI if configured in future
              alert("OpenAI integration pending. Please use Gemini provider.");
          }

      } catch (error) {
          console.error("AI Generation Error:", error);
          alert(`Failed to generate response using ${aiSettings.activeMode} mode. Check console/keys.`);
      } finally {
          setIsGeneratingAi(false);
      }
  };

  const handleManualRefresh = async () => {
      if(selectedPsid && onFetchMessages) {
          setIsRefreshing(true);
          await onFetchMessages(selectedPsid);
          setTimeout(() => setIsRefreshing(false), 500);
      }
  };

  const handleSend = () => {
    if (!inputText.trim() || !selectedPsid) return;
    onSendMessage(selectedPsid, inputText);
    setInputText('');
  };

  const insertTemplate = (text: string) => {
      // Append text instead of replace
      setInputText(prev => prev ? `${prev} ${text}` : text);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && selectedPsid) {
          const file = e.target.files[0];
          const isImage = file.type.startsWith('image/');
          const isVideo = file.type.startsWith('video/');
          const isAudio = file.type.startsWith('audio/');
          
          let type = AttachmentType.FILE;
          if(isImage) type = AttachmentType.IMAGE;
          if(isVideo) type = AttachmentType.VIDEO;
          if(isAudio) type = AttachmentType.AUDIO;

          // Simulate upload by creating a fake URL or using a placeholder
          // In real app, you would upload to server here.
          const fakeUrl = URL.createObjectURL(file);
          
          onSendMessage(selectedPsid, `${file.name}`, type, fakeUrl);
      }
  };

  const handleVoiceRecord = () => {
      if(isRecording) {
          setIsRecording(false);
          // Simulate sending voice note
          if(selectedPsid) {
              onSendMessage(selectedPsid, "Voice Message", AttachmentType.AUDIO, "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
          }
      } else {
          setIsRecording(true);
          // In real app, trigger MediaRecorder API
      }
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
    if (lower.includes('urgent') || lower.includes('issue')) return 'bg-red-50 text-red-600 border-red-200';
    if (lower.includes('vip') || lower.includes('deal')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (lower.includes('money') || lower.includes('paid')) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    return 'bg-blue-50 text-blue-600 border-blue-200';
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
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm overflow-hidden
              ${isMe 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
              }`}
          >
             {msg.attachmentType === AttachmentType.TEXT && <p>{msg.messageText}</p>}
             
             {msg.attachmentType === AttachmentType.IMAGE && (
                 <div>
                     <img src={msg.attachmentUrl} alt="Attachment" className="rounded-lg max-w-full h-auto mt-1" />
                 </div>
             )}
             
             {msg.attachmentType === AttachmentType.VIDEO && (
                 <div className="mt-1">
                     <video controls className="rounded-lg max-w-full h-auto w-64 bg-black">
                         <source src={msg.attachmentUrl} type="video/mp4" />
                         Your browser does not support the video tag.
                     </video>
                 </div>
             )}

             {msg.attachmentType === AttachmentType.AUDIO && (
                 <div className={`flex items-center gap-2 ${isMe ? 'text-white' : 'text-slate-700'}`}>
                     <div className="p-2 rounded-full bg-white/20">
                        <Mic size={16} /> 
                     </div>
                     <audio controls className="h-8 w-48 rounded opacity-80" src={msg.attachmentUrl}>
                     </audio>
                 </div>
             )}

             {msg.attachmentType === AttachmentType.FILE && (
                 <div className={`flex items-center gap-2 p-2 rounded-lg border ${isMe ? 'bg-blue-700 border-blue-500' : 'bg-slate-50 border-slate-200'}`}>
                     <FileText size={20} />
                     <div className="overflow-hidden">
                         <p className="truncate font-bold text-xs">{msg.messageText}</p>
                         <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="text-[10px] underline opacity-80 hover:opacity-100">Download File</a>
                     </div>
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

    // Store Category in 'status' field as a hack for this prototype
    const replyData = {
        id: editingReplyId || Date.now().toString(),
        label: newReplyLabel,
        text: newReplyText,
        status: [templateCategory === 'All' ? 'General' : templateCategory] 
    };

    if(editingReplyId) {
        onUpdateReply(replyData);
    } else {
        onAddReply(replyData);
    }
    
    // Reset and show all templates to ensure new one is visible
    setEditingReplyId(null);
    setNewReplyLabel('');
    setNewReplyText('');
    setTemplateCategory('All'); 
    setActiveWidgetTab('templates');
  };

  const startEditReply = (reply: SavedReply) => {
      setEditingReplyId(reply.id);
      setNewReplyLabel(reply.label);
      setNewReplyText(reply.text);
      // Try to extract category from status array
      if(reply.status && reply.status.length > 0 && categories.includes(reply.status[0])) {
          setTemplateCategory(reply.status[0]);
      }
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

  const getAiStatusIcon = () => {
      if (aiSettings.activeMode === 'paid') return <Gem size={16} className="text-violet-500" />;
      if (aiSettings.activeMode === 'free') return <Zap size={16} className="text-emerald-500" />;
      return <MousePointer2 size={16} className="text-slate-400" />;
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
      
      {/* 1. LEFT SIDEBAR: Conversation List */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-white">
        <div className="p-4 border-b border-slate-100">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Inbox</h2>
              
              {/* GLOBAL AI STATUS INDICATOR */}
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${
                  aiSettings.activeMode === 'paid' ? 'bg-violet-50 text-violet-600 border-violet-200' : 
                  aiSettings.activeMode === 'free' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                  'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                  <div className={`w-2 h-2 rounded-full ${aiSettings.activeMode !== 'manual' ? 'animate-pulse' : 'bg-slate-400'} ${
                      aiSettings.activeMode === 'paid' ? 'bg-violet-500' : 
                      aiSettings.activeMode === 'free' ? 'bg-emerald-500' : ''
                  }`}></div>
                  {aiSettings.activeMode === 'paid' ? 'Premium AI' : aiSettings.activeMode === 'free' ? 'Efficient AI' : 'Manual'}
              </div>
          </div>
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
                    <div className="flex items-center gap-1">
                        {conv.aiEnabled && aiSettings.activeMode !== 'manual' && <Bot size={12} className="text-emerald-500" />}
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {lastMsg ? format(lastMsg.createdTime, 'MMM d') : ''}
                        </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                      <p className={`text-xs truncate flex-1 ${conv.unreadCount > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                        {lastMsg?.isFromPage ? `You: ${lastMsg.messageText}` : lastMsg?.messageText || 'Start conversation'}
                      </p>
                  </div>
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
              <div className="flex items-center gap-4 text-slate-600">
                
                {/* AI Toggle Switch (Per Chat) */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${aiSettings.activeMode === 'manual' ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed' : 'bg-white border-slate-200'}`}>
                    {getAiStatusIcon()}
                    <span className="text-xs font-bold text-slate-600">Chat AI</span>
                    <button 
                        onClick={() => {
                            if(aiSettings.activeMode !== 'manual') {
                                onToggleAi(selectedConversation.psid, !selectedConversation.aiEnabled);
                            }
                        }}
                        disabled={aiSettings.activeMode === 'manual'}
                        className={`w-8 h-4 rounded-full relative transition-colors ${
                            selectedConversation.aiEnabled && aiSettings.activeMode !== 'manual' 
                            ? (aiSettings.activeMode === 'paid' ? 'bg-violet-600' : 'bg-emerald-500') 
                            : 'bg-slate-300'
                        }`}
                    >
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${selectedConversation.aiEnabled && aiSettings.activeMode !== 'manual' ? 'left-4.5' : 'left-0.5'}`}></div>
                    </button>
                </div>

                <button 
                    onClick={handleManualRefresh} 
                    className={`p-2 hover:bg-blue-50 text-blue-600 rounded-full transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                    title="Refresh Messages"
                >
                    <RefreshCw size={20} />
                </button>
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
                  {savedReplies.slice(0,5).map(reply => (
                      <button 
                        key={reply.id}
                        onClick={() => insertTemplate(reply.text)}
                        className="flex-shrink-0 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1"
                      >
                         <MessageSquare size={12} className="text-blue-500" />
                         {reply.label}
                      </button>
                  ))}
                  <button onClick={() => { setIsWidgetOpen(true); setIsWidgetMinimized(false); }} className="flex-shrink-0 px-3 py-1.5 bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100 rounded-full text-xs font-medium transition-colors">
                      + Templates
                  </button>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex gap-1 mb-2 text-slate-400">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,video/*,application/pdf" />
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-blue-600 transition-colors" title="Send Image/Video/File">
                      <Paperclip size={20} />
                  </button>
                  <button 
                    onClick={handleVoiceRecord}
                    className={`p-2 rounded-full transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-slate-100 text-slate-500 hover:text-blue-600'}`} 
                    title="Send Voice Note"
                  >
                      <Mic size={20} />
                  </button>
                </div>
                <div className="flex-1 bg-slate-100 rounded-2xl flex items-center p-1 relative">
                    <input 
                      className="w-full bg-transparent px-4 py-2 text-sm outline-none text-slate-800 placeholder-slate-400"
                      placeholder={isRecording ? "Recording audio... Click Mic to send." : selectedConversation.aiEnabled && aiSettings.activeMode !== 'manual' ? `AI (${aiSettings.activeMode}) Auto-Pilot Enabled (Type to override)` : "Type a message..."}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      disabled={isRecording}
                    />
                    
                    {/* Magic AI Button */}
                    <button 
                        onClick={handleGenerateAiResponse}
                        disabled={isGeneratingAi || aiSettings.activeMode === 'manual'}
                        className={`absolute right-2 p-1.5 rounded-full transition-all ${
                            aiSettings.activeMode === 'manual' ? 'opacity-30 cursor-not-allowed' :
                            isGeneratingAi ? 'bg-purple-100 text-purple-400 animate-pulse' : 'hover:bg-purple-100 text-purple-500'
                        }`}
                        title={aiSettings.activeMode === 'manual' ? "Enable AI in Settings" : `Draft with ${aiSettings.activeMode === 'paid' ? 'Premium' : 'Efficiency'} AI`}
                    >
                        <Wand2 size={16} />
                    </button>
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

        {/* Advanced Template Manager Widget */}
        {isWidgetOpen && (
            <div className={`absolute bottom-36 right-4 bg-white shadow-2xl border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 z-50 flex flex-col ${isWidgetMinimized ? 'w-72 h-12' : 'w-96 h-[500px]'}`}>
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
                        {/* Tabs */}
                        <div className="flex border-b border-slate-100">
                            <button 
                                onClick={() => setActiveWidgetTab('templates')} 
                                className={`flex-1 py-3 text-xs font-bold ${activeWidgetTab === 'templates' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Saved List
                            </button>
                            <button 
                                onClick={() => { setActiveWidgetTab('add'); setEditingReplyId(null); setNewReplyLabel(''); setNewReplyText(''); }} 
                                className={`flex-1 py-3 text-xs font-bold ${activeWidgetTab === 'add' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                {editingReplyId ? 'Edit Template' : 'Add New'}
                            </button>
                        </div>

                        {activeWidgetTab === 'templates' && (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Search & Category */}
                                <div className="p-3 border-b border-slate-100 space-y-2 bg-white">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input 
                                            type="text" 
                                            placeholder="Search templates..." 
                                            value={templateSearch}
                                            onChange={(e) => setTemplateSearch(e.target.value)}
                                            className="w-full bg-slate-50 text-slate-800 pl-9 pr-4 py-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 border border-slate-200"
                                        />
                                    </div>
                                    <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setTemplateCategory(cat)}
                                                className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                                                    templateCategory === cat 
                                                    ? 'bg-slate-800 text-white border-slate-800' 
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* List */}
                                <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50">
                                    {filteredTemplates.map(reply => (
                                        <div key={reply.id} className="group bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md transition-all cursor-pointer hover:border-blue-300">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2">
                                                    <FolderOpen size={14} className="text-slate-400" />
                                                    <span className="font-bold text-xs text-slate-700">{reply.label}</span>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); startEditReply(reply); }}
                                                        className="p-1 text-slate-400 hover:text-blue-600 bg-slate-50 rounded"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onDeleteReply(reply.id); }}
                                                        className="p-1 text-slate-400 hover:text-red-600 bg-slate-50 rounded"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">{reply.text}</p>
                                            
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => insertTemplate(reply.text)}
                                                    className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold py-1.5 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Zap size={10} /> Insert
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(reply.text);
                                                    }}
                                                    className="px-3 bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold py-1.5 rounded hover:bg-slate-100 transition-colors"
                                                    title="Copy to clipboard"
                                                >
                                                    <Copy size={10} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredTemplates.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                            <Search size={24} className="mb-2 opacity-20" />
                                            <p className="text-xs">No templates found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeWidgetTab === 'add' && (
                            <div className="p-4 space-y-4 bg-slate-50 flex-1 overflow-y-auto">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Category</label>
                                    <div className="flex gap-1 flex-wrap">
                                        {categories.filter(c => c !== 'All').map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setTemplateCategory(cat)}
                                                className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-colors ${
                                                    templateCategory === cat 
                                                    ? 'bg-blue-600 text-white border-blue-600' 
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Label / Title</label>
                                    <input 
                                        value={newReplyLabel}
                                        onChange={(e) => setNewReplyLabel(e.target.value)}
                                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Intro (Bangla)"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Message Content</label>
                                    <textarea 
                                        value={newReplyText}
                                        onChange={(e) => setNewReplyText(e.target.value)}
                                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Type your message here..."
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button 
                                        onClick={handleSaveReply} 
                                        className="flex-1 bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-black shadow-md transition-all"
                                    >
                                        {editingReplyId ? 'Update Template' : 'Save Template'}
                                    </button>
                                    <button 
                                        onClick={() => { setActiveWidgetTab('templates'); setEditingReplyId(null); setNewReplyLabel(''); setNewReplyText(''); }} 
                                        className="px-4 bg-white border border-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
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
                className="absolute bottom-6 right-6 bg-slate-800 text-white p-3 rounded-full shadow-lg hover:bg-slate-700 transition-all z-40 flex items-center gap-2 pr-4"
                title="Open Templates"
             >
                <Layout size={20} />
                <span className="text-xs font-bold">Templates</span>
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
                     <button 
                        onClick={() => {
                            if(onOpenProposal) onOpenProposal();
                        }}
                        className="flex flex-col items-center justify-center p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors border border-purple-100"
                     >
                         <DollarSign size={16} className="mb-1" />
                         <span className="text-[10px] font-bold">Proposal</span>
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
                     <button 
                        onClick={() => {
                            alert("Sending Audit Report Link...");
                            // In real app, generate link and send
                            onSendMessage(selectedConversation.psid, `Here is your Website Audit Report: ${window.location.origin}/audit/${selectedConversation.psid}`);
                        }}
                        className="flex flex-col items-center justify-center p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
                     >
                         <ScanSearch size={16} className="mb-1" />
                         <span className="text-[10px] font-bold">Send Audit</span>
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
