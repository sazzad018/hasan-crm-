
import React, { useState } from 'react';
import { Conversation, PaymentMethod } from '../types';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Clock, Shield, LogOut, Wallet, Activity, Lock, Megaphone, AlertTriangle, Briefcase, Mail, BarChart3, TrendingUp, Monitor, Calendar, MousePointer2, Eye, MessageCircle, DollarSign, Users, CheckSquare, Square, DownloadCloud, Flame, Star, Copy, MousePointerClick, Zap, List, Smartphone, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, isSameDay, isWithinInterval, endOfDay } from 'date-fns';

interface ClientPortalProps {
  client: Conversation;
  onTopUp: (psid: string, amount: number) => void;
  onToggleTask: (psid: string, taskId: string) => void;
  onExit: () => void;
  paymentMethods?: PaymentMethod[]; // New Prop
}

const ClientPortal: React.FC<ClientPortalProps> = ({ client, onTopUp, onToggleTask, onExit, paymentMethods = [] }) => {
  
  // Default permissions if undefined
  const permissions = client.portalPermissions || {
      viewBalance: true,
      allowTopUp: false, 
      viewHistory: true,
      showTotalDeposit: true,
      showTotalSpend: true
  };

  // State for Table Timeframe & Pagination
  const [timeframe, setTimeframe] = useState<'7d' | '15d' | '1m' | '3m' | '6m' | '1y' | 'all' | 'custom'>('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate Lifetime Stats
  const allTransactions = client.transactions || [];
  const lifetimeDeposit = allTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

  const lifetimeSpend = allTransactions
      .filter(t => t.type === 'debit') // Or filter by category 'ad_spend' if strictly ad spend
      .reduce((sum, t) => sum + t.amount, 0);

  // Filter Transactions by Category - ADDED SAFETY CHECKS
  const adSpendTransactions = allTransactions.filter(t => t.category === 'ad_spend').sort((a, b) => b.date.getTime() - a.date.getTime());
  const webDevTransactions = allTransactions.filter(t => t.category === 'web_dev').sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Helpers for missing date-fns functions
  const subMonths = (date: Date, amount: number) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() - amount);
      return d;
  }
  const subYears = (date: Date, amount: number) => {
      const d = new Date(date);
      d.setFullYear(d.getFullYear() - amount);
      return d;
  }

  // Helper to get Start Date based on Timeframe
  const getStartDate = () => {
      const now = new Date();
      switch(timeframe) {
          case '7d': return addDays(now, -7);
          case '15d': return addDays(now, -15);
          case '1m': return subMonths(now, 1);
          case '3m': return subMonths(now, 3);
          case '6m': return subMonths(now, 6);
          case '1y': return subYears(now, 1);
          case 'custom': return customStart ? new Date(customStart + 'T00:00:00') : addDays(now, -7);
          case 'all': return new Date(0); // Beginning of time
          default: return addDays(now, -7);
      }
  };

  const getEndDate = () => {
      if (timeframe === 'custom' && customEnd) return endOfDay(new Date(customEnd + 'T00:00:00'));
      return new Date();
  }

  const startDate = getStartDate();
  const endDate = getEndDate();

  // Calculate Chart Data (Based on selected timeframe)
  // For simplification in chart rendering, we will still render 7 bars but aggregated or just the last 7 days relative to end date if range is huge
  // However, requirements say "Real-time metrics... Timeframe: Last 7 days...". Ideally the chart updates.
  // For this prototype, let's keep the chart fixed to Last 7 Days (or visual representation of selected range if small)
  // To properly support 1 year chart we need a graphing library. I will stick to "Last 7 Days" for the visual bar chart 
  // but update the "Key Metrics Grid" numbers based on the selected timeframe.

  const txInPeriod = adSpendTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      return isWithinInterval(txDate, { start: startDate, end: endDate });
  });

  // Key Metrics Calculation based on Timeframe
  const totalSpendPeriod = txInPeriod.reduce((acc, tx) => acc + tx.amount, 0);
  const totalConversionsPeriod = txInPeriod.reduce((acc, tx) => acc + (tx.metadata?.conversions || 0), 0);
  const totalImpressionsPeriod = txInPeriod.reduce((acc, tx) => acc + (tx.metadata?.impressions || 0), 0);
  const totalReachPeriod = txInPeriod.reduce((acc, tx) => acc + (tx.metadata?.reach || 0), 0);
  const costPerResult = totalConversionsPeriod > 0 ? (totalSpendPeriod / totalConversionsPeriod) : 0;

  // Chart Data (Fixed to Last 7 Days for UI stability as requested in previous prompts, or dynamic if easy)
  // Let's stick to Last 7 Days visual for the bar chart to keep it looking good without Recharts
  const chartDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), -i)).reverse();
  const getChartStats = (date: Date) => {
      const tx = adSpendTransactions.find(t => isSameDay(t.date, date));
      return {
          amount: tx ? tx.amount : 0,
          conversions: tx?.metadata?.conversions || 0,
          impressions: tx?.metadata?.impressions || 0,
      };
  };
  const maxChartSpend = Math.max(...chartDays.map(d => getChartStats(d).amount), 10);


  // Growth Plan Stats
  const allTasks = client.tasks || [];
  const completedTasks = allTasks.filter(t => t.isCompleted).length;
  const totalTasks = allTasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter Logic for Table (Uses same logic as metrics now)
  const filteredTableData = txInPeriod;

  // Pagination Logic
  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage);
  const paginatedTransactions = filteredTableData.slice(
      (currentPage - 1) * itemsPerPage, 
      currentPage * itemsPerPage
  );

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

  const bankMethods = paymentMethods.filter(m => m.category === 'bank');
  const mobileMethods = paymentMethods.filter(m => m.category !== 'bank');

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
         <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-[#9B7BE3] rounded-lg flex items-center justify-center text-white font-bold">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-4">
                  {/* 1. CURRENT BALANCE CARD */}
                  <div className="bg-[#9B7BE3] text-white rounded-2xl p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[200px]">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600 rounded-full blur-[80px] opacity-30 -translate-y-1/2 translate-x-1/2"></div>
                      
                      <div className="relative z-10 flex justify-between items-start">
                          <div>
                              <p className="text-violet-100 font-medium uppercase tracking-wider text-sm mb-1">Current Balance</p>
                              {permissions.viewBalance ? (
                                  <h2 className="text-5xl font-bold tracking-tight text-white drop-shadow-sm">${(client.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                              ) : (
                                  <div className="flex items-center gap-2 mt-2">
                                      <Lock size={24} className="text-slate-100" />
                                      <span className="text-2xl font-bold text-slate-100">Hidden by Admin</span>
                                  </div>
                              )}
                              <div className="mt-2 flex items-center gap-2">
                                <div className="px-2 py-0.5 rounded bg-white/20 text-xs font-bold text-white border border-white/20 flex items-center gap-1">
                                    <Briefcase size={12} /> {client.servicePackage || 'Standard Plan'}
                                </div>
                              </div>
                          </div>
                          <Shield className="text-white opacity-80" size={32} />
                      </div>

                      <div className="relative z-10 flex gap-4 mt-6">
                          <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition-all backdrop-blur-sm cursor-default border border-white/20">
                              <Activity size={20} /> Status: Active
                          </button>
                      </div>
                  </div>

                  {/* 2. LIFETIME SUMMARY CARDS (NEW) */}
                  <div className="grid grid-cols-2 gap-4">
                      {permissions.showTotalDeposit !== false && (
                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Deposit (Lifetime)</p>
                              <p className="text-xl font-bold text-emerald-600 mt-1">+${lifetimeDeposit.toLocaleString()}</p>
                          </div>
                      )}
                      {permissions.showTotalSpend !== false && (
                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spent (Lifetime)</p>
                              <p className="text-xl font-bold text-slate-800 mt-1">-${lifetimeSpend.toLocaleString()}</p>
                          </div>
                      )}
                  </div>
              </div>

              {/* PAYMENT METHODS & STATS */}
              <div className="space-y-6">
                  {/* Payment Methods Widget */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 h-full overflow-y-auto max-h-[400px] custom-scrollbar">
                      <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                          <CreditCard size={14} /> How to Pay
                      </h3>
                      
                      {mobileMethods.length > 0 && (
                          <div className="space-y-3 mb-4">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile Banking</p>
                              {mobileMethods.map(method => (
                                  <div key={method.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                                      <div className="flex justify-between items-center mb-1">
                                          <span className="font-bold text-slate-800 flex items-center gap-1">
                                              {method.provider} 
                                              <span className="text-[10px] bg-white border border-slate-200 px-1 rounded text-slate-500 font-normal">{method.type}</span>
                                          </span>
                                          <button 
                                            onClick={() => {navigator.clipboard.writeText(method.accountNumber); alert('Number Copied!')}}
                                            className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                                            title="Copy Number"
                                          >
                                              <Copy size={12} />
                                          </button>
                                      </div>
                                      <p className="font-mono text-slate-600 font-medium tracking-wide text-lg">{method.accountNumber}</p>
                                      {method.instructions && <p className="text-[10px] text-slate-400 mt-1 italic">{method.instructions}</p>}
                                  </div>
                              ))}
                          </div>
                      )}

                      {bankMethods.length > 0 && (
                          <div className="space-y-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                                  <Building2 size={10} /> Bank Transfer
                              </p>
                              {bankMethods.map(method => (
                                  <div key={method.id} className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-xs">
                                      <div className="flex justify-between items-center mb-2 border-b border-blue-100 pb-1">
                                          <span className="font-bold text-blue-900">{method.provider}</span>
                                          <span className="text-[9px] text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">{method.branchName ? `${method.branchName} Branch` : 'Main'}</span>
                                      </div>
                                      <div className="space-y-1">
                                          <div className="flex justify-between group">
                                              <span className="text-slate-500">Name:</span>
                                              <div className="flex gap-1 items-center">
                                                  <span className="font-medium text-slate-700">{method.accountName}</span>
                                                  <button onClick={() => {navigator.clipboard.writeText(method.accountName || '');}} className="opacity-0 group-hover:opacity-100 text-blue-500"><Copy size={10}/></button>
                                              </div>
                                          </div>
                                          <div className="flex justify-between group">
                                              <span className="text-slate-500">Acc No:</span>
                                              <div className="flex gap-1 items-center">
                                                  <span className="font-mono font-bold text-slate-800">{method.accountNumber}</span>
                                                  <button onClick={() => {navigator.clipboard.writeText(method.accountNumber);}} className="opacity-0 group-hover:opacity-100 text-blue-500"><Copy size={10}/></button>
                                              </div>
                                          </div>
                                          {method.routingNumber && (
                                              <div className="flex justify-between group">
                                                  <span className="text-slate-500">Routing:</span>
                                                  <div className="flex gap-1 items-center">
                                                      <span className="font-mono text-slate-700">{method.routingNumber}</span>
                                                      <button onClick={() => {navigator.clipboard.writeText(method.routingNumber || '');}} className="opacity-0 group-hover:opacity-100 text-blue-500"><Copy size={10}/></button>
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}

                      {paymentMethods.length === 0 && (
                          <p className="text-xs text-slate-400 italic">No payment details available.</p>
                      )}
                  </div>
              </div>
          </div>

          {/* SERVICE PERFORMANCE TRACKER - REDESIGNED */}
          {permissions.viewHistory && (
             <div className="space-y-6">
                 
                 {/* 1. PROFESSIONAL FACEBOOK ADS DASHBOARD */}
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                     {/* Header */}
                     <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/30">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                 <BarChart3 size={20} />
                             </div>
                             <div>
                                 <h3 className="font-bold text-lg text-slate-800">Ad Performance</h3>
                                 <p className="text-xs text-slate-500">Real-time metrics from your active campaigns</p>
                             </div>
                         </div>
                         <div className="flex items-center gap-2 flex-wrap justify-end">
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timeframe:</span>
                             <select 
                                value={timeframe}
                                onChange={(e) => { setTimeframe(e.target.value as any); setCurrentPage(1); }}
                                className="text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                             >
                                 <option value="7d">Last 7 Days</option>
                                 <option value="15d">Last 15 Days</option>
                                 <option value="1m">Last 1 Month</option>
                                 <option value="3m">Last 3 Months</option>
                                 <option value="6m">Last 6 Months</option>
                                 <option value="1y">Last 1 Year</option>
                                 <option value="all">All Time</option>
                                 <option value="custom">Custom Range</option>
                             </select>
                             {timeframe === 'custom' && (
                                 <div className="flex gap-1">
                                     <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="text-xs border rounded px-2 py-1" />
                                     <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="text-xs border rounded px-2 py-1" />
                                 </div>
                             )}
                         </div>
                     </div>

                     {/* Key Metrics Grid */}
                     <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
                         {/* Spend */}
                         <div className="p-6 hover:bg-slate-50 transition-colors">
                             <div className="flex items-center gap-2 text-slate-500 mb-2">
                                 <Wallet size={16} />
                                 <span className="text-xs font-bold uppercase tracking-wider">Spend ({timeframe})</span>
                             </div>
                             <p className="text-2xl font-bold text-slate-800">${totalSpendPeriod.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                         </div>

                         {/* Impressions */}
                         <div className="p-6 hover:bg-slate-50 transition-colors">
                             <div className="flex items-center gap-2 text-slate-500 mb-2">
                                 <Eye size={16} />
                                 <span className="text-xs font-bold uppercase tracking-wider">Impressions</span>
                             </div>
                             <p className="text-2xl font-bold text-slate-800">{totalImpressionsPeriod.toLocaleString()}</p>
                             <p className="text-[10px] text-slate-400 mt-1">Total views on ads</p>
                         </div>

                         {/* Result / Purchase */}
                         <div className="p-6 hover:bg-slate-50 transition-colors">
                             <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                 <TrendingUp size={16} />
                                 <span className="text-xs font-bold uppercase tracking-wider">Purchases</span>
                             </div>
                             <p className="text-2xl font-bold text-emerald-600">{totalConversionsPeriod}</p>
                             <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                                 <span className="font-bold text-slate-600">${costPerResult.toFixed(2)}</span> per result
                             </div>
                         </div>

                         {/* Reach/Traffic */}
                         <div className="p-6 hover:bg-slate-50 transition-colors">
                             <div className="flex items-center gap-2 text-blue-600 mb-2">
                                 <MousePointerClick size={16} />
                                 <span className="text-xs font-bold uppercase tracking-wider">Clicks / Reach</span>
                             </div>
                             <p className="text-2xl font-bold text-blue-600">{totalReachPeriod.toLocaleString()}</p>
                         </div>
                     </div>
                     
                     {/* CHART CONTAINER (Visual fixed to Last 7 Days to keep UI clean, updated numbers in tooltip) */}
                     <div className="p-8">
                         <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Visual Trend (Last 7 Days)</h4>
                         <div className="relative h-72 border border-slate-100 bg-slate-50/50 rounded-xl p-6 shadow-inner overflow-x-auto">
                             {/* Background Grid Lines */}
                             <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none z-0">
                                <div className="w-full h-px bg-slate-200 border-t border-dashed"></div>
                                <div className="w-full h-px bg-slate-200 border-t border-dashed"></div>
                                <div className="w-full h-px bg-slate-200 border-t border-dashed"></div>
                                <div className="w-full h-px bg-slate-200 border-t border-dashed"></div>
                             </div>

                             {/* BARS */}
                             <div className="absolute inset-0 flex items-end justify-between px-10 pb-2 pt-10 gap-6 z-10 min-w-[600px]">
                                 {chartDays.map((day, idx) => {
                                     const stats = getChartStats(day);
                                     const heightPercent = maxChartSpend > 0 ? (stats.amount / maxChartSpend) * 100 : 0;
                                     
                                     return (
                                         <div key={idx} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                                             
                                             {/* The Bar Container */}
                                             <div className="relative w-full flex justify-center items-end" style={{ height: '100%' }}>
                                                 
                                                 {/* SALES BUBBLE - HIGH VISIBILITY */}
                                                 {stats.conversions > 0 && (
                                                     <div 
                                                        className="absolute z-20 flex flex-col items-center animate-in slide-in-from-bottom-2 fade-in transition-all duration-300 transform group-hover:scale-110" 
                                                        style={{ bottom: `calc(${Math.max(heightPercent, 5)}% + 12px)` }}
                                                     >
                                                         <div className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-full shadow-md flex items-center gap-1 border-2 border-white">
                                                             <Zap size={10} className="fill-white" /> {stats.conversions}
                                                         </div>
                                                     </div>
                                                 )}

                                                 {/* THE BAR */}
                                                 <div 
                                                    className="w-full max-w-[40px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md shadow-md group-hover:from-blue-500 group-hover:to-blue-300 transition-all relative cursor-pointer"
                                                    style={{ height: `${Math.max(heightPercent, 2)}%` }} // min 2% height visibility
                                                 >
                                                    {/* Tooltip on Hover */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-800 text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-2xl border border-slate-700 w-48 scale-95 group-hover:scale-100 origin-bottom">
                                                        <p className="text-xs font-bold text-center border-b border-slate-600 pb-2 mb-2 text-slate-200">{format(day, 'EEEE, MMM d')}</p>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-[10px]">
                                                                <span className="text-slate-400">Spend:</span>
                                                                <span className="text-white font-bold">${stats.amount.toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-[10px]">
                                                                <span className="text-slate-400">Sales:</span>
                                                                <span className="text-emerald-400 font-bold">{stats.conversions}</span>
                                                            </div>
                                                            <div className="flex justify-between text-[10px]">
                                                                <span className="text-slate-400">Impressions:</span>
                                                                <span className="text-blue-300 font-bold">{stats.impressions}</span>
                                                            </div>
                                                        </div>
                                                        {/* Arrow */}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
                                                    </div>
                                                 </div>
                                             </div>
                                             
                                             {/* Date Label */}
                                             <span className="text-[10px] font-bold text-slate-500 mt-3 uppercase tracking-wider">
                                                 {format(day, 'dd MMM')}
                                             </span>
                                         </div>
                                     );
                                 })}
                             </div>
                         </div>
                     </div>

                     {/* DETAILED BREAKDOWN TABLE (WITH PAGINATION) */}
                     <div className="border-t border-slate-100">
                         <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                 <List size={14} /> Daily Breakdown ({filteredTableData.length} Records)
                             </h4>
                         </div>
                         <div className="overflow-x-auto">
                             <table className="w-full text-left">
                                 <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                                     <tr>
                                         <th className="px-6 py-3">Date</th>
                                         <th className="px-6 py-3">Campaign / Details</th>
                                         <th className="px-6 py-3 text-right">Amount Spent</th>
                                         <th className="px-6 py-3 text-right">Impressions</th>
                                         <th className="px-6 py-3 text-right">Reach</th>
                                         <th className="px-6 py-3 text-right">Messages</th>
                                         <th className="px-6 py-3 text-right">Sales</th>
                                         <th className="px-6 py-3 text-right">Cost/Sale</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100">
                                     {paginatedTransactions.map(tx => (
                                         <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                             <td className="px-6 py-3 text-xs font-medium text-slate-700">
                                                 {format(tx.date, 'MMM d, yyyy')}
                                             </td>
                                             <td className="px-6 py-3 text-xs text-slate-600 font-medium max-w-[200px] truncate" title={tx.description}>
                                                 {tx.description.replace('Daily Ad Spend', '').replace(/\(.*\)/, '').replace(/^-/, '').trim() || 'General Campaign'}
                                             </td>
                                             <td className="px-6 py-3 text-right text-xs font-bold text-slate-800">
                                                 ${tx.amount.toFixed(2)}
                                             </td>
                                             <td className="px-6 py-3 text-right text-xs text-slate-500">
                                                 {tx.metadata?.impressions?.toLocaleString() || '-'}
                                             </td>
                                             <td className="px-6 py-3 text-right text-xs text-slate-500">
                                                 {tx.metadata?.reach?.toLocaleString() || '-'}
                                             </td>
                                             <td className="px-6 py-3 text-right text-xs text-slate-500">
                                                 {tx.metadata?.messages || '-'}
                                             </td>
                                             <td className="px-6 py-3 text-right text-xs font-bold text-emerald-600">
                                                 {tx.metadata?.conversions || '-'}
                                             </td>
                                             <td className="px-6 py-3 text-right text-xs text-slate-500">
                                                 {tx.metadata?.conversions && tx.metadata.conversions > 0 
                                                    ? `$${(tx.amount / tx.metadata.conversions).toFixed(2)}` 
                                                    : '-'}
                                             </td>
                                         </tr>
                                     ))}
                                     {paginatedTransactions.length === 0 && (
                                         <tr>
                                             <td colSpan={8} className="px-6 py-8 text-center text-xs text-slate-400">No detailed ad logs found for this period.</td>
                                         </tr>
                                     )}
                                 </tbody>
                             </table>
                         </div>
                         
                         {/* PAGINATION CONTROLS */}
                         {totalPages > 1 && (
                             <div className="px-6 py-3 border-t border-slate-100 flex justify-between items-center">
                                 <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                     <ChevronLeft size={14} /> Prev
                                 </button>
                                 <span className="text-[10px] text-slate-400 font-bold uppercase">Page {currentPage} of {totalPages}</span>
                                 <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                     Next <ChevronRight size={14} />
                                 </button>
                             </div>
                         )}
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
