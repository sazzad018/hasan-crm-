
import React, { useState, useEffect } from 'react';
import { Conversation, LeadStatus, PortalPermissions, Transaction, TransactionCategory, TransactionMetadata } from '../types';
import { ExternalLink, CreditCard, User, Users, Copy, ArrowRight, ShieldCheck, Edit3, X, Save, Trash2, Plus, Minus, RefreshCw, Lock, Mail, MapPin, Briefcase, Megaphone, AlertTriangle, TrendingUp, Monitor, MousePointer2, Eye, MessageCircle, DollarSign, Calendar, ListTodo, DownloadCloud, CheckSquare, Square, AlertCircle, Clock, Globe, Smartphone, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

interface ClientReportProps {
  conversations: Conversation[];
  onOpenPortal: (psid: string) => void;
  onUpdateClientProfile: (psid: string, data: Partial<Conversation>) => void;
  onManageBalance: (psid: string, amount: number, type: 'credit' | 'debit', description: string, category: TransactionCategory, metadata?: TransactionMetadata) => void;
  onDeleteTransaction: (psid: string, txId: string) => void;
  onEditTransaction: (psid: string, txId: string, updatedTx: Partial<Transaction>) => void;
  onAddTask: (psid: string, title: string, type: 'weekly' | 'monthly', priority: 'high' | 'medium' | 'low', deadline?: Date) => void;
  onDeleteTask: (psid: string, taskId: string) => void;
}

const ClientReport: React.FC<ClientReportProps> = ({ 
  conversations, 
  onOpenPortal, 
  onUpdateClientProfile,
  onManageBalance,
  onDeleteTransaction,
  onEditTransaction,
  onAddTask,
  onDeleteTask
}) => {
  // Filter only Active Clients
  const activeClients = conversations.filter(c => c.status === 'active_client');

  // MODAL STATE - Using ID instead of Object to ensure fresh data from props
  const [selectedClientPsid, setSelectedClientPsid] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'profile' | 'wallet' | 'tasks' | 'history' | 'permissions'>('profile');
  
  // Wallet Sub-tab State
  const [fundTab, setFundTab] = useState<'ad_spend' | 'manual'>('manual');

  // DERIVED STATE - This ensures modal always shows fresh data from props
  const selectedClient = conversations.find(c => c.psid === selectedClientPsid) || null;
  const isEditModalOpen = !!selectedClient;

  // FORM STATES
  const [editForm, setEditForm] = useState({
      userName: '',
      extractedMobile: '',
      extractedWebsite: '',
      clientEmail: '',
      clientAddress: '',
      servicePackage: ''
  });

  const [walletForm, setWalletForm] = useState({
      amount: '',
      type: 'credit' as 'credit' | 'debit',
      description: '',
      category: 'other' as TransactionCategory
  });

  // Dedicated Ad Spend Form State
  const [adSpendForm, setAdSpendForm] = useState({
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      impressions: '',
      reach: '',
      messages: '',
      conversions: ''
  });

  // Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<'weekly' | 'monthly'>('weekly');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  // Transaction Edit State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editTxForm, setEditTxForm] = useState({
      date: '',
      time: '',
      amount: '',
      type: 'credit',
      description: '',
      category: 'other',
      impressions: '',
      reach: '',
      messages: '',
      conversions: ''
  });

  const [permissionsForm, setPermissionsForm] = useState<PortalPermissions>({
      viewBalance: true,
      allowTopUp: true,
      viewHistory: true
  });
  
  const [portalSettingsForm, setPortalSettingsForm] = useState({
      portalAnnouncement: '',
      isPortalSuspended: false
  });

  const copyLink = (psid: string) => {
      const url = `https://portal.agency.com/u/${psid}`;
      navigator.clipboard.writeText(url);
      alert(`Magic Link copied: ${url}`);
  };

  const openEditModal = (client: Conversation) => {
      setSelectedClientPsid(client.psid);
      
      // Initialize forms with snapshot data
      setEditForm({
          userName: client.userName,
          extractedMobile: client.extractedMobile || '',
          extractedWebsite: client.extractedWebsite || '',
          clientEmail: client.clientEmail || '',
          clientAddress: client.clientAddress || '',
          servicePackage: client.servicePackage || ''
      });
      // Set permissions default or existing
      setPermissionsForm(client.portalPermissions || {
          viewBalance: true,
          allowTopUp: true,
          viewHistory: true
      });
      
      setPortalSettingsForm({
          portalAnnouncement: client.portalAnnouncement || '',
          isPortalSuspended: client.isPortalSuspended || false
      });
      
      // Reset states
      setEditingTx(null);
      setActiveModalTab('profile');
      setFundTab('manual');
      // Reset Wallet Forms
      setWalletForm({ amount: '', type: 'credit', description: '', category: 'other' });
      setAdSpendForm({ amount: '', date: format(new Date(), 'yyyy-MM-dd'), impressions: '', reach: '', messages: '', conversions: '' });
      setNewTaskTitle('');
  };

  const closeEditModal = () => {
      setSelectedClientPsid(null);
  };

  const startEditTx = (tx: Transaction) => {
      setEditingTx(tx);
      setEditTxForm({
          date: format(tx.date, 'yyyy-MM-dd'),
          time: format(tx.date, 'HH:mm'),
          amount: tx.amount.toString(),
          type: tx.type,
          description: tx.description,
          category: tx.category || 'other',
          impressions: tx.metadata?.impressions?.toString() || '',
          reach: tx.metadata?.reach?.toString() || '',
          messages: tx.metadata?.messages?.toString() || '',
          conversions: tx.metadata?.conversions?.toString() || ''
      });
  };

  const saveEditTx = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedClient || !editingTx) return;
      
      // Construct date
      const newDate = new Date(`${editTxForm.date}T${editTxForm.time}`);
      
      const metadata: TransactionMetadata = {
          impressions: editTxForm.impressions ? parseInt(editTxForm.impressions) : undefined,
          reach: editTxForm.reach ? parseInt(editTxForm.reach) : undefined,
          messages: editTxForm.messages ? parseInt(editTxForm.messages) : undefined,
          conversions: editTxForm.conversions ? parseInt(editTxForm.conversions) : undefined,
      };
  
      onEditTransaction(selectedClient.psid, editingTx.id, {
          date: newDate,
          amount: parseFloat(editTxForm.amount),
          type: editTxForm.type as 'credit' | 'debit',
          description: editTxForm.description,
          category: editTxForm.category as TransactionCategory,
          metadata
      });
      
      setEditingTx(null);
      alert('Transaction updated successfully!');
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedClient) return;
      
      onUpdateClientProfile(selectedClient.psid, editForm);
      alert("Profile updated!");
  };

  const handlePermissionsUpdate = (e: React.FormEvent) => {
      e.preventDefault();
      if(!selectedClient) return;

      onUpdateClientProfile(selectedClient.psid, { 
          portalPermissions: permissionsForm,
          portalAnnouncement: portalSettingsForm.portalAnnouncement,
          isPortalSuspended: portalSettingsForm.isPortalSuspended
      });
      alert("Permissions & Settings updated!");
  };

  const handleBalanceUpdate = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedClient || !walletForm.amount) return;

      onManageBalance(selectedClient.psid, parseFloat(walletForm.amount), walletForm.type, walletForm.description || (walletForm.type === 'credit' ? 'Deposit' : 'Expense'), walletForm.category);
      
      // Reset form but keep modal open to see change
      setWalletForm({ amount: '', type: 'credit', description: '', category: 'other' });
      // The balance UI will auto-update because 'selectedClient' is derived from props
  };

  const handleQuickAdSpend = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedClient || !adSpendForm.amount) return;
      
      const description = `Daily Ad Spend (${format(new Date(adSpendForm.date), 'MMM d')})`;
      const metadata: TransactionMetadata = {
          impressions: adSpendForm.impressions ? parseInt(adSpendForm.impressions) : undefined,
          reach: adSpendForm.reach ? parseInt(adSpendForm.reach) : undefined,
          messages: adSpendForm.messages ? parseInt(adSpendForm.messages) : undefined,
          conversions: adSpendForm.conversions ? parseInt(adSpendForm.conversions) : undefined,
      };

      onManageBalance(selectedClient.psid, parseFloat(adSpendForm.amount), 'debit', description, 'ad_spend', metadata);
      
      setAdSpendForm({ 
          amount: '', date: format(new Date(), 'yyyy-MM-dd'),
          impressions: '', reach: '', messages: '', conversions: ''
      });
      
      alert('Ad spend recorded successfully!');
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedClient || !newTaskTitle) return;
      
      const deadline = newTaskDeadline ? new Date(newTaskDeadline) : undefined;
      
      onAddTask(selectedClient.psid, newTaskTitle, newTaskType, newTaskPriority, deadline);
      setNewTaskTitle('');
      setNewTaskDeadline('');
  };

  // CSV DOWNLOAD LOGIC
  const downloadHistoryCSV = () => {
      if (!selectedClient || !selectedClient.transactions) return;

      const headers = ['Date', 'Type', 'Amount', 'Category', 'Description', 'Impressions', 'Reach', 'Messages', 'Sales/Conversions'];
      const rows = selectedClient.transactions.map(tx => [
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
      link.setAttribute("download", `client_history_${selectedClient.userName}_${format(new Date(), 'yyyyMMdd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const renderTaskItem = (task: any) => {
      const priorityColor = task.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' : 
                            task.priority === 'low' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200';
      
      return (
          <div key={task.id} className={`bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-3 shadow-sm ${task.priority === 'high' ? 'border-l-4 border-l-red-500' : ''}`}>
              <div className="mt-0.5">
                  {task.isCompleted ? <CheckSquare className="text-emerald-500" size={18} /> : <Square className="text-slate-300" size={18} />}
              </div>
              <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-medium ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${priorityColor}`}>
                        {task.priority || 'Medium'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-slate-400">Assign: {format(task.assignedDate, 'MMM d')}</p>
                      {task.deadline && (
                          <p className="text-[10px] text-red-500 font-bold flex items-center gap-0.5">
                              <Clock size={10} /> Due: {format(task.deadline, 'MMM d')}
                          </p>
                      )}
                  </div>
              </div>
              <button onClick={() => onDeleteTask(selectedClient!.psid, task.id)} className="text-slate-300 hover:text-red-500">
                  <Trash2 size={16} />
              </button>
          </div>
      );
  };

  return (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
             <div className="relative z-10">
                 <h2 className="text-3xl font-bold mb-1">{activeClients.length}</h2>
                 <p className="text-violet-200 text-sm font-medium uppercase tracking-wider">Active Clients</p>
             </div>
             <User size={100} className="absolute -right-4 -bottom-4 text-white opacity-10" />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <CreditCard size={24} />
                 </div>
                 <h3 className="font-bold text-slate-700">Total Funds</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">
                 ${activeClients.reduce((sum, c) => sum + (c.walletBalance || 0), 0).toFixed(2)}
             </p>
             <p className="text-xs text-slate-500 mt-1">Combined wallet balance</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <ShieldCheck size={24} />
                 </div>
                 <h3 className="font-bold text-slate-700">Portal Security</h3>
             </div>
             <p className="text-sm text-slate-600 leading-relaxed">
                 All portals are secured via <span className="font-bold text-slate-800">Magic Links</span>. No passwords required for clients.
             </p>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
             <h3 className="font-bold text-slate-800">Client Portfolio List</h3>
         </div>
         
         <div className="overflow-x-auto">
             <table className="w-full text-left">
                 <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                     <tr>
                         <th className="px-6 py-4">Client Name</th>
                         <th className="px-6 py-4">Service & Contact</th>
                         <th className="px-6 py-4">Current Balance</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                     {activeClients.length > 0 ? (
                         activeClients.map(client => (
                             <tr key={client.psid} className="hover:bg-slate-50 transition-colors group">
                                 <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold">
                                             {client.userName.charAt(0)}
                                         </div>
                                         <div>
                                             <p className="font-bold text-slate-800">{client.userName}</p>
                                             <p className="text-xs text-slate-400 font-mono">ID: {client.psid}</p>
                                         </div>
                                     </div>
                                 </td>
                                 <td className="px-6 py-4 text-sm text-slate-600">
                                     <div className="flex flex-col">
                                         <span className="font-bold text-violet-700 text-xs mb-1">
                                             {client.servicePackage || 'Standard Plan'}
                                         </span>
                                         <span>{client.extractedMobile || 'N/A'}</span>
                                         <span className="text-xs text-slate-400">{client.extractedWebsite || ''}</span>
                                     </div>
                                 </td>
                                 <td className="px-6 py-4">
                                     <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                         ${(client.walletBalance || 0).toFixed(2)}
                                     </span>
                                 </td>
                                 <td className="px-6 py-4 text-sm">
                                     {client.isPortalSuspended ? (
                                         <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                             <Lock size={12} /> Suspended
                                         </span>
                                     ) : (
                                         <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                                             <ShieldCheck size={12} /> Active
                                         </span>
                                     )}
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                     <div className="flex items-center justify-end gap-2">
                                         <button 
                                            onClick={() => openEditModal(client)}
                                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                                         >
                                             <Edit3 size={14} /> Manage
                                         </button>
                                         <button 
                                            onClick={() => copyLink(client.psid)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Copy Link"
                                         >
                                             <Copy size={16} />
                                         </button>
                                         <button 
                                            onClick={() => onOpenPortal(client.psid)}
                                            className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                            title="Open Portal View"
                                         >
                                             <ExternalLink size={16} />
                                         </button>
                                     </div>
                                 </td>
                             </tr>
                         ))
                     ) : (
                         <tr>
                             <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                 No active clients found. Move leads to 'Active Client' status to see them here.
                             </td>
                         </tr>
                     )}
                 </tbody>
             </table>
         </div>
      </div>

      {/* MANAGE CLIENT MODAL */}
      {isEditModalOpen && selectedClient && (
          <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center animate-in fade-in duration-200 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden h-[85vh] flex flex-col">
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">
                             {selectedClient.userName.charAt(0)}
                         </div>
                         <div>
                             <h3 className="font-bold text-slate-800 text-lg">Manage Client</h3>
                             <p className="text-xs text-slate-500">{selectedClient.userName} • {selectedClient.psid}</p>
                         </div>
                      </div>
                      <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200">
                          <X size={20} />
                      </button>
                  </div>

                  {/* Modal Tabs */}
                  <div className="flex border-b border-slate-200 overflow-x-auto bg-white">
                      <button 
                        onClick={() => setActiveModalTab('profile')}
                        className={`flex-1 min-w-[100px] py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeModalTab === 'profile' ? 'border-violet-600 text-violet-600 bg-violet-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                      >
                          <User size={16} /> Profile
                      </button>
                      <button 
                        onClick={() => setActiveModalTab('wallet')}
                        className={`flex-1 min-w-[100px] py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeModalTab === 'wallet' ? 'border-violet-600 text-violet-600 bg-violet-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                      >
                          <CreditCard size={16} /> Funds
                      </button>
                      <button 
                        onClick={() => setActiveModalTab('tasks')}
                        className={`flex-1 min-w-[100px] py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeModalTab === 'tasks' ? 'border-violet-600 text-violet-600 bg-violet-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                      >
                          <ListTodo size={16} /> Growth Plan
                      </button>
                      <button 
                        onClick={() => setActiveModalTab('history')}
                        className={`flex-1 min-w-[100px] py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeModalTab === 'history' ? 'border-violet-600 text-violet-600 bg-violet-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                      >
                          <RefreshCw size={16} /> History
                      </button>
                      <button 
                        onClick={() => setActiveModalTab('permissions')}
                        className={`flex-1 min-w-[100px] py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeModalTab === 'permissions' ? 'border-violet-600 text-violet-600 bg-violet-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                      >
                          <Lock size={16} /> Access
                      </button>
                  </div>

                  {/* Modal Content Area */}
                  <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
                      
                      {/* 1. PROFILE TAB - NEW DESIGN */}
                      {activeModalTab === 'profile' && (
                          <div className="flex flex-col md:flex-row gap-6 h-full">
                              {/* Left Column: Avatar & Summary */}
                              <div className="w-full md:w-1/3 space-y-4">
                                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                                      <div className="absolute top-0 w-full h-16 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
                                      
                                      {/* Avatar */}
                                      <div className="w-24 h-24 rounded-full bg-white text-violet-600 flex items-center justify-center text-4xl font-bold mb-3 shadow-lg border-4 border-white relative z-10 mt-4">
                                          {selectedClient.userName.charAt(0)}
                                      </div>
                                      <h3 className="font-bold text-slate-800 text-lg">{selectedClient.userName}</h3>
                                      <p className="text-sm text-slate-500 mb-4">{selectedClient.servicePackage || 'No Plan Active'}</p>
                                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${selectedClient.status === 'active_client' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                          {selectedClient.status.replace('_', ' ').toUpperCase()}
                                      </div>
                                  </div>
                                  
                                  {/* Contact Quick View */}
                                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-sm space-y-4">
                                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Details</h4>
                                      <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                          <Mail size={16} className="text-violet-500" /> 
                                          <span className="truncate">{selectedClient.clientEmail || 'No Email'}</span>
                                      </div>
                                      <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                          <Smartphone size={16} className="text-emerald-500" /> 
                                          <span>{selectedClient.extractedMobile || 'No Phone'}</span>
                                      </div>
                                      <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                          <Globe size={16} className="text-blue-500" /> 
                                          <a href={selectedClient.extractedWebsite} target="_blank" rel="noreferrer" className="truncate hover:underline hover:text-blue-600">{selectedClient.extractedWebsite || 'No Website'}</a>
                                      </div>
                                  </div>
                              </div>

                              {/* Right Column: Edit Form */}
                              <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-y-auto">
                                  <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                      <Edit2 size={18} className="text-violet-600"/> Edit Client Information
                                  </h4>
                                  <form onSubmit={handleProfileUpdate} className="space-y-5">
                                      <div className="grid grid-cols-2 gap-5">
                                          <div>
                                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Client Name</label>
                                              <input 
                                                  value={editForm.userName}
                                                  onChange={(e) => setEditForm({...editForm, userName: e.target.value})}
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all"
                                              />
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 flex items-center gap-1">
                                                  <Briefcase size={12} /> Service Package
                                              </label>
                                              <input 
                                                  value={editForm.servicePackage}
                                                  onChange={(e) => setEditForm({...editForm, servicePackage: e.target.value})}
                                                  placeholder="e.g. Gold SEO Plan"
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all"
                                              />
                                          </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-5">
                                          <div>
                                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Mobile Number</label>
                                              <input 
                                                  value={editForm.extractedMobile}
                                                  onChange={(e) => setEditForm({...editForm, extractedMobile: e.target.value})}
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all"
                                              />
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 flex items-center gap-1">
                                                  <Mail size={12} /> Email Address
                                              </label>
                                              <input 
                                                  value={editForm.clientEmail}
                                                  onChange={(e) => setEditForm({...editForm, clientEmail: e.target.value})}
                                                  placeholder="client@email.com"
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all"
                                              />
                                          </div>
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 flex items-center gap-1">
                                              <MapPin size={12} /> Billing Address
                                          </label>
                                          <input 
                                              value={editForm.clientAddress}
                                              onChange={(e) => setEditForm({...editForm, clientAddress: e.target.value})}
                                              placeholder="Full address..."
                                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all"
                                          />
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Website</label>
                                          <input 
                                              value={editForm.extractedWebsite}
                                              onChange={(e) => setEditForm({...editForm, extractedWebsite: e.target.value})}
                                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all"
                                          />
                                      </div>
                                      <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2 mt-4">
                                          <Save size={18} /> Save Profile Changes
                                      </button>
                                  </form>
                              </div>
                          </div>
                      )}

                      {/* 2. WALLET TAB - NEW DESIGN */}
                      {activeModalTab === 'wallet' && (
                          <div className="space-y-6 max-w-2xl mx-auto">
                              
                              {/* Virtual Card */}
                              <div className="relative h-48 rounded-2xl overflow-hidden shadow-2xl bg-slate-900 text-white p-7 flex flex-col justify-between transform transition-transform hover:scale-[1.01]">
                                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-900 to-slate-900 opacity-90"></div>
                                  {/* Decorative Circles */}
                                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500 opacity-20 rounded-full blur-xl"></div>

                                  <div className="relative z-10 flex justify-between items-start">
                                      <div>
                                          <p className="text-violet-200 text-xs font-bold uppercase tracking-[0.2em] mb-1">Total Balance</p>
                                          <h2 className="text-4xl font-bold tracking-tight text-white drop-shadow-sm">${(selectedClient.walletBalance || 0).toFixed(2)}</h2>
                                      </div>
                                      <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                                          <span className="text-xs font-bold tracking-wider text-violet-100">PREPAID</span>
                                      </div>
                                  </div>

                                  <div className="relative z-10 flex justify-between items-end">
                                      <div>
                                          <p className="text-xs text-slate-400 font-mono mb-1">{selectedClient.psid.match(/.{1,4}/g)?.join(' ') || '0000 0000 0000 0000'}</p>
                                          <p className="text-sm font-bold tracking-wide">{selectedClient.userName.toUpperCase()}</p>
                                      </div>
                                      <CreditCard size={36} className="text-violet-200 opacity-80" />
                                  </div>
                              </div>

                              {/* Actions Area */}
                              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                  {/* Tab Switcher */}
                                  <div className="flex border-b border-slate-100">
                                      <button 
                                          onClick={() => setFundTab('manual')}
                                          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${fundTab === 'manual' ? 'bg-white text-slate-800 border-b-2 border-slate-800' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                      >
                                          <DollarSign size={16} /> Fund Adjustment
                                      </button>
                                      <button 
                                          onClick={() => setFundTab('ad_spend')}
                                          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${fundTab === 'ad_spend' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                      >
                                          <TrendingUp size={16} /> Record Ad Spend
                                      </button>
                                  </div>

                                  <div className="p-6">
                                      {fundTab === 'manual' ? (
                                          // Manual Form Redesigned
                                          <form onSubmit={handleBalanceUpdate} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                              <div className="flex gap-4">
                                                  <label className={`flex-1 cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${walletForm.type === 'credit' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-100 hover:border-slate-300'}`}>
                                                      <input type="radio" name="type" className="hidden" checked={walletForm.type === 'credit'} onChange={() => setWalletForm({...walletForm, type: 'credit'})} />
                                                      <div className={`p-2 rounded-full ${walletForm.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                          <Plus size={20} />
                                                      </div>
                                                      <span className={`text-xs font-bold tracking-wide ${walletForm.type === 'credit' ? 'text-emerald-800' : 'text-slate-500'}`}>ADD FUNDS</span>
                                                  </label>
                                                  <label className={`flex-1 cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${walletForm.type === 'debit' ? 'border-red-500 bg-red-50 shadow-sm' : 'border-slate-100 hover:border-slate-300'}`}>
                                                      <input type="radio" name="type" className="hidden" checked={walletForm.type === 'debit'} onChange={() => setWalletForm({...walletForm, type: 'debit'})} />
                                                      <div className={`p-2 rounded-full ${walletForm.type === 'debit' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                                                          <Minus size={20} />
                                                      </div>
                                                      <span className={`text-xs font-bold tracking-wide ${walletForm.type === 'debit' ? 'text-red-800' : 'text-slate-500'}`}>DEDUCT</span>
                                                  </label>
                                              </div>
                                              
                                              <div>
                                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Amount ($)</label>
                                                  <div className="relative">
                                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                      <input 
                                                          type="number"
                                                          step="0.01"
                                                          required
                                                          value={walletForm.amount}
                                                          onChange={(e) => setWalletForm({...walletForm, amount: e.target.value})}
                                                          className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-slate-800 outline-none transition-all"
                                                          placeholder="0.00"
                                                      />
                                                  </div>
                                              </div>

                                              <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Category</label>
                                                      <select 
                                                          value={walletForm.category}
                                                          onChange={(e) => setWalletForm({...walletForm, category: e.target.value as TransactionCategory})}
                                                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-800 outline-none bg-white font-medium"
                                                      >
                                                          <option value="other">General / Other</option>
                                                          <option value="payment">Deposit / Payment</option>
                                                          <option value="web_dev">Web Development</option>
                                                          <option value="service_fee">Service Fee</option>
                                                      </select>
                                                  </div>
                                                  <div>
                                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Description</label>
                                                      <input 
                                                          required
                                                          value={walletForm.description}
                                                          onChange={(e) => setWalletForm({...walletForm, description: e.target.value})}
                                                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-800 outline-none font-medium"
                                                          placeholder="Short note..."
                                                      />
                                                  </div>
                                              </div>
                                              
                                              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl mt-2">
                                                  Confirm Transaction
                                              </button>
                                          </form>
                                      ) : (
                                          // Ad Spend Form Redesigned
                                          <form onSubmit={handleQuickAdSpend} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                              <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                      <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1 ml-1">Date</label>
                                                      <input 
                                                          type="date"
                                                          required
                                                          value={adSpendForm.date}
                                                          onChange={(e) => setAdSpendForm({...adSpendForm, date: e.target.value})}
                                                          className="w-full border border-blue-100 bg-blue-50/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                                                      />
                                                  </div>
                                                  <div>
                                                      <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1 ml-1">Daily Cost ($)</label>
                                                      <input 
                                                          type="number"
                                                          step="0.01"
                                                          required
                                                          value={adSpendForm.amount}
                                                          onChange={(e) => setAdSpendForm({...adSpendForm, amount: e.target.value})}
                                                          className="w-full border border-blue-100 bg-blue-50/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                                                          placeholder="0.00"
                                                      />
                                                  </div>
                                              </div>
                                              
                                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Performance Metrics (Optional)</p>
                                                  <div className="grid grid-cols-2 gap-4">
                                                      <div>
                                                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Impressions</label>
                                                          <div className="relative">
                                                              <Eye size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                              <input 
                                                                  type="number"
                                                                  value={adSpendForm.impressions}
                                                                  onChange={(e) => setAdSpendForm({...adSpendForm, impressions: e.target.value})}
                                                                  className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                                                  placeholder="0"
                                                              />
                                                          </div>
                                                      </div>
                                                      <div>
                                                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reach</label>
                                                          <div className="relative">
                                                              <Users size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                              <input 
                                                                  type="number"
                                                                  value={adSpendForm.reach}
                                                                  onChange={(e) => setAdSpendForm({...adSpendForm, reach: e.target.value})}
                                                                  className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                                                  placeholder="0"
                                                              />
                                                          </div>
                                                      </div>
                                                      <div>
                                                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Messages</label>
                                                          <div className="relative">
                                                              <MessageCircle size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                              <input 
                                                                  type="number"
                                                                  value={adSpendForm.messages}
                                                                  onChange={(e) => setAdSpendForm({...adSpendForm, messages: e.target.value})}
                                                                  className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                                                  placeholder="0"
                                                              />
                                                          </div>
                                                      </div>
                                                      <div>
                                                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-emerald-600">Sales/Conv.</label>
                                                          <div className="relative">
                                                              <TrendingUp size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                                              <input 
                                                                  type="number"
                                                                  value={adSpendForm.conversions}
                                                                  onChange={(e) => setAdSpendForm({...adSpendForm, conversions: e.target.value})}
                                                                  className="w-full border border-emerald-200 bg-emerald-50/50 rounded-lg pl-8 pr-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none font-bold text-emerald-800"
                                                                  placeholder="0"
                                                              />
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>

                                              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-200/50 transition-all">
                                                  <TrendingUp size={16} /> Record Daily Performance
                                              </button>
                                          </form>
                                      )}
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* 3. TASKS TAB - IMPLEMENTED & FIXED VISIBILITY */}
                      {activeModalTab === 'tasks' && (
                          <div className="flex flex-col md:flex-row gap-6">
                              {/* New Task Form */}
                              <div className="w-full md:w-1/3 space-y-4">
                                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                      <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                                          <Plus size={16} className="text-blue-600" /> Assign New Task
                                      </h4>
                                      <form onSubmit={handleAddTaskSubmit} className="space-y-4">
                                          <div>
                                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Task Title</label>
                                              <input 
                                                  required
                                                  value={newTaskTitle}
                                                  onChange={(e) => setNewTaskTitle(e.target.value)}
                                                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                  placeholder="e.g. Upload new logo"
                                              />
                                          </div>
                                          <div className="grid grid-cols-2 gap-3">
                                              <div>
                                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                                                  <select 
                                                      value={newTaskType}
                                                      onChange={(e) => setNewTaskType(e.target.value as any)}
                                                      className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white"
                                                  >
                                                      <option value="weekly">Weekly Focus</option>
                                                      <option value="monthly">Monthly Goal</option>
                                                  </select>
                                              </div>
                                              <div>
                                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Priority</label>
                                                  <select 
                                                      value={newTaskPriority}
                                                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                                                      className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white"
                                                  >
                                                      <option value="high">High 🔥</option>
                                                      <option value="medium">Medium</option>
                                                      <option value="low">Low</option>
                                                  </select>
                                              </div>
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deadline</label>
                                              <input 
                                                  type="date"
                                                  value={newTaskDeadline}
                                                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                                                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                              />
                                          </div>
                                          <button type="submit" className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-black transition-colors">
                                              Add Task
                                          </button>
                                      </form>
                                  </div>
                              </div>

                              {/* Task List */}
                              <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                  <h4 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                                      <span>Current Growth Plan</span>
                                      <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">
                                          {selectedClient.tasks?.length || 0} Tasks
                                      </span>
                                  </h4>
                                  
                                  <div className="space-y-3">
                                      {selectedClient.tasks && selectedClient.tasks.length > 0 ? (
                                          selectedClient.tasks.map(renderTaskItem)
                                      ) : (
                                          <div className="text-center py-10 text-slate-400">
                                              <ListTodo size={32} className="mx-auto mb-2 opacity-20" />
                                              <p>No tasks assigned yet.</p>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* 4. HISTORY TAB - IMPLEMENTED */}
                      {activeModalTab === 'history' && (
                          <div className="space-y-6">
                              {/* Quick Stats Row */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                      <p className="text-xs text-slate-500 uppercase font-bold">Total Spent</p>
                                      <p className="text-xl font-bold text-slate-800">
                                          ${(selectedClient.transactions?.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0) || 0).toLocaleString()}
                                      </p>
                                  </div>
                                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                      <p className="text-xs text-slate-500 uppercase font-bold">Total Deposited</p>
                                      <p className="text-xl font-bold text-emerald-600">
                                          ${(selectedClient.transactions?.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0) || 0).toLocaleString()}
                                      </p>
                                  </div>
                                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                      <p className="text-xs text-slate-500 uppercase font-bold">Total Sales</p>
                                      <p className="text-xl font-bold text-blue-600">
                                          {(selectedClient.transactions?.reduce((sum, t) => sum + (t.metadata?.conversions || 0), 0) || 0).toLocaleString()}
                                      </p>
                                  </div>
                                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                                      <button 
                                          onClick={downloadHistoryCSV}
                                          className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                                      >
                                          <DownloadCloud size={20} /> Download CSV
                                      </button>
                                  </div>
                              </div>

                              {/* Transaction Table */}
                              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                  <table className="w-full text-left">
                                      <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                          <tr>
                                              <th className="px-6 py-3">Date</th>
                                              <th className="px-6 py-3">Description</th>
                                              <th className="px-6 py-3">Amount</th>
                                              <th className="px-6 py-3 text-right">Actions</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                          {selectedClient.transactions && selectedClient.transactions.length > 0 ? (
                                              selectedClient.transactions.map(tx => (
                                                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                                      <td className="px-6 py-3 text-sm text-slate-600">
                                                          {format(tx.date, 'MMM d, yyyy')}
                                                          <div className="text-[10px] text-slate-400">{format(tx.date, 'h:mm a')}</div>
                                                      </td>
                                                      <td className="px-6 py-3">
                                                          <p className="text-sm font-medium text-slate-800">{tx.description}</p>
                                                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase font-bold tracking-wider">{tx.category}</span>
                                                      </td>
                                                      <td className={`px-6 py-3 font-bold text-sm ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                          {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                                                      </td>
                                                      <td className="px-6 py-3 text-right">
                                                          <div className="flex justify-end gap-2">
                                                              {/* Edit functionality could be expanded here */}
                                                              <button onClick={() => onDeleteTransaction(selectedClient.psid, tx.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                                                  <Trash2 size={16} />
                                                              </button>
                                                          </div>
                                                      </td>
                                                  </tr>
                                              ))
                                          ) : (
                                              <tr>
                                                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                                      No transactions found.
                                                  </td>
                                              </tr>
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      )}
                      
                      {/* 5. PERMISSIONS & SETTINGS TAB */}
                      {activeModalTab === 'permissions' && (
                          <form onSubmit={handlePermissionsUpdate} className="space-y-4">
                              
                              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl space-y-3">
                                  <h4 className="font-bold text-orange-900 text-sm flex items-center gap-2">
                                      <AlertTriangle size={16} /> Admin Controls
                                  </h4>
                                  
                                  <div className="flex items-center justify-between">
                                      <div>
                                          <h4 className="font-bold text-slate-800 text-sm">Suspend Portal Access</h4>
                                          <p className="text-xs text-slate-500">Lock client out of the portal immediately.</p>
                                      </div>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                          <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={portalSettingsForm.isPortalSuspended}
                                            onChange={(e) => setPortalSettingsForm({...portalSettingsForm, isPortalSuspended: e.target.checked})}
                                          />
                                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                      </label>
                                  </div>
                                  
                                  <div>
                                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                                          <Megaphone size={12} /> Dashboard Announcement
                                      </label>
                                      <textarea 
                                          value={portalSettingsForm.portalAnnouncement}
                                          onChange={(e) => setPortalSettingsForm({...portalSettingsForm, portalAnnouncement: e.target.value})}
                                          placeholder="Enter a message to show on the client's dashboard..."
                                          className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none h-20"
                                      />
                                  </div>
                              </div>

                              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
                                  <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Client Permissions</h4>
                                  <div className="flex items-center justify-between">
                                      <div>
                                          <h4 className="font-bold text-slate-800 text-sm">View Wallet Balance</h4>
                                          <p className="text-xs text-slate-500">Allow client to see their current fund balance.</p>
                                      </div>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                          <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={permissionsForm.viewBalance}
                                            onChange={(e) => setPermissionsForm({...permissionsForm, viewBalance: e.target.checked})}
                                          />
                                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                      </label>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                      <div>
                                          <h4 className="font-bold text-slate-800 text-sm">Allow Online Top-up</h4>
                                          <p className="text-xs text-slate-500">Enable the "Add Funds" button in the portal.</p>
                                      </div>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                          <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={permissionsForm.allowTopUp}
                                            onChange={(e) => setPermissionsForm({...permissionsForm, allowTopUp: e.target.checked})}
                                          />
                                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                      </label>
                                  </div>

                                  <div className="flex items-center justify-between">
                                      <div>
                                          <h4 className="font-bold text-slate-800 text-sm">View Transaction History</h4>
                                          <p className="text-xs text-slate-500">Show list of past deposits and expenses.</p>
                                      </div>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                          <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={permissionsForm.viewHistory}
                                            onChange={(e) => setPermissionsForm({...permissionsForm, viewHistory: e.target.checked})}
                                          />
                                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                      </label>
                                  </div>
                              </div>
                              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-lg">
                                  Save Access Settings
                              </button>
                          </form>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ClientReport;
