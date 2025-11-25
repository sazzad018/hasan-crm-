
import React, { useState } from 'react';
import { Conversation } from '../types';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Clock, Shield, LogOut, Wallet, Activity, Lock, Megaphone, AlertTriangle, Briefcase, Mail, BarChart3, TrendingUp, Monitor, Calendar, MousePointer2, Eye, MessageCircle, DollarSign, Users, CheckSquare, Square, DownloadCloud, Flame, Star } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';

interface ClientPortalProps {
  client: Conversation;
  onTopUp: (psid: string, amount: number) => void;
  onToggleTask: (psid: string, taskId: string) => void;
  onExit: () => void; // Only for prototype, real users wouldn't have this
}

const ClientPortal: React.FC<ClientPortalProps> = ({ client, onTopUp, onToggleTask, onExit }) => {
  // Removed local state for TopUp since the feature is disabled for clients
  
  // Default permissions if undefined
  const permissions = client.portalPermissions || {
      viewBalance: true,
      allowTopUp: false, // Default to false as per requirement
      viewHistory: true
  };

  // Filter Transactions by Category
  const allTransactions = client.transactions || [];
  const adSpendTransactions = allTransactions.filter(t => t.category === 'ad_spend').sort((a, b) => b.date.getTime() - a.date.getTime());
  const webDevTransactions = allTransactions.filter(t => t.category === 'web_dev').sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Calculate Ad Spend Stats (Last 30 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), -i)).reverse();
  const totalSpendLast30 = adSpendTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const maxSpend = Math.max(...adSpendTransactions.map(t => t.amount), 10); // avoid div by zero

  // AGGREGATE REAL METRICS from Transaction Metadata
  const totalImpressions = adSpendTransactions.reduce((acc, t) => acc + (t.metadata?.impressions || 0), 0);
  const totalReach = adSpendTransactions.reduce((acc, t) => acc + (t.metadata?.reach || 0), 0);
  const totalMessages = adSpendTransactions.reduce((acc, t) => acc + (t.metadata?.messages || 0), 0);
  const totalConversions = adSpendTransactions.reduce((acc, t) => acc + (t.metadata?.conversions || 0), 0);

  // Growth Plan Stats
  const allTasks = client.tasks || [];
  const completedTasks = allTasks.filter(t => t.isCompleted).length;
  const totalTasks = allTasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getDailyStats = (date: Date) => {
      const tx = adSpendTransactions.find(t => isSameDay(t.date, date));
      return {
          amount: tx ? tx.amount : 0,
          conversions: tx?.metadata?.conversions || 0
      };
  };

  // CSV DOWNLOAD LOGIC
  const downloadHistoryCSV = () => {
      if (!allTransactions || allTransactions.length === 0) return;

      const headers = ['Date', 'Type', 'Amount', 'Category', 'Description', 'Impressions', 'Reach', 'Messages', 'Sales/Conversions'];
      const rows = allTransactions.map(tx => [
          format(tx.date, 'yyyy-MM-dd HH:mm'),
          tx.type,
          tx.amount.toString(),
          tx.category || 'other',
          `"${tx.description}"`,
          tx.metadata?.impressions || 0,
          tx.metadata?.reach || 0,
          tx.metadata?.messages || 0,
          tx.metadata?.conversions || 0
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `transaction_history_${format(new Date(), 'yyyyMMdd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
  
  // 1. SUSPENDED VIEW CHECK
  if (client.isPortalSuspended) {
      return (
          <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center border-t-4 border-red-500">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                      <Lock size={40} />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">Account Suspended</h1>
                  <p className="text-slate-500 mb-6">
                      Access to your client portal has been temporarily suspended by the administrator. 
                      Please contact support to resolve this issue.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 mb-6 border border-slate-200">
                      <strong>Admin Message:</strong><br/>
                      {client.portalAnnouncement || "No specific reason provided. Contact admin."}
                  </div>
                  <button onClick={onExit} className="text-blue-600 font-bold hover:underline">
                      Back to Login
                  </button>
              </div>
          </div>
      );
  }

  const renderTaskItem = (task: any) => {
      const isPriority = task.priority === 'high';
      return (
          <div key={task.id} 
               onClick={() => onToggleTask(client.psid, task.id)}
               className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 relative overflow-hidden group 
               ${task.isCompleted 
                    ? 'bg-emerald-50 border-emerald-100 opacity-60' 
                    : isPriority 
                        ? 'bg-white border-red-100 hover:border-red-300 shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-blue-300'}`}
          >
              {/* High Priority Badge */}
              {!task.isCompleted && isPriority && (
                  <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[9px] font-bold px-2 py-1 rounded-bl-lg">
                      HIGH PRIORITY
                  </div>
              )}

              <div className={`mt-0.5 transition-colors ${task.isCompleted ? 'text-emerald-500' : isPriority ? 'text-red-400' : 'text-slate-300'}`}>
                  {task.isCompleted ? <CheckSquare size={22} /> : <Square size={22} />}
              </div>
              <div className="flex-1">
                  <p className={`font-bold text-sm ${task.isCompleted ? 'text-emerald-800 line-through' : 'text-slate-800'}`}>
                      {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-xs text-slate-400">Assign: {format(task.assignedDate, 'MMM d')}</p>
                      {task.deadline && !task.isCompleted && (
                          <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                              <Clock size={12} /> Due: {format(new Date(task.deadline), 'MMM d')}
                          </p>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* Top Navigation (Simulated External Site) */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
         <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                 C
             </div>
             <span className="font-bold text-slate-800 tracking-tight">ClientPortal™</span>
         </div>
         <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                 <p className="text-sm font-bold text-slate-800">{client.userName}</p>
                 <p className="text-xs text-slate-500">{client.servicePackage || 'Standard Access'}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                 <div className="w-full h-full flex items-center justify-center bg-violet-600 text-white font-bold text-lg">
                     {client.userName.charAt(0)}
                 </div>
             </div>
             <button onClick={onExit} className="text-xs text-slate-400 hover:text-red-500 ml-2">
                 <LogOut size={16} />
             </button>
         </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Financial Overview</h1>
                  <p className="text-slate-500 mt-2">Manage your project funds, view history, and stats.</p>
              </div>
              {client.clientEmail && (
                 <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-600 shadow-sm">
                     <Mail size={16} /> {client.clientEmail}
                 </div>
              )}
          </div>
          
          {/* ADMIN ANNOUNCEMENT BANNER */}
          {client.portalAnnouncement && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <Megaphone size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                      <h4 className="font-bold text-amber-800 text-sm uppercase">Announcement</h4>
                      <p className="text-amber-700 text-sm">{client.portalAnnouncement}</p>
                  </div>
              </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* BALANCE CARD */}
              <div className="md:col-span-2 bg-slate-900 text-white rounded-2xl p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[200px]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="relative z-10 flex justify-between items-start">
                      <div>
                          <p className="text-slate-400 font-medium uppercase tracking-wider text-sm mb-1">Current Balance</p>
                          {permissions.viewBalance ? (
                              <h2 className="text-5xl font-bold tracking-tight">${(client.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                          ) : (
                              <div className="flex items-center gap-2 mt-2">
                                  <Lock size={24} className="text-slate-500" />
                                  <span className="text-2xl font-bold text-slate-500">Hidden by Admin</span>
                              </div>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                             <div className="px-2 py-0.5 rounded bg-white/10 text-xs font-bold text-slate-300 border border-white/10 flex items-center gap-1">
                                <Briefcase size={12} /> {client.servicePackage || 'Standard Plan'}
                             </div>
                          </div>
                      </div>
                      <Shield className="text-emerald-400" size={32} />
                  </div>

                  <div className="relative z-10 flex gap-4 mt-6">
                      {/* Top Up Button Removed for Client View */}
                      <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all backdrop-blur-sm cursor-default">
                          <Activity size={20} /> Status: Active
                      </button>
                  </div>
              </div>

              {/* QUICK STATS */}
              <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                              <Wallet size={20} />
                          </div>
                          <span className="text-sm font-bold text-slate-600">Total Spent</span>
                      </div>
                      {permissions.viewHistory ? (
                          <p className="text-2xl font-bold text-slate-800">
                              ${allTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0).toLocaleString() || '0.00'}
                          </p>
                      ) : (
                          <p className="text-slate-400 text-sm italic">Hidden</p>
                      )}
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                              <Clock size={20} />
                          </div>
                          <span className="text-sm font-bold text-slate-600">Last Transaction</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800">
                          {permissions.viewHistory && allTransactions.length > 0 
                             ? format(allTransactions[0].date, 'MMM d, yyyy') 
                             : 'N/A'}
                      </p>
                  </div>
              </div>
          </div>

          {/* TASKS / GROWTH CHECKLIST SECTION (Advanced Features) */}
          <div>
              {/* Sales Guarantee Banner */}
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-t-2xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
                  <div className="relative z-10">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                          <Flame className="text-orange-400 fill-orange-400" /> 
                          Guaranteed Sales Booster
                      </h3>
                      <p className="text-indigo-100 text-sm mt-1 max-w-2xl">
                          To increase your SALES, you MUST complete these tasks. The faster you complete them, the faster your sales will grow. Guaranteed.
                      </p>
                  </div>
                  <div className="relative z-10 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 text-center min-w-[120px]">
                      <span className="block text-2xl font-bold">{progressPercentage}%</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Growth Score</span>
                  </div>
                  {/* Background decoration */}
                  <div className="absolute -right-10 -bottom-20 w-60 h-60 bg-white opacity-5 rounded-full blur-3xl"></div>
              </div>
              
              <div className="bg-white rounded-b-2xl shadow-sm border-x border-b border-slate-200 p-6">
                  {/* Progress Bar */}
                  <div className="mb-8">
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                          <span>Progress</span>
                          <span>{completedTasks} of {totalTasks} Completed</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out"
                              style={{ width: `${progressPercentage}%` }}
                          ></div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                          <h4 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                              <Calendar size={16} className="text-blue-600" /> Weekly Focus
                          </h4>
                          <div className="space-y-3">
                              {client.tasks && client.tasks.filter(t => t.type === 'weekly').length > 0 ? (
                                  client.tasks.filter(t => t.type === 'weekly').map(renderTaskItem)
                              ) : (
                                  <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                      <p className="text-slate-400 text-sm">No weekly tasks. You are all caught up!</p>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div>
                          <h4 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                              <TrendingUp size={16} className="text-violet-600" /> Monthly Goals
                          </h4>
                          <div className="space-y-3">
                              {client.tasks && client.tasks.filter(t => t.type === 'monthly').length > 0 ? (
                                  client.tasks.filter(t => t.type === 'monthly').map(renderTaskItem)
                              ) : (
                                  <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                      <p className="text-slate-400 text-sm">No monthly goals set.</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* SERVICE PERFORMANCE TRACKER */}
          {permissions.viewHistory && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 
                 {/* 1. FACEBOOK ADS TRACKER */}
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                     <div className="flex items-center justify-between mb-6">
                         <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                             <BarChart3 className="text-blue-600" /> Facebook Ads Performance
                         </h3>
                         <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">Last 7 Days</span>
                     </div>
                     
                     {/* CHART CONTAINER WITH IMPROVED VISIBILITY */}
                     <div className="relative h-64 mb-6 border border-slate-200 bg-slate-50 rounded-xl p-4">
                         
                         {/* Background Grid Lines */}
                         <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none z-0">
                            <div className="w-full h-px bg-slate-200 border-t border-dashed"></div>
                            <div className="w-full h-px bg-slate-200 border-t border-dashed"></div>
                            <div className="w-full h-px bg-slate-200 border-t border-dashed"></div>
                            <div className="w-full h-px bg-slate-200 border-t border-dashed"></div>
                         </div>

                         {/* BARS */}
                         <div className="absolute inset-0 flex items-end justify-between px-6 pb-2 pt-6 gap-3 z-10">
                             {last7Days.map((day, idx) => {
                                 const { amount, conversions } = getDailyStats(day);
                                 const heightPercent = maxSpend > 0 ? (amount / maxSpend) * 100 : 0;
                                 
                                 return (
                                     <div key={idx} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                                         
                                         {/* The Bar Container */}
                                         <div className="relative w-full flex justify-center items-end" style={{ height: '100%' }}>
                                             
                                             {/* SALES BUBBLE - HIGH VISIBILITY */}
                                             {conversions > 0 && (
                                                 <div 
                                                    className="absolute z-20 flex flex-col items-center animate-in slide-in-from-bottom-2 fade-in transition-all duration-300 transform group-hover:scale-110" 
                                                    style={{ bottom: `calc(${Math.max(heightPercent, 5)}% + 8px)` }}
                                                 >
                                                     <div className="bg-emerald-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border-2 border-white">
                                                         <TrendingUp size={12} /> {conversions} Sales
                                                     </div>
                                                 </div>
                                             )}

                                             {/* THE BAR */}
                                             <div 
                                                className="w-full max-w-[28px] bg-gradient-to-b from-blue-500 to-blue-600 rounded-t-lg shadow-sm group-hover:from-blue-400 group-hover:to-blue-500 transition-all relative border-x border-t border-blue-400/20"
                                                style={{ height: `${Math.max(heightPercent, 2)}%` }} // min 2% height visibility
                                             >
                                                {/* Tooltip on Hover */}
                                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-800 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-slate-700">
                                                    <p className="text-xs font-bold text-center border-b border-slate-600 pb-1 mb-1 text-slate-200">{format(day, 'MMM d')}</p>
                                                    <div className="flex gap-3 text-[10px]">
                                                        <span className="text-blue-300 font-bold">${amount.toFixed(2)}</span>
                                                        <span className="text-emerald-400 font-bold">{conversions} Sales</span>
                                                    </div>
                                                </div>
                                             </div>
                                         </div>
                                         
                                         {/* Date Label - DARK TEXT */}
                                         <span className="text-[10px] font-bold text-slate-600 mt-2 bg-white/50 px-1 rounded">
                                             {format(day, 'dd/MM')}
                                         </span>
                                     </div>
                                 );
                             })}
                         </div>
                     </div>
                     
                     {/* KPI METRICS CARDS */}
                     {adSpendTransactions.length > 0 && (
                         <div className="grid grid-cols-2 gap-3 py-3">
                             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm">
                                 <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><Eye size={12} /> Impressions</p>
                                 <p className="text-lg font-bold text-slate-800">{totalImpressions.toLocaleString()}</p>
                             </div>
                             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm">
                                 <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><Users size={12} /> Reach</p>
                                 <p className="text-lg font-bold text-slate-800">{totalReach.toLocaleString()}</p>
                             </div>
                             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm">
                                 <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><MessageCircle size={12} /> Messages</p>
                                 <p className="text-lg font-bold text-slate-800">{totalMessages.toLocaleString()}</p>
                             </div>
                             <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 shadow-sm">
                                 <p className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1"><DollarSign size={12} /> Total Sales</p>
                                 <p className="text-lg font-bold text-emerald-800">{totalConversions.toLocaleString()}</p>
                             </div>
                         </div>
                     )}
                     
                     <div className="mt-auto border-t border-slate-100 pt-3">
                         <div className="flex justify-between items-center text-sm text-slate-600">
                            <span>Total Spend (Last 30 days)</span>
                            <span className="font-bold text-slate-800">${totalSpendLast30.toFixed(2)}</span>
                         </div>
                     </div>
                 </div>

                 {/* 2. WEB DEV & SERVICES TABLE */}
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                     <div className="flex items-center justify-between mb-4">
                         <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                             <Monitor className="text-violet-600" /> Web Development & Services
                         </h3>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto max-h-60 pr-2">
                         {webDevTransactions.length > 0 ? (
                             <div className="space-y-3">
                                 {webDevTransactions.map(tx => (
                                     <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                         <div>
                                             <p className="font-bold text-sm text-slate-700">{tx.description}</p>
                                             <p className="text-xs text-slate-400">{format(tx.date, 'MMM d, yyyy')}</p>
                                         </div>
                                         <span className="font-bold text-slate-800">-${tx.amount.toFixed(2)}</span>
                                     </div>
                                 ))}
                             </div>
                         ) : (
                             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                 <Monitor size={32} className="mb-2 opacity-20" />
                                 <p className="text-sm">No development costs recorded.</p>
                             </div>
                         )}
                     </div>
                 </div>

             </div>
          )}

          {/* FULL TRANSACTION HISTORY TABLE */}
          {permissions.viewHistory && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-slate-800">Complete Ledger</h3>
                      <button 
                        onClick={downloadHistoryCSV}
                        className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-2"
                      >
                         <DownloadCloud size={16} /> Download CSV
                      </button>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                              <tr>
                                  <th className="px-8 py-4">Date</th>
                                  <th className="px-8 py-4">Description</th>
                                  <th className="px-8 py-4">Category</th>
                                  <th className="px-8 py-4 text-right">Amount</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {allTransactions.length > 0 ? (
                                  allTransactions.map((tx) => (
                                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                          <td className="px-8 py-4 text-sm text-slate-600">
                                              {format(tx.date, 'MMM d, yyyy')}
                                              <div className="text-xs text-slate-400">{format(tx.date, 'h:mm a')}</div>
                                          </td>
                                          <td className="px-8 py-4 font-medium text-slate-800">
                                              {tx.description}
                                              {tx.metadata && (
                                                  <div className="flex gap-2 mt-1 text-[10px] text-slate-500 font-normal">
                                                      {tx.metadata.conversions ? <span className="text-green-600 font-bold">{tx.metadata.conversions} Sales</span> : null}
                                                      {tx.metadata.messages ? <span>{tx.metadata.messages} Msgs</span> : null}
                                                  </div>
                                              )}
                                          </td>
                                          <td className="px-8 py-4">
                                              {tx.category === 'ad_spend' && <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 uppercase">Ad Spend</span>}
                                              {tx.category === 'web_dev' && <span className="text-[10px] font-bold bg-violet-50 text-violet-600 px-2 py-1 rounded border border-violet-100 uppercase">Web Dev</span>}
                                              {tx.category === 'payment' && <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100 uppercase">Payment</span>}
                                              {(!tx.category || tx.category === 'other' || tx.category === 'service_fee') && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase">General</span>}
                                          </td>
                                          <td className={`px-8 py-4 text-right font-mono font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                              {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                                          </td>
                                      </tr>
                                  ))
                              ) : (
                                  <tr>
                                      <td colSpan={4} className="px-8 py-12 text-center text-slate-400">
                                          No transactions found.
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

      </main>
    </div>
  );
};

export default ClientPortal;
