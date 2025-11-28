import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SettingsPanel from './components/SettingsPanel';
import PaymentSettings from './components/PaymentSettings';
import MessengerCRM from './components/MessengerCRM';
import Dashboard from './components/Dashboard';
import WebhookSimulator from './components/WebhookSimulator';
import LeadDatabase from './components/LeadDatabase';
import ScheduleManager from './components/ScheduleManager';
import ClientReport from './components/ClientReport';
import ClientPortal from './components/ClientPortal';
import TaskManager from './components/TaskManager';
import InvoiceGenerator from './components/InvoiceGenerator';
import WebsiteManager from './components/WebsiteManager'; 
import BulkSmsManager from './components/BulkSmsManager';
import AiSalesBrain from './components/AiSalesBrain'; 
import CampaignGenerator from './components/CampaignGenerator'; 
import PersonalVault from './components/PersonalVault'; 
import PublicLeadForm from './components/PublicLeadForm'; 
import ProposalBuilder from './components/ProposalBuilder'; 
import AutomationHub from './components/AutomationHub'; 
import AuditTool from './components/AuditTool'; 
import DailyBriefingModal from './components/DailyBriefingModal'; 
import { format, addDays, differenceInHours, isSameDay, differenceInDays } from 'date-fns';
import { Conversation, PluginSettings, AttachmentType, LeadStatus, SavedReply, Meeting, Transaction, TransactionCategory, TransactionMetadata, ClientTask, AdminTask, FbMessage, ClientWebsite, PaymentMethod, AiKnowledgeItem, SmsSettings, SmsCampaign, AiSettings, PersonalAccount, InvoiceRecord, Proposal, DripSequence, AutoReportConfig, ServiceType } from './types';
import { Bell, X, Send, AlertTriangle } from 'lucide-react'; 

// Helper function to replace missing date-fns export
const dateSubDays = (date: Date, amount: number): Date => {
    const d = new Date(date);
    d.setDate(d.getDate() - amount);
    return d;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [portalClientId, setPortalClientId] = useState<string | null>(null); 
  const [isPublicMode, setIsPublicMode] = useState(false); 
  const [notifications, setNotifications] = useState<string[]>([]); 
  
  // Daily Briefing State
  const [showDailyBriefing, setShowDailyBriefing] = useState(false);

  // MANUAL FALLBACK POPUP STATE (When AI doesn't know what to send)
  const [manualSendRequired, setManualSendRequired] = useState<{
      client: Conversation;
      dayCount: number;
  } | null>(null);
  const [manualFallbackMessage, setManualFallbackMessage] = useState('');

  // IMPORTANT: Set this to your live server URL
  const API_BASE_URL = 'https://akafshop.com'; 

  // --- GENERATE 50+ MOCK DATA POINTS ---
  const generateMockData = (): Conversation[] => {
      const statuses: LeadStatus[] = ['new_lead', 'interested', 'negotiation', 'active_client', 'cold', 'converted', 'past_client'];
      const sources = ['facebook', 'manual', 'web_form'];
      const services: ServiceType[] = ['fb_ads', 'web_dev', 'funnel', 'seo', 'other'];
      
      const names = [
          'Rahim Store', 'Fashion BD', 'Tech Point', 'Dr. Ariful Islam', 'Advocate Karim', 
          'Sadia Parlour', 'Dhaka Real Estate', 'Organic Foods BD', 'Learning Hub', 'Travel Xpress',
          'Mobile Gadget Shop', 'Fitness Plus', 'Burger King Dhanmondi', 'Cloud Solutions', 'Interior Studio',
          'Dream Weavers', 'Wedding Diaries', 'Car Bazar', 'Bike Point', 'Pet Lovers BD',
          'Gaming Zone', 'Kids Wear', 'Saree House', 'Punjabi World', 'Shoe Box',
          'Electro Mart', 'Home Decor', 'Beauty & Glam', 'Corporate Gifts', 'Event Management Pro',
          'Digital Marketers', 'Freelancer Apu', 'Graphic Art', 'Video Editors Guild', 'Content House',
          'SEO Master', 'Web Devs BD', 'App Studio', 'Hosting Provider', 'Domain seller',
          'T-Shirt Print', 'Mug Print', 'Gift Shop', 'Flower House', 'Cake Art',
          'Biryani House', 'Kebab Zone', 'Pizza Palace', 'Coffee Time', 'Tea Stall VIP'
      ];

      return names.map((name, index) => {
          const psid = (1000 + index).toString();
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const source = sources[Math.floor(Math.random() * sources.length)] as any;
          const serviceType = services[Math.floor(Math.random() * services.length)];
          
          const hasPhone = Math.random() > 0.3;
          const hasWeb = Math.random() > 0.5;
          const isClient = status === 'active_client' || status === 'converted';
          
          // Generate Transactions for Clients
          const transactions: Transaction[] = [];
          if (isClient) {
              // Initial Deposit
              transactions.push({
                  id: `tx_${psid}_1`,
                  date: dateSubDays(new Date(), Math.floor(Math.random() * 60)),
                  type: 'credit',
                  amount: Math.floor(Math.random() * 500) + 100,
                  description: 'Initial Deposit',
                  category: 'payment',
                  status: 'completed'
              });
              // Ad Spends
              for(let i=0; i<5; i++) {
                  transactions.push({
                      id: `tx_${psid}_ad_${i}`,
                      date: dateSubDays(new Date(), Math.floor(Math.random() * 30)),
                      type: 'debit',
                      amount: Math.floor(Math.random() * 50) + 10,
                      description: 'Daily Ad Spend',
                      category: 'ad_spend',
                      status: 'completed',
                      metadata: {
                          impressions: Math.floor(Math.random() * 5000) + 1000,
                          reach: Math.floor(Math.random() * 4000) + 800,
                          messages: Math.floor(Math.random() * 20) + 1,
                          conversions: Math.floor(Math.random() * 5)
                      }
                  });
              }
          }

          // Randomize Low Balance Alert Settings
          const alertEnabled = Math.random() > 0.5;
          const alertThreshold = Math.floor(Math.random() * 50) + 10;

          return {
              psid,
              userName: name,
              status,
              source,
              serviceType,
              statusChangedDate: dateSubDays(new Date(), Math.floor(Math.random() * 10)), // Mocked status change date
              extractedMobile: hasPhone ? `017${Math.floor(Math.random() * 100000000)}` : undefined,
              extractedWebsite: hasWeb ? `https://${name.replace(/\s/g, '').toLowerCase()}.com` : undefined,
              extractedFbLink: `https://fb.com/${name.replace(/\s/g, '.')}`,
              walletBalance: isClient ? Math.floor(Math.random() * 500) : 0,
              lowBalanceAlert: { isEnabled: alertEnabled, threshold: alertThreshold }, 
              downloadCount: Math.floor(Math.random() * 5),
              smsCount: Math.floor(Math.random() * 10),
              unreadCount: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
              lastActive: dateSubDays(new Date(), Math.floor(Math.random() * 10)),
              tags: isClient ? ['VIP', 'Retainer'] : Math.random() > 0.5 ? ['Hot Lead'] : [],
              dealValue: isClient ? Math.floor(Math.random() * 2000) + 500 : 0,
              aiEnabled: Math.random() > 0.5,
              aiSummary: `Generated lead for ${name}. Interested in digital marketing services.`,
              messages: [
                  { 
                      id: Date.now(), 
                      messageText: 'Hi, I am interested in your services.', 
                      attachmentType: AttachmentType.TEXT, 
                      fbMid: `mid_${index}`, 
                      createdTime: dateSubDays(new Date(), 1),
                      isFromPage: false
                  }
              ],
              transactions: transactions,
              invoices: [],
              tasks: [],
              isBestQuality: Math.random() > 0.8,
              portalPermissions: {
                  viewBalance: true,
                  allowTopUp: false,
                  viewHistory: true,
                  showTotalDeposit: true,
                  showTotalSpend: true
              }
          };
      });
  };

  // 1. Initial Saved Replies
  const [savedReplies, setSavedReplies] = useState<SavedReply[]>([
    { 
      id: '1', 
      label: "👋 Power Intro", 
      text: "আসসালামু আলাইকুম! আপনার পেজটি দেখলাম, প্রোডাক্টগুলো দারুণ। কিন্তু মনে হচ্ছে রিচ একটু কম হচ্ছে। আমরা বুস্ট ছাড়াই অর্গানিক রিচ বাড়াতে সাহায্য করি। বিস্তারিত জানতে চান?", 
      status: ['Greeting'] 
    },
    { 
      id: '2', 
      label: "🏆 Social Proof", 
      text: "আমাদের রিসেন্ট একটি ক্লায়েন্টের সেলস গত মাসে ৪০% বেড়েছে। আমরা তাদের জন্য যে স্ট্র্যাটেজি ব্যবহার করেছি, সেটা আপনার সাথে শেয়ার করতে পারি। দেখাবো?", 
      status: ['Details'] 
    },
    { 
      id: '3', 
      label: "💰 Price Objection", 
      text: "বাজেট নিয়ে চিন্তা করবেন না। যদি ৫০০ টাকা খরচ করে ২০০০ টাকার সেলস আসে, তবে কি সেটা লস হবে? আমরা এভাবেই আরওআই ফোকাসড অ্যাড রান করি।", 
      status: ['Objection'] 
    },
    { 
      id: '4', 
      label: "📞 Push to Call", 
      text: "মেসেজে সব বুঝিয়ে বলা কঠিন। আপনার কি ১০ মিনিট সময় হবে? আমি কল দিয়ে বিস্তারিত বলতাম।", 
      status: ['Closing'] 
    },
    { 
      id: '5', 
      label: "🔥 Urgency Close", 
      text: "আমাদের এই মাসের স্লট প্রায় শেষ। আপনি যদি আজ কনফার্ম করেন, তবে আমরা এখনই কাজ শুরু করতে পারব। ইনভয়েস পাঠাবো?", 
      status: ['Closing'] 
    },
    { 
      id: '6', 
      label: "✅ Welcome Kit", 
      text: "ধন্যবাদ! আমি ইনভয়েস পাঠিয়েছি। পেমেন্ট ক্লিয়ার হলে ২৪ ঘন্টার মধ্যে কাজ শুরু হবে। 🚀", 
      status: ['Details'] 
    },
  ]);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  
  // AUTOMATION STATE - With Professional Bengali Templates
  const [dripSequences, setDripSequences] = useState<DripSequence[]>([
      {
          id: 'ds1',
          triggerStatus: 'interested',
          isEnabled: true,
          steps: [
              { id: 's1', dayDelay: 1, message: 'প্রিয় {{name}}, Social Ads Expert এ আগ্রহ দেখানোর জন্য ধন্যবাদ! 🤝 আমাদের পোর্টফোলিও এবং সফল প্রোজেক্টগুলো দেখতে এই লিংকে ক্লিক করুন: [LINK] - আমরা আপনার বিজনেসের গ্রোথ নিয়ে কথা বলতে চাই।' },
              { id: 's2', dayDelay: 3, message: 'জানেন কি? সঠিক ফানেল স্ট্র্যাটেজি ব্যবহার করে আমাদের ক্লায়েন্টরা গড়ে ২০০% পর্যন্ত সেলস বাড়াতে পেরেছে। 🚀 আপনার বিজনেসেও এই স্ট্র্যাটেজি কিভাবে কাজ করবে তা জানতে আমাদের সাথে কথা বলুন।' },
              { id: 's3', dayDelay: 5, message: 'প্রিয় {{name}}, এই মাসে আমাদের প্রিমিয়াম কনসালটেশনের স্লট প্রায় শেষ। আপনি কি আপনার ফ্রি স্ট্র্যাটেজি কলটি বুক করতে চান? রিপ্লাই করুন "YES" অথবা কল করুন 017...' }
          ]
      },
      // NEW: Win-Back / Project Ended Sequence (7 STEPS - 5, 10, 15, 21, 30, 45, 60)
      {
          id: 'ds2',
          triggerStatus: 'past_client',
          isEnabled: true,
          steps: [
              { id: 'wb1', dayDelay: 5, message: 'প্রিয় {{name}}, ধন্যবাদ আমাদের সাথে কাজ করার জন্য! 🤝 আশা করি প্রোজেক্টটি আপনার উপকারে এসেছে। কোনো সাপোর্ট লাগলে জানাবেন।' },
              { id: 'wb2', dayDelay: 10, message: 'আসসালামু আলাইকুম {{name}}, ১০ দিন হলো আমাদের প্রোজেক্ট শেষ হয়েছে। আপনার বিজনেসের বর্তমান অবস্থা কেমন? নতুন কোনো ক্যাম্পেইন প্ল্যান করতে চাইলে আমরা আছি।' },
              { id: 'wb3', dayDelay: 15, message: 'প্রিয় {{name}}, ফেসবুকে নতুন কিছু আপডেট এসেছে যা আপনার সেলস বাড়াতে পারে। আমরা পুরাতন ক্লায়েন্টদের জন্য ফ্রি অডিট দিচ্ছি। কথা বলতে চান?' },
              { id: 'wb4', dayDelay: 21, message: 'হ্যালো {{name}}, আপনি কি জানেন আমাদের পুরাতন ক্লায়েন্টরা "Retaining Package" এ ২০% ডিসকাউন্ট পায়? আপনার বিজনেসকে নেক্সট লেভেলে নিতে আজই কল করুন।' },
              { id: 'wb5', dayDelay: 30, message: 'প্রিয় {{name}}, ১ মাস হয়ে গেল আমরা শেষ কথা বলেছি। আপনার কম্পিটিটররা কিন্তু থেমে নেই! 🚀 আসুন আপনার মার্কেটিং স্ট্র্যাটেজিটি নতুন করে সাজাই।' },
              { id: 'wb6', dayDelay: 45, message: 'লং টাইম নো সি {{name}}! 👋 সামনে ঈদ/সিজনাল সেলস আসছে। এখনই সেরা সময় নতুন অ্যাড রান করার। আপনার জন্য আমাদের টিম রেডি আছে।' },
              { id: 'wb7', dayDelay: 60, message: 'প্রিয় {{name}}, আমাদের শেষ কথা হওয়ার পর ৬০ দিন পার হয়েছে। আপনার ডিজিটাল মার্কেটিং পার্টনার হিসেবে আমরা চাই আপনার বিজনেসের উন্নতি অব্যাহত থাকুক। আপনার জন্য আমাদের একটি বিশেষ কামব্যাক অফার আছে - আমাদের কমপ্লিট এসইও অডিটে ৩০% ডিসকাউন্ট। অফারটি নিতে রিপ্লাই দিন "YES"।' }
          ]
      }
  ]);
  const [reportConfig, setReportConfig] = useState<AutoReportConfig>({
      isEnabled: true,
      frequency: 'weekly',
      method: 'sms',
      includeMetrics: ['spend', 'sales']
  });

  const [personalAccounts, setPersonalAccounts] = useState<PersonalAccount[]>([
      { id: '1', platformName: 'Facebook Personal', category: 'social', username: 'my.email@gmail.com', password: 'password123', notes: 'Main personal account' },
      { id: '2', platformName: 'Udemy', category: 'course', username: 'student@gmail.com', password: 'coursePass!', notes: 'Marketing courses here' }
  ]);

  const handleAddPersonalAccount = (account: PersonalAccount) => {
      setPersonalAccounts([...personalAccounts, account]);
  };

  const handleUpdatePersonalAccount = (updatedAccount: PersonalAccount) => {
      setPersonalAccounts(personalAccounts.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
  };

  const handleDeletePersonalAccount = (id: string) => {
      setPersonalAccounts(personalAccounts.filter(acc => acc.id !== id));
  };

  const [aiKnowledgeBase, setAiKnowledgeBase] = useState<AiKnowledgeItem[]>([
      { id: '1', category: 'Services', question: 'আপনারা কি কি সার্ভিস দেন?', answer: 'আমরা মূলত ফেসবুক অ্যাডস, সেলস ফানেল তৈরি এবং ওয়েবসাইট ডেভেলপমেন্ট সার্ভিস দিয়ে থাকি।' },
      { id: '2', category: 'Pricing', question: 'সার্ভিস চার্জ বা খরচ কেমন?', answer: 'আমাদের প্যাকেজ সাধারণত ৫০০০ টাকা থেকে শুরু হয়।' }
  ]);

  const [aiSettings, setAiSettings] = useState<AiSettings>({
      activeMode: 'manual',
      paidConfig: { provider: 'gemini', apiKey: '', model: 'gemini-3-pro-preview' },
      freeConfig: { provider: 'gemini', apiKey: '', model: 'gemini-2.5-flash' }
  });

  const [aiPersona, setAiPersona] = useState<string>(`
CONTEXT:
You are an expert Sales Agent for "Social Ads Expert", a Bangladeshi Digital Marketing Agency.
Your goal is to CONVERT leads into clients by being persuasive, professional, and friendly.
CRITICAL INSTRUCTIONS:
1. **LANGUAGE**: You MUST reply in **Bengali (Bangla)**.
`);

  const [smsSettings, setSmsSettings] = useState<SmsSettings>({
      apiUrl: '',
      apiKey: '',
      senderId: '',
      method: 'GET',
      paramMap: { to: 'to', message: 'message', apiKey: 'api_key' }
  });
  const [smsHistory, setSmsHistory] = useState<SmsCampaign[]>([
      { id: '1', name: 'Eid Promo Blast', message: 'Eid Mubarak! Get 50% off.', targetAudience: 'All Leads', totalSent: 120, timestamp: dateSubDays(new Date(), 2), status: 'sent' }
  ]);

  // 2. State for Conversations (Clients)
  const [conversations, setConversations] = useState<Conversation[]>(generateMockData());
  const [isLoading, setIsLoading] = useState(true);

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
      { id: '1', category: 'mobile', provider: 'Bkash', type: 'Personal', accountNumber: '01700000000', instructions: 'Send money using Send Money option.' },
      { id: '2', category: 'bank', provider: 'City Bank', type: 'Current', accountNumber: '1234567890', accountName: 'Social Ads Expert', instructions: 'Use Invoice ID as reference.', branchName: 'Gulshan 1', routingNumber: '123456789' },
      { id: '3', category: 'mobile', provider: 'Nagad', type: 'Merchant', accountNumber: '01800000000', instructions: 'Payment option.' }
  ]);

  // ... (Helper functions like handleAddPaymentMethod, extractInfo, logApiWarning, addNotification...) ...
  
  const handleAddPaymentMethod = (method: PaymentMethod) => {
      setPaymentMethods([...paymentMethods, method]);
  };

  const handleDeletePaymentMethod = (id: string) => {
      setPaymentMethods(paymentMethods.filter(p => p.id !== id));
  };

  const extractInfo = (text: string) => {
    const info: Partial<Conversation> = {};
    const phoneRegex = /(?:\+8801|8801|01)[3-9]\d{8}/g;
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

  const logApiWarning = (context: string, error: unknown) => {
      console.warn(`[API] ${context} failed (Demo Mode - Backend Unavailable):`, error);
  };

  const addNotification = (msg: string) => {
      setNotifications(prev => [msg, ...prev]);
      setTimeout(() => setNotifications(prev => prev.filter(n => n !== msg)), 5000);
  };

  const handleUpdateClientProfile = async (psid: string, data: Partial<Conversation>) => {
      setConversations(prev => prev.map(c => {
          if (c.psid === psid) {
              const updates: Partial<Conversation> = { ...data };
              
              // NEW: Timestamp when status changes
              if (data.status && data.status !== c.status) {
                  updates.statusChangedDate = new Date();
                  
                  // Trigger notification for Drip
                  const drip = dripSequences.find(d => d.triggerStatus === data.status && d.isEnabled);
                  if (drip) {
                      setTimeout(() => {
                          addNotification(`🚀 Automation Started: "${drip.triggerStatus.replace('_', ' ')}" Drip Sequence triggered for ${c.userName}.`);
                      }, 500);
                  }
              }
              return { ...c, ...updates };
          }
          return c;
      }));

      try {
        const payload = { psid, ...data };
        await fetch(`${API_BASE_URL}/api/update_client.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
      } catch (error) {
          logApiWarning("update_client", error);
      }
  };

  const handleUpdateIndustry = (psid: string, industry: string) => handleUpdateClientProfile(psid, { industry: industry as any });
  const handleUpdateServiceType = (psid: string, serviceType: string) => handleUpdateClientProfile(psid, { serviceType: serviceType as ServiceType });

  // API Integration: Fetch Clients with Retry and Robust JSON Handling
  const fetchClients = async () => {
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/get_clients.php?_t=${Date.now()}`);
            
            // Only error on server failure, allow retries
            if (!response.ok && response.status >= 500) {
                throw new Error(`HTTP ${response.status}`);
            } else if (!response.ok) {
                // 4xx error, break loop
                break; 
            }

            const text = await response.text();
            
            // Validate Empty response
            if (!text || text.trim().length === 0) {
                if (conversations.length <= 4) setConversations(generateMockData());
                return;
            }

            // Validate JSON
            let data;
            try { 
                data = JSON.parse(text); 
            } catch (e) {
                console.warn(`[API] JSON Parse error in fetchClients:`, e);
                // Don't retry on parse error, data is corrupt
                if (conversations.length <= 4) setConversations(generateMockData());
                return;
            }
            
            if (Array.isArray(data) || (data && data.status !== 'error')) {
                    const rawList = Array.isArray(data) ? data : [];
                    const mappedData: Conversation[] = rawList.map((row: any) => ({
                        psid: row.psid,
                        userName: row.user_name || 'Unknown User',
                        status: row.status,
                        source: row.source,
                        extractedMobile: row.mobile,
                        extractedWebsite: row.website,
                        extractedFbLink: row.fb_link,
                        walletBalance: parseFloat(row.wallet_balance || '0'),
                        lowBalanceAlert: row.low_balance_alert ? JSON.parse(row.low_balance_alert) : { isEnabled: false, threshold: 10 },
                        downloadCount: 0,
                        smsCount: 0,
                        unreadCount: 0, 
                        lastActive: new Date(row.last_active || Date.now()),
                        messages: [], 
                        tags: row.tags ? JSON.parse(row.tags) : [],
                        tasks: [],
                        transactions: [],
                        invoices: [],
                        aiEnabled: row.ai_enabled == 1, 
                        notes: row.notes,
                        industry: row.industry,
                        serviceType: row.service_type,
                        portalPermissions: row.portal_permissions ? JSON.parse(row.portal_permissions) : {
                            viewBalance: true,
                            allowTopUp: false,
                            viewHistory: true,
                            showTotalDeposit: true,
                            showTotalSpend: true
                        }
                    }));

                    setConversations(prev => {
                        if(prev.length === 0) return mappedData;
                        return mappedData.map(newC => {
                            const existing = prev.find(p => p.psid === newC.psid);
                            return existing ? { 
                                ...newC, 
                                messages: existing.messages, 
                                aiEnabled: existing.aiEnabled ?? newC.aiEnabled, 
                                invoices: existing.invoices, 
                                notes: existing.notes || newC.notes, 
                                transactions: existing.transactions || [], 
                                tasks: existing.tasks || [],
                                statusChangedDate: existing.statusChangedDate,
                                lastAutomatedMessageDate: existing.lastAutomatedMessageDate 
                            } : newC;
                        });
                    });
                    return; // Success
            } else {
                if (conversations.length <= 4) setConversations(generateMockData());
                return;
            }
        } catch (error) {
            attempts++;
            if (attempts >= maxAttempts) {
                logApiWarning("fetchClients", error);
                if (conversations.length <= 4) setConversations(generateMockData());
            } else {
                // Exponential backoff
                await new Promise(r => setTimeout(r, 1000 * attempts)); 
            }
        }
    }
    setIsLoading(false);
  };

  // Fetch Client Messages with Retry and Robust JSON
  const fetchClientMessages = async (psid: string) => {
    let attempts = 0;
    const maxAttempts = 3;

    while(attempts < maxAttempts) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/get_messages.php?sender_id=${psid}&_t=${Date.now()}`);
            
            if (!response.ok && response.status >= 500) {
                 throw new Error(`HTTP ${response.status}`);
            } else if (!response.ok) {
                 break; 
            }

            const text = await response.text();
            if (!text || text.trim().length === 0) return;
            
            let data;
            try { 
                data = JSON.parse(text); 
            } catch (e) { 
                console.warn(`[API] JSON Parse error in fetchClientMessages for ${psid}`);
                return; 
            }

            if (Array.isArray(data)) {
                const fetchedMessages: FbMessage[] = data.map((msg: any) => ({
                    id: msg.id,
                    messageText: msg.message,
                    attachmentType: (msg.attachment_type as AttachmentType) || AttachmentType.TEXT,
                    attachmentUrl: msg.attachment_url,
                    fbMid: msg.mid,
                    isFromPage: msg.is_from_page == 1 || msg.is_from_page === true,
                    createdTime: new Date(msg.created_at)
                }));
                
                setConversations(prev => prev.map(c => c.psid === psid ? { ...c, messages: fetchedMessages } : c));
                return; // Success
            }
            return;

        } catch (e) {
            attempts++;
            if (attempts >= maxAttempts) {
                logApiWarning("fetchClientMessages", e);
            } else {
                await new Promise(r => setTimeout(r, 1000 * attempts));
            }
        }
    }
  };

  // --- STARTUP LOGIC & AUTOMATION ENGINE ---
  useEffect(() => {
    fetchClients();
    const interval = setInterval(fetchClients, 15000);

    // DAILY BRIEFING CHECK LOGIC
    const checkBriefing = () => {
        const lastBriefingTime = localStorage.getItem('lastBriefingTime');
        const tenHours = 10 * 60 * 60 * 1000;
        const now = Date.now();

        if (!lastBriefingTime || (now - parseInt(lastBriefingTime)) > tenHours) {
            // Show briefing if never shown OR 10 hours passed
            setShowDailyBriefing(true);
        }
    };
    
    // Check on load
    setTimeout(checkBriefing, 2000); // Small delay for effect

    // --- 🚀 ADVANCED AUTOMATION WORKER (The Brain) ---
    // Runs every 60 seconds to check for Drip Triggers
    const automationInterval = setInterval(() => {
        const today = new Date();
        
        setConversations(currentConversations => {
            let hasUpdates = false;
            let manualReq = null;
            
            const updatedConversations = currentConversations.map(client => {
                // 1. Skip if no status date or automation not needed
                if (!client.statusChangedDate) return client;

                // 2. Find matching Active Sequence for this client's status
                const activeSeq = dripSequences.find(s => s.triggerStatus === client.status && s.isEnabled);
                if (!activeSeq) return client;

                // 3. Calculate Days Inactive
                const daysPassed = differenceInDays(today, new Date(client.statusChangedDate));
                
                // 4. Check if a message is scheduled for THIS exact day
                // AND ensure we haven't already sent an automation today (Spam Guard)
                const alreadySentToday = client.lastAutomatedMessageDate && isSameDay(new Date(client.lastAutomatedMessageDate), today);
                
                if (alreadySentToday) return client;

                // 5. Find Template OR Check for Milestone Fallback
                const stepToTrigger = activeSeq.steps.find(step => step.dayDelay === daysPassed);
                const isMilestone = [5, 10, 15, 21, 30, 45, 60].includes(daysPassed); // Check specific milestones

                if (stepToTrigger) {
                    // --- CASE A: TEMPLATE EXISTS -> AUTO SEND ---
                    console.log(`[AUTO] Sending Day ${daysPassed} msg to ${client.userName}`);
                    
                    const personalizedMsg = stepToTrigger.message.replace('{{name}}', client.userName);
                    
                    // In real production, this would call your backend API endpoint
                    
                    // B. Show Notification to Admin
                    addNotification(`🤖 Auto-SMS sent to ${client.userName} (Day ${daysPassed} Rule)`);

                    hasUpdates = true;
                    
                    // C. Return updated client object
                    return {
                        ...client,
                        lastAutomatedMessageDate: new Date(),
                        smsCount: (client.smsCount || 0) + 1,
                        messages: [
                            ...client.messages,
                            {
                                id: Date.now(),
                                messageText: `[AUTO-SMS]: ${personalizedMsg}`,
                                attachmentType: AttachmentType.TEXT,
                                fbMid: `auto_${Date.now()}`,
                                isFromPage: true,
                                createdTime: new Date()
                            }
                        ]
                    };
                } else if (isMilestone) {
                     // --- CASE B: NO TEMPLATE -> MANUAL POPUP REQUEST ---
                     // We found a milestone (e.g., Day 20) but no rule exists for it.
                     // Trigger manual intervention only if not already asking for someone else
                     if (!manualReq) {
                         manualReq = { client, dayCount: daysPassed };
                     }
                }

                return client;
            });

            // If we found a manual request, set it (outside the map to avoid conflicts)
            if (manualReq) {
                setManualSendRequired(manualReq);
            }

            return hasUpdates ? updatedConversations : currentConversations;
        });

    }, 60000); // Check every 1 minute

    return () => {
        clearInterval(interval);
        clearInterval(automationInterval);
    };
  }, [dripSequences]);

  const handleCloseBriefing = () => {
      setShowDailyBriefing(false);
      localStorage.setItem('lastBriefingTime', Date.now().toString());
  };

  const handleBriefingQuickAction = (action: string, id: string) => {
      if (action === 'sms_reminder') {
          // Trigger SMS logic
          addNotification(`SMS Reminder queued for client ID: ${id}`);
      } else if (action === 'call') {
          window.open(`tel:${id}`);
      } else if (action === 'chat') {
          handleOpenChatFromSchedule(id);
          setShowDailyBriefing(false);
      }
  };

  const handleManualSendSubmit = () => {
      if (manualSendRequired && manualFallbackMessage) {
          handleSendMessage(manualSendRequired.client.psid, manualFallbackMessage);
          alert(`Message Sent to ${manualSendRequired.client.userName}! System marked as handled for today.`);
          
          // Mark as sent in conversation to avoid re-triggering today
          setConversations(prev => prev.map(c => {
              if (c.psid === manualSendRequired.client.psid) {
                  return { ...c, lastAutomatedMessageDate: new Date() };
              }
              return c;
          }));

          setManualSendRequired(null);
          setManualFallbackMessage('');
      }
  };

  // --- MOCK SCHEDULES & TASKS ---
  const [meetings, setMeetings] = useState<Meeting[]>([
      { id: '1', psid: '1002', clientName: 'Fashion BD', title: 'Campaign Strategy', date: new Date(new Date().setHours(10,0,0,0)), status: 'completed' },
      { id: '2', psid: '1005', clientName: 'Tech Point', title: 'Monthly Review', date: new Date(new Date().setHours(14,30,0,0)), status: 'pending' }
  ]);

  const [adminTasks, setAdminTasks] = useState<AdminTask[]>([
      { id: 'at1', title: 'Review Facebook API V19', status: 'todo', priority: 'high', isCompleted: false, createdAt: new Date() }
  ]);

  useEffect(() => {
      // Optional: Persist tasks
  }, [adminTasks]);
  
  const [websites, setWebsites] = useState<ClientWebsite[]>([
      {
          id: '1', clientId: '1005', clientName: 'Tech Point', websiteUrl: 'https://techpoint.com.bd', 
          adminUrl: 'https://techpoint.com.bd/wp-admin', provider: 'Hostinger', expiryDate: '2024-12-31',
          wpUser: 'admin', wpPass: 'Tech@2024', cpanelUser: 'tech_cp', cpanelPass: 'server123', cost: '5000 BDT'
      }
  ]);

  const handleAddWebsite = (site: ClientWebsite) => setWebsites([...websites, site]);
  const handleUpdateWebsite = (updatedSite: ClientWebsite) => setWebsites(websites.map(s => s.id === updatedSite.id ? updatedSite : s));
  const handleDeleteWebsite = (id: string) => setWebsites(websites.filter(s => s.id !== id));

  const [settings, setSettings] = useState<PluginSettings>({
      pageAccessToken: '', verifyToken: 'my_custom_verify_token', appId: '', appSecret: '', webhookUrl: 'https://akafshop.com/api/webhook.php', googleSheetId: '', googleServiceAccountJson: ''
  });

  const handleSaveSettings = async () => {
      try {
          await fetch(`${API_BASE_URL}/api/save_settings.php`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(settings)
          });
          alert("Settings saved to Database!");
      } catch (e) {
          logApiWarning("save_settings", e);
          alert("Settings saved locally (Demo Mode).");
      }
  };

  const handleUpdateStatus = (psid: string, status: LeadStatus) => handleUpdateClientProfile(psid, { status });
  const handleUpdateSummary = (psid: string, summary: string) => handleUpdateClientProfile(psid, { aiSummary: summary });
  const handleUpdateNotes = (psid: string, notes: string) => handleUpdateClientProfile(psid, { notes });
  const handleUpdateTags = (psid: string, tags: string[]) => handleUpdateClientProfile(psid, { tags });
  const handleUpdateDealValue = (psid: string, value: number) => handleUpdateClientProfile(psid, { dealValue: value });
  
  const handleToggleAi = (psid: string, enabled: boolean) => handleUpdateClientProfile(psid, { aiEnabled: enabled });
  const handleToggleBestQuality = (psid: string) => {
      const client = conversations.find(c => c.psid === psid);
      if (client) handleUpdateClientProfile(psid, { isBestQuality: !client.isBestQuality });
  };

  const handleLeadsExported = (psids: string[]) => {
    setConversations(prev => prev.map(c => psids.includes(c.psid) ? { ...c, downloadCount: c.downloadCount + 1 } : c));
  };

  const handleSmsSent = (psids: string[]) => {
      setConversations(prev => prev.map(c => psids.includes(c.psid) ? { ...c, smsCount: (c.smsCount || 0) + 1 } : c));
  };

  const handleSendMessage = async (psid: string, text: string, attachmentType: AttachmentType = AttachmentType.TEXT, attachmentUrl?: string) => {
      const newMessage = {
          id: Date.now(),
          messageText: text,
          attachmentType: attachmentType,
          attachmentUrl: attachmentUrl,
          fbMid: `mid.page.${Date.now()}`,
          isFromPage: true,
          createdTime: new Date()
      };

      setConversations(prev => prev.map(c => {
          if (c.psid === psid) {
              return { ...c, messages: [...c.messages, newMessage], lastActive: new Date() };
          }
          return c;
      }));

      try {
          await fetch(`${API_BASE_URL}/api/send_message.php`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ recipient_id: psid, message_text: text, attachment_type: attachmentType, attachment_url: attachmentUrl })
          });
      } catch(e) {
          logApiWarning("send_message", e);
      }
  };

  // Template Handlers
  const handleAddReply = (reply: SavedReply) => setSavedReplies([...savedReplies, reply]);
  const handleUpdateReply = (updatedReply: SavedReply) => setSavedReplies(savedReplies.map(r => r.id === updatedReply.id ? updatedReply : r));
  const handleDeleteReply = (id: string) => setSavedReplies(savedReplies.filter(r => r.id !== id));

  // AI Knowledge Base Handlers
  const handleAddAiKnowledge = (item: AiKnowledgeItem) => setAiKnowledgeBase([...aiKnowledgeBase, item]);
  const handleUpdateAiKnowledge = (updatedItem: AiKnowledgeItem) => setAiKnowledgeBase(aiKnowledgeBase.map(item => item.id === updatedItem.id ? updatedItem : item));
  const handleDeleteAiKnowledge = (id: string) => setAiKnowledgeBase(aiKnowledgeBase.filter(item => item.id !== id));

  // SMS Handlers
  const handleSaveSmsSettings = (newSettings: SmsSettings) => setSmsSettings(newSettings);
  const handleSaveSmsCampaign = (campaign: SmsCampaign) => setSmsHistory([campaign, ...smsHistory]);

  const handleAddManualLead = async (leadData: Partial<Conversation>) => {
    const newLead: Conversation = {
        psid: leadData.psid || `manual_${Date.now()}`,
        userName: leadData.userName || 'Unknown Lead',
        status: leadData.status || 'new_lead',
        source: leadData.source || 'manual',
        unreadCount: 0,
        downloadCount: 0,
        smsCount: 0,
        lastActive: new Date(),
        aiSummary: 'New entry added via form/admin.',
        tags: [],
        dealValue: 0,
        messages: [{ id: Date.now(), messageText: 'Lead created in system.', attachmentType: AttachmentType.TEXT, fbMid: 'manual_entry', createdTime: new Date() }],
        extractedMobile: leadData.extractedMobile,
        extractedWebsite: leadData.extractedWebsite,
        extractedFbLink: leadData.extractedFbLink,
        notes: leadData.notes,
        businessInfo: leadData.businessInfo,
        invoices: []
    };

    setConversations([newLead, ...conversations]);

    try {
        await fetch(`${API_BASE_URL}/api/save_lead.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newLead)
        });
    } catch (e) {
        logApiWarning("save_lead", e);
    }
  };

  const handleScheduleMeeting = (psid: string, title: string, date: Date, reminderConfig?: { enabled: boolean, timeBefore: number, message: string }) => {
      const client = conversations.find(c => c.psid === psid);
      if(!client) return;
      const newMeeting: Meeting = {
          id: Date.now().toString(),
          psid,
          clientName: client.userName,
          title,
          date,
          status: 'pending',
          reminder: reminderConfig
      };
      setMeetings([...meetings, newMeeting]);
  };

  const handleDeleteMeeting = (id: string) => setMeetings(meetings.filter(m => m.id !== id));
  const handleToggleMeetingStatus = (id: string) => setMeetings(meetings.map(m => m.id === id ? { ...m, status: m.status === 'pending' ? 'completed' : 'pending' } : m));
  
  const [selectedPsidForChat, setSelectedPsidForChat] = useState<string | null>(null);
  const handleOpenChatFromSchedule = (psid: string) => { setActiveTab('messages'); setSelectedPsidForChat(psid); };
  const handleOpenPortal = (psid: string) => { setPortalClientId(psid); setActiveTab('portal_view'); };

  const handleFundUpdate = async (
      psid: string, 
      amount: number, 
      type: 'credit' | 'debit', 
      description: string, 
      category: TransactionCategory = 'other',
      metadata?: TransactionMetadata,
      customDate?: Date
  ) => {
      const txDate = customDate || new Date();
      const validAmount = parseFloat(amount.toString()) || 0;

      const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          date: txDate,
          type: type,
          amount: validAmount,
          description: description,
          category: category,
          status: 'completed',
          metadata: metadata 
      };

      setConversations(prev => prev.map(c => {
          if (c.psid === psid) {
              const currentBalance = parseFloat((c.walletBalance || 0).toString());
              let newBalance = type === 'credit' ? currentBalance + validAmount : currentBalance - validAmount;
              newBalance = Math.round(newBalance * 100) / 100; 
              
              return {
                  ...c,
                  walletBalance: newBalance,
                  transactions: [newTx, ...(c.transactions || [])]
              };
          }
          return c;
      }));

      try {
          const payload = {
              psid,
              amount: validAmount,
              type,
              description,
              category,
              date: format(txDate, 'yyyy-MM-dd HH:mm:ss'), 
              ...metadata 
          };
          await fetch(`${API_BASE_URL}/api/add_transaction.php`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
      } catch (e) {
          logApiWarning("add_transaction", e);
      }
  };

  const handleDeleteTransaction = (psid: string, txId: string) => {
      setConversations(prev => prev.map(c => {
          if (c.psid === psid && c.transactions) {
              const txToDelete = c.transactions.find(t => t.id === txId);
              if (!txToDelete) return c;
              let newBalance = c.walletBalance || 0;
              if (txToDelete.type === 'credit') newBalance -= txToDelete.amount;
              else newBalance += txToDelete.amount;
              newBalance = Math.round(newBalance * 100) / 100;

              return {
                  ...c,
                  walletBalance: newBalance,
                  transactions: c.transactions.filter(t => t.id !== txId)
              };
          }
          return c;
      }));
  };

  const handleEditTransaction = (psid: string, txId: string, updatedTx: Partial<Transaction>) => {
      setConversations(prev => prev.map(c => {
          if (c.psid === psid && c.transactions) {
              const oldTx = c.transactions.find(t => t.id === txId);
              if (!oldTx) return c;
              let tempBalance = c.walletBalance || 0;
              
              if (oldTx.type === 'credit') tempBalance -= oldTx.amount;
              else tempBalance += oldTx.amount;

              const newAmount = updatedTx.amount !== undefined ? updatedTx.amount : oldTx.amount;
              const newType = updatedTx.type || oldTx.type;
              
              if (newType === 'credit') tempBalance += newAmount;
              else tempBalance -= newAmount;
              tempBalance = Math.round(tempBalance * 100) / 100;

              return {
                  ...c,
                  walletBalance: tempBalance,
                  transactions: c.transactions.map(t => t.id === txId ? { ...t, ...updatedTx } : t)
              };
          }
          return c;
      }));
  };

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
              return { ...c, tasks: [newTask, ...(c.tasks || [])] };
          }
          return c;
      }));
  };

  const handleToggleTask = (psid: string, taskId: string) => {
      setConversations(prev => prev.map(c => {
          if (c.psid === psid && c.tasks) {
              return { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t) };
          }
          return c;
      }));
  };

  const handleDeleteTask = (psid: string, taskId: string) => {
      setConversations(prev => prev.map(c => {
          if (c.psid === psid && c.tasks) {
              return { ...c, tasks: c.tasks.filter(t => t.id !== taskId) };
          }
          return c;
      }));
  };

  const handleSaveInvoice = async (psid: string, invoice: InvoiceRecord) => {
      setConversations(prev => prev.map(c => {
          if (c.psid === psid) {
              const currentInvoices = c.invoices || [];
              if (currentInvoices.some(inv => inv.id === invoice.id)) return c;
              return { ...c, invoices: [invoice, ...currentInvoices] };
          }
          return c;
      }));

      try {
          await fetch(`${API_BASE_URL}/api/save_invoice.php`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ psid, invoice })
          });
      } catch (e) {
          logApiWarning("save_invoice", e);
      }
  };

  // Proposal & Automation Logic
  const handleSaveProposal = (proposal: Proposal) => {
      setProposals(prev => {
          const existing = prev.findIndex(p => p.id === proposal.id);
          if(existing >= 0) {
              const updated = [...prev];
              updated[existing] = proposal;
              return updated;
          }
          return [...prev, proposal];
      });
  };

  const handleAcceptProposal = (proposalId: string) => {
      const proposal = proposals.find(p => p.id === proposalId);
      if (!proposal) return;

      // 1. Update Proposal Status
      setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: 'accepted' } : p));

      // 2. Create Invoice
      const newInvoice: InvoiceRecord = {
          id: `inv_${Date.now()}`,
          invoiceNumber: `INV-AUTO-${format(new Date(), 'yyMMdd')}`,
          date: new Date(),
          totalAmount: proposal.totalAmount,
          items: proposal.items,
          status: 'unpaid'
      };
      handleSaveInvoice(proposal.clientId, newInvoice);
      alert("Proposal Accepted! Invoice Generated.");
  };

  const handleAddAdminTask = (title: string, description?: string, relatedClientId?: string) => {
      const newTask: AdminTask = {
          id: `at_${Date.now()}`,
          title,
          description,
          relatedClientId,
          relatedClientName: relatedClientId ? conversations.find(c => c.psid === relatedClientId)?.userName : undefined,
          isCompleted: false,
          status: 'todo',
          priority: 'medium',
          createdAt: new Date()
      };
      setAdminTasks([newTask, ...adminTasks]);
  };

  const handleUpdateAdminTaskStatus = (taskId: string, status: 'todo' | 'in_progress' | 'done') => {
      setAdminTasks(adminTasks.map(t => t.id === taskId ? { ...t, status: status, isCompleted: status === 'done' } : t));
  };

  const handleDeleteAdminTask = (taskId: string) => {
      setAdminTasks(adminTasks.filter(t => t.id !== taskId));
  };

  const handleSimulateMessage = (text: string | null, type: AttachmentType, url?: string, psidInput?: string) => {
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
            const hasNewMobile = extractedData.extractedMobile && conv.extractedMobile !== extractedData.extractedMobile;
            const updates: any = {};
            if (hasNewMobile) {
                updates.extractedMobile = extractedData.extractedMobile;
                updates.status = conv.status === 'new_lead' ? 'interested' : conv.status;
                handleUpdateClientProfile(psid, updates);
            }
            updatedConversations[existingConvIndex] = {
                ...conv,
                messages: [...conv.messages, newMessage],
                lastActive: new Date(),
                unreadCount: conv.unreadCount + 1,
                extractedMobile: extractedData.extractedMobile || conv.extractedMobile,
                extractedWebsite: extractedData.extractedWebsite || conv.extractedWebsite,
                extractedFbLink: extractedData.extractedFbLink || conv.extractedFbLink,
                status: updates.status || conv.status
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
                smsCount: 0,
                tags: ['New'],
                dealValue: 0,
                aiSummary: 'New user via Simulator. Needs qualification.',
                messages: [newMessage],
                invoices: [],
                transactions: [],
                tasks: [],
                ...extractedData
            };
            handleUpdateClientProfile(psid, newConv);
            return [newConv, ...prev];
        }
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'settings': return <SettingsPanel settings={settings} updateSettings={setSettings} onSave={handleSaveSettings} />;
      case 'payment_methods': return <PaymentSettings paymentMethods={paymentMethods} onAddPaymentMethod={handleAddPaymentMethod} onDeletePaymentMethod={handleDeletePaymentMethod} />;
      case 'messages': return ( <MessengerCRM conversations={conversations} savedReplies={savedReplies} aiKnowledgeBase={aiKnowledgeBase} aiPersona={aiPersona} aiSettings={aiSettings} onUpdateStatus={handleUpdateStatus} onUpdateValue={() => {}} onSendMessage={handleSendMessage} onAddReply={handleAddReply} onUpdateReply={handleUpdateReply} onDeleteReply={handleDeleteReply} onUpdateSummary={handleUpdateSummary} onScheduleMeeting={handleScheduleMeeting} onUpdateTags={handleUpdateTags} onUpdateDealValue={handleUpdateDealValue} onUpdateNotes={handleUpdateNotes} onFetchMessages={fetchClientMessages} onToggleAi={handleToggleAi} onAddAiKnowledge={handleAddAiKnowledge} onUpdateAiKnowledge={handleUpdateAiKnowledge} onDeleteAiKnowledge={handleDeleteAiKnowledge} onOpenProposal={() => setActiveTab('proposals')} /> );
      case 'ai_brain': return <AiSalesBrain aiKnowledgeBase={aiKnowledgeBase} onAddAiKnowledge={handleAddAiKnowledge} onDeleteAiKnowledge={handleDeleteAiKnowledge} aiPersona={aiPersona} setAiPersona={setAiPersona} aiSettings={aiSettings} setAiSettings={setAiSettings} />;
      case 'campaign_gen': return <CampaignGenerator />;
      case 'my_accounts': return <PersonalVault accounts={personalAccounts} onAddAccount={handleAddPersonalAccount} onUpdateAccount={handleUpdatePersonalAccount} onDeleteAccount={handleDeletePersonalAccount} />;
      case 'schedules': return ( <ScheduleManager meetings={meetings} conversations={conversations} onScheduleMeeting={handleScheduleMeeting} onDeleteMeeting={handleDeleteMeeting} onToggleStatus={handleToggleMeetingStatus} onOpenChat={handleOpenChatFromSchedule} /> );
      case 'tasks': return ( <TaskManager tasks={adminTasks} conversations={conversations} onAddTask={handleAddAdminTask} onUpdateStatus={handleUpdateAdminTaskStatus} onDeleteTask={handleDeleteAdminTask} /> );
      case 'leads': return <LeadDatabase conversations={conversations} onExport={handleLeadsExported} onAddManualLead={handleAddManualLead} onUpdateStatus={handleUpdateStatus} onOpenPublicLink={() => setIsPublicMode(true)} onToggleBestQuality={handleToggleBestQuality} onUpdateNotes={handleUpdateNotes} onUpdateServiceType={handleUpdateServiceType} onUpdateIndustry={handleUpdateIndustry} />;
      case 'client_report': return <ClientReport conversations={conversations} dripSequences={dripSequences} onOpenPortal={handleOpenPortal} onUpdateClientProfile={handleUpdateClientProfile} onManageBalance={handleFundUpdate} onDeleteTransaction={handleDeleteTransaction} onEditTransaction={handleEditTransaction} onAddTask={handleAddTask} onDeleteTask={handleDeleteTask} onSendMessage={handleSendMessage} />;
      case 'invoices': return <InvoiceGenerator conversations={conversations} onSaveInvoice={handleSaveInvoice} />;
      case 'web_vault': return <WebsiteManager websites={websites} conversations={conversations} onAddWebsite={handleAddWebsite} onUpdateWebsite={handleUpdateWebsite} onDeleteWebsite={handleDeleteWebsite} />;
      case 'bulk_sms': return <BulkSmsManager conversations={conversations} meetings={meetings} settings={smsSettings} onSaveSettings={handleSaveSmsSettings} onSaveCampaign={handleSaveSmsCampaign} onUpdateSmsStats={handleSmsSent} campaignHistory={smsHistory} aiPersona={aiPersona} />;
      case 'proposals': return <ProposalBuilder conversations={conversations} proposals={proposals} onSaveProposal={handleSaveProposal} onAcceptProposal={handleAcceptProposal} />;
      case 'automation': return <AutomationHub conversations={conversations} dripSequences={dripSequences} onUpdateDrip={(seq) => setDripSequences(dripSequences.map(s => s.id === seq.id ? seq : s))} reportConfig={reportConfig} onUpdateReportConfig={setReportConfig} smsSettings={smsSettings} />;
      case 'audit_tool': return <AuditTool />;
      case 'simulator': return <WebhookSimulator onSimulateMessage={handleSimulateMessage} />;
      case 'dashboard': default: return <Dashboard conversations={conversations} meetings={meetings} onOpenChat={handleOpenChatFromSchedule} adminTasks={adminTasks} smsHistory={smsHistory} aiSettings={aiSettings} aiKnowledgeBase={aiKnowledgeBase} smsSettings={smsSettings} setActiveTab={setActiveTab} />;
    }
  };

  if (activeTab === 'portal_view' && portalClientId) {
      const client = conversations.find(c => c.psid === portalClientId);
      if (client) {
          return (
              <ClientPortal client={client} onTopUp={(psid, amount) => handleFundUpdate(psid, amount, 'credit', 'Online Top-up', 'payment')} onToggleTask={handleToggleTask} onExit={() => setActiveTab('client_report')} paymentMethods={paymentMethods} />
          );
      }
  }

  if (isPublicMode) {
      return (
          <div className="relative">
              <button onClick={() => setIsPublicMode(false)} className="fixed top-4 left-4 bg-slate-900 text-white px-4 py-2 rounded-lg z-50 shadow-lg text-sm font-bold">Back to Admin Dashboard</button>
              <PublicLeadForm onSubmit={handleAddManualLead} />
          </div>
      );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      
      {/* GLOBAL NOTIFICATION CONTAINER */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
          {notifications.map((note, idx) => (
              <div key={idx} className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 duration-300">
                  <div className="bg-orange-500 rounded-full p-1.5 animate-pulse">
                      <Bell size={16} className="text-white" />
                  </div>
                  <div>
                      <p className="text-sm font-bold">{note}</p>
                      <p className="text-[10px] text-slate-400">Just now</p>
                  </div>
              </div>
          ))}
      </div>
      
      {/* MANUAL FALLBACK MODAL */}
      {manualSendRequired && (
          <div className="fixed inset-0 bg-slate-900/80 z-[200] flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                  <div className="flex items-center gap-3 mb-4 text-orange-600">
                      <div className="p-2 bg-orange-100 rounded-full"><AlertTriangle size={20}/></div>
                      <h3 className="font-bold">Automation Fallback Required</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                      Client <strong>{manualSendRequired.client.userName}</strong> has reached <strong>Day {manualSendRequired.dayCount}</strong> of inactivity, but no automated template exists for this milestone.
                  </p>
                  <textarea 
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none h-32 mb-4"
                      placeholder="Write a manual follow-up message..."
                      value={manualFallbackMessage}
                      onChange={e => setManualFallbackMessage(e.target.value)}
                  />
                  <div className="flex gap-3">
                      <button 
                          onClick={() => setManualSendRequired(null)}
                          className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-50"
                      >
                          Skip for Today
                      </button>
                      <button 
                          onClick={handleManualSendSubmit}
                          disabled={!manualFallbackMessage}
                          className="flex-1 py-2 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700 disabled:opacity-50"
                      >
                          Send Manual SMS
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* DAILY BRIEFING MODAL */}
      {showDailyBriefing && (
          <DailyBriefingModal 
              conversations={conversations} 
              meetings={meetings} 
              onClose={handleCloseBriefing}
              onQuickAction={handleBriefingQuickAction}
          />
      )}

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-64 p-8 h-screen overflow-hidden flex flex-col print:ml-0 print:p-0 print:h-auto print:overflow-visible">
        <header className="mb-6 flex justify-between items-center flex-shrink-0">
          <div>
             <h1 className="text-2xl font-bold text-slate-800 capitalize">
                {activeTab === 'messages' ? 'CRM & Inbox' : 
                 activeTab === 'leads' ? 'Lead Database' :
                 activeTab === 'client_report' ? 'Client Report & Portals' :
                 activeTab === 'web_vault' ? 'Website Credential Vault' :
                 activeTab === 'bulk_sms' ? 'Bulk SMS & API' :
                 activeTab === 'tasks' ? 'Task Command Center' :
                 activeTab === 'invoices' ? 'Invoice Generator' :
                 activeTab === 'schedules' ? 'Mission Control' :
                 activeTab === 'ai_brain' ? 'AI Training Center' :
                 activeTab === 'campaign_gen' ? 'Facebook Campaign Name Generator' :
                 activeTab === 'my_accounts' ? 'My Accounts Vault' :
                 activeTab === 'payment_methods' ? 'Payment Methods Manager' :
                 activeTab === 'proposals' ? 'Proposal Builder' :
                 activeTab === 'automation' ? 'Automation Hub' :
                 activeTab === 'audit_tool' ? 'AI Audit Tool' :
                 activeTab.replace('_', ' ')}
             </h1>
             {/* ... header description logic ... */}
          </div>
        </header>
        <div className="flex-1 overflow-auto print:overflow-visible custom-scrollbar">
            {activeTab === 'messages' && selectedPsidForChat ? (
                <MessengerCRM 
                    key={`crm-forced-${selectedPsidForChat}`}
                    conversations={conversations} 
                    savedReplies={savedReplies}
                    aiKnowledgeBase={aiKnowledgeBase}
                    aiPersona={aiPersona}
                    aiSettings={aiSettings}
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
                    onFetchMessages={fetchClientMessages}
                    onToggleAi={handleToggleAi}
                    onAddAiKnowledge={handleAddAiKnowledge}
                    onUpdateAiKnowledge={handleUpdateAiKnowledge}
                    onDeleteAiKnowledge={handleDeleteAiKnowledge}
                    onOpenProposal={() => setActiveTab('proposals')}
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