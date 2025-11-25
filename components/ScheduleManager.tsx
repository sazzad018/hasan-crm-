
import React from 'react';
import { Meeting, Conversation } from '../types';
import { Calendar, Clock, MessageSquare, CheckCircle, Trash2, ArrowRight, User, Circle } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, isSameDay } from 'date-fns';

interface ScheduleManagerProps {
  meetings: Meeting[];
  conversations: Conversation[];
  onDeleteMeeting: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onOpenChat: (psid: string) => void;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ 
  meetings, 
  conversations, 
  onDeleteMeeting, 
  onToggleStatus,
  onOpenChat
}) => {
  
  // Sort meetings by date
  const sortedMeetings = [...meetings].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group meetings by Date string (YYYY-MM-DD)
  const groupedMeetings = sortedMeetings.reduce((groups, meeting) => {
    const dateKey = format(meeting.date, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(meeting);
    return groups;
  }, {} as Record<string, Meeting[]>);

  const getClientSummary = (psid: string) => {
    const conv = conversations.find(c => c.psid === psid);
    return conv?.aiSummary || "No summary available for this client.";
  };

  const renderMeetingCard = (meeting: Meeting) => {
    const summary = getClientSummary(meeting.psid);
    const isCompleted = meeting.status === 'completed';

    return (
      <div key={meeting.id} className={`group bg-white rounded-xl border-l-4 ${isCompleted ? 'border-l-slate-200 opacity-60' : 'border-l-blue-500'} border-y border-r border-slate-200 p-5 transition-all hover:shadow-md mb-4`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
             <div className="flex items-center gap-2 mb-1">
                 <span className={`text-sm font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600`}>
                     {format(meeting.date, 'h:mm a')}
                 </span>
                 <span className="h-px flex-1 bg-slate-100"></span>
             </div>

             <h3 className={`font-bold text-lg ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                 {meeting.title}
             </h3>
             
             <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                 <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                    <User size={12} />
                    <span className="font-bold text-slate-700">{meeting.clientName}</span>
                 </div>
             </div>

             {/* Context Section */}
             <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-start gap-2">
                    <MessageSquare size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-600 leading-relaxed italic">"{summary}"</p>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <button 
                onClick={() => onToggleStatus(meeting.id)}
                className={`p-2 rounded-lg border transition-colors ${
                    isCompleted 
                    ? 'bg-green-50 text-green-600 border-green-200' 
                    : 'bg-white text-slate-300 border-slate-200 hover:border-blue-400 hover:text-blue-500'
                }`}
                title={isCompleted ? "Mark Pending" : "Mark Done"}
            >
                <CheckCircle size={20} />
            </button>
            <button 
                onClick={() => onDeleteMeeting(meeting.id)}
                className="p-2 bg-white text-slate-300 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-lg transition-colors"
                title="Delete Schedule"
            >
                <Trash2 size={20} />
            </button>
            <button 
                onClick={() => onOpenChat(meeting.psid)}
                className="p-2 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 rounded-lg transition-colors mt-auto"
                title="Open Chat"
            >
                <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const pendingCount = meetings.filter(m => m.status === 'pending').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={24} className="text-blue-600" />
                Schedule Manager
            </h2>
            <p className="text-sm text-slate-500 mt-1">Review your daily roadmap and client commitments.</p>
        </div>
        <div className="flex items-center gap-6">
             <div className="text-right">
                 <p className="text-2xl font-bold text-slate-800">{pendingCount}</p>
                 <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Total Pending</p>
             </div>
             <div className="h-10 w-px bg-slate-200"></div>
             <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all">
                + Add Custom Event
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Timeline */}
          <div className="lg:col-span-3 space-y-8">
             {Object.keys(groupedMeetings).length > 0 ? (
                 Object.keys(groupedMeetings).map(dateKey => {
                     const dateObj = new Date(dateKey);
                     const isTodayDate = isToday(dateObj);
                     const isTom = isTomorrow(dateObj);
                     const dayMeetings = groupedMeetings[dateKey];

                     return (
                         <div key={dateKey} className="relative">
                             {/* Date Header */}
                             <div className="flex items-center gap-4 mb-4 sticky top-0 bg-slate-50 z-10 py-2">
                                 <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border shadow-sm ${
                                     isTodayDate 
                                     ? 'bg-blue-600 text-white border-blue-700' 
                                     : 'bg-white text-slate-600 border-slate-200'
                                 }`}>
                                     <span className="text-[10px] uppercase font-bold tracking-wider">{format(dateObj, 'MMM')}</span>
                                     <span className="text-xl font-bold leading-none">{format(dateObj, 'd')}</span>
                                 </div>
                                 <div>
                                     <h3 className={`text-lg font-bold ${isTodayDate ? 'text-blue-700' : 'text-slate-800'}`}>
                                         {isTodayDate ? 'Today' : isTom ? 'Tomorrow' : format(dateObj, 'EEEE')}
                                     </h3>
                                     <p className="text-xs text-slate-500 font-medium">
                                         {dayMeetings.length} Meeting{dayMeetings.length !== 1 ? 's' : ''} scheduled
                                     </p>
                                 </div>
                                 <div className="flex-1 h-px bg-slate-200"></div>
                             </div>

                             {/* Cards List */}
                             <div className="pl-4 md:pl-0">
                                 {dayMeetings.map(m => renderMeetingCard(m))}
                             </div>
                         </div>
                     );
                 })
             ) : (
                 <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                     <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                     <h3 className="text-lg font-bold text-slate-600">No schedules found</h3>
                     <p className="text-slate-400 mt-1">Your calendar is clear! Chat with leads to schedule meetings.</p>
                 </div>
             )}
          </div>

          {/* Sidebar Stats / Info */}
          <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <Clock size={18} /> Focus Mode
                  </h3>
                  <p className="text-indigo-100 text-xs leading-relaxed opacity-90 mb-4">
                      Reviewing client summaries before meetings increases conversion rate by 40%.
                  </p>
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                      <div className="flex justify-between text-xs font-bold mb-1">
                          <span>Today's Progress</span>
                          <span>{meetings.filter(m => isToday(m.date) && m.status === 'completed').length}/{meetings.filter(m => isToday(m.date)).length}</span>
                      </div>
                      <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: '30%' }}></div>
                      </div>
                  </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider">Legend</h3>
                  <div className="space-y-3">
                      <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm text-slate-600">Pending Meeting</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                          <span className="text-sm text-slate-600">Completed</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <span className="text-sm text-slate-600">High Priority</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ScheduleManager;
