import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import SettingsPanel from './components/SettingsPanel';
import MessengerCRM from './components/MessengerCRM';
import Dashboard from './components/Dashboard';
import WebhookSimulator from './components/WebhookSimulator';
import LeadDatabase from './components/LeadDatabase';
import ScheduleManager from './components/ScheduleManager';
import ClientReport from './components/ClientReport';
import ClientPortal from './components/ClientPortal';
import TaskManager from './components/TaskManager';
import InvoiceGenerator from './components/InvoiceGenerator';
import { Conversation, PluginSettings, AttachmentType, LeadStatus, SavedReply, Meeting, Transaction, TransactionCategory, TransactionMetadata, ClientTask, AdminTask } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [portalClientId, setPortalClientId] = useState<string | null>(null); // For Client Portal View
  
  // 1. Initial Saved Replies
  const [savedReplies, setSavedReplies] = useState<SavedReply[]>([
    { 
      id: '1', 
      label: "👋 Power Intro", 
      text: "Hi! I reviewed your page and noticed you have a great product but might be missing some potential customers due to reach issues. We help businesses like yours scale 3x faster. Want to hear a quick strategy?", 
      status: ['new_lead'] 
    },
    { 
      id: '2', 
      label: "🏆 Social Proof", 
      text: "We recently helped a similar brand increase their revenue by 40% in just 2 months. I'd love to share that case study with you. Should I send it?", 
      status: ['interested'] 
    },
    { 
      id: '3', 
      label: "💰 Price Objection", 
      text: "I understand the budget concern. However, think of this as an investment, not a cost. If spending $500 brings you $2000 in sales, the cost becomes irrelevant. Shall we try a pilot campaign?", 
      status: ['negotiation'] 
    },
    { 
      id: '4', 
      label: "📞 Push to Call", 
      text: "It's hard to explain the full strategy over text. Are you free for a quick 10-minute discovery call today? I can show you exactly how we'll execute this.", 
      status: ['interested', 'negotiation'] 
    },
    { 
      id: '5', 
      label: "🔥 Urgency Close", 
      text: "We are finalizing our client roster for this month and only have 1 slot left for the Premium Setup. I'd hate for you to wait until next month. Shall I send the invoice to lock this in?", 
      status: ['negotiation'] 
    },
    { 
      id: '6', 
      label: "✅ Welcome Kit", 
      text: "Fantastic decision! I've attached the invoice. Once cleared, our team will start the onboarding process within 24 hours. Let's grow your business! 🚀", 
      status: ['converted'] 
    },
  ]);

  // 2. Initialize Massive Mock Data (20 Items) - With Wallet Data for Active Clients
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      psid: '1001', userName: 'Rahim Uddin', status: 'new_lead', source: 'facebook', extractedMobile: '01711223344', downloadCount: 0, unreadCount: 1, lastActive: new Date(),
      tags: ['Priority'], dealValue: 0,
      aiSummary: 'User asked about SEO services and shared phone number. Pending initial call.',
      messages: [{ id: 1, messageText: 'Hi, call me at 01711223344 regarding SEO.', attachmentType: AttachmentType.TEXT, fbMid: 'm1', createdTime: new Date() }]
    },
    {
      psid: '1002', userName: 'Jessica Alba', status: 'negotiation', source: 'facebook', extractedWebsite: 'https://jessicabeauty.com', downloadCount: 3, unreadCount: 0, lastActive: new Date(Date.now() - 3600000),
      tags: ['High Budget', 'Beauty'], dealValue: 1500,
      aiSummary: 'Interested in premium package. Negotiation ongoing about price. Sent proposal link.',
      messages: [{ id: 2, messageText: 'Here is my site: https://jessicabeauty.com. Send proposal.', attachmentType: AttachmentType.TEXT, fbMid: 'm2', createdTime: new Date() }]
    },
    {
      psid: '1003', userName: 'Karim Benz', status: 'interested', source: 'facebook', extractedFbLink: 'https://facebook.com/karim.cars', downloadCount: 1, unreadCount: 2, lastActive: new Date(Date.now() - 7200000),
      tags: ['Automotive'], dealValue: 500,
      aiSummary: 'Car dealership owner looking for FB Ads. Shared page link.',
      messages: [{ id: 3, messageText: 'Check my page https://facebook.com/karim.cars', attachmentType: AttachmentType.TEXT, fbMid: 'm3', createdTime: new Date() }]
    },
    {
      psid: '1004', userName: 'Unknown User', status: 'cold', source: 'facebook', downloadCount: 0, unreadCount: 0, lastActive: new Date(Date.now() - 86400000),
      tags: [], dealValue: 0,
      aiSummary: 'Casual browsing. Not interested currently.',
      messages: [{ id: 4, messageText: 'Just looking, thanks.', attachmentType: AttachmentType.TEXT, fbMid: 'm4', createdTime: new Date() }]
    },
    {
      psid: '1005', userName: 'Tech Startup BD', status: 'active_client', source: 'facebook', extractedMobile: '01888999000', extractedWebsite: 'https://techbd.com', downloadCount: 5, unreadCount: 0, lastActive: new Date(Date.now() - 100000000),
      tags: ['VIP', 'Retainer'], dealValue: 2000,
      walletBalance: 845.50,
      clientEmail: 'admin@techbd.com',
      clientAddress: 'Level 4, Karwan Bazar, Dhaka',
      servicePackage: 'Enterprise Growth Plan',
      portalAnnouncement: '⚠️ Server maintenance scheduled for Friday night.',
      portalPermissions: { viewBalance: true, allowTopUp: true, viewHistory: true },
      tasks: [
          { id: 't1', title: 'Upload high-res logo to drive', type: 'weekly', priority: 'medium', isCompleted: true, assignedDate: new Date() },
          { id: 't2', title: 'Record 3 Product Videos for Reels', type: 'weekly', priority: 'high', deadline: new Date(Date.now() + 86400000 * 2), isCompleted: false, assignedDate: new Date() },
          { id: 't3', title: 'Increase Ad Budget by 20%', type: 'monthly', priority: 'low', isCompleted: false, assignedDate: new Date() }
      ],
      transactions: [
          { id: 'tx1', date: new Date(Date.now() - 86400000 * 10), type: 'credit', amount: 2000, description: 'Initial Deposit', category: 'payment', status: 'completed' },
          { id: 'tx5', date: new Date(Date.now() - 86400000 * 8), type: 'debit', amount: 249.50, description: 'Content Creation Fee', category: 'service_fee', status: 'completed' },
          // Demo Ad Spend Data for Chart with Metadata
          { 
              id: 'ad1', date: new Date(Date.now() - 86400000 * 6), type: 'debit', amount: 45.20, description: 'Daily Ad Spend (FB)', category: 'ad_spend', status: 'completed',
              metadata: { impressions: 12500, reach: 9800, messages: 12, conversions: 3 }
          },
          { 
              id: 'ad2', date: new Date(Date.now() - 86400000 * 5), type: 'debit', amount: 52.10, description: 'Daily Ad Spend (FB)', category: 'ad_spend', status: 'completed',
              metadata: { impressions: 14200, reach: 11000, messages: 15, conversions: 5 }
          },
          { 
              id: 'ad3', date: new Date(Date.now() - 86400000 * 4), type: 'debit', amount: 48.50, description: 'Daily Ad Spend (FB)', category: 'ad_spend', status: 'completed',
              metadata: { impressions: 13000, reach: 10200, messages: 10, conversions: 2 }
          },
          { 
              id: 'ad4', date: new Date(Date.now() - 86400000 * 3), type: 'debit', amount: 65.00, description: 'Daily Ad Spend (FB) - Wknd', category: 'ad_spend', status: 'completed',
              metadata: { impressions: 18000, reach: 14500, messages: 25, conversions: 8 }
          },
          { 
              id: 'ad5', date: new Date(Date.now() - 86400000 * 2), type: 'debit', amount: 55.30, description: 'Daily Ad Spend (FB)', category: 'ad_spend', status: 'completed',
              metadata: { impressions: 15500, reach: 12000, messages: 18, conversions: 6 }
          },
          { 
              id: 'ad6', date: new Date(Date.now() - 86400000 * 1), type: 'debit', amount: 12.50, description: 'Daily Ad Spend (FB)', category: 'ad_spend', status: 'completed',
              metadata: { impressions: 4000, reach: 3500, messages: 3, conversions: 0 }
          },
          { id: 'web1', date: new Date(Date.now() - 86400000 * 2), type: 'debit', amount: 150.00, description: 'Landing Page Fix', category: 'web_dev', status: 'completed' },
      ],
      aiSummary: 'Active Client. Payment confirmed. Onboarding in progress.',
      messages: [{ id: 5, messageText: 'Payment done. Start working.', attachmentType: AttachmentType.TEXT, fbMid: 'm5', createdTime: new Date() }]
    },
    {
      psid: '1006', userName: 'Sarah Khan', status: 'new_lead', source: 'facebook', downloadCount: 0, unreadCount: 1, lastActive: new Date(Date.now() - 5000),
      tags: ['Design'], dealValue: 100,
      aiSummary: 'Needs photo editing services for ads. Sent sample image.',
      messages: [{ id: 6, messageText: '', attachmentType: AttachmentType.IMAGE, attachmentUrl: 'https://picsum.photos/300/200', fbMid: 'm6', createdTime: new Date() }, { id: 7, messageText: 'Can you edit this photo for my ad?', attachmentType: AttachmentType.TEXT, fbMid: 'm7', createdTime: new Date() }]
    },
    {
      psid: '1007', userName: 'Fashion House', status: 'interested', source: 'facebook', extractedMobile: '01912341234', extractedFbLink: 'https://fb.me/fashionhouse', downloadCount: 2, unreadCount: 0, lastActive: new Date(Date.now() - 150000),
      tags: ['E-commerce'], dealValue: 800,
      aiSummary: 'Boutique owner. Wants to boost FB page engagement.',
      messages: [{ id: 8, messageText: 'Call 01912341234 or msg https://fb.me/fashionhouse', attachmentType: AttachmentType.TEXT, fbMid: 'm8', createdTime: new Date() }]
    },
    {
      psid: '1008', userName: 'Mr. John', status: 'negotiation', source: 'facebook', extractedWebsite: 'https://johnrealtor.com', downloadCount: 10, unreadCount: 0, lastActive: new Date(Date.now() - 200000),
      tags: ['Real Estate', 'Hot Lead'], dealValue: 3000,
      aiSummary: 'Real estate leads needed. High potential client.',
      messages: [{ id: 9, messageText: 'I need leads for https://johnrealtor.com', attachmentType: AttachmentType.TEXT, fbMid: 'm9', createdTime: new Date() }]
    },
    {
      psid: '1013', userName: 'Dr. Strange', status: 'active_client', source: 'facebook', downloadCount: 8, unreadCount: 0, lastActive: new Date(Date.now() - 900000000),
      tags: ['Medical', 'VIP'], dealValue: 5000,
      walletBalance: 4500.00,
      clientEmail: 'doc@strange.clinic',
      servicePackage: 'Medical Branding Suite',
      portalPermissions: { viewBalance: true, allowTopUp: false, viewHistory: true },
      transactions: [
          { id: 'tx10', date: new Date(Date.now() - 86400000 * 30), type: 'credit', amount: 5000, description: 'Retainer Fee', category: 'payment', status: 'completed' },
          { id: 'tx11', date: new Date(Date.now() - 86400000 * 15), type: 'debit', amount: 500, description: 'Medical Poster Design', category: 'service_fee', status: 'completed' },
          { id: 'tx12', date: new Date(Date.now() - 86400000 * 2), type: 'debit', amount: 50, description: 'Website Maintenance', category: 'web_dev', status: 'completed' }
      ],
      tasks: [
        { id: 't1', title: 'Approve new Website Mockup', type: 'weekly', priority: 'high', isCompleted: false, assignedDate: new Date() },
      ],
      aiSummary: 'Old client. Consultation fee paid. Ongoing service.',
      messages: [{ id: 14, messageText: 'Consultation fee paid.', attachmentType: AttachmentType.TEXT, fbMid: 'm14', createdTime: new Date() }]
    },
    {
      psid: '1020', userName: 'Happy Client', status: 'active_client', source: 'facebook', extractedMobile: '01700000000', downloadCount: 12, unreadCount: 0, lastActive: new Date(Date.now() - 60000 * 5),
      tags: ['Loyal'], dealValue: 200,
      walletBalance: 50.00,
      servicePackage: 'Basic Support',
      isPortalSuspended: true,
      portalAnnouncement: 'Please contact admin to reactivate account.',
      portalPermissions: { viewBalance: false, allowTopUp: false, viewHistory: false },
      transactions: [
          { id: 'tx20', date: new Date(Date.now() - 86400000 * 2), type: 'credit', amount: 200, description: 'Promo Boost', category: 'payment', status: 'completed' },
          { id: 'tx21', date: new Date(Date.now() - 3600000), type: 'debit', amount: 150, description: 'Ad Spend', category: 'ad_spend', status: 'completed' }
      ],
      aiSummary: 'Loyal client gave positive feedback. Added personal number.',
      messages: [{ id: 21, messageText: 'Great job! 01700000000 is my personal number.', attachmentType: AttachmentType.TEXT, fbMid: 'm21', createdTime: new Date() }]
    },
    {
      psid: '1016', userName: 'Real Estate Agent', status: 'negotiation', source: 'facebook', extractedMobile: '01555222333', extractedWebsite: 'https://remax.com', downloadCount: 4, unreadCount: 0, lastActive: new Date(Date.now() - 3600000 * 2),
      tags: ['Real Estate'], dealValue: 1200,
      aiSummary: 'Agent from Remax. Wants bulk leads. Negotiation phase.',
      messages: [{ id: 17, messageText: 'Contact 01555222333 or visit https://remax.com', attachmentType: AttachmentType.TEXT, fbMid: 'm17', createdTime: new Date() }]
    }
  ]);

  // 3. Meeting State
  const [meetings, setMeetings] = useState<Meeting[]>([
      { id: '1', psid: '1002', clientName: 'Jessica Alba', title: 'Finalize Proposal Details', date: new Date(new Date().setHours(10,0,0,0)), status: 'completed' },
      { id: '2', psid: '1005', clientName: 'Tech Startup BD', title: 'Onboarding Call', date: new Date(new Date().setHours(14,30,0,0)), status: 'pending' },
      { id: '3', psid: '1013', clientName: 'Dr. Strange', title: 'Consultation Follow-up', date: new Date(new Date().setHours(16,0,0,0)), status: 'pending' },
  ]);

  // 4. Admin Tasks State (Personal Task Manager)
  const [adminTasks, setAdminTasks] = useState<AdminTask[]>([
      { id: 'at1', title: 'Review new Facebook API Changes', isCompleted: false, createdAt: new Date() },
      { id: 'at2', title: 'Follow up with 5 new leads', description: 'Priority for today', isCompleted: false, createdAt: new Date() },
      { id: 'at3', title: 'Update invoice template', isCompleted: true, createdAt: new Date() }
  ]);

  // Helper function to extract data from text using Regex
  const extractInfo = (text: string) => {
    const info: Partial<Conversation> = {};
    const phoneRegex = /(?:\+88|0088)?(01[3-9]\d{8})/g;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) info.extractedMobile = phoneMatch[0];

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urlMatches = text.match(urlRegex);

    if (urlMatches) {
        urlMatches.forEach(url => {
            if (url.includes('facebook.com') || url.includes('fb.me')) {
                info.extractedFbLink = url;
            } else {
                info.extractedWebsite = url;
            }
        });
    }
    return info;
  };

  const handleUpdateStatus = (psid: string, status: LeadStatus) => {
    setConversations(conversations.map(c => 
        c.psid === psid ? { ...c, status } : c
    ));
  };

  const handleUpdateSummary = (psid: string, summary: string) => {
    setConversations(conversations.map(c =>
        c.psid === psid ? { ...c, aiSummary: summary } : c
    ));
  };
  
  const handleUpdateNotes = (psid: string, notes: string) => {
    setConversations(conversations.map(c => 
        c.psid === psid ? { ...c, notes } : c
    ));
  };

  const handleUpdateTags = (psid: string, tags: string[]) => {
    setConversations(conversations.map(c =>
        c.psid === psid ? { ...c, tags } : c
    ));
  };

  const handleUpdateDealValue = (psid: string, value: number) => {
    setConversations(conversations.map(c => 
        c.psid === psid ? { ...c, dealValue: value } : c
    ));
  };

  const handleLeadsExported = (psids: string[]) => {
    setConversations(conversations.map(c => 
        psids.includes(c.psid) ? { ...c, downloadCount: c.downloadCount + 1 } : c
    ));
  };

  const handleSendMessage = (psid: string, text: string) => {
      const newMessage = {
          id: Date.now(),
          messageText: text,
          attachmentType: AttachmentType.TEXT,
          fbMid: `mid.page.${Date.now()}`,
          isFromPage: true,
          createdTime: new Date()
      };

      setConversations(prev => prev.map(c => {
          if (c.psid === psid) {
              return {
                  ...c,
                  messages: [...c.messages, newMessage],
                  lastActive: new Date()
              };
          }
          return c;
      }));
  };

  // Saved Reply Handlers
  const handleAddReply = (reply: SavedReply) => {
    setSavedReplies([...savedReplies, reply]);
  };

  const handleUpdateReply = (updatedReply: SavedReply) => {
    setSavedReplies(savedReplies.map(r => r.id === updatedReply.id ? updatedReply : r));
  };

  const handleDeleteReply = (id: string) => {
    setSavedReplies(savedReplies.filter(r => r.id !== id));
  };

  const handleAddManualLead = (leadData: Partial<Conversation>) => {
    const newLead: Conversation = {
        psid: `manual_${Date.now()}`,
        userName: leadData.userName || 'Unknown Lead',
        status: leadData.status || 'new_lead',
        source: 'manual',
        unreadCount: 0,
        downloadCount: 0,
        lastActive: new Date(),
        aiSummary: 'Manual entry added by admin.',
        tags: [],
        dealValue: 0,
        messages: [{
            id: Date.now(),
            messageText: 'Manual entry created.',
            attachmentType: AttachmentType.TEXT,
            fbMid: 'manual_entry',
            createdTime: new Date()
        }],
        extractedMobile: leadData.extractedMobile,
        extractedWebsite: leadData.extractedWebsite,
        extractedFbLink: leadData.extractedFbLink,
        notes: leadData.notes
    };
    setConversations([newLead, ...conversations]);
  };

  const handleScheduleMeeting = (psid: string, title: string, date: Date) => {
      const client = conversations.find(c => c.psid === psid);
      if(!client) return;
      const newMeeting: Meeting = {
          id: Date.now().toString(),
          psid,
          clientName: client.userName,
          title,
          date,
          status: 'pending'
      };
      setMeetings([...meetings, newMeeting]);
  };

  const handleDeleteMeeting = (id: string) => {
      setMeetings(meetings.filter(m => m.id !== id));
  };

  const handleToggleMeetingStatus = (id: string) => {
      setMeetings(meetings.map(m => 
        m.id === id ? { ...m, status: m.status === 'pending' ? 'completed' : 'pending' } : m
      ));
  };
  
  // Navigation Helper
  const [selectedPsidForChat, setSelectedPsidForChat] = useState<string | null>(null);

  const handleOpenChatFromSchedule = (psid: string) => {
      setActiveTab('messages');
      setSelectedPsidForChat(psid);
  };

  // Portal Helper
  const handleOpenPortal = (psid: string) => {
      setPortalClientId(psid);
      setActiveTab('portal_view');
  };

  // --- ADMIN MANAGEMENT HANDLERS ---
  
  // 1. Client Top Up / Fund Management (Used by Portal AND Admin)
  const handleFundUpdate = (
      psid: string, 
      amount: number, 
      type: 'credit' | 'debit', 
      description: string, 
      category: TransactionCategory = 'other',
      metadata?: TransactionMetadata
  ) => {
      setConversations(prev => prev.map(c => {
          if (c.psid === psid) {
              const currentBalance = c.walletBalance || 0;
              const newBalance = type === 'credit' ? currentBalance + amount : currentBalance - amount;
              
              const newTx: Transaction = {
                  id: `tx_${Date.now()}`,
                  date: new Date(),
                  type: type,
                  amount: amount,
                  description: description,
                  category: category,
                  status: 'completed',
                  metadata: metadata
              };
              
              return {
                  ...c,
                  walletBalance: newBalance,
                  transactions: [newTx, ...(c.transactions || [])]
              };
          }
          return c;
      }));
  };

  // 2. Admin Edit Client Profile
  const handleUpdateClientProfile = (psid: string, data: Partial<Conversation>) => {
      setConversations(prev => prev.map(c => 
          c.psid === psid ? { ...c, ...data } : c
      ));
  };

  // 3. Admin Delete Transaction
  const handleDeleteTransaction = (psid: string, txId: string) => {
      setConversations(prev => prev.map(c => {
          if (c.psid === psid && c.transactions) {
              const txToDelete = c.transactions.find(t => t.id === txId);
              if (!txToDelete) return c;

              // Reverse the balance impact
              let newBalance = c.walletBalance || 0;
              if (txToDelete.type === 'credit') {
                  newBalance -= txToDelete.amount;
              } else {
                  newBalance += txToDelete.amount;
              }

              return {
                  ...c,
                  walletBalance: newBalance,
                  transactions: c.transactions.filter(t => t.id !== txId)
              };
          }
          return c;
      }));
  };

  // 4. Admin Edit Transaction
  const handleEditTransaction = (psid: string, txId: string, updatedTx: Partial<Transaction>) => {
      setConversations(prev => prev.map(c => {
          if (c.psid === psid && c.transactions) {
              const oldTx = c.transactions.find(t => t.id === txId);
              if (!oldTx) return c;

              // Calculate balance impact difference
              // 1. Revert old impact
              let tempBalance = c.walletBalance || 0;
              if (oldTx.type === 'credit') {
                  tempBalance -= oldTx.amount;
              } else {
                  tempBalance += oldTx.amount;
              }

              // 2. Apply new impact (from updated fields or falling back to old ones)
              const newAmount = updatedTx.amount !== undefined ? updatedTx.amount : oldTx.amount;
              const newType = updatedTx.type || oldTx.type;

              if (newType === 'credit') {
                  tempBalance += newAmount;
              } else {
                  tempBalance -= newAmount;
              }

              return {
                  ...c,
                  walletBalance: tempBalance,
                  transactions: c.transactions.map(t => t.id === txId ? { ...t, ...updatedTx } : t)
              };
          }
          return c;
      }));
  };

  // 5. Task Management Handlers (Client Specific)
  const handleAddTask = (psid: string, taskTitle: string, type: 'weekly' | 'monthly', priority: 'high' | 'medium' | 'low' = 'medium', deadline?: Date) => {
      setConversations(prev => prev.map(c => {
          if (c.psid === psid) {
              const newTask: ClientTask = {
                  id: `task_${Date.now()}`,
                  title: taskTitle,
                  type: type,
                  priority: priority,
                  deadline: deadline,
                  isCompleted: false,
                  assignedDate: new Date()
              };
              return {
                  ...c,
                  tasks: [newTask, ...(c.tasks || [])]
              };
          }
          return c;
      }));
  };

  const handleToggleTask = (psid: string, taskId: string) => {
      setConversations(prev => prev.map(c => {
          if (c.psid === psid && c.tasks) {
              return {
                  ...c,
                  tasks: c.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)
              };
          }
          return c;
      }));
  };

  const handleDeleteTask = (psid: string, taskId: string) => {
      setConversations(prev => prev.map(c => {
          if (c.psid === psid && c.tasks) {
              return {
                  ...c,
                  tasks: c.tasks.filter(t => t.id !== taskId)
              };
          }
          return c;
      }));
  };

  // 6. Admin Personal Task Handlers
  const handleAddAdminTask = (title: string, description?: string, relatedClientId?: string) => {
      const newTask: AdminTask = {
          id: `at_${Date.now()}`,
          title,
          description,
          relatedClientId,
          relatedClientName: relatedClientId ? conversations.find(c => c.psid === relatedClientId)?.userName : undefined,
          isCompleted: false,
          createdAt: new Date()
      };
      setAdminTasks([newTask, ...adminTasks]);
  };

  const handleToggleAdminTask = (taskId: string) => {
      setAdminTasks(adminTasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const handleDeleteAdminTask = (taskId: string) => {
      setAdminTasks(adminTasks.filter(t => t.id !== taskId));
  };

  const [settings, setSettings] = useState<PluginSettings>({
    pageAccessToken: '',
    verifyToken: 'my_custom_verify_token',
    appId: '',
    appSecret: '',
    webhookUrl: 'https://your-wordpress-site.com/?mfb_webhook=1',
    googleSheetId: '',
    googleServiceAccountJson: ''
  });

  const handleSimulateMessage = (
    text: string | null,
    type: AttachmentType,
    url?: string,
    psidInput?: string
  ) => {
    // ... existing logic ...
    const psid = psidInput || '1234567890123456';
    const messageContent = text || `(${type} attachment)`;

    const newMessage = {
      id: Date.now(),
      messageText: messageContent,
      attachmentType: type,
      attachmentUrl: url,
      fbMid: `mid.$simulated${Date.now()}`,
      createdTime: new Date(),
    };

    const extractedData = text ? extractInfo(text) : {};

    setConversations(prev => {
        const existingConvIndex = prev.findIndex(c => c.psid === psid);
        
        if (existingConvIndex >= 0) {
            const updatedConversations = [...prev];
            const conv = updatedConversations[existingConvIndex];
            
            updatedConversations[existingConvIndex] = {
                ...conv,
                messages: [...conv.messages, newMessage],
                lastActive: new Date(),
                unreadCount: conv.unreadCount + 1,
                extractedMobile: extractedData.extractedMobile || conv.extractedMobile,
                extractedWebsite: extractedData.extractedWebsite || conv.extractedWebsite,
                extractedFbLink: extractedData.extractedFbLink || conv.extractedFbLink,
                status: conv.status === 'converted' || conv.status === 'cold' ? 'negotiation' : conv.status 
            };
            return updatedConversations;
        } else {
            const newConv: Conversation = {
                psid: psid,
                userName: 'New User ' + psid.slice(-4), 
                status: 'new_lead',
                source: 'facebook',
                unreadCount: 1,
                lastActive: new Date(),
                downloadCount: 0,
                tags: ['New'],
                dealValue: 0,
                aiSummary: 'New user via Simulator. Needs qualification.',
                messages: [newMessage],
                ...extractedData
            };
            return [newConv, ...prev];
        }
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'settings':
        return <SettingsPanel settings={settings} updateSettings={setSettings} />;
      case 'messages':
        return (
            <MessengerCRM 
                conversations={conversations} 
                savedReplies={savedReplies}
                onUpdateStatus={handleUpdateStatus}
                onUpdateValue={() => {}} 
                onSendMessage={handleSendMessage}
                onAddReply={handleAddReply}
                onUpdateReply={handleUpdateReply}
                onDeleteReply={handleDeleteReply}
                onUpdateSummary={handleUpdateSummary}
                onScheduleMeeting={handleScheduleMeeting}
                onUpdateTags={handleUpdateTags}
                onUpdateDealValue={handleUpdateDealValue}
                onUpdateNotes={handleUpdateNotes}
            />
        );
      case 'schedules':
        return (
            <ScheduleManager 
                meetings={meetings} 
                conversations={conversations}
                onDeleteMeeting={handleDeleteMeeting}
                onToggleStatus={handleToggleMeetingStatus}
                onOpenChat={handleOpenChatFromSchedule}
            />
        );
      case 'tasks':
        return (
            <TaskManager 
                tasks={adminTasks}
                conversations={conversations}
                onAddTask={handleAddAdminTask}
                onToggleTask={handleToggleAdminTask}
                onDeleteTask={handleDeleteAdminTask}
            />
        );
      case 'leads':
        return <LeadDatabase 
                  conversations={conversations} 
                  onExport={handleLeadsExported} 
                  onAddManualLead={handleAddManualLead} 
                  onUpdateStatus={handleUpdateStatus}
               />;
      case 'client_report':
        return <ClientReport 
                  conversations={conversations}
                  onOpenPortal={handleOpenPortal}
                  onUpdateClientProfile={handleUpdateClientProfile}
                  onManageBalance={handleFundUpdate}
                  onDeleteTransaction={handleDeleteTransaction}
                  onEditTransaction={handleEditTransaction}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
               />;
      case 'invoices':
        return <InvoiceGenerator conversations={conversations} />;
      case 'simulator':
        return <WebhookSimulator onSimulateMessage={handleSimulateMessage} />;
      case 'dashboard':
      default:
        return <Dashboard 
                  conversations={conversations} 
                  meetings={meetings} 
                  onOpenChat={handleOpenChatFromSchedule} 
               />;
    }
  };

  // Special Route for Public Portal View (No Sidebar)
  if (activeTab === 'portal_view' && portalClientId) {
      const client = conversations.find(c => c.psid === portalClientId);
      if (client) {
          return (
              <ClientPortal 
                  client={client} 
                  onTopUp={(psid, amount) => handleFundUpdate(psid, amount, 'credit', 'Online Top-up', 'payment')} 
                  onToggleTask={handleToggleTask}
                  onExit={() => setActiveTab('client_report')} // In real app, this wouldn't exist for client
              />
          );
      }
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-64 p-8 h-screen overflow-hidden flex flex-col print:ml-0 print:p-0 print:h-auto print:overflow-visible">
        <header className="mb-6 flex justify-between items-center flex-shrink-0">
          <div>
             <h1 className="text-2xl font-bold text-slate-800 capitalize">
                {activeTab === 'messages' ? 'CRM & Inbox' : 
                 activeTab === 'leads' ? 'Lead Database' :
                 activeTab === 'client_report' ? 'Client Report & Portals' :
                 activeTab === 'tasks' ? 'Daily Tasks' :
                 activeTab === 'invoices' ? 'Invoice Generator' :
                 activeTab.replace('_', ' ')}
             </h1>
             <p className="text-slate-500 text-sm">
                {activeTab === 'client_report' ? 'Manage active client portfolios and portal access' : 
                 activeTab === 'tasks' ? 'Manage personal and agency-wide tasks' :
                 activeTab === 'invoices' ? 'Create and download PDF invoices for clients' :
                 'Manage your Facebook Messenger Integration'}
             </p>
          </div>
        </header>
        <div className="flex-1 overflow-auto print:overflow-visible">
            {activeTab === 'messages' && selectedPsidForChat ? (
                <MessengerCRM 
                    key={`crm-forced-${selectedPsidForChat}`}
                    conversations={conversations} 
                    savedReplies={savedReplies}
                    onUpdateStatus={handleUpdateStatus}
                    onUpdateValue={() => {}} 
                    onSendMessage={handleSendMessage}
                    onAddReply={handleAddReply}
                    onUpdateReply={handleUpdateReply}
                    onDeleteReply={handleDeleteReply}
                    onUpdateSummary={handleUpdateSummary}
                    onScheduleMeeting={handleScheduleMeeting}
                    onUpdateTags={handleUpdateTags}
                    onUpdateDealValue={handleUpdateDealValue}
                    onUpdateNotes={handleUpdateNotes}
                />
            ) : (
                renderContent()
            )}
        </div>
      </main>
    </div>
  );
};

export default App;