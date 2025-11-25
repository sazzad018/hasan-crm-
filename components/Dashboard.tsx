
import React from 'react';
import { Conversation, Meeting } from '../types';
import { Users, Calendar, ArrowRight, MessageCircle, Phone, CheckCircle, AlertCircle, Database, TrendingUp, Clock } from 'lucide-react';
import { isToday, format, addDays, isSameDay } from 'date-fns';

interface DashboardProps {
  conversations: Conversation[];
  meetings: Meeting[];
  onOpenChat: (psid: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ conversations, meetings, onOpenChat }) => {
  
  // 1. Get Today's Meetings
  const todaysMeetings = meetings
    .filter(m => isToday(m.date) && m.status === 'pending')
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // 2. Identify Priority Follow-ups
  const priorityLeads = conversations
    .filter(c => (c.status === 'negotiation' || c.status === 'new_lead') && c.extractedMobile)
    .slice(0, 4);

  // 3. Stats
  const totalLeads = conversations.length;
  const qualifiedCount = conversations.filter(c => !!c.extractedMobile).length;
  const newLeadsCount = conversations.filter(c => c.status === 'new_lead').length;
  const convertedCount = conversations.filter(c => c.status === 'converted').length;

  // 4. Calculate 5-Day Forecast
  const next5Days = Array.from({ length: 5 }, (_, i) => addDays(new Date(), i));
  
  const getMeetingCountForDate = (date: Date) => {
    return meetings.filter(m => isSameDay(m.date, date) && m.status === 'pending').length;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome & High Level Stats */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Hello, Admin 👋</h2>
          <p className="text-slate-500 mt-1">Business Overview & Daily Tasks</p>
        </div>
        <div className="flex gap-2 text-sm font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-slate-600">
           <span>📅 Today: {format(new Date(), 'EEEE, MMMM do')}</span>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* TOTAL LEADS */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Database size={80} className="text-blue-600" />
              </div>
              <div className="flex flex-col h-full justify-between relative z-10">
                  <div className="p-2 bg-blue-50 w-fit rounded-lg text-blue-600 mb-3">
                      <Users size={20} />
                  </div>
                  <div>
                      <h3 className="text-4xl font-bold text-slate-800 tracking-tight">{totalLeads}</h3>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mt-1">Total Leads</p>
                  </div>
              </div>
          </div>

          {/* NUMBERS COLLECTED */}
          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Phone size={80} className="text-emerald-600" />
              </div>
              <div className="flex flex-col h-full justify-between relative z-10">
                  <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-white w-fit rounded-lg text-emerald-600 shadow-sm">
                          <Phone size={20} />
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full">
                          {totalLeads > 0 ? Math.round((qualifiedCount / totalLeads) * 100) : 0}% Rate
                      </span>
                  </div>
                  <div>
                      <h3 className="text-4xl font-bold text-emerald-900 tracking-tight">{qualifiedCount}</h3>
                      <p className="text-emerald-700 font-bold text-xs uppercase tracking-wider mt-1">Phones Collected</p>
                  </div>
              </div>
          </div>

          {/* TODAY'S MEETINGS */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-purple-300 transition-all">
              <div className="flex flex-col h-full justify-between">
                  <div className="p-2 bg-purple-50 w-fit rounded-lg text-purple-600 mb-3">
                      <Calendar size={20} />
                  </div>
                  <div>
                      <h3 className="text-3xl font-bold text-slate-800">{todaysMeetings.length}</h3>
                      <p className="text-slate-500 font-medium text-sm">Meetings Today</p>
                  </div>
              </div>
          </div>

          {/* PENDING FOLLOW-UPS */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-orange-300 transition-all">
              <div className="flex flex-col h-full justify-between">
                  <div className="p-2 bg-orange-50 w-fit rounded-lg text-orange-600 mb-3">
                      <AlertCircle size={20} />
                  </div>
                  <div>
                      <h3 className="text-3xl font-bold text-slate-800">{priorityLeads.length}</h3>
                      <p className="text-slate-500 font-medium text-sm">Priority Follow-ups</p>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: TODAY'S AGENDA */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Agenda Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Calendar size={18} className="text-blue-600" /> Today's Agenda
                    </h3>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {todaysMeetings.length} Events
                    </span>
                </div>
                
                <div className="divide-y divide-slate-100">
                    {todaysMeetings.length > 0 ? (
                        todaysMeetings.map(meeting => (
                            <div key={meeting.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center gap-4 group">
                                <div className="flex flex-col items-center min-w-[60px]">
                                    <span className="text-sm font-bold text-slate-800">{format(meeting.date, 'h:mm')}</span>
                                    <span className="text-xs text-slate-400 uppercase">{format(meeting.date, 'a')}</span>
                                </div>
                                <div className="h-10 w-1 bg-blue-100 rounded-full group-hover:bg-blue-500 transition-colors"></div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{meeting.title}</h4>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                        <Users size={14} />
                                        <span>with {meeting.clientName}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onOpenChat(meeting.psid)}
                                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                                >
                                    Start Chat
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                            <CheckCircle size={48} className="mb-4 text-emerald-100" />
                            <p className="text-slate-600 font-medium">All caught up for today!</p>
                            <p className="text-xs mt-1">Check the 5-Day Forecast for upcoming tasks.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Business Health / Funnel */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                 <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-600" /> Lead Pipeline
                 </h3>
                 <div className="space-y-4">
                    {[
                      { label: 'New Leads', count: newLeadsCount, color: 'bg-blue-500' },
                      { label: 'Interested', count: conversations.filter(c => c.status === 'interested').length, color: 'bg-indigo-500' },
                      { label: 'In Negotiation', count: conversations.filter(c => c.status === 'negotiation').length, color: 'bg-orange-500' },
                      { label: 'Converted', count: convertedCount, color: 'bg-emerald-500' }
                    ].map((stage) => (
                      <div key={stage.label} className="flex items-center gap-4">
                          <span className="w-24 text-xs font-bold text-slate-500 uppercase text-right">{stage.label}</span>
                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${stage.color} rounded-full`} style={{ width: `${(stage.count / totalLeads) * 100}%` }}></div>
                          </div>
                          <span className="w-8 text-sm font-bold text-slate-700">{stage.count}</span>
                      </div>
                    ))}
                 </div>
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
            
            {/* 1. NEW 5-DAY FORECAST WIDGET */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 bg-indigo-50/50">
                    <h3 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                        <Clock size={16} className="text-indigo-600" /> 5-Day Workload Forecast
                    </h3>
                </div>
                <div className="divide-y divide-slate-50">
                    {next5Days.map((date, index) => {
                        const count = getMeetingCountForDate(date);
                        const isTodayDate = isToday(date);
                        
                        return (
                            <div key={index} className={`flex items-center justify-between px-5 py-3 ${isTodayDate ? 'bg-indigo-50/30' : ''}`}>
                                <div className="flex flex-col">
                                    <span className={`text-xs font-bold ${isTodayDate ? 'text-indigo-600' : 'text-slate-700'}`}>
                                        {isTodayDate ? 'Today' : format(date, 'EEEE')}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        {format(date, 'MMM d')}
                                    </span>
                                </div>
                                <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                    count > 0 
                                    ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                }`}>
                                    {count} Meetings
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 italic">"Consistency is key to conversion"</p>
                </div>
            </div>

            {/* 2. PRIORITY ACTIONS */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-fit">
                <div className="px-5 py-3 border-b border-slate-100 bg-orange-50/50">
                    <h3 className="font-bold text-orange-900 text-sm flex items-center gap-2">
                        <AlertCircle size={16} className="text-orange-600" /> Needs Attention
                    </h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {priorityLeads.map(lead => (
                        <div key={lead.psid} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{lead.userName}</h4>
                                    <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                                        {lead.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <span className="text-[10px] text-slate-400">{format(lead.lastActive, 'MMM d')}</span>
                            </div>
                            
                            <p className="text-xs text-slate-500 mb-3 truncate">
                                {lead.aiSummary || 'No summary available.'}
                            </p>

                            <button 
                                onClick={() => onOpenChat(lead.psid)}
                                className="w-full py-1.5 flex items-center justify-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                            >
                                <MessageCircle size={14} /> Send Message
                            </button>
                        </div>
                    ))}
                    {priorityLeads.length === 0 && (
                         <div className="p-6 text-center text-slate-400">
                            <p className="text-sm">No priority follow-ups.</p>
                         </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
