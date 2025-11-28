
import React from 'react';
import { Conversation, Meeting, AdminTask, SmsCampaign, AiSettings, AiKnowledgeItem, SmsSettings } from '../types';
import { 
  Users, Filter, MessageCircle, Phone, CheckCircle, Database, ArrowRight, UserPlus, 
  Facebook, User, TrendingUp, Activity, BarChart3, Clock, Wallet, DollarSign, 
  BrainCircuit, Smartphone, Zap, FileText, Calendar, CheckSquare, AlertTriangle, Briefcase, PlusCircle, Check
} from 'lucide-react';
import { format, isSameWeek, isSameMonth, isSameYear } from 'date-fns';
import BusinessCalculator from './BusinessCalculator'; 

interface DashboardProps {
  conversations: Conversation[];
  meetings: Meeting[];
  onOpenChat: (psid: string) => void;
  adminTasks: AdminTask[];
  smsHistory: SmsCampaign[];
  aiSettings: AiSettings;
  aiKnowledgeBase: AiKnowledgeItem[];
  smsSettings: SmsSettings;
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    conversations, meetings, onOpenChat,
    adminTasks, smsHistory, aiSettings, smsSettings, setActiveTab
}) => {
  
  // --- LEAD CALCULATIONS ---
  const totalLeads = conversations.length;
  const newLeads = conversations.filter(c => c.status === 'new_lead');
  const interested = conversations.filter(c => c.status === 'interested');
  const negotiation = conversations.filter(c => c.status === 'negotiation');
  const activeClients = conversations.filter(c => c.status === 'active_client');

  // Source Stats
  const fbLeads = conversations.filter(c => c.source === 'facebook').length;
  const manualLeads = conversations.filter(c => c.source === 'manual').length;

  // Recent Leads (Last 5)
  const recentLeads = [...conversations]
    .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
    .slice(0, 5);

  // --- FINANCIALS & CURRENCY ---
  // Assuming stored amounts are in USD base.
  // Conversion Rate: 1 USD = 145 BDT.
  const DOLLAR_RATE = 145;
  const now = new Date();

  // Get all CREDIT transactions (Money In)
  const allInTransactions = conversations
      .flatMap(c => c.transactions || [])
      .filter(t => t.type === 'credit');

  const calculateTotal = (txs: typeof allInTransactions) => txs.reduce((sum, t) => sum + t.amount, 0);

  // Income Breakdown (USD)
  const incomeWeekUSD = calculateTotal(allInTransactions.filter(t => isSameWeek(new Date(t.date), now)));
  const incomeMonthUSD = calculateTotal(allInTransactions.filter(t => isSameMonth(new Date(t.date), now)));
  const incomeYearUSD = calculateTotal(allInTransactions.filter(t => isSameYear(new Date(t.date), now)));

  // Total Ad Spend (USD) - DEBIT type, category 'ad_spend'
  const totalAdSpend = conversations.reduce((sum, c) => {
      const clientSpend = c.transactions?.filter(t => t.category === 'ad_spend').reduce((tSum, t) => tSum + t.amount, 0) || 0;
      return sum + clientSpend;
  }, 0);

  // System Health
  const isAiConnected = aiSettings.activeMode === 'manual' 
      ? false 
      : (aiSettings.activeMode === 'paid' ? !!aiSettings.paidConfig.apiKey : !!aiSettings.freeConfig.apiKey);
  const isSmsConnected = !!smsSettings.apiUrl;
  const isWebhookActive = true; 

  const getPercentage = (count: number) => {
      if(totalLeads === 0) return 0;
      return Math.round((count / totalLeads) * 100);
  };

  // Format Helper for BDT
  const formatBDT = (usdAmount: number) => {
      const bdt = usdAmount * DOLLAR_RATE;
      if (bdt > 1000000) return `${(bdt / 1000000).toFixed(1)}M`;
      if (bdt > 1000) return `${(bdt / 1000).toFixed(1)}K`;
      return bdt.toLocaleString();
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. HEADER & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="text-blue-600" /> Agency Command Center
          </h2>
          <p className="text-slate-500 mt-1">Snapshot of your lead pipeline and daily operations.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setActiveTab('invoices')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all">
                <FileText size={16} /> Invoice
            </button>
            <button onClick={() => setActiveTab('bulk_sms')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all">
                <Smartphone size={16} /> SMS Blast
            </button>
            <button onClick={() => setActiveTab('tasks')} className="flex items-center gap-2 bg-slate-900 text-white hover:bg-black px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-slate-200 transition-all">
                <CheckSquare size={16} /> Add Task
            </button>
        </div>
      </div>

      {/* 2. LEAD PIPELINE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border-l-4 border-blue-500 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                  <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">New Leads</p>
                      <h3 className="text-3xl font-bold text-slate-800 mt-1">{newLeads.length}</h3>
                  </div>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <UserPlus size={20} />
                  </div>
              </div>
              <p className="text-xs text-slate-400">Fresh entries needing contact</p>
          </div>

          <div className="bg-white p-5 rounded-xl border-l-4 border-indigo-500 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                  <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Interested</p>
                      <h3 className="text-3xl font-bold text-slate-800 mt-1">{interested.length}</h3>
                  </div>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <MessageCircle size={20} />
                  </div>
              </div>
              <p className="text-xs text-slate-400">Replied & showing interest</p>
          </div>

          <div className="bg-white p-5 rounded-xl border-l-4 border-orange-500 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                  <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">In Negotiation</p>
                      <h3 className="text-3xl font-bold text-slate-800 mt-1">{negotiation.length}</h3>
                  </div>
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                      <TrendingUp size={20} />
                  </div>
              </div>
              <p className="text-xs text-slate-400">Proposal sent / Pricing talk</p>
          </div>

          <div className="bg-white p-5 rounded-xl border-l-4 border-emerald-500 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                  <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Clients</p>
                      <h3 className="text-3xl font-bold text-slate-800 mt-1">{activeClients.length}</h3>
                  </div>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <CheckCircle size={20} />
                  </div>
              </div>
              <p className="text-xs text-slate-400">Converted & paying customers</p>
          </div>
      </div>

      {/* 3. CASH FLOW ANALYTICS (NEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-600" /> Income: This Week
              </h3>
              <div className="flex flex-col gap-1">
                  <p className="text-3xl font-bold text-emerald-600">
                      ${incomeWeekUSD.toLocaleString()}
                  </p>
                  <p className="text-sm font-bold text-slate-400 flex items-center gap-1">
                      ≈ {formatBDT(incomeWeekUSD)} BDT
                      <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-500">Rate: {DOLLAR_RATE}</span>
                  </p>
              </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-600" /> Income: This Month
              </h3>
              <div className="flex flex-col gap-1">
                  <p className="text-3xl font-bold text-blue-600">
                      ${incomeMonthUSD.toLocaleString()}
                  </p>
                  <p className="text-sm font-bold text-slate-400 flex items-center gap-1">
                      ≈ {formatBDT(incomeMonthUSD)} BDT
                      <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-500">Rate: {DOLLAR_RATE}</span>
                  </p>
              </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-violet-600" /> Income: This Year
              </h3>
              <div className="flex flex-col gap-1">
                  <p className="text-3xl font-bold text-violet-600">
                      ${incomeYearUSD.toLocaleString()}
                  </p>
                  <p className="text-sm font-bold text-slate-400 flex items-center gap-1">
                      ≈ {formatBDT(incomeYearUSD)} BDT
                      <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-500">Rate: {DOLLAR_RATE}</span>
                  </p>
              </div>
          </div>
      </div>

      {/* 4. MAIN GRID: FUNNEL, CALCULATOR & TASKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Pipeline & Sources */}
          <div className="lg:col-span-2 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Funnel Chart */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <Filter size={18} className="text-slate-500" /> Conversion Pipeline
                      </h3>
                      
                      <div className="space-y-5">
                          <div className="relative">
                              <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-blue-600">New Leads</span>
                                  <span className="text-slate-600">{newLeads.length} ({getPercentage(newLeads.length)}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${Math.max(getPercentage(newLeads.length), 5)}%` }}></div>
                              </div>
                          </div>

                          <div className="relative">
                              <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-indigo-600">Interested</span>
                                  <span className="text-slate-600">{interested.length} ({getPercentage(interested.length)}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                  <div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${Math.max(getPercentage(interested.length), 5)}%` }}></div>
                              </div>
                          </div>

                          <div className="relative">
                              <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-orange-600">Negotiation</span>
                                  <span className="text-slate-600">{negotiation.length} ({getPercentage(negotiation.length)}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                  <div className="bg-orange-500 h-3 rounded-full" style={{ width: `${Math.max(getPercentage(negotiation.length), 5)}%` }}></div>
                              </div>
                          </div>

                          <div className="relative">
                              <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-emerald-600">Converted</span>
                                  <span className="text-slate-600">{activeClients.length} ({getPercentage(activeClients.length)}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                  <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${Math.max(getPercentage(activeClients.length), 5)}%` }}></div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* BUSINESS CALCULATOR (NEW) */}
                  <BusinessCalculator />
              </div>

              {/* Recent Leads Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                       <h3 className="font-bold text-slate-800 flex items-center gap-2">
                           <Clock size={18} className="text-slate-500" /> Recent Leads
                       </h3>
                   </div>
                   <div className="overflow-x-auto">
                       <table className="w-full text-left">
                           <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                               <tr>
                                   <th className="px-6 py-3">Name</th>
                                   <th className="px-6 py-3">Status</th>
                                   <th className="px-6 py-3">Source</th>
                                   <th className="px-6 py-3 text-right">Chat</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                               {recentLeads.map(lead => (
                                   <tr key={lead.psid} className="hover:bg-slate-50">
                                       <td className="px-6 py-4">
                                           <div className="flex items-center gap-3">
                                               <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                   {lead.userName.charAt(0)}
                                               </div>
                                               <div>
                                                   <p className="text-sm font-bold text-slate-800">{lead.userName}</p>
                                                   <p className="text-[10px] text-slate-400">{format(lead.lastActive, 'MMM d, h:mm a')}</p>
                                               </div>
                                           </div>
                                       </td>
                                       <td className="px-6 py-4">
                                           <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase
                                               ${lead.status === 'new_lead' ? 'bg-blue-100 text-blue-700' : 
                                                 lead.status === 'active_client' ? 'bg-violet-100 text-violet-700' :
                                                 lead.status === 'negotiation' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                                               {lead.status.replace('_', ' ')}
                                           </span>
                                       </td>
                                       <td className="px-6 py-4 text-xs text-slate-500">
                                           {lead.source === 'facebook' ? (
                                               <span className="flex items-center gap-1"><Facebook size={12} className="text-blue-600"/> FB Auto</span>
                                           ) : (
                                               <span className="flex items-center gap-1"><User size={12} className="text-orange-500"/> Manual</span>
                                           )}
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                           <button onClick={() => onOpenChat(lead.psid)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors">
                                               <MessageCircle size={16} />
                                           </button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
              </div>
          </div>

          {/* RIGHT: Tasks & Stats */}
          <div className="space-y-6">
              
              {/* UNIFIED TASKS & MEETINGS */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-fit">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <CheckSquare size={18} className="text-slate-500" /> Today's Priorities
                      </h3>
                  </div>
                  
                  <div className="p-2 space-y-1">
                      {/* Meetings First */}
                      {meetings.filter(m => m.status === 'pending').slice(0, 3).map(m => (
                          <div key={m.id} className="p-3 bg-violet-50 rounded-lg border border-violet-100">
                              <div className="flex justify-between items-start mb-1">
                                  <span className="text-[10px] font-bold bg-white px-2 rounded text-violet-600 border border-violet-200">
                                      {format(m.date, 'h:mm a')}
                                  </span>
                                  <Calendar size={12} className="text-violet-400" />
                              </div>
                              <p className="text-xs font-bold text-violet-900 line-clamp-1">{m.title}</p>
                              <p className="text-[10px] text-violet-600 mt-0.5">w/ {m.clientName}</p>
                          </div>
                      ))}
                      
                      {/* Admin Tasks */}
                      {adminTasks.filter(t => !t.isCompleted).slice(0, 3).map(t => (
                          <div key={t.id} className="p-3 bg-white rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                              <div className="flex justify-between items-start mb-1">
                                  <span className={`text-[9px] font-bold px-1.5 rounded uppercase ${t.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                      {t.priority}
                                  </span>
                              </div>
                              <p className="text-xs font-bold text-slate-700 line-clamp-1">{t.title}</p>
                          </div>
                      ))}

                      {meetings.length === 0 && adminTasks.length === 0 && (
                          <p className="text-center text-xs text-slate-400 py-4">No pending tasks or meetings.</p>
                      )}
                  </div>
              </div>

              {/* SOURCE BREAKDOWN (Mini) */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Lead Sources</h4>
                  <div className="flex gap-2">
                      <div className="flex-1 bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                          <Facebook size={16} className="mx-auto text-blue-600 mb-1" />
                          <span className="block text-lg font-bold text-blue-900">{fbLeads}</span>
                          <span className="text-[10px] text-blue-600 font-bold">Facebook</span>
                      </div>
                      <div className="flex-1 bg-orange-50 rounded-lg p-3 text-center border border-orange-100">
                          <User size={16} className="mx-auto text-orange-500 mb-1" />
                          <span className="block text-lg font-bold text-orange-900">{manualLeads}</span>
                          <span className="text-[10px] text-orange-600 font-bold">Manual</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 4. BOTTOM SECTION: SYSTEM HEALTH & SPEND */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
               <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Ad Spend (All Time)</p>
                   <h3 className="text-2xl font-bold text-slate-800">${totalAdSpend.toLocaleString()}</h3>
               </div>
               <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                   <DollarSign size={24} />
               </div>
          </div>

          {/* Integrated System Health */}
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-5 text-white flex flex-col justify-center lg:col-span-2">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                   <Activity size={14} /> System Health
               </h4>
               <div className="grid grid-cols-3 gap-4">
                   <div className="flex flex-col justify-center p-2 rounded bg-slate-800/50">
                       <span className="flex items-center gap-2 text-slate-300 text-xs mb-1"><BrainCircuit size={14}/> AI Brain</span>
                       <span className={`font-bold text-[10px] px-2 py-0.5 rounded w-fit ${isAiConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                           {isAiConnected ? 'ONLINE' : 'OFFLINE'}
                       </span>
                   </div>
                   <div className="flex flex-col justify-center p-2 rounded bg-slate-800/50">
                       <span className="flex items-center gap-2 text-slate-300 text-xs mb-1"><Smartphone size={14}/> SMS Gateway</span>
                       <span className={`font-bold text-[10px] px-2 py-0.5 rounded w-fit ${isSmsConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                           {isSmsConnected ? 'READY' : 'CONFIG'}
                       </span>
                   </div>
                   <div className="flex flex-col justify-center p-2 rounded bg-slate-800/50">
                       <span className="flex items-center gap-2 text-slate-300 text-xs mb-1"><Zap size={14}/> Webhook</span>
                       <span className={`font-bold text-[10px] px-2 py-0.5 rounded w-fit ${isWebhookActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                           LISTENING
                       </span>
                   </div>
               </div>
          </div>
      </div>

    </div>
  );
};

export default Dashboard;
