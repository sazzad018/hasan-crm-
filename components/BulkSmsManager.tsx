
import React, { useState, useMemo } from 'react';
import { Conversation, SmsSettings, SmsCampaign, Meeting, LeadStatus } from '../types';
import { Send, Settings, CheckCircle, AlertTriangle, Save, Variable, Filter, Sparkles, ArrowRight, BookOpen, LayoutTemplate, Smartphone, Users, History, Zap, Search, UserPlus, CheckSquare, Square, Upload, Globe, Facebook, Star, Bot, X } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { isSameDay, isSameMonth } from 'date-fns';

interface BulkSmsManagerProps {
    conversations: Conversation[];
    meetings: Meeting[]; 
    settings: SmsSettings;
    onSaveSettings: (settings: SmsSettings) => void;
    onSaveCampaign: (campaign: SmsCampaign) => void;
    onUpdateSmsStats: (psids: string[]) => void;
    campaignHistory: SmsCampaign[];
    aiPersona: string; 
}

interface SmsFilterState {
    source: string;
    status: string;
    date: string;
    hasWebsite: boolean;
    hasFacebook: boolean;
    isBestQuality: boolean;
}

const BulkSmsManager: React.FC<BulkSmsManagerProps> = ({ 
    conversations, meetings, settings, onSaveSettings, onSaveCampaign, onUpdateSmsStats, campaignHistory, aiPersona 
}) => {
    const [activeTab, setActiveTab] = useState<'compose' | 'settings' | 'history'>('compose');
    
    // Audience Selection Mode
    const [selectionMode, setSelectionMode] = useState<'filters' | 'manual' | 'upload'>('filters');
    const [manualRecipients, setManualRecipients] = useState<string[]>([]);
    const [leadSearchTerm, setLeadSearchTerm] = useState('');

    // Upload Mode State
    const [csvText, setCsvText] = useState('');
    const [uploadedContacts, setUploadedContacts] = useState<Conversation[]>([]);

    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendingProgress, setSendingProgress] = useState(0);

    // Right Panel Tab State
    const [creativeTab, setCreativeTab] = useState<'templates' | 'preview' | 'ai'>('templates');

    // Advanced Filtering State
    const [smsFilters, setSmsFilters] = useState<SmsFilterState>({
        source: 'all',
        status: 'all',
        date: 'all',
        hasWebsite: false,
        hasFacebook: false,
        isBestQuality: false
    });

    // AI Generation State
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    // Settings Form State
    const [localSettings, setLocalSettings] = useState<SmsSettings>(settings);

    // Agency Scripts Data (Bengali)
    const agencyScripts = [
        {
            category: 'Facebook Ads 🚀',
            templates: [
                "প্রিয় {{name}}, আপনার পেজের রিচ কমে গেছে? 📉 আমরা টার্গেটেড ফেসবুক অ্যাডের মাধ্যমে আপনার সেলস ৩ গুণ বাড়াতে সাহায্য করতে পারি। ফ্রি কনসালটেশনের জন্য রিপ্লাই দিন।",
                "বাজেট শেষ কিন্তু সেলস নাই? 🛑 আর বুস্ট নয়, প্রফেশনাল অ্যাড ফানেল দিয়ে আপনার বিজনেসের গ্রোথ বাড়ান। বিস্তারিত জানতে কল করুন: 017..."
            ]
        },
        {
            category: 'Web & Landing Page 🌐',
            templates: [
                "প্রিয় {{name}}, আপনার কাস্টমাররা কি আপনাকে অনলাইনে খুঁজে পাচ্ছে না? 🌐 আজই তৈরি করুন নিজের ওয়েবসাইট বা ল্যান্ডিং পেজ। আমাদের পোর্টফোলিও দেখুন: [LINK]",
                "৫০০০ টাকায় প্রফেশনাল ওয়েবসাইট! 💻 ডোমেইন, হোস্টিং এবং ডিজাইন সহ কমপ্লিট প্যাকেজ। অফারটি সীমিত সময়ের জন্য।"
            ]
        },
        {
            category: 'Follow-up / Closing 🤝',
            templates: [
                "প্রিয় {{name}}, এই মাসের জন্য আমাদের প্রিমিয়াম কনসালটেশনের স্লট প্রায় শেষ। আপনি কি আপনার ফ্রি স্ট্র্যাটেজি কলটি বুক করতে চান? রিপ্লাই করুন 'YES' অথবা কল করুন 017...",
                "ঈদ অফার! 🌙 এই সপ্তাহে বুকিং দিলে ডিজিটাল মার্কেটিং প্যাকেজে পাচ্ছেন ২০% ডিসকাউন্ট। বিস্তারিত জানতে রিপ্লাই দিন 'INTERESTED'।"
            ]
        }
    ];

    // --- RECIPIENT LOGIC ---
    
    const filteredRecipients = useMemo(() => {
        let list = conversations.filter(c => !!c.extractedMobile); // Must have phone
        
        // Source
        if (smsFilters.source !== 'all') {
            if (smsFilters.source === 'web') list = list.filter(c => c.source === 'web_form');
            else list = list.filter(c => c.source === smsFilters.source);
        }

        // Status
        if (smsFilters.status !== 'all') {
            list = list.filter(c => c.status === smsFilters.status);
        }

        // Date
        if (smsFilters.date !== 'all') {
            const now = new Date();
            list = list.filter(c => {
                const leadDate = new Date(c.lastActive);
                if (smsFilters.date === 'today') return isSameDay(leadDate, now);
                if (smsFilters.date === 'month') return isSameMonth(leadDate, now);
                return true;
            });
        }

        // Attributes
        if (smsFilters.hasWebsite) list = list.filter(c => !!c.extractedWebsite);
        if (smsFilters.hasFacebook) list = list.filter(c => !!c.extractedFbLink || c.source === 'facebook');
        if (smsFilters.isBestQuality) list = list.filter(c => c.isBestQuality);

        return list;
    }, [conversations, smsFilters]);

    const finalRecipients = useMemo(() => {
        if (selectionMode === 'upload') {
            return uploadedContacts;
        }
        if (selectionMode === 'manual') {
            return conversations.filter(c => manualRecipients.includes(c.psid) && !!c.extractedMobile);
        }
        return filteredRecipients;
    }, [selectionMode, manualRecipients, filteredRecipients, conversations, uploadedContacts]);

    const searchableLeads = conversations
        .filter(c => !!c.extractedMobile)
        .filter(c => c.userName.toLowerCase().includes(leadSearchTerm.toLowerCase()) || c.extractedMobile?.includes(leadSearchTerm) || c.status.includes(leadSearchTerm));

    const totalContacts = conversations.filter(c => !!c.extractedMobile).length;

    const insertVariable = () => {
        setMessage(prev => prev + ' {{name}} ');
    };

    const toggleManualRecipient = (psid: string) => {
        setManualRecipients(prev => 
            prev.includes(psid) ? prev.filter(id => id !== psid) : [...prev, psid]
        );
    };

    const handleSelectAllManual = () => {
        if (manualRecipients.length === searchableLeads.length) {
            setManualRecipients([]);
        } else {
            setManualRecipients(searchableLeads.map(c => c.psid));
        }
    };

    const handleProcessUpload = () => {
        const rawNumbers = csvText.split(/[\n,;]+/).map(n => n.trim()).filter(n => n.length > 0);
        const validContacts: Conversation[] = rawNumbers.map((num, idx) => ({
            psid: `ext_${Date.now()}_${idx}`, 
            userName: 'Imported Contact',
            extractedMobile: num,
            status: 'new_lead' as LeadStatus,
            source: 'manual',
            messages: [],
            lastActive: new Date(),
            unreadCount: 0,
            downloadCount: 0,
            tags: ['Imported'],
            dealValue: 0,
            smsCount: 0,
            aiEnabled: false,
            invoices: [],
            transactions: [],
            tasks: []
        }));
        setUploadedContacts(validContacts);
    };

    const handleGenerateAiSuggestions = async () => {
        if (!message) {
            alert("Please write a draft message first for the AI to improve!");
            return;
        }
        
        setCreativeTab('ai');

        if (!process.env.API_KEY) {
            const suggestions = [
               `Hey ${message.includes('{{name}}') ? '{{name}}' : 'there'}, don't miss out! ${message}`,
               `Exclusive Offer: ${message} - Valid for 24h only!`,
               `Hi ${message.includes('{{name}}') ? '{{name}}' : 'there'}, checking in. ${message}?`,
               `Urgent: ${message}. Reply YES to claim.`,
               `${message} - Social Ads Expert Team`
            ];
            setAiSuggestions(suggestions);
            return;
        }

        setIsGeneratingAi(true);
        try {
            const prompt = `
            CONTEXT:
            ${aiPersona}

            TASK:
            You are an expert SMS Marketer targeting Bangladeshi customers. 
            The user has written a draft SMS: "${message}".
            
            Generate 5 different variations of this message to increase conversion.
            Styles:
            1. Urgent/FOMO (Bangla)
            2. Friendly/Personal (Bangla)
            3. Professional/Value-driven (Bangla)
            4. Short & Punchy (Banglish)
            5. Question-based (Bangla)

            CONSTRAINTS:
            - Keep each under 160 characters if possible.
            - Keep the variable {{name}} if it exists.
            - Return ONLY the 5 messages separated by "|||".
            `;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            if (response.text) {
                const suggestions = response.text.split('|||').map(s => s.trim()).filter(s => s.length > 0);
                setAiSuggestions(suggestions);
            }
        } catch (error) {
            console.error("AI Gen Error", error);
            alert("Failed to generate suggestions.");
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const handleSend = async () => {
        if (finalRecipients.length === 0) {
            alert('No recipients selected.');
            return;
        }
        if (!message) {
            alert('Please enter a message.');
            return;
        }
        if (!settings.apiUrl) {
            alert('Please configure SMS Gateway settings first.');
            setActiveTab('settings');
            return;
        }

        setIsSending(true);
        setSendingProgress(0);

        let successCount = 0;
        const sentPsids: string[] = [];
        
        for (let i = 0; i < finalRecipients.length; i++) {
            const client = finalRecipients[i];
            const personalizedMsg = message.replace('{{name}}', client.userName);
            const mobile = client.extractedMobile!;

            try {
                let url = settings.apiUrl;
                const params = new URLSearchParams();
                
                const paramTo = settings.paramMap?.to || 'to';
                const paramMsg = settings.paramMap?.message || 'message';
                const paramKey = settings.paramMap?.apiKey || 'api_key';

                if(paramKey) params.append(paramKey, settings.apiKey);
                params.append(paramTo, mobile);
                params.append(paramMsg, personalizedMsg);
                if(settings.senderId) params.append('sender_id', settings.senderId);

                if (settings.method === 'GET') {
                    url = `${url}?${params.toString()}`;
                    console.log(`[SMS MOCK] Sending GET to ${mobile}: ${url}`);
                } else {
                    console.log(`[SMS MOCK] Sending POST to ${mobile}`, Object.fromEntries(params));
                }
                successCount++;
                if (!client.psid.startsWith('ext_')) {
                    sentPsids.push(client.psid);
                }
            } catch (e) {
                console.error("SMS Failed for", mobile, e);
            }

            setSendingProgress(Math.round(((i + 1) / finalRecipients.length) * 100));
            await new Promise(r => setTimeout(r, 100));
        }

        setIsSending(false);
        
        const newCampaign: SmsCampaign = {
            id: Date.now().toString(),
            name: `Campaign ${new Date().toLocaleDateString()}`,
            message: message,
            targetAudience: selectionMode === 'manual' ? 'Manual Selection' : selectionMode === 'upload' ? 'Bulk Upload' : 'Smart Filters',
            totalSent: successCount,
            timestamp: new Date(),
            status: 'sent'
        };
        onSaveCampaign(newCampaign);
        if (sentPsids.length > 0) {
            onUpdateSmsStats(sentPsids);
        }

        alert(`Successfully sent ${successCount} messages!`);
        setMessage('');
        setSendingProgress(0);
        setActiveTab('history');
        setUploadedContacts([]);
        setCsvText('');
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Leads</p>
                        <h3 className="text-2xl font-bold text-slate-800">{totalContacts} <span className="text-sm font-normal text-slate-400">with Phone</span></h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Target Audience</p>
                        <h3 className="text-2xl font-bold text-emerald-600">{finalRecipients.length} <span className="text-sm font-normal text-slate-400">Selected</span></h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-violet-50 text-violet-600 rounded-lg">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Gateway Status</p>
                        <h3 className="text-lg font-bold text-slate-800">
                            {settings.apiUrl ? <span className="text-emerald-500 flex items-center gap-1">Online <CheckCircle size={14}/></span> : <span className="text-orange-500">Config Req.</span>}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="flex border-b border-slate-100">
                    <button 
                        onClick={() => setActiveTab('compose')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'compose' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        <Send size={16} /> Campaign Wizard
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'history' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        <History size={16} /> Sent History
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'settings' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        <Settings size={16} /> Gateway Settings
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
                    
                    {/* --- COMPOSE TAB --- */}
                    {activeTab === 'compose' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                            
                            {/* LEFT: AUDIENCE SELECTION */}
                            <div className="lg:col-span-4 flex flex-col gap-4">
                                
                                {/* 1. Mode Switcher */}
                                <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
                                    <button 
                                        onClick={() => setSelectionMode('filters')}
                                        className={`flex-1 py-2.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${selectionMode === 'filters' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Filter size={12} /> Segments
                                    </button>
                                    <button 
                                        onClick={() => setSelectionMode('manual')}
                                        className={`flex-1 py-2.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${selectionMode === 'manual' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <UserPlus size={12} /> Picker
                                    </button>
                                    <button 
                                        onClick={() => setSelectionMode('upload')}
                                        className={`flex-1 py-2.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${selectionMode === 'upload' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Upload size={12} /> Upload
                                    </button>
                                </div>

                                {/* 2A. Smart Filters */}
                                {selectionMode === 'filters' && (
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5 flex-1 overflow-y-auto">
                                        
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                <Filter size={14} /> Filter Audience
                                            </h4>
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                {filteredRecipients.length} Matches
                                            </span>
                                        </div>

                                        {/* Source Tabs */}
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Lead Source</label>
                                            <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                                                {['all', 'facebook', 'manual', 'web'].map(src => (
                                                    <button
                                                        key={src}
                                                        onClick={() => setSmsFilters({...smsFilters, source: src})}
                                                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${smsFilters.source === src ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        {src}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Status & Date Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Lead Status</label>
                                                <select 
                                                    value={smsFilters.status}
                                                    onChange={(e) => setSmsFilters({...smsFilters, status: e.target.value})}
                                                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 bg-white"
                                                >
                                                    <option value="all">All Statuses</option>
                                                    <option value="new_lead">New Lead</option>
                                                    <option value="interested">Interested</option>
                                                    <option value="negotiation">Negotiation</option>
                                                    <option value="active_client">Active Client</option>
                                                    <option value="cold">Cold / Lost</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Date Active</label>
                                                <select 
                                                    value={smsFilters.date}
                                                    onChange={(e) => setSmsFilters({...smsFilters, date: e.target.value})}
                                                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 bg-white"
                                                >
                                                    <option value="all">All Time</option>
                                                    <option value="today">Today</option>
                                                    <option value="month">This Month</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Attributes Toggles */}
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Must Have</label>
                                            <div className="space-y-2">
                                                <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${smsFilters.hasWebsite ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <Globe size={16} className={smsFilters.hasWebsite ? "text-blue-600" : "text-slate-400"} />
                                                        <span className={`text-xs font-bold ${smsFilters.hasWebsite ? "text-slate-800" : "text-slate-600"}`}>Has Website</span>
                                                    </div>
                                                    <input type="checkbox" className="hidden" checked={smsFilters.hasWebsite} onChange={(e) => setSmsFilters({...smsFilters, hasWebsite: e.target.checked})} />
                                                    {smsFilters.hasWebsite && <CheckCircle size={14} className="text-blue-600" />}
                                                </label>

                                                <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${smsFilters.hasFacebook ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <Facebook size={16} className={smsFilters.hasFacebook ? "text-indigo-600" : "text-slate-400"} />
                                                        <span className={`text-xs font-bold ${smsFilters.hasFacebook ? "text-slate-800" : "text-slate-600"}`}>Facebook Profile</span>
                                                    </div>
                                                    <input type="checkbox" className="hidden" checked={smsFilters.hasFacebook} onChange={(e) => setSmsFilters({...smsFilters, hasFacebook: e.target.checked})} />
                                                    {smsFilters.hasFacebook && <CheckCircle size={14} className="text-indigo-600" />}
                                                </label>

                                                <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${smsFilters.isBestQuality ? 'bg-amber-50 border-amber-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <Star size={16} className={smsFilters.isBestQuality ? "text-amber-600 fill-amber-600" : "text-slate-400"} />
                                                        <span className={`text-xs font-bold ${smsFilters.isBestQuality ? "text-slate-800" : "text-slate-600"}`}>Best Quality</span>
                                                    </div>
                                                    <input type="checkbox" className="hidden" checked={smsFilters.isBestQuality} onChange={(e) => setSmsFilters({...smsFilters, isBestQuality: e.target.checked})} />
                                                    {smsFilters.isBestQuality && <CheckCircle size={14} className="text-amber-600" />}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2B. Manual Picker */}
                                {selectionMode === 'manual' && (
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden h-[500px]">
                                        <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                <input 
                                                    type="text" 
                                                    placeholder="Search..." 
                                                    value={leadSearchTerm}
                                                    onChange={(e) => setLeadSearchTerm(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-700">
                                                    {manualRecipients.length} Selected / {searchableLeads.length} Available
                                                </span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setManualRecipients([])} className="text-[10px] px-2 py-1 rounded hover:bg-red-50 text-red-500 font-bold transition-colors">Clear</button>
                                                    <button onClick={handleSelectAllManual} className="text-[10px] px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold transition-colors">Select All</button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase sticky top-0 z-10">
                                                    <tr>
                                                        <th className="px-4 py-3 w-10"></th>
                                                        <th className="px-4 py-3">Lead</th>
                                                        <th className="px-4 py-3">Status</th>
                                                        <th className="px-4 py-3 text-right">Phone</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {searchableLeads.map(lead => (
                                                        <tr 
                                                            key={lead.psid} 
                                                            onClick={() => toggleManualRecipient(lead.psid)}
                                                            className={`cursor-pointer transition-all hover:bg-slate-50 ${manualRecipients.includes(lead.psid) ? 'bg-blue-50/30' : ''}`}
                                                        >
                                                            <td className="px-4 py-3 text-center">
                                                                <div className={`flex items-center justify-center transition-colors ${manualRecipients.includes(lead.psid) ? 'text-blue-600' : 'text-slate-300'}`}>
                                                                    {manualRecipients.includes(lead.psid) ? <CheckSquare size={16} /> : <Square size={16} />}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                                        {lead.userName.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold text-slate-800">{lead.userName}</p>
                                                                        <p className="text-[9px] text-slate-400">{lead.source}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border bg-slate-50 text-slate-500 border-slate-100">
                                                                    {lead.status.replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <span className="font-mono text-xs font-bold text-slate-600">{lead.extractedMobile}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* 2C. Bulk Upload Mode */}
                                {selectionMode === 'upload' && (
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden h-[500px] p-5">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                                            <Upload size={14} /> Import Numbers
                                        </h4>
                                        
                                        <textarea 
                                            className="flex-1 w-full border border-slate-200 rounded-xl p-4 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-slate-50"
                                            placeholder={`Paste numbers here...\n01711223344\n01811223344\n01911223344`}
                                            value={csvText}
                                            onChange={e => setCsvText(e.target.value)}
                                        />
                                        
                                        <div className="mt-4 flex justify-between items-center">
                                            <span className="text-xs text-slate-500">
                                                Separators: Newline, Comma, Semicolon
                                            </span>
                                            <button 
                                                onClick={handleProcessUpload}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors"
                                            >
                                                Process List
                                            </button>
                                        </div>

                                        {uploadedContacts.length > 0 && (
                                            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex justify-between items-center">
                                                <span className="text-xs font-bold text-emerald-700 flex items-center gap-2">
                                                    <CheckCircle size={14} /> {uploadedContacts.length} Numbers Ready
                                                </span>
                                                <button onClick={() => {setUploadedContacts([]); setCsvText('')}} className="text-xs text-emerald-600 hover:underline">Clear</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* CENTER: COMPOSER */}
                            <div className="lg:col-span-5 space-y-4">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col relative">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <label className="text-sm font-bold text-slate-800 block">Campaign Message</label>
                                            <p className="text-[10px] text-slate-400">Targeting <span className="font-bold text-slate-800">{finalRecipients.length}</span> recipients</p>
                                        </div>
                                        <button onClick={insertVariable} className="text-xs text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-bold border border-blue-100">
                                            <Variable size={14} /> Insert Name
                                        </button>
                                    </div>

                                    <textarea 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full flex-1 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50 focus:bg-white transition-all mb-3"
                                        placeholder="Hi {{name}}, grab our special 50% OFF offer now!..."
                                    />

                                    <div className="flex justify-between items-center text-xs text-slate-400 mb-4 px-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <span>{message.length} characters</span>
                                        <span className={Math.ceil(message.length / 160) > 1 ? "text-orange-500 font-bold" : "font-bold text-slate-600"}>
                                            {Math.ceil(message.length / 160)} SMS Credit(s)
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-2">
                                        <button 
                                            onClick={handleGenerateAiSuggestions}
                                            disabled={isGeneratingAi || !message}
                                            className="bg-gradient-to-r from-violet-100 to-purple-100 hover:from-violet-200 hover:to-purple-200 text-violet-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs border border-violet-200"
                                        >
                                            {isGeneratingAi ? <Sparkles className="animate-spin" size={14} /> : <Bot size={14} />}
                                            AI Rewrite
                                        </button>
                                        {isSending ? (
                                            <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 flex items-center justify-center">
                                                <div className="flex flex-col items-center w-full">
                                                    <div className="flex justify-between w-full text-[10px] font-bold text-slate-600 mb-1 px-2">
                                                        <span>Sending...</span>
                                                        <span>{sendingProgress}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${sendingProgress}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={handleSend}
                                                disabled={finalRecipients.length === 0 || !message}
                                                className="bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                                            >
                                                <Send size={14} /> Send Blast ({finalRecipients.length})
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: CAMPAIGN CREATIVE STUDIO */}
                            <div className="lg:col-span-3 flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="flex border-b border-slate-100">
                                    <button 
                                        onClick={() => setCreativeTab('templates')}
                                        className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${creativeTab === 'templates' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <LayoutTemplate size={14} /> Templates
                                    </button>
                                    <button 
                                        onClick={() => setCreativeTab('preview')}
                                        className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${creativeTab === 'preview' ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Smartphone size={14} /> Preview
                                    </button>
                                    <button 
                                        onClick={() => setCreativeTab('ai')}
                                        className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${creativeTab === 'ai' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Sparkles size={14} /> AI
                                    </button>
                                </div>

                                <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">
                                    
                                    {/* 1. TEMPLATES */}
                                    {creativeTab === 'templates' && (
                                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <BookOpen size={14} className="text-blue-600" />
                                                <h5 className="font-bold text-slate-800 text-xs uppercase">Marketing Scripts</h5>
                                            </div>
                                            {agencyScripts.map((category, idx) => (
                                                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 border-b border-slate-100 pb-1">{category.category}</p>
                                                    <div className="space-y-2">
                                                        {category.templates.map((tpl, tIdx) => (
                                                            <div 
                                                                key={tIdx}
                                                                onClick={() => setMessage(tpl)}
                                                                className="group p-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] text-slate-600 cursor-pointer hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 transition-all leading-relaxed relative"
                                                            >
                                                                {tpl}
                                                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100">
                                                                    <div className="bg-blue-200 text-blue-700 p-1 rounded-full">
                                                                        <ArrowRight size={8} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 2. PREVIEW */}
                                    {creativeTab === 'preview' && (
                                        <div className="flex-1 flex items-center justify-center p-4 bg-slate-100 overflow-hidden">
                                            <div className="bg-white border-8 border-slate-800 rounded-[30px] shadow-2xl overflow-hidden relative h-full w-full max-w-[240px] flex flex-col">
                                                <div className="h-6 bg-slate-800 w-full absolute top-0 left-0 z-20 flex justify-center">
                                                    <div className="w-20 h-4 bg-black rounded-b-xl"></div>
                                                </div>
                                                <div className="bg-slate-100 flex-1 pt-12 p-3 overflow-y-auto custom-scrollbar">
                                                    <div className="text-center mb-4 opacity-50">
                                                        <p className="text-[9px] text-slate-500 font-bold">Today 10:23 AM</p>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-xs text-slate-700 max-w-[95%] self-start border border-slate-200">
                                                            <p className="font-bold text-blue-600 mb-1 text-[10px]">{settings.senderId || 'MyBrand'}</p>
                                                            <p className="leading-relaxed text-[11px]">
                                                                {message ? message.replace('{{name}}', finalRecipients[0]?.userName || 'John') : 'Your message preview...'}
                                                            </p>
                                                            <p className="text-[9px] text-slate-400 mt-1 text-right">Now</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. AI */}
                                    {creativeTab === 'ai' && (
                                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                                            {aiSuggestions.length > 0 ? (
                                                <>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Sparkles size={14} className="text-purple-600" />
                                                        <h5 className="font-bold text-slate-800 text-xs uppercase">AI Variations</h5>
                                                    </div>
                                                    {aiSuggestions.map((sug, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            onClick={() => setMessage(sug)}
                                                            className="bg-white p-3 rounded-lg border border-purple-100 text-[11px] text-slate-700 cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all shadow-sm"
                                                        >
                                                            {sug}
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
                                                    <Zap size={32} className="mb-3 opacity-20" />
                                                    <p className="text-xs font-medium">Draft a message and click "AI Rewrite" to see magic here!</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- HISTORY TAB --- */}
                    {activeTab === 'history' && (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Campaign Name</th>
                                        <th className="px-6 py-4">Audience</th>
                                        <th className="px-6 py-4">Message</th>
                                        <th className="px-6 py-4 text-right">Sent</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {campaignHistory.length > 0 ? (
                                        campaignHistory.slice().reverse().map(camp => (
                                            <tr key={camp.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-xs text-slate-500">
                                                    {camp.timestamp.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-sm text-slate-800">
                                                    {camp.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 uppercase font-bold">
                                                        {camp.targetAudience.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate" title={camp.message}>
                                                    {camp.message}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                                    {camp.totalSent}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                No SMS campaigns found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* --- SETTINGS TAB --- */}
                    {activeTab === 'settings' && (
                        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Settings size={18} className="text-slate-600" /> API Gateway Configuration
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                                    <AlertTriangle size={16} className="inline mr-2 mb-0.5" />
                                    Configure your 3rd party SMS provider here (e.g., Twilio, Greenweb).
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">API Endpoint URL</label>
                                    <input 
                                        value={localSettings.apiUrl}
                                        onChange={(e) => setLocalSettings({...localSettings, apiUrl: e.target.value})}
                                        placeholder="https://api.sms-provider.com/send"
                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Request Method</label>
                                        <select 
                                            value={localSettings.method}
                                            onChange={(e) => setLocalSettings({...localSettings, method: e.target.value as 'GET' | 'POST'})}
                                            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm bg-white"
                                        >
                                            <option value="GET">GET (Query Params)</option>
                                            <option value="POST">POST (Body)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sender ID</label>
                                        <input 
                                            value={localSettings.senderId}
                                            onChange={(e) => setLocalSettings({...localSettings, senderId: e.target.value})}
                                            placeholder="MyBrand"
                                            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">API Key</label>
                                    <input 
                                        value={localSettings.apiKey}
                                        onChange={(e) => setLocalSettings({...localSettings, apiKey: e.target.value})}
                                        type="password"
                                        placeholder="••••••••••••"
                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button 
                                        onClick={() => { onSaveSettings(localSettings); alert('Settings Saved!'); }}
                                        className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all shadow-lg"
                                    >
                                        Save Configuration
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkSmsManager;
