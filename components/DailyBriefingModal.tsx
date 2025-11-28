import React from 'react';
import { Conversation, Meeting } from '../types';
import { X, AlertTriangle, TrendingUp, Calendar, ArrowRight, DollarSign, Send, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { format, isToday, differenceInDays } from 'date-fns';

interface DailyBriefingModalProps {
    conversations: Conversation[];
    meetings: Meeting[];
    onClose: () => void;
    onQuickAction: (action: string, id: string) => void;
}

const DailyBriefingModal: React.FC<DailyBriefingModalProps> = ({ conversations, meetings, onClose, onQuickAction }) => {
    
    // 1. ANALYZE LOW BALANCE
    const lowBalanceClients = conversations.filter(c => {
        if (c.status !== 'active_client' || !c.lowBalanceAlert?.isEnabled) return false;
        return (c.walletBalance || 0) < (c.lowBalanceAlert.threshold || 10);
    });

    // 2. ANALYZE SALES OPPORTUNITIES (Hot leads inactive for > 2 days)
    const opportunityLeads = conversations.filter(c => {
        const isLead = c.status === 'interested' || c.status === 'negotiation';
        const isHot = c.tags?.includes('Hot Lead') || (c.dealValue || 0) > 1000 || c.isBestQuality;
        const inactiveDays = differenceInDays(new Date(), new Date(c.lastActive));
        return isLead && isHot && inactiveDays >= 2;
    });

    // 3. TODAY'S AGENDA
    const todaysMeetings = meetings.filter(m => isToday(new Date(m.date)) && m.status === 'pending');

    // Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    return (
        <div className="fixed inset-0 bg-slate-900/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden flex-shrink-0">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <span className="text-3xl">👋</span> {greeting}, Boss!
                        </h1>
                        <p className="text-slate-300">Here is your <span className="font-bold text-[#9B7BE3]">Agency Pulse Report</span> to keep operations running smoothly.</p>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#9B7BE3] rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* COLUMN 1: CRITICAL ALERTS */}
                        <div className="space-y-6">
                            
                            {/* Low Balance Section */}
                            <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
                                <div className="bg-red-50 px-6 py-3 border-b border-red-100 flex justify-between items-center">
                                    <h3 className="font-bold text-red-800 text-sm flex items-center gap-2">
                                        <AlertTriangle size={16} /> Low Balance Alerts ({lowBalanceClients.length})
                                    </h3>
                                    <span className="text-[10px] text-red-600 font-medium bg-white px-2 py-0.5 rounded-full border border-red-100">Action Required</span>
                                </div>
                                <div className="p-2 max-h-60 overflow-y-auto custom-scrollbar">
                                    {lowBalanceClients.length > 0 ? (
                                        lowBalanceClients.map(client => (
                                            <div key={client.psid} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0">
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{client.userName}</p>
                                                    <p className="text-xs text-slate-500">Bal: <span className="font-bold text-red-500">${client.walletBalance?.toFixed(2)}</span> (Limit: ${client.lowBalanceAlert?.threshold})</p>
                                                </div>
                                                <button 
                                                    onClick={() => onQuickAction('sms_reminder', client.psid)}
                                                    className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
                                                >
                                                    <Send size={12} /> Remind
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-slate-400 text-xs">
                                            <CheckCircle size={24} className="mx-auto mb-2 text-emerald-400" />
                                            All client balances look healthy!
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Today's Agenda */}
                            <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                                <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex justify-between items-center">
                                    <h3 className="font-bold text-blue-800 text-sm flex items-center gap-2">
                                        <Calendar size={16} /> Today's Mission ({todaysMeetings.length})
                                    </h3>
                                </div>
                                <div className="p-2 max-h-40 overflow-y-auto custom-scrollbar">
                                    {todaysMeetings.length > 0 ? (
                                        todaysMeetings.map(m => (
                                            <div key={m.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0">
                                                <div className="flex gap-3 items-center">
                                                    <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold">
                                                        {format(new Date(m.date), 'h:mm a')}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm line-clamp-1">{m.title}</p>
                                                        <p className="text-xs text-slate-500">w/ {m.clientName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-slate-400 text-xs">
                                            No meetings scheduled for today. Focus on production!
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* COLUMN 2: GROWTH OPPORTUNITIES */}
                        <div className="flex flex-col h-full bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
                            <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100">
                                <h3 className="font-bold text-emerald-800 text-sm flex items-center gap-2">
                                    <TrendingUp size={16} /> Sales Opportunities (Follow-up)
                                </h3>
                                <p className="text-xs text-emerald-600 mt-1">These high-value leads are slipping away. Contact them!</p>
                            </div>
                            
                            <div className="flex-1 p-2 overflow-y-auto custom-scrollbar">
                                {opportunityLeads.length > 0 ? (
                                    opportunityLeads.map(lead => (
                                        <div key={lead.psid} className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                                                        {lead.userName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{lead.userName}</p>
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                                            <Clock size={10} /> 
                                                            <span>Inactive {differenceInDays(new Date(), new Date(lead.lastActive))} days</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                                                    ${lead.dealValue?.toLocaleString()}
                                                </span>
                                            </div>
                                            
                                            <div className="flex gap-2 mt-3">
                                                <button 
                                                    onClick={() => onQuickAction('call', lead.extractedMobile || '')}
                                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                                                >
                                                    Call
                                                </button>
                                                <button 
                                                    onClick={() => onQuickAction('chat', lead.psid)}
                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors shadow-sm"
                                                >
                                                    <MessageSquare size={12} /> Message
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                        <TrendingUp size={32} className="mb-2 opacity-20" />
                                        <p className="text-sm">Great job! No slipping leads found.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2"
                    >
                        Let's Get to Work <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyBriefingModal;