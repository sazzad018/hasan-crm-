export enum AttachmentType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  FILE = 'file',
  FALLBACK = 'fallback'
}

export type LeadStatus = 'new_lead' | 'interested' | 'negotiation' | 'converted' | 'active_client' | 'cold' | 'archived' | 'past_client';

export type LeadSource = 'facebook' | 'manual' | 'web_form'; 

export type TransactionCategory = 'ad_spend' | 'web_dev' | 'service_fee' | 'payment' | 'other';

export type ServiceType = 'fb_ads' | 'web_dev' | 'funnel' | 'seo' | 'video_editing' | 'other';

export interface TransactionMetadata {
  impressions?: number;
  reach?: number;
  messages?: number;
  conversions?: number; 
}

export interface Transaction {
  id: string;
  date: Date;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category?: TransactionCategory; 
  metadata?: TransactionMetadata; 
  status: 'completed' | 'pending';
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceRecord {
    id: string;
    invoiceNumber: string;
    date: Date;
    totalAmount: number;
    items: InvoiceItem[];
    status: 'paid' | 'unpaid';
    discount?: number;
    advance?: number;
}

export interface Proposal {
    id: string;
    clientId: string;
    clientName: string;
    title: string;
    coverLetter: string;
    items: InvoiceItem[];
    totalAmount: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    createdDate: Date;
    validUntil: Date;
}

export interface DripStep {
    id: string;
    dayDelay: number; 
    message: string;
}

export interface DripSequence {
    id: string;
    triggerStatus: LeadStatus;
    isEnabled: boolean;
    steps: DripStep[];
}

export interface AutoReportConfig {
    isEnabled: boolean;
    frequency: 'weekly' | 'monthly';
    method: 'email' | 'sms'; 
    includeMetrics: string[]; 
}

export interface ClientTask {
  id: string;
  title: string;
  type: 'weekly' | 'monthly';
  priority?: 'high' | 'medium' | 'low'; 
  deadline?: Date; 
  isCompleted: boolean;
  assignedDate: Date;
}

export interface AdminTask {
    id: string;
    title: string;
    description?: string;
    relatedClientId?: string; 
    relatedClientName?: string;
    isCompleted: boolean;
    status: 'todo' | 'in_progress' | 'done'; 
    priority: 'high' | 'medium' | 'low';
    createdAt: Date;
}

export interface FbMessage {
  id: number;
  messageText: string;
  attachmentType: AttachmentType;
  attachmentUrl?: string;
  fbMid: string;
  isFromPage?: boolean; 
  createdTime: Date;
}

export interface PortalPermissions {
  viewBalance: boolean;
  allowTopUp: boolean;
  viewHistory: boolean;
  showTotalDeposit?: boolean;
  showTotalSpend?: boolean;
}

export interface LowBalanceConfig {
    isEnabled: boolean;
    threshold: number;
    lastAlertSent?: Date;
}

export interface ScheduledMessage {
    id: string;
    text: string;
    type: 'specific_date' | 'repeat';
    scheduledDate?: Date; 
    repeatIntervalDays?: number;
    nextRun: Date;
    status: 'pending' | 'sent' | 'active' | 'paused';
    createdAt: Date;
}

export interface Conversation {
  psid: string;
  userName: string;
  profilePic?: string; 
  messages: FbMessage[];
  status: LeadStatus;
  statusChangedDate?: Date; 
  lastAutomatedMessageDate?: Date; 
  source: LeadSource; 
  notes?: string;
  aiSummary?: string; 
  aiEnabled?: boolean; 
  lastActive: Date;
  unreadCount: number;
  
  tags: string[]; 
  dealValue?: number; 
  isBestQuality?: boolean; 
  
  walletBalance?: number;
  lowBalanceAlert?: LowBalanceConfig; 
  
  transactions?: Transaction[];
  tasks?: ClientTask[];
  invoices?: InvoiceRecord[]; 
  proposals?: Proposal[]; 
  reportConfig?: AutoReportConfig; 
  portalPermissions?: PortalPermissions; 
  
  clientEmail?: string;
  clientAddress?: string;
  servicePackage?: string; 
  
  portalAnnouncement?: string; 
  isPortalSuspended?: boolean; 
  
  extractedMobile?: string;
  extractedWebsite?: string;
  extractedFbLink?: string;
  
  downloadCount: number; 
  smsCount?: number;
  businessInfo?: string; 
  industry?: 'Clothing' | 'Food' | 'RealEstate' | 'Tech' | 'Health' | 'Education' | 'Other'; 
  
  serviceType?: ServiceType;
  
  scheduledMessages?: ScheduledMessage[]; // NEW
  isAutomationPaused?: boolean; // NEW
}

export interface SavedReply {
  id: string;
  label: string;
  text: string;
  status: string[]; 
}

export interface Meeting {
  id: string;
  psid: string;
  clientName: string;
  title: string; 
  date: Date;
  status: 'pending' | 'completed';
  reminder?: {
      enabled: boolean;
      timeBefore: number; 
      message: string;
  };
}

export interface ClientWebsite {
  id: string;
  clientId: string; 
  clientName: string;
  websiteUrl: string;
  adminUrl: string; 
  provider: string; 
  nameServers?: string; 
  purchaseDate?: string;
  expiryDate?: string;
  wpUser: string;
  wpPass: string;
  cpanelUrl?: string;
  cpanelUser?: string;
  cpanelPass?: string;
  notes?: string;
  cost?: string;         
  usedFeatures?: string; 
  conditions?: string;   
}

export interface PersonalAccount {
  id: string;
  platformName: string; 
  category: 'social' | 'course' | 'entertainment' | 'tools';
  loginUrl?: string;
  username: string;
  password?: string;
  notes?: string;
}

export interface PaymentMethod {
  id: string;
  category: 'bank' | 'mobile' | 'other';
  provider: string; 
  type: string; 
  accountName?: string; 
  accountNumber: string;
  routingNumber?: string;
  branchName?: string;
  swiftCode?: string;
  instructions?: string; 
}

export interface PluginSettings {
  pageAccessToken: string;
  verifyToken: string;
  appId: string;
  appSecret: string;
  webhookUrl: string;
  googleSheetId?: string;
  googleServiceAccountJson?: string;
}

export interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    messaging: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message?: {
        mid: string;
        text?: string;
        attachments?: Array<{
          type: string;
          payload: { url: string };
        }>;
      };
    }>;
  }>;
}

export interface AiKnowledgeItem {
    id: string;
    question: string; 
    answer: string;   
    category?: string; 
    description?: string; 
}

export type AiMode = 'paid' | 'free' | 'manual';

export interface AiConfigProfile {
    provider: 'gemini' | 'openai';
    apiKey: string;
    model: string;
    maxTokens?: number;
}

export interface AiSettings {
    activeMode: AiMode; 
    paidConfig: AiConfigProfile;
    freeConfig: AiConfigProfile;
}

export interface SmsSettings {
    apiUrl: string; 
    apiKey: string;
    senderId: string; 
    method: 'GET' | 'POST';
    paramMap: {
        to: string; 
        message: string; 
        apiKey: string; 
    };
}

export interface SmsCampaign {
    id: string;
    name: string;
    message: string;
    targetAudience: string; 
    totalSent: number;
    timestamp: Date;
    status: 'sent' | 'failed';
}