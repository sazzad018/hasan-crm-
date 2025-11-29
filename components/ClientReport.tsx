
import React, { useState } from 'react';
import { Conversation, LeadStatus, PortalPermissions, Transaction, TransactionCategory, TransactionMetadata, LowBalanceConfig, InvoiceRecord, DripSequence, AttachmentType } from '../types';
import { ExternalLink, CreditCard, User, Users, Copy, ArrowRight, ShieldCheck, Edit3, X, Save, Trash2, Plus, Minus, RefreshCw, Lock, Mail, MapPin, Briefcase, Megaphone, AlertTriangle, TrendingUp, Monitor, MousePointer2, Eye, MessageCircle, DollarSign, Calendar, ListTodo, DownloadCloud, CheckSquare, Square, AlertCircle, Clock, Globe, Smartphone, Edit2, BarChart3, FileText, Receipt, CheckCircle, Info, Bell, Zap, PauseCircle, PlayCircle, Send, Archive, Share2, Link, QrCode } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface ClientReportProps {
  conversations: Conversation[];
  dripSequences?: DripSequence[]; 
  onOpenPortal: (psid: string) => void;
  onUpdateClientProfile: (psid: string, data: Partial<Conversation>) => void;
  onManageBalance: (psid: string, amount: number, type: 'credit' | 'debit', description: string, category: TransactionCategory, metadata?: TransactionMetadata, date?: Date) => void;
  onDeleteTransaction: (psid: string, txId: string) => void;
  onEditTransaction: (psid: string, txId: string, updatedTx: Partial<Transaction>) => void;
  onAddTask: (psid: string, title: string, type: 'weekly' | 'monthly', priority: 'high' | 'medium' | 'low', deadline?: Date) => void;
  onDeleteTask: (psid: string, taskId: string) => void;
  onSendMessage?: (psid: string, text: string, attachmentType?: AttachmentType) => void; 
}

const ClientReport: React.FC<ClientReportProps> = ({ 
  conversations, 
  dripSequences = [],
  onOpenPortal, 
  onUpdateClientProfile,
  onManageBalance,
  onDeleteTransaction,
  onEditTransaction,
  onAddTask,
  onDeleteTask,
  onSendMessage
}) => {
  // VIEW MODE STATE
  const [viewMode, setViewMode] = useState<'active' | 'past'>('active');

  // Filter Clients
  const activeClients = conversations.filter(c => c.status === 'active_client' || c.status === 'converted');
  const pastClients = conversations.filter(c => c.status === 'past_client');

  // MODAL STATE
  const [selectedClientPsid, setSelectedClientPsid] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'profile' | 'wallet' | 'tasks' | 'invoices' | 'history' | 'permissions'>('profile');
  
  // Wallet Sub-tab State
  const [fundTab, setFundTab] = useState<'ad_spend' | 'manual'>('manual');

  // Transaction Confirmation States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<{
      source: 'manual' | 'ad_spend';
      payload: any;
  } | null>(null);

  // NEW: Win-Back Message Modal State
  const [winBackClient, setWinBackClient] = useState<Conversation | null>(null);
  const [winBackMessage, setWinBackMessage] = useState('');

  // NEW: Share Portal Modal State
  const [portalShareClient, setPortalShareClient] = useState<Conversation | null>(null);

  // DERIVED STATE
  const selectedClient = conversations.find(c => c.psid === selectedClientPsid) || null;
  const isEditModalOpen = !!selectedClient;

  // FORM STATES (Existing...)
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
      category: 'other' as TransactionCategory,
      date: format(new Date(), 'yyyy-MM-dd')
  });

  const [adSpendForm, setAdSpendForm] = useState({
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      impressions: '',
      reach: '',
      messages: '',
      conversions: '',
      note: '' 
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<'weekly' | 'monthly'>('weekly');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  const [permissionsForm, setPermissionsForm] = useState<PortalPermissions>({
      viewBalance: true,
      allowTopUp: true,
      viewHistory: true,
      showTotalDeposit: true,
      showTotalSpend: true
  });
  
  const [portalSettingsForm, setPortalSettingsForm] = useState({
      portalAnnouncement: '',
      isPortalSuspended: false
  });

  const [lowBalanceForm, setLowBalanceForm] = useState<LowBalanceConfig>({
      isEnabled: false,
      threshold: 10
  });

  // --- HANDLERS ---

  const handleStatusChange = (client: Conversation, newStatus: LeadStatus) => {
      onUpdateClientProfile(client.psid, { status: newStatus });
      if (newStatus === 'past_client') {
          alert(`Project Paused for ${client.userName}. \nThey have been moved to 'Project History' tab.`);
      } else if (newStatus === 'active_client') {
          alert(`Welcome back! ${client.userName} is now ACTIVE again.`);
      }
  };

  const openWinBackModal = (client: Conversation) => {
      setWinBackClient(client);
      
      // Smart Suggestion Logic
      const daysInactive = client.statusChangedDate 
          ? differenceInDays(new Date(), new Date(client.statusChangedDate)) 
          : 0;
      
      // Find the Win-Back Sequence (ds2 is our hardcoded ID for win-back in App.tsx)
      const sequence = dripSequences.find(s => s.triggerStatus === 'past_client');
      
      let suggestedMsg = "";
      if (sequence) {
          // Find the step closest to the current inactive days
          const step = sequence.steps.slice().reverse().find(s => daysInactive >= s.dayDelay) || sequence.steps[0];
          suggestedMsg = step?.message.replace('{{name}}', client.userName) || "";
      }

      setWinBackMessage(suggestedMsg || `Hello ${client.userName}, checking in on your business!`);
  };

  const handleSendWinBackMessage = () => {
      if (winBackClient && winBackMessage && onSendMessage) {
          onSendMessage(winBackClient.psid, winBackMessage);
          alert(`Message Sent to ${winBackClient.userName}!`);
          setWinBackClient(null);
          setWinBackMessage('');
      } else {
          // Fallback if no sender function passed
          alert(`Simulating SMS to ${winBackClient?.extractedMobile || 'Client'}:\n\n"${winBackMessage}"`);
          setWinBackClient(null);
      }
  };

  const openSharePortalModal = (client: Conversation) => {
      setPortalShareClient(client);
  };

  // ... (Existing openEditModal, handleProfileUpdate, etc. kept same) ...
  const openEditModal = (client: Conversation) => {
      setSelectedClientPsid(client.psid);
      setEditForm({
          userName: client.userName,
          extractedMobile: client.extractedMobile || '',
          extractedWebsite: client.extractedWebsite || '',
          clientEmail: client.clientEmail || '',
          clientAddress: client.clientAddress || '',
          servicePackage: client.servicePackage || ''
      });
      setPermissionsForm(client.portalPermissions || { 
          viewBalance: true, 
          allowTopUp: true, 
          viewHistory: true,
          showTotalDeposit: true,
          showTotalSpend: true 
      });
      setPortalSettingsForm({ portalAnnouncement: client.portalAnnouncement || '', isPortalSuspended: client.isPortalSuspended || false });
      setLowBalanceForm(client.lowBalanceAlert || { isEnabled: false, threshold: 10 });
      setActiveModalTab('profile');
      setFundTab('manual');
      setWalletForm({ amount: '', type: 'credit', description: '', category: 'other', date: format(new Date(), 'yyyy-MM-dd') });
      setAdSpendForm({ amount: '', date: format(new Date(), 'yyyy-MM-dd'), impressions: '', reach: '', messages: '', conversions: '', note: '' });
      setNewTaskTitle('');
  };

  const closeEditModal = () => setSelectedClientPsid(null);

  const handleProfileUpdate = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedClient) return;
      onUpdateClientProfile(selectedClient.psid, editForm);
      alert("Profile updated!");
  };

  const handlePermissionsUpdate = (e: React.FormEvent) => {
      e.preventDefault();
      if(!selectedClient) return;
      onUpdateClientProfile(selectedClient.psid, { portalPermissions: permissionsForm, portalAnnouncement: portalSettingsForm.portalAnnouncement, isPortalSuspended: portalSettingsForm.isPortalSuspended });
      alert("Access & Permissions updated!");
  };

  const handleSaveLowBalanceConfig = () => {
      if (!selectedClient) return;
      onUpdateClientProfile(selectedClient.psid, { lowBalanceAlert: lowBalanceForm });
      alert("Low Balance Alert settings saved!");
  };

  const handleBalanceUpdate = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedClient || !walletForm.amount) return;
      const txDate = walletForm.date ? new Date(walletForm.date) : new Date();
      setPendingTransaction({
          source: 'manual',
          payload: {
              psid: selectedClient.psid,
              amount: parseFloat(walletForm.amount) || 0,
              type: walletForm.type,
              description: walletForm.description || (walletForm.type === 'credit' ? 'Deposit' : 'Expense'),
              category: walletForm.category,
              metadata: undefined,
              date: txDate
          }
      });
      setShowConfirmModal(true);
  };

  const handleQuickAdSpend = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedClient || !adSpendForm.amount) return;
      const txDate = adSpendForm.date ? new Date(adSpendForm.date) : new Date();
      const baseDescription = `Daily Ad Spend (${format(txDate, 'MMM d')})`;
      const finalDescription = adSpendForm.note ? `${baseDescription} - ${adSpendForm.note}` : baseDescription;
      const metadata: TransactionMetadata = {
          impressions: parseInt(adSpendForm.impressions) || 0,
          reach: parseInt(adSpendForm.reach) || 0,
          messages: parseInt(adSpendForm.messages) || 0,
          conversions: parseInt(adSpendForm.conversions) || 0,
      };
      setPendingTransaction({
          source: 'ad_spend',
          payload: {
              psid: selectedClient.psid,
              amount: parseFloat(adSpendForm.amount) || 0,
              type: 'debit',
              description: finalDescription,
              category: 'ad_spend',
              metadata: metadata,
              date: txDate
          }
      });
      setShowConfirmModal(true);
  };

  const executeTransaction = () => {
      if (!pendingTransaction) return;
      const { psid, amount, type, description, category, metadata, date } = pendingTransaction.payload;
      onManageBalance(psid, amount, type, description, category, metadata, date);
      if (pendingTransaction.source === 'manual') {
          setWalletForm({ amount: '', type: 'credit', description: '', category: 'other', date: format(new Date(), 'yyyy-MM-dd') });
      } else {
          setAdSpendForm({ amount: '', date: format(new Date(), 'yyyy-MM-dd'), impressions: '', reach: '', messages: '', conversions: '', note: '' });
      }
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      setPendingTransaction(null);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedClient || !newTaskTitle) return;
      const deadline = newTaskDeadline ? new Date(newTaskDeadline) : undefined;
      onAddTask(selectedClient.psid, newTaskTitle, newTaskType, newTaskPriority, deadline);
      setNewTaskTitle('');
      setNewTaskDeadline('');
  };

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      
      {/* 2. TAB NAVIGATION */}
      <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setViewMode('active')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors border-b-2 ${viewMode === 'active' ? 'border-violet-600 text-violet-600 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
          >
              <Users size={18} /> Active Portfolios
          </button>
          <button 
            onClick={() => setViewMode('past')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors border-b-2 ${viewMode === 'past' ? 'border-slate-600 text-slate-800 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
          >
              <Archive size={18} /> Project History (Paused/Win-Back)
          </button>
      </div>

      {/* 3. CLIENT LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
         <div className="overflow-auto flex-1">
             <table className="w-full text-left">
                 <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0 z-10">
                     <tr>
                         <th className="px-6 py-4">Client Name</th>
                         <th className="px-6 py-4">Service & Contact</th>
                         <th className="px-6 py-4">{viewMode === 'active' ? 'Current Balance' : 'Automation Status'}</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                     {(viewMode === 'active' ? activeClients : pastClients).length > 0 ? (
                         (viewMode === 'active' ? activeClients : pastClients).map(client => (
                             <tr key={client.psid} className={`hover:bg-slate-50 transition-colors group ${viewMode === 'past' ? 'bg-slate-50/50' : ''}`}>
                                 <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                         <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${viewMode === 'active' ? 'bg-violet-600' : 'bg-slate-400'}`}>
                                             {client.userName.charAt(0)}
                                         </div>
                                         <div>
                                             <p className={`font-bold ${viewMode === 'active' ? 'text-slate-800' : 'text-slate-600'}`}>{client.userName}</p>
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
                                     </div>
                                 </td>
                                 <td className="px-6 py-4">
                                     {viewMode === 'active' ? (
                                         <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                                             ${(client.walletBalance || 0).toFixed(2)}
                                         </span>
                                     ) : (
                                         <div className="text-xs">
                                             <p className="font-bold text-indigo-600 flex items-center gap-1">
                                                <Zap size={10} /> 
                                                {client.statusChangedDate 
                                                    ? `Next Auto-SMS: Day ${Math.ceil((differenceInDays(new Date(), new Date(client.statusChangedDate)) + 5) / 5) * 5}`
                                                    : 'Automation Pending'}
                                             </p>
                                             <p className="text-slate-400 mt-1">
                                                 {client.statusChangedDate ? `${differenceInDays(new Date(), new Date(client.statusChangedDate))} days inactive` : ''}
                                             </p>
                                         </div>
                                     )}
                                 </td>
                                 <td className="px-6 py-4 text-sm">
                                     {viewMode === 'active' ? (
                                         <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold border border-emerald-200">
                                             <Zap size={12} className="fill-emerald-700" /> Active
                                         </span>
                                     ) : (
                                         <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                                             <PauseCircle size={12} /> Auto-Pilot
                                         </span>
                                     )}
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                     <div className="flex items-center justify-end gap-2">
                                         <button 
                                            onClick={() => openEditModal(client)}
                                            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                                         >
                                             <Edit3 size={14} /> Manage
                                         </button>

                                         {viewMode === 'active' ? (
                                             <>
                                                 <button 
                                                    onClick={() => openSharePortalModal(client)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Get Portal Link"
                                                 >
                                                     <Share2 size={16} /> 
                                                 </button>
                                                 <button 
                                                    onClick={() => onOpenPortal(client.psid)}
                                                    className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                                    title="Open Portal (Preview)"
                                                 >
                                                     <ExternalLink size={16} />
                                                 </button>
                                                 <button 
                                                    onClick={() => handleStatusChange(client, 'past_client')}
                                                    className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-100"
                                                    title="Pause Project (Move to History)"
                                                 >
                                                     <PauseCircle size={16} />
                                                 </button>
                                             </>
                                         ) : (
                                             <>
                                                 <button 
                                                    onClick={() => handleStatusChange(client, 'active_client')}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Reactivate Project"
                                                 >
                                                     <PlayCircle size={16} />
                                                 </button>
                                             </>
                                         )}
                                     </div>
                                 </td>
                             </tr>
                         ))
                     ) : (
                         <tr>
                             <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                 {viewMode === 'active' 
                                    ? "No active clients found. Move leads to 'Active Client' status to see them here." 
                                    : "No project history found. Paused or completed projects will appear here."}
                             </td>
                         </tr>
                     )}
                 </tbody>
             </table>
         </div>
      </div>

      {/* --- SHARE PORTAL MODAL --- */}
      {portalShareClient && (
        <div className="fixed inset-0 bg-slate-900/80 z-[150] flex items-center justify-center p-4 animate-in fade-in backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-slate-900 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#9B7BE3] rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
                    <h3 className="text-xl font-bold relative z-10">Client Portal Access</h3>
                    <p className="text-slate-300 text-sm relative z-10 mt-1">Share this secure link with {portalShareClient.userName}</p>
                    <button onClick={() => setPortalShareClient(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24}/></button>
                </div>
                
                <div className="p-8 space-y-6">
                    
                    {/* Link Box */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Secure Link</label>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 pl-4">
                            <Globe size={16} className="text-slate-400 flex-shrink-0" />
                            <input 
                                readOnly 
                                value={`${window.location.origin}?portal_id=${portalShareClient.psid}`}
                                className="bg-transparent border-none outline-none text-sm text-slate-600 flex-1 w-full truncate font-mono"
                            />
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}?portal_id=${portalShareClient.psid}`);
                                    alert("Link Copied!");
                                }}
                                className="bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-500 p-2 rounded-lg transition-colors"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Actions Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => window.open(`${window.location.origin}?portal_id=${portalShareClient.psid}`, '_blank')}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-violet-500 hover:bg-violet-50 transition-all group"
                        >
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                                <ExternalLink size={20} />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-violet-700">Open in New Tab</span>
                        </button>

                        <button 
                            onClick={() => {
                                if(onSendMessage) {
                                    const msg = `Hi ${portalShareClient.userName}, here is your personal dashboard link to view ads, expenses and download invoices: ${window.location.origin}?portal_id=${portalShareClient.psid}`;
                                    onSendMessage(portalShareClient.psid, msg);
                                    alert("Link sent via Message!");
                                }
                            }}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                        >
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <Send size={20} />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Send to Client</span>
                        </button>
                    </div>

                    {/* QR Section */}
                    <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4 border border-slate-100">
                        <div className="bg-white p-2 rounded border border-slate-200">
                            <QrCode size={40} className="text-slate-800" /> 
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-700">Scan to View</p>
                            <p className="text-xs text-slate-500">Client can scan this code to open portal on mobile.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      )}

      {/* --- QUICK WIN-BACK MESSAGE MODAL --- */}
      {winBackClient && (
          <div className="fixed inset-0 bg-slate-900/60 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <MessageCircle size={18} className="text-indigo-600" /> 
                          Re-engage Client
                      </h3>
                      <button onClick={() => setWinBackClient(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                              {winBackClient.userName.charAt(0)}
                          </div>
                          <div>
                              <p className="font-bold text-sm text-slate-800">{winBackClient.userName}</p>
                              <p className="text-xs text-slate-500">
                                  Inactive for {winBackClient.statusChangedDate ? differenceInDays(new Date(), new Date(winBackClient.statusChangedDate)) : 0} days
                              </p>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message</label>
                          <textarea 
                              value={winBackMessage}
                              onChange={(e) => setWinBackMessage(e.target.value)}
                              className="w-full h-32 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-50 focus:bg-white"
                              placeholder="Write your message..."
                          />
                          <p className="text-[10px] text-slate-400 mt-1 text-right">
                              *Suggestion based on inactive duration
                          </p>
                      </div>

                      <button 
                          onClick={handleSendWinBackMessage}
                          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                      >
                          <Send size={16} /> Send Now
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MANAGE CLIENT MODAL (Existing...) */}
      {isEditModalOpen && selectedClient && (
          <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center animate-in fade-in duration-200 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden h-[85vh] flex flex-col">
                  {/* ... (Existing Modal Content - Profile, Wallet, etc. - UNCHANGED) ... */}
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
                      {['profile', 'wallet', 'tasks', 'invoices', 'history', 'permissions'].map((tab) => (
                          <button 
                            key={tab}
                            onClick={() => setActiveModalTab(tab as any)}
                            className={`flex-1 min-w-[100px] py-3 text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-2 uppercase tracking-wide ${activeModalTab === tab ? 'border-violet-600 text-violet-600 bg-violet-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                          >
                              {tab === 'profile' && <User size={14} />}
                              {tab === 'wallet' && <CreditCard size={14} />}
                              {tab === 'tasks' && <ListTodo size={14} />}
                              {tab === 'invoices' && <Receipt size={14} />}
                              {tab === 'history' && <RefreshCw size={14} />}
                              {tab === 'permissions' && <Lock size={14} />}
                              {tab === 'tasks' ? 'Growth Plan' : tab === 'invoices' ? 'Records' : tab === 'permissions' ? 'Access' : tab}
                          </button>
                      ))}
                  </div>

                  {/* Modal Content Area */}
                  <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
                      
                      {/* 1. PROFILE TAB */}
                      {activeModalTab === 'profile' && (
                          <div className="flex flex-col md:flex-row gap-6 h-full">
                              <div className="w-full md:w-1/3 space-y-4">
                                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                                      <div className="absolute top-0 w-full h-16 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
                                      <div className="w-24 h-24 rounded-full bg-white text-violet-600 flex items-center justify-center text-4xl font-bold mb-3 shadow-lg border-4 border-white relative z-10 mt-4">
                                          {selectedClient.userName.charAt(0)}
                                      </div>
                                      <h3 className="font-bold text-slate-800 text-lg">{selectedClient.userName}</h3>
                                      <p className="text-sm text-slate-500 mb-4">{selectedClient.servicePackage || 'No Plan Active'}</p>
                                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${selectedClient.status === 'active_client' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                          {selectedClient.status.replace('_', ' ').toUpperCase()}
                                      </div>
                                  </div>
                                  
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
                                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mobile Number</label>
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

                      {/* 2. WALLET TAB */}
                      {activeModalTab === 'wallet' && (
                          <div className="space-y-6 max-w-2xl mx-auto">
                              {/* Virtual Card */}
                              <div className="relative h-48 rounded-2xl overflow-hidden shadow-2xl bg-slate-900 text-white p-7 flex flex-col justify-between transform transition-transform hover:scale-[1.01]">
                                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-900 to-slate-900 opacity-90"></div>
                                  <div className="relative z-10 flex justify-between items-start">
                                      <div>
                                          <p className="text-violet-200 text-xs font-bold uppercase tracking-[0.2em] mb-1">Total Balance</p>
                                          <h2 className="text-4xl font-bold tracking-tight text-white drop-shadow-sm">${(selectedClient.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
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

                              {/* Low Balance Alert */}
                              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                                  <div className="flex justify-between items-center mb-3">
                                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                          <Bell size={16} className="text-orange-500" /> Low Balance Auto-Alert
                                      </h4>
                                      <div className="flex items-center gap-3">
                                          <label className="relative inline-flex items-center cursor-pointer">
                                              <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={lowBalanceForm.isEnabled}
                                                onChange={(e) => setLowBalanceForm({...lowBalanceForm, isEnabled: e.target.checked})}
                                              />
                                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-orange-500"></div>
                                          </label>
                                      </div>
                                  </div>
                                  {lowBalanceForm.isEnabled && (
                                      <div className="flex items-center gap-3">
                                          <span className="text-xs font-bold text-orange-800">Alert below ($):</span>
                                          <input 
                                              type="number"
                                              value={lowBalanceForm.threshold}
                                              onChange={(e) => setLowBalanceForm({...lowBalanceForm, threshold: parseFloat(e.target.value)})}
                                              className="w-24 px-2 py-1 text-sm border border-orange-200 rounded outline-none font-bold"
                                          />
                                          <button onClick={handleSaveLowBalanceConfig} className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded font-bold hover:bg-orange-200">Save</button>
                                      </div>
                                  )}
                              </div>

                              {/* Actions Area */}
                              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
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
                                          <form onSubmit={handleBalanceUpdate} className="space-y-6">
                                              <div className="flex gap-4">
                                                  <label className={`flex-1 cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 ${walletForm.type === 'credit' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100'}`}>
                                                      <input type="radio" name="type" className="hidden" checked={walletForm.type === 'credit'} onChange={() => setWalletForm({...walletForm, type: 'credit'})} />
                                                      <div className="p-2 rounded-full bg-emerald-100 text-emerald-600"><Plus size={20} /></div>
                                                      <span className="text-xs font-bold">ADD FUNDS</span>
                                                  </label>
                                                  <label className={`flex-1 cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 ${walletForm.type === 'debit' ? 'border-red-500 bg-red-50' : 'border-slate-100'}`}>
                                                      <input type="radio" name="type" className="hidden" checked={walletForm.type === 'debit'} onChange={() => setWalletForm({...walletForm, type: 'debit'})} />
                                                      <div className="p-2 rounded-full bg-red-100 text-red-600"><Minus size={20} /></div>
                                                      <span className="text-xs font-bold">DEDUCT</span>
                                                  </label>
                                              </div>
                                              <div>
                                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount ($)</label>
                                                  <input type="number" step="0.01" required value={walletForm.amount} onChange={(e) => setWalletForm({...walletForm, amount: e.target.value})} className="w-full border rounded-xl p-3 text-lg font-bold" />
                                              </div>
                                              <div>
                                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                                                  <input required value={walletForm.description} onChange={(e) => setWalletForm({...walletForm, description: e.target.value})} className="w-full border rounded-xl p-3 text-sm" placeholder="Short note..." />
                                              </div>
                                              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black">Confirm Transaction</button>
                                          </form>
                                      ) : (
                                          <form onSubmit={handleQuickAdSpend} className="space-y-6">
                                              <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                      <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Date</label>
                                                      <input type="date" required value={adSpendForm.date} onChange={(e) => setAdSpendForm({...adSpendForm, date: e.target.value})} className="w-full border border-blue-100 rounded-xl p-3 text-sm font-bold" />
                                                  </div>
                                                  <div>
                                                      <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Amount Spent ($)</label>
                                                      <input type="number" step="0.01" required value={adSpendForm.amount} onChange={(e) => setAdSpendForm({...adSpendForm, amount: e.target.value})} className="w-full border border-blue-100 rounded-xl p-3 text-sm font-bold" />
                                                  </div>
                                              </div>
                                              <div>
                                                  <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Note</label>
                                                  <input value={adSpendForm.note} onChange={(e) => setAdSpendForm({...adSpendForm, note: e.target.value})} className="w-full border border-blue-100 rounded-xl p-3 text-sm" placeholder="Details..." />
                                              </div>
                                              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                  <div><label className="text-xs font-bold text-slate-500 uppercase">Impressions</label><input type="number" value={adSpendForm.impressions} onChange={(e) => setAdSpendForm({...adSpendForm, impressions: e.target.value})} className="w-full border rounded p-2 text-xs" /></div>
                                                  <div><label className="text-xs font-bold text-slate-500 uppercase">Reach</label><input type="number" value={adSpendForm.reach} onChange={(e) => setAdSpendForm({...adSpendForm, reach: e.target.value})} className="w-full border rounded p-2 text-xs" /></div>
                                                  <div><label className="text-xs font-bold text-slate-500 uppercase">Messages</label><input type="number" value={adSpendForm.messages} onChange={(e) => setAdSpendForm({...adSpendForm, messages: e.target.value})} className="w-full border rounded p-2 text-xs" /></div>
                                                  <div><label className="text-xs font-bold text-emerald-600 uppercase">Sales</label><input type="number" value={adSpendForm.conversions} onChange={(e) => setAdSpendForm({...adSpendForm, conversions: e.target.value})} className="w-full border border-emerald-200 rounded p-2 text-xs font-bold text-emerald-700" /></div>
                                              </div>
                                              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700">Save Ad Report</button>
                                          </form>
                                      )}
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* 3. GROWTH PLAN (TASKS) TAB */}
                      {activeModalTab === 'tasks' && (
                          <div className="space-y-6">
                              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                  <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus size={16} className="text-violet-600"/> Assign New Task</h4>
                                  <form onSubmit={handleAddTaskSubmit} className="space-y-4">
                                      <input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Task Title..." className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none" required />
                                      <div className="flex gap-3">
                                          <select value={newTaskType} onChange={(e) => setNewTaskType(e.target.value as any)} className="border rounded-lg p-2 text-xs bg-white"><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select>
                                          <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as any)} className="border rounded-lg p-2 text-xs bg-white"><option value="high">High Priority</option><option value="medium">Medium</option><option value="low">Low</option></select>
                                          <input type="date" value={newTaskDeadline} onChange={(e) => setNewTaskDeadline(e.target.value)} className="border rounded-lg p-2 text-xs" />
                                      </div>
                                      <button type="submit" className="w-full bg-violet-600 text-white py-2 rounded-lg font-bold text-xs hover:bg-violet-700">Add to Growth Plan</button>
                                  </form>
                              </div>
                              <div className="space-y-3">
                                  <h4 className="text-xs font-bold text-slate-500 uppercase">Assigned Tasks</h4>
                                  {selectedClient.tasks && selectedClient.tasks.length > 0 ? (
                                      selectedClient.tasks.map(task => (
                                          <div key={task.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                              <div>
                                                  <p className={`text-sm font-bold ${task.isCompleted ? 'line-through text-emerald-600' : 'text-slate-800'}`}>{task.title}</p>
                                                  <div className="flex gap-2 text-[10px] text-slate-500 mt-1">
                                                      <span className="uppercase bg-slate-100 px-1.5 rounded">{task.type}</span>
                                                      <span className={`uppercase px-1.5 rounded text-white ${task.priority === 'high' ? 'bg-red-500' : 'bg-slate-400'}`}>{task.priority}</span>
                                                      {task.deadline && <span>Due: {format(new Date(task.deadline), 'MMM d')}</span>}
                                                  </div>
                                              </div>
                                              <button onClick={() => onDeleteTask(selectedClient!.psid, task.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                                          </div>
                                      ))
                                  ) : <p className="text-center text-slate-400 text-xs py-4">No tasks assigned yet.</p>}
                              </div>
                          </div>
                      )}

                      {/* 4. RECORDS (INVOICES) TAB */}
                      {activeModalTab === 'invoices' && (
                          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                              <table className="w-full text-left">
                                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                                      <tr>
                                          <th className="px-4 py-3">Invoice #</th>
                                          <th className="px-4 py-3">Date</th>
                                          <th className="px-4 py-3">Amount</th>
                                          <th className="px-4 py-3">Status</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-sm">
                                      {selectedClient.invoices && selectedClient.invoices.length > 0 ? (
                                          selectedClient.invoices.map(inv => (
                                              <tr key={inv.id}>
                                                  <td className="px-4 py-3 font-mono text-xs">{inv.invoiceNumber}</td>
                                                  <td className="px-4 py-3 text-slate-600">{format(new Date(inv.date), 'MMM d, yyyy')}</td>
                                                  <td className="px-4 py-3 font-bold text-slate-800">${inv.totalAmount.toLocaleString()}</td>
                                                  <td className="px-4 py-3">
                                                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                                          {inv.status}
                                                      </span>
                                                  </td>
                                              </tr>
                                          ))
                                      ) : (
                                          <tr><td colSpan={4} className="text-center py-8 text-slate-400 text-xs">No invoices generated yet.</td></tr>
                                      )}
                                  </tbody>
                              </table>
                          </div>
                      )}

                      {/* 5. HISTORY TAB */}
                      {activeModalTab === 'history' && (
                          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                              <table className="w-full text-left">
                                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                                      <tr>
                                          <th className="px-4 py-3">Date</th>
                                          <th className="px-4 py-3">Type</th>
                                          <th className="px-4 py-3">Description</th>
                                          <th className="px-4 py-3 text-right">Amount</th>
                                          <th className="px-4 py-3"></th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-sm">
                                      {selectedClient.transactions && selectedClient.transactions.length > 0 ? (
                                          selectedClient.transactions.map(tx => (
                                              <tr key={tx.id}>
                                                  <td className="px-4 py-3 text-slate-600 text-xs">{format(new Date(tx.date), 'MMM d')}</td>
                                                  <td className="px-4 py-3 uppercase text-[10px] font-bold text-slate-500">{tx.type}</td>
                                                  <td className="px-4 py-3 text-slate-800 max-w-[150px] truncate" title={tx.description}>{tx.description}</td>
                                                  <td className={`px-4 py-3 text-right font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                      {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                                                  </td>
                                                  <td className="px-4 py-3 text-right">
                                                      <button onClick={() => onDeleteTransaction(selectedClient!.psid, tx.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                                                  </td>
                                              </tr>
                                          ))
                                      ) : (
                                          <tr><td colSpan={5} className="text-center py-8 text-slate-400 text-xs">No transaction history.</td></tr>
                                      )}
                                  </tbody>
                              </table>
                          </div>
                      )}

                      {/* 6. PERMISSIONS TAB */}
                      {activeModalTab === 'permissions' && (
                          <div className="space-y-6 max-w-xl mx-auto bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Portal Access Control</h4>
                              <form onSubmit={handlePermissionsUpdate} className="space-y-4">
                                  <div className="space-y-3">
                                      <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                          <span className="text-sm font-medium text-slate-700">View Balance</span>
                                          <input type="checkbox" checked={permissionsForm.viewBalance} onChange={e => setPermissionsForm({...permissionsForm, viewBalance: e.target.checked})} className="accent-violet-600 w-4 h-4"/>
                                      </label>
                                      <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                          <span className="text-sm font-medium text-slate-700">View History</span>
                                          <input type="checkbox" checked={permissionsForm.viewHistory} onChange={e => setPermissionsForm({...permissionsForm, viewHistory: e.target.checked})} className="accent-violet-600 w-4 h-4"/>
                                      </label>
                                      <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                          <span className="text-sm font-medium text-slate-700">Show Total Deposit</span>
                                          <input type="checkbox" checked={permissionsForm.showTotalDeposit ?? true} onChange={e => setPermissionsForm({...permissionsForm, showTotalDeposit: e.target.checked})} className="accent-violet-600 w-4 h-4"/>
                                      </label>
                                      <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                          <span className="text-sm font-medium text-slate-700">Show Total Spend</span>
                                          <input type="checkbox" checked={permissionsForm.showTotalSpend ?? true} onChange={e => setPermissionsForm({...permissionsForm, showTotalSpend: e.target.checked})} className="accent-violet-600 w-4 h-4"/>
                                      </label>
                                      <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                          <span className="text-sm font-medium text-slate-700">Suspend Portal Access</span>
                                          <input type="checkbox" checked={portalSettingsForm.isPortalSuspended} onChange={e => setPortalSettingsForm({...portalSettingsForm, isPortalSuspended: e.target.checked})} className="accent-red-600 w-4 h-4"/>
                                      </label>
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Portal Announcement</label>
                                      <textarea 
                                          value={portalSettingsForm.portalAnnouncement}
                                          onChange={e => setPortalSettingsForm({...portalSettingsForm, portalAnnouncement: e.target.value})}
                                          className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none h-24"
                                          placeholder="Message shown to client upon login..."
                                      />
                                  </div>
                                  <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold text-sm hover:bg-black transition-colors">Update Permissions</button>
                              </form>
                          </div>
                      )}

                      {/* --- CONFIRMATION MODAL --- */}
                      {showConfirmModal && pendingTransaction && (
                          <div className="fixed inset-0 bg-slate-900/70 z-[110] flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
                              <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
                                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                      <AlertTriangle size={24} />
                                  </div>
                                  <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Transaction?</h3>
                                  
                                  <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left text-sm border border-slate-200 space-y-2">
                                      <div className="flex justify-between">
                                          <span className="text-slate-500">Date:</span>
                                          <span className="font-bold">{format(new Date(pendingTransaction.payload.date), 'MMM d, yyyy')}</span>
                                      </div>
                                      <div className="flex justify-between">
                                          <span className="text-slate-500">Amount:</span>
                                          <span className="font-bold">${pendingTransaction.payload.amount}</span>
                                      </div>
                                      <div className="flex justify-between">
                                          <span className="text-slate-500">Type:</span>
                                          <span className="font-bold uppercase">{pendingTransaction.payload.type}</span>
                                      </div>
                                      <div>
                                          <span className="text-slate-500 block text-xs mb-1">Description:</span>
                                          <span className="font-medium text-slate-800">{pendingTransaction.payload.description}</span>
                                      </div>
                                  </div>

                                  <div className="flex gap-3">
                                      <button 
                                        onClick={() => { setShowConfirmModal(false); setPendingTransaction(null); }}
                                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                      >
                                          Cancel
                                      </button>
                                      <button 
                                        onClick={executeTransaction}
                                        className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg"
                                      >
                                          Yes, Proceed
                                      </button>
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* --- SUCCESS MODAL --- */}
                      {showSuccessModal && (
                          <div className="fixed inset-0 bg-slate-900/70 z-[110] flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
                              <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 text-center relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                      <CheckCircle size={32} />
                                  </div>
                                  <h3 className="text-xl font-bold text-slate-800 mb-2">Success!</h3>
                                  <p className="text-slate-500 mb-6">Transaction has been recorded successfully.</p>
                                  
                                  <button 
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                                  >
                                      Thank You
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ClientReport;
