
import React, { useState } from 'react';
import { Meeting, Conversation } from '../types';
import { Calendar, Clock, MessageSquare, CheckCircle, Trash2, Flag, Plus, X, Bell, Zap } from 'lucide-react';
import { format, isToday, isTomorrow, addDays } from 'date-fns';

interface ScheduleManagerProps {
  meetings: Meeting[];
  conversations: Conversation[];
  onScheduleMeeting: (psid: string, title: string, date: Date, reminderConfig?: { enabled: boolean, timeBefore: number, message: string }) => void;
  onDeleteMeeting: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onOpenChat: (psid: string) => void;
}

interface MeetingCardProps {
  meeting: Meeting;
  isCompact?: boolean;
  onToggleStatus: (id: string) => void;
  onOpenChat: (psid: string) => void;
  onDeleteMeeting: (id: string) => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, isCompact = false, onToggleStatus, onOpenChat, onDeleteMeeting }) => (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${meeting.status === 'completed' ? 'opacity-60 bg-slate-50' : ''}`}>
         <div className={`absolute left-0 top-0 bottom-0 w-1 ${meeting.status === 'completed' ? 'bg-slate-300' : 'bg-[#9B7BE3]'}`}></div>
         
         <div className="flex justify-between items-start pl-3">
             <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1">
                     <span className="text-xs font-bold text-[#9B7BE3] bg-violet-50 px-2 py-0.5 rounded">
                         {format(meeting.date, 'h:mm a')}
                     </span>
                     {!isToday(meeting.date) && (
                         <span className="text-[10px] text-slate-400 font-bold uppercase">{format(meeting.date, 'MMM d')}</span>
                     )}
                     {meeting.reminder?.enabled && !isCompact && (
                         <span className="text-[9px] flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100" title={`Auto-msg: "${meeting.reminder.message}"`}>
                             <Bell size={8} /> Auto-Msg Set
                         </span>
                     )}
                 </div>
                 <h3 className={`font-bold text-slate-800 ${isCompact ? 'text-sm' : 'text-base'} ${meeting.status === 'completed' ? 'line-through decoration-slate-400' : ''}`}>
                     {meeting.title}
                 </h3>
                 <div className="flex items-center gap-1.5 mt-2">
                     <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                         {meeting.clientName.charAt(0)}
                     </div>
                     <span className="text-xs text-slate-500 font-medium">{meeting.clientName}</span>
                 </div>
             </div>

             <div className="flex flex-col gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                      onClick={() => onToggleStatus(meeting.id)}
                      className={`p-1.5 rounded hover:bg-emerald-50 text-slate-300 hover:text-emerald-500 transition-colors`}
                      title={meeting.status === 'completed' ? "Undo" : "Complete"}
                  >
                      <CheckCircle size={18} />
                  </button>
                  <button 
                      onClick={() => onOpenChat(meeting.psid)}
                      className="p-1.5 rounded hover:bg-blue-50 text-slate-300 hover:text-blue-500 transition-colors"
                      title="Chat"
                  >
                      <MessageSquare size={18} />
                  </button>
                  <button 
                      onClick={() => onDeleteMeeting(meeting.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                      title="Delete"
                  >
                      <Trash2 size={18} />
                  </button>
             </div>
         </div>
    </div>
);

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ 
  meetings, 
  conversations, 
  onScheduleMeeting,
  onDeleteMeeting, 
  onToggleStatus,
  onOpenChat
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [selectedPsid, setSelectedPsid] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Reminder State
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState(60); // minutes
  const [reminderMessage, setReminderMessage] = useState('Hi! We have a scheduled meeting in 1 hour. Please call us on WhatsApp if you are free.');

  const today = new Date();
  const tomorrow = addDays(today, 1);

  const todaysMeetings = meetings.filter(m => isToday(m.date) && m.status === 'pending').sort((a,b) => a.date.getTime() - b.date.getTime());
  const tomorrowsMeetings = meetings.filter(m => isTomorrow(m.date) && m.status === 'pending').sort((a,b) => a.date.getTime() - b.date.getTime());
  const completedMeetings = meetings.filter(m => m.status === 'completed').sort((a,b) => b.date.getTime() - a.date.getTime());
  const upcomingMeetings = meetings.filter(m => m.date > tomorrow && m.status === 'pending').sort((a,b) => a.date.getTime() - b.date.getTime());

  const reminderTemplates = [
      { label: 'WhatsApp Call', text: 'Hi! We have a meeting scheduled shortly. If you are free, please call us on WhatsApp.' },
      { label: 'Zoom Link', text: 'Hello, our meeting is coming up. Here is the Zoom link: [LINK]' },
      { label: 'Standard Reminder', text: 'Just a friendly reminder about our meeting scheduled for [TIME].' },
      { label: 'Preparation', text: 'Hi, for our meeting soon, please have your ad account ID ready.' }
  ];

  const getClientSummary = (psid: string) => {
    const conv = conversations.find(c => c.psid === psid);
    return conv?.aiSummary || "No summary available.";
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!selectedPsid || !title || !date || !time) return;

      const dateObj = new Date(`${date}T${time}`);
      
      onScheduleMeeting(selectedPsid, title, dateObj, {
          enabled: reminderEnabled,
          timeBefore: reminderTime,
          message: reminderMessage
      });

      setIsModalOpen(false);
      // Reset form
      setTitle('');
      setDate('');
      setTime('');
      setSelectedPsid('');
      setReminderEnabled(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 h-full flex flex-col relative">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end pb-4 border-b border-slate-200">
         <div>
             <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                 <Flag size={24} className="text-[#9B7BE3] fill-[#9B7BE3]" /> 
                 Mission Control
             </h1>
             <p className="text-slate-500 text-sm mt-1">Manage your daily agenda and client commitments.</p>
         </div>
         <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                 <p className="text-3xl font-bold text-slate-800 leading-none">{todaysMeetings.length}</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Missions Today</p>
             </div>
             <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#9B7BE3] hover:bg-violet-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-violet-200 flex items-center gap-2 transition-all"
             >
                 <Plus size={18} /> New Schedule
             </button>
         </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
          
          {/* COLUMN 1: TODAY'S FOCUS */}
          <div className="flex flex-col h-full overflow-hidden bg-slate-50/50 rounded-2xl border border-slate-200">
              <div className="p-4 border-b border-slate-200 bg-white/50 backdrop-blur sticky top-0 z-10">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      Today's Focus
                  </h2>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                  {todaysMeetings.length > 0 ? (
                      todaysMeetings.map(m => (
                        <MeetingCard 
                            key={m.id} 
                            meeting={m} 
                            onToggleStatus={onToggleStatus} 
                            onOpenChat={onOpenChat} 
                            onDeleteMeeting={onDeleteMeeting} 
                        />
                      ))
                  ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                          <CheckCircle size={48} className="mb-2 opacity-20" />
                          <p className="text-sm font-medium">All clear for today!</p>
                      </div>
                  )}
              </div>
          </div>

          {/* COLUMN 2: TOMORROW & UPCOMING */}
          <div className="flex flex-col h-full overflow-hidden bg-slate-50/50 rounded-2xl border border-slate-200">
              <div className="p-4 border-b border-slate-200 bg-white/50 backdrop-blur sticky top-0 z-10">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Calendar size={14} className="text-blue-500" />
                      Upcoming
                  </h2>
              </div>
              <div className="p-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-3 ml-1">Tomorrow</p>
                      <div className="space-y-3">
                          {tomorrowsMeetings.length > 0 ? (
                              tomorrowsMeetings.map(m => (
                                <MeetingCard 
                                    key={m.id} 
                                    meeting={m} 
                                    isCompact 
                                    onToggleStatus={onToggleStatus} 
                                    onOpenChat={onOpenChat} 
                                    onDeleteMeeting={onDeleteMeeting} 
                                />
                              ))
                          ) : (
                              <p className="text-xs text-slate-400 italic ml-1">No schedules yet.</p>
                          )}
                      </div>
                  </div>
                  
                  {upcomingMeetings.length > 0 && (
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-3 ml-1">Later this week</p>
                          <div className="space-y-3">
                              {upcomingMeetings.map(m => (
                                <MeetingCard 
                                    key={m.id} 
                                    meeting={m} 
                                    isCompact 
                                    onToggleStatus={onToggleStatus} 
                                    onOpenChat={onOpenChat} 
                                    onDeleteMeeting={onDeleteMeeting} 
                                />
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>

          {/* COLUMN 3: COMPLETED LOG */}
          <div className="flex flex-col h-full overflow-hidden bg-slate-50/50 rounded-2xl border border-slate-200">
              <div className="p-4 border-b border-slate-200 bg-white/50 backdrop-blur sticky top-0 z-10">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle size={14} className="text-emerald-500" />
                      Mission Log
                  </h2>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                  {completedMeetings.length > 0 ? (
                      completedMeetings.map(m => (
                        <MeetingCard 
                            key={m.id} 
                            meeting={m} 
                            isCompact 
                            onToggleStatus={onToggleStatus} 
                            onOpenChat={onOpenChat} 
                            onDeleteMeeting={onDeleteMeeting} 
                        />
                      ))
                  ) : (
                      <div className="py-8 text-center text-slate-400 text-xs">
                          No completed missions yet.
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* SCHEDULE MODAL */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Calendar className="text-[#9B7BE3]" size={20} />
                          New Mission / Schedule
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                      
                      {/* Basic Info */}
                      <div className="space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Client</label>
                              <select 
                                  required
                                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#9B7BE3] outline-none bg-white"
                                  value={selectedPsid}
                                  onChange={e => setSelectedPsid(e.target.value)}
                              >
                                  <option value="">-- Choose Client --</option>
                                  {conversations.map(c => (
                                      <option key={c.psid} value={c.psid}>{c.userName}</option>
                                  ))}
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Meeting Title</label>
                              <input 
                                  required
                                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#9B7BE3] outline-none"
                                  placeholder="e.g. Strategy Call"
                                  value={title}
                                  onChange={e => setTitle(e.target.value)}
                              />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                                  <input 
                                      required
                                      type="date"
                                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#9B7BE3] outline-none"
                                      value={date}
                                      onChange={e => setDate(e.target.value)}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time</label>
                                  <input 
                                      required
                                      type="time"
                                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#9B7BE3] outline-none"
                                      value={time}
                                      onChange={e => setTime(e.target.value)}
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Auto-Reminder Section */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                  <Bell size={16} className={reminderEnabled ? "text-[#9B7BE3]" : "text-slate-400"} /> 
                                  Auto-Reminder Setup
                              </label>
                              <div 
                                onClick={() => setReminderEnabled(!reminderEnabled)}
                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${reminderEnabled ? 'bg-[#9B7BE3]' : 'bg-slate-300'}`}
                              >
                                  <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${reminderEnabled ? 'left-6' : 'left-1'}`}></div>
                              </div>
                          </div>

                          {reminderEnabled && (
                              <div className="pt-2 space-y-3 animate-in fade-in slide-in-from-top-2">
                                  <div>
                                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Send Message Before</label>
                                      <select 
                                          value={reminderTime}
                                          onChange={(e) => setReminderTime(parseInt(e.target.value))}
                                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#9B7BE3] outline-none bg-white"
                                      >
                                          <option value={15}>15 Minutes</option>
                                          <option value={30}>30 Minutes</option>
                                          <option value={60}>1 Hour</option>
                                          <option value={1440}>1 Day</option>
                                      </select>
                                  </div>
                                  
                                  <div>
                                      <div className="flex justify-between items-end mb-1">
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Reminder Message</label>
                                          <span className="text-[9px] text-slate-400">Will be sent automatically</span>
                                      </div>
                                      <textarea 
                                          value={reminderMessage}
                                          onChange={(e) => setReminderMessage(e.target.value)}
                                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#9B7BE3] outline-none min-h-[60px]"
                                      />
                                      {/* Quick Templates */}
                                      <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-1">
                                          {reminderTemplates.map((tpl, idx) => (
                                              <button
                                                  key={idx}
                                                  type="button"
                                                  onClick={() => setReminderMessage(tpl.text)}
                                                  className="flex-shrink-0 px-2 py-1 bg-white border border-slate-200 text-[10px] text-slate-600 rounded hover:border-[#9B7BE3] hover:text-[#9B7BE3] transition-colors whitespace-nowrap flex items-center gap-1"
                                              >
                                                  <Zap size={10} /> {tpl.label}
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>

                      <button type="submit" className="w-full bg-[#9B7BE3] hover:bg-violet-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-violet-200 transition-all flex items-center justify-center gap-2">
                          <CheckCircle size={18} /> Schedule Mission
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default ScheduleManager;
