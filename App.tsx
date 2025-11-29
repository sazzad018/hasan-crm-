import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CampaignGenerator from './components/CampaignGenerator';
import LeadDatabase from './components/LeadDatabase';
import AuditTool from './components/AuditTool';
import MessengerCRM from './components/MessengerCRM';
import ProposalBuilder from './components/ProposalBuilder';
import AutomationHub from './components/AutomationHub';
import ScheduleManager from './components/ScheduleManager';
import PaymentSettings from './components/PaymentSettings';
import ClientReport from './components/ClientReport';
import InvoiceGenerator from './components/InvoiceGenerator';
import TaskManager from './components/TaskManager';
import BulkSmsManager from './components/BulkSmsManager';
import AiSalesBrain from './components/AiSalesBrain';
import WebsiteManager from './components/WebsiteManager';
import PersonalVault from './components/PersonalVault';
import SettingsPanel from './components/SettingsPanel';
import WebhookSimulator from './components/WebhookSimulator';
import PublicLeadForm from './components/PublicLeadForm';
import ClientPortal from './components/ClientPortal';
import DailyBriefingModal from './components/DailyBriefingModal';

// Types
import { 
  Conversation, Meeting, AdminTask, SmsCampaign, AiSettings, 
  AiKnowledgeItem, SmsSettings, SavedReply, LeadStatus, 
  ClientWebsite, PersonalAccount, PaymentMethod, Proposal,
  DripSequence, AutoReportConfig, PluginSettings, AttachmentType
} from './types';

const App: React.FC = () => {
  // IMPORTANT: Set this to your live server URL (No trailing slash)
  // If running locally with PHP, it might be http://localhost/your-folder/api
  const API_BASE_URL = 'https://tracker.beautyzonebangladesh.com/api'; 

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data States (Initially Empty, will fill from DB)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [adminTasks, setAdminTasks] = useState<AdminTask[]>([]);
  
  // Local Only States (For settings/config mostly, unless you add tables for them)
  const [smsHistory, setSmsHistory] = useState<SmsCampaign[]>([]);
  const [aiKnowledgeBase, setAiKnowledgeBase] = useState<AiKnowledgeItem[]>([]);
  const [savedReplies, setSavedReplies] = useState<SavedReply[]>([
      { id: 'r1', label: 'Intro', text: 'Hi! How can we help you today?', status: ['General'] }
  ]);
  const [websites, setWebsites] = useState<ClientWebsite[]>([]);
  const [personalAccounts, setPersonalAccounts] = useState<PersonalAccount[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
      { id: 'pm1', category: 'mobile', provider: 'Bkash', type: 'Personal', accountNumber: '017XX-XXXXXX' }
  ]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  
  // Settings States
  const [aiSettings, setAiSettings] = useState<AiSettings>({
    activeMode: 'manual',
    paidConfig: { provider: 'gemini', apiKey: '', model: 'gemini-3-pro-preview' },
    freeConfig: { provider: 'gemini', apiKey: '', model: 'gemini-2.5-flash' }
  });
  const [aiPersona, setAiPersona] = useState('You are a professional digital marketing consultant for a Bangladeshi agency.');
  const [smsSettings, setSmsSettings] = useState<SmsSettings>({
    apiUrl: '', apiKey: '', senderId: '', method: 'GET', paramMap: { to: 'to', message: 'message', apiKey: 'api_key' }
  });
  const [dripSequences, setDripSequences] = useState<DripSequence[]>([
      { id: 'ds1', triggerStatus: 'new_lead', isEnabled: true, steps: [] },
      { id: 'ds2', triggerStatus: 'past_client', isEnabled: true, steps: [] } // Win-back
  ]);
  const [reportConfig, setReportConfig] = useState<AutoReportConfig>({
      isEnabled: false, frequency: 'weekly', method: 'email', includeMetrics: ['spend', 'sales']
  });
  const [pluginSettings, setPluginSettings] = useState<PluginSettings>({
      pageAccessToken: '', verifyToken: '', appId: '', appSecret: '', webhookUrl: ''
  });

  // Derived State for specific views
  const [portalModeClient, setPortalModeClient] = useState<Conversation | null>(null);
  const [showBriefing, setShowBriefing] = useState(true); 

  // --- API HANDLERS (FETCHER) ---
  const fetchData = async () => {
      try {
          setIsLoading(true);
          const response = await fetch(`${API_BASE_URL}/index.php?action=get_all_data`);
          if (!response.ok) throw new Error("Network response was not ok");
          const data = await response.json();
          
          let loadedConversations: Conversation[] = [];

          // Hydrate Conversations
          if(data.conversations) {
              // Convert DB structure (snake_case) to App structure (camelCase)
              loadedConversations = data.conversations.map((c: any) => ({
                  ...c,
                  userName: c.user_name || c.userName || 'Unknown User', 
                  extractedMobile: c.mobile || c.extractedMobile, 
                  psid: c.psid,
                  status: c.status || 'new_lead',
                  source: c.source || 'manual',
                  messages: c.messages || [],
                  tags: c.tags || [],
                  lastActive: new Date(c.last_active || c.lastActive || new Date()),
                  walletBalance: c.wallet_balance ? parseFloat(c.wallet_balance) : (c.walletBalance || 0),
                  dealValue: c.deal_value ? parseFloat(c.deal_value) : (c.dealValue || 0),
              }));
              setConversations(loadedConversations);
          }

          // Hydrate Meetings
          if(data.meetings) {
              setMeetings(data.meetings.map((m:any) => {
                  const clientPsid = m.client_psid || m.psid;
                  const client = loadedConversations.find(c => c.psid === clientPsid);
                  return {
                      ...m,
                      id: m.id || Date.now().toString(),
                      psid: clientPsid,
                      clientName: client ? client.userName : (m.clientName || 'Unknown'), 
                      title: m.title || 'Untitled Meeting',
                      date: new Date(m.meeting_date || m.date),
                      status: m.status || 'pending'
                  };
              }));
          }

          // Hydrate Tasks
          if(data.tasks) {
              setAdminTasks(data.tasks.map((t:any) => ({
                  ...t,
                  id: t.id || Date.now().toString(),
                  relatedClientId: t.related_client_psid || t.relatedClientId,
                  createdAt: new Date(t.created_at || t.createdAt || new Date())
              })));
          }
          
      } catch (error) {
          console.error("Failed to fetch data, switching to Demo Mode:", error);
          
          // --- FALLBACK DUMMY DATA FOR DEMO MODE ---
          setConversations([
            {
                psid: '1001',
                userName: 'Rafiqul Islam',
                status: 'active_client',
                source: 'facebook',
                lastActive: new Date(),
                unreadCount: 0,
                downloadCount: 0,
                messages: [
                    { id: 1, messageText: 'How much for SEO?', attachmentType: AttachmentType.TEXT, fbMid: 'm1', createdTime: new Date(Date.now() - 86400000) },
                    { id: 2, messageText: 'Our package starts at 15k BDT.', attachmentType: AttachmentType.TEXT, fbMid: 'm2', isFromPage: true, createdTime: new Date(Date.now() - 86000000) }
                ],
                tags: ['VIP'],
                walletBalance: 5000,
                extractedMobile: '01700000000',
                servicePackage: 'Gold SEO',
                isBestQuality: true,
                dealValue: 15000,
                industry: 'Tech',
                transactions: [
                    { id: 'tx1', date: new Date(Date.now() - 864000000), type: 'credit', amount: 10000, description: 'Initial Deposit', status: 'completed' },
                    { id: 'tx2', date: new Date(Date.now() - 432000000), type: 'debit', amount: 2000, description: 'Ad Spend (FB)', category: 'ad_spend', metadata: { impressions: 5000, reach: 4500, conversions: 12 }, status: 'completed' },
                    { id: 'tx3', date: new Date(Date.now() - 100000000), type: 'debit', amount: 3000, description: 'Web Development Fee', category: 'web_dev', status: 'completed' }
                ],
                tasks: [
                    { id: 'tsk1', title: 'Weekly ROI Report', type: 'weekly', priority: 'high', isCompleted: false, assignedDate: new Date(), deadline: new Date(Date.now() + 86400000) }
                ]
            },
            {
                psid: '1002',
                userName: 'Sadia Khan',
                status: 'new_lead',
                source: 'web_form',
                lastActive: new Date(Date.now() - 3600000),
                unreadCount: 1,
                downloadCount: 0,
                messages: [{ id: 3, messageText: 'I need a website for my boutique.', attachmentType: AttachmentType.TEXT, fbMid: 'm3', createdTime: new Date() }],
                tags: [],
                extractedMobile: '01800000000',
                dealValue: 0,
                industry: 'Clothing'
            },
            {
                psid: '1003',
                userName: 'Karim Uddin',
                status: 'negotiation',
                source: 'facebook',
                lastActive: new Date(Date.now() - 7200000),
                unreadCount: 0,
                downloadCount: 0,
                messages: [
                    { id: 4, messageText: 'Is the price negotiable?', attachmentType: AttachmentType.TEXT, fbMid: 'm4', createdTime: new Date(Date.now() - 7200000) }
                ],
                tags: ['Hot Lead'],
                dealValue: 25000,
                industry: 'RealEstate'
            }
          ]);
          
          setMeetings([
              { id: 'mt1', psid: '1001', clientName: 'Rafiqul Islam', title: 'Monthly Report Call', date: new Date(new Date().setHours(14, 0, 0, 0)), status: 'pending' }
          ]);
          
          setAdminTasks([
              { id: 't1', title: 'Check server logs', priority: 'high', status: 'todo', isCompleted: false, createdAt: new Date() },
              { id: 't2', title: 'Update ad creatives for Eid', priority: 'medium', status: 'in_progress', isCompleted: false, createdAt: new Date() }
          ]);

      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
      fetchData();
  }, []);

  // --- ACTION HANDLERS ---

  const handleUpdateStatus = async (psid: string, status: LeadStatus) => {
      // Optimistic UI Update
      setConversations(prev => prev.map(c => c.psid === psid ? { ...c, status, statusChangedDate: new Date() } : c));
      
      // API Call
      try {
          await fetch(`${API_BASE_URL}/index.php?action=update_status`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ psid, status })
          });
      } catch (e) {
          console.error("Update failed (Demo Mode active)", e);
          // Alert intentionally omitted to keep demo smooth
      }
  };

  const handleAddManualLead = async (lead: Partial<Conversation>) => {
      const newLead = { ...lead, id: Date.now().toString() } as Conversation;
      setConversations(prev => [...prev, newLead]); // Optimistic

      try {
          await fetch(`${API_BASE_URL}/index.php?action=add_lead`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newLead)
          });
      } catch (e) {
          console.error("Add lead failed (Demo Mode active)", e);
      }
  };

  const handleScheduleMeeting = (psid: string, title: string, date: Date) => {
      const client = conversations.find(c => c.psid === psid);
      const newMeeting: Meeting = {
          id: Date.now().toString(),
          psid,
          clientName: client ? client.userName : 'Unknown',
          title,
          date,
          status: 'pending'
      };
      setMeetings(prev => [...prev, newMeeting]);
      // Add API call here similarly...
  };

  const handleDeleteMeeting = (id: string) => {
      setMeetings(prev => prev.filter(m => m.id !== id));
  };

  const handleToggleMeetingStatus = (id: string) => {
      setMeetings(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'pending' ? 'completed' : 'pending' } : m));
  };

  const handleAddTask = (title: string, description?: string, relatedClientId?: string) => {
      const client = conversations.find(c => c.psid === relatedClientId);
      const newTask: AdminTask = {
          id: Date.now().toString(),
          title,
          description,
          relatedClientId,
          relatedClientName: client?.userName,
          status: 'todo',
          priority: 'medium',
          isCompleted: false,
          createdAt: new Date()
      };
      setAdminTasks(prev => [...prev, newTask]);
  };

  const handleUpdateTaskStatus = (id: string, status: 'todo' | 'in_progress' | 'done') => {
      setAdminTasks(prev => prev.map(t => t.id === id ? { ...t, status, isCompleted: status === 'done' } : t));
  };

  const handleDeleteTask = (id: string) => {
      setAdminTasks(prev => prev.filter(t => t.id !== id));
  };

  // URL Query Params check for Portal Mode
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const portalId = params.get('portal_id');
      if(portalId) {
          const client = conversations.find(c => c.psid === portalId);
          if(client) setPortalModeClient(client);
      }
  }, [conversations]);

  // Render Portal Mode if active
  if (portalModeClient) {
      return (
          <ClientPortal 
              client={portalModeClient} 
              onTopUp={() => {}} 
              onToggleTask={() => {}} 
              onExit={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('portal_id');
                  window.history.replaceState({}, '', url.toString());
                  setPortalModeClient(null);
              }} 
              paymentMethods={paymentMethods}
          />
      );
  }

  // Render Public Form if route matches
  if (window.location.pathname === '/form/lead-gen') {
      return <PublicLeadForm onSubmit={(data) => {
          handleAddManualLead(data);
          alert("Submitted!");
      }} />;
  }

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-500 font-bold">Loading CRM...</span>
          </div>
      );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        {showBriefing && activeTab === 'dashboard' && (
            <DailyBriefingModal 
                conversations={conversations}
                meetings={meetings}
                onClose={() => setShowBriefing(false)}
                onQuickAction={(action, id) => {
                    if (action === 'chat') {
                        setActiveTab('messages');
                        setShowBriefing(false);
                    }
                }}
            />
        )}

        {activeTab === 'dashboard' && (
            <Dashboard 
                conversations={conversations}
                meetings={meetings}
                onOpenChat={(psid) => { setActiveTab('messages'); }}
                adminTasks={adminTasks}
                smsHistory={smsHistory}
                aiSettings={aiSettings}
                aiKnowledgeBase={aiKnowledgeBase}
                smsSettings={smsSettings}
                setActiveTab={setActiveTab}
            />
        )}
        {activeTab === 'campaign_gen' && <CampaignGenerator />}
        {activeTab === 'leads' && (
            <LeadDatabase 
                conversations={conversations}
                onExport={() => {}}
                onAddManualLead={handleAddManualLead}
                onUpdateStatus={handleUpdateStatus}
                onOpenPublicLink={() => { 
                    window.open(window.location.origin + '/form/lead-gen', '_blank');
                }}
                onToggleBestQuality={(psid) => setConversations(prev => prev.map(c => c.psid === psid ? { ...c, isBestQuality: !c.isBestQuality } : c))}
                onUpdateNotes={(psid, notes) => setConversations(prev => prev.map(c => c.psid === psid ? { ...c, notes } : c))}
                onUpdateIndustry={(psid, industry) => setConversations(prev => prev.map(c => c.psid === psid ? { ...c, industry: industry as any } : c))}
                onUpdateServiceType={(psid, service) => setConversations(prev => prev.map(c => c.psid === psid ? { ...c, serviceType: service as any } : c))}
            />
        )}
        {activeTab === 'audit_tool' && <AuditTool />}
        {activeTab === 'messages' && (
            <MessengerCRM 
                conversations={conversations}
                savedReplies={savedReplies}
                aiKnowledgeBase={aiKnowledgeBase}
                aiPersona={aiPersona}
                aiSettings={aiSettings}
                onUpdateStatus={handleUpdateStatus}
                onUpdateValue={() => {}}
                onSendMessage={(psid, text, type, url) => { 
                    const now = new Date();
                    const newMsg = {
                        id: Date.now(),
                        messageText: text,
                        attachmentType: type || AttachmentType.TEXT,
                        attachmentUrl: url,
                        fbMid: `mid.${Date.now()}`,
                        isFromPage: true,
                        createdTime: now
                    };
                    setConversations(prev => prev.map(c => c.psid === psid ? { ...c, messages: [...c.messages, newMsg as any], lastActive: now } : c));
                }}
                onAddReply={(reply) => setSavedReplies([...savedReplies, reply])}
                onUpdateReply={(reply) => setSavedReplies(prev => prev.map(r => r.id === reply.id ? reply : r))}
                onDeleteReply={(id) => setSavedReplies(prev => prev.filter(r => r.id !== id))}
                onUpdateSummary={(psid, summary) => setConversations(prev => prev.map(c => c.psid === psid ? { ...c, aiSummary: summary } : c))}
                onScheduleMeeting={handleScheduleMeeting}
                onUpdateTags={(psid, tags) => setConversations(prev => prev.map(c => c.psid === psid ? { ...c, tags } : c))}
                onUpdateDealValue={(psid, val) => setConversations(prev => prev.map(c => c.psid === psid ? { ...c, dealValue: val } : c))}
                onUpdateNotes={(psid, notes) => setConversations(prev => prev.map(c => c.psid === psid ? { ...c, notes } : c))}
                onToggleAi={(psid, enabled) => setConversations(prev => prev.map(c => c.psid === psid ? { ...c, aiEnabled: enabled } : c))}
                onAddAiKnowledge={(item) => setAiKnowledgeBase([...aiKnowledgeBase, item])}
                onUpdateAiKnowledge={() => {}}
                onDeleteAiKnowledge={(id) => setAiKnowledgeBase(prev => prev.filter(k => k.id !== id))}
                onOpenProposal={() => setActiveTab('proposals')}
                onUpdateScheduledMessages={(psid, msgs, paused) => setConversations(prev => prev.map(c => c.psid === psid ? { ...c, scheduledMessages: msgs, isAutomationPaused: paused } : c))}
            />
        )}
        {activeTab === 'proposals' && (
            <ProposalBuilder 
                conversations={conversations}
                proposals={proposals}
                onSaveProposal={(prop) => setProposals([...proposals, prop])}
                onAcceptProposal={(id) => setProposals(prev => prev.map(p => p.id === id ? { ...p, status: 'accepted' } : p))}
            />
        )}
        {activeTab === 'automation' && (
            <AutomationHub 
                conversations={conversations}
                dripSequences={dripSequences}
                onUpdateDrip={(seq) => setDripSequences(prev => prev.map(s => s.id === seq.id ? seq : s))}
                reportConfig={reportConfig}
                onUpdateReportConfig={setReportConfig}
                smsSettings={smsSettings}
            />
        )}
        {activeTab === 'schedules' && (
            <ScheduleManager 
                meetings={meetings}
                conversations={conversations}
                onScheduleMeeting={handleScheduleMeeting}
                onDeleteMeeting={handleDeleteMeeting}
                onToggleStatus={handleToggleMeetingStatus}
                onOpenChat={(psid) => setActiveTab('messages')}
            />
        )}
        {activeTab === 'payment_methods' && (
            <PaymentSettings 
                paymentMethods={paymentMethods}
                onAddPaymentMethod={(m) => setPaymentMethods([...paymentMethods, m])}
                onDeletePaymentMethod={(id) => setPaymentMethods(prev => prev.filter(m => m.id !== id))}
            />
        )}
        {activeTab === 'client_report' && (
            <ClientReport 
                conversations={conversations}
                dripSequences={dripSequences}
                onOpenPortal={(psid) => {}}
                onUpdateClientProfile={(psid, data) => setConversations(prev => prev.map(c => c.psid === psid ? { ...c, ...data } : c))}
                onManageBalance={(psid, amount, type, description, category, metadata, date) => {
                    setConversations(prev => prev.map(c => {
                        if (c.psid !== psid) return c;
                        const tx: any = { id: Date.now().toString(), date: date || new Date(), type, amount, description, category, metadata, status: 'completed' };
                        const newBalance = type === 'credit' ? (c.walletBalance || 0) + amount : (c.walletBalance || 0) - amount;
                        return { ...c, walletBalance: newBalance, transactions: [...(c.transactions || []), tx] };
                    }));
                }}
                onDeleteTransaction={(psid, txId) => {
                    setConversations(prev => prev.map(c => {
                        if (c.psid !== psid) return c;
                        return { ...c, transactions: (c.transactions || []).filter(t => t.id !== txId) };
                    }));
                }}
                onEditTransaction={() => {}}
                onAddTask={(psid, title, type, priority, deadline) => {
                    setConversations(prev => prev.map(c => {
                        if (c.psid !== psid) return c;
                        const task: any = { id: Date.now().toString(), title, type, priority, deadline, isCompleted: false, assignedDate: new Date() };
                        return { ...c, tasks: [...(c.tasks || []), task] };
                    }));
                }}
                onDeleteTask={(psid, taskId) => {
                    setConversations(prev => prev.map(c => {
                        if(c.psid !== psid) return c;
                        return { ...c, tasks: (c.tasks || []).filter(t => t.id !== taskId) };
                    }));
                }}
                onSendMessage={(psid, text) => { 
                    alert(`Message sent to ${psid}: ${text}`);
                }}
            />
        )}
        {activeTab === 'invoices' && (
            <InvoiceGenerator 
                conversations={conversations}
                onSaveInvoice={(psid, inv) => setConversations(prev => prev.map(c => c.psid === psid ? { ...c, invoices: [...(c.invoices || []), inv] } : c))}
            />
        )}
        {activeTab === 'tasks' && (
            <TaskManager 
                tasks={adminTasks}
                conversations={conversations}
                onAddTask={handleAddTask}
                onUpdateStatus={handleUpdateTaskStatus}
                onDeleteTask={handleDeleteTask}
            />
        )}
        {activeTab === 'bulk_sms' && (
            <BulkSmsManager 
                conversations={conversations}
                meetings={meetings}
                settings={smsSettings}
                onSaveSettings={setSmsSettings}
                onSaveCampaign={(camp) => setSmsHistory([...smsHistory, camp])}
                onUpdateSmsStats={() => {}}
                campaignHistory={smsHistory}
                aiPersona={aiPersona}
            />
        )}
        {activeTab === 'ai_brain' && (
            <AiSalesBrain 
                aiKnowledgeBase={aiKnowledgeBase}
                onAddAiKnowledge={(item) => setAiKnowledgeBase([...aiKnowledgeBase, item])}
                onDeleteAiKnowledge={(id) => setAiKnowledgeBase(prev => prev.filter(i => i.id !== id))}
                aiPersona={aiPersona}
                setAiPersona={setAiPersona}
                aiSettings={aiSettings}
                setAiSettings={setAiSettings}
            />
        )}
        {activeTab === 'web_vault' && (
            <WebsiteManager 
                websites={websites}
                conversations={conversations}
                onAddWebsite={(site) => setWebsites([...websites, site])}
                onUpdateWebsite={(site) => setWebsites(prev => prev.map(s => s.id === site.id ? site : s))}
                onDeleteWebsite={(id) => setWebsites(prev => prev.filter(s => s.id !== id))}
            />
        )}
        {activeTab === 'my_accounts' && (
            <PersonalVault 
                accounts={personalAccounts}
                onAddAccount={(acc) => setPersonalAccounts([...personalAccounts, acc])}
                onUpdateAccount={(acc) => setPersonalAccounts(prev => prev.map(a => a.id === acc.id ? acc : a))}
                onDeleteAccount={(id) => setPersonalAccounts(prev => prev.filter(a => a.id !== id))}
            />
        )}
        {activeTab === 'settings' && (
            <SettingsPanel 
                settings={pluginSettings}
                updateSettings={setPluginSettings}
                onSave={() => alert("Plugin Settings Saved")}
            />
        )}
        {activeTab === 'simulator' && (
            <WebhookSimulator onSimulateMessage={(text, type, url, psid) => {
                // Simulate adding message to conversation
                const now = new Date();
                const newMessage = {
                    id: Date.now(),
                    messageText: text || (type === 'image' ? 'Sent an image' : 'Sent audio'),
                    attachmentType: type,
                    attachmentUrl: url,
                    fbMid: `mid.${Date.now()}`,
                    isFromPage: false,
                    createdTime: now
                };
                
                setConversations(prev => {
                    const existing = prev.find(c => c.psid === psid);
                    if (existing) {
                        return prev.map(c => c.psid === psid ? { ...c, messages: [...c.messages, newMessage as any], lastActive: now, unreadCount: c.unreadCount + 1 } : c);
                    } else {
                        return [...prev, {
                            psid: psid || `user_${Date.now()}`,
                            userName: 'New User',
                            messages: [newMessage as any],
                            status: 'new_lead',
                            source: 'facebook',
                            lastActive: now,
                            unreadCount: 1,
                            tags: [],
                            downloadCount: 0
                        } as Conversation];
                    }
                });
            }} />
        )}
      </main>
    </div>
  );
};

export default App;