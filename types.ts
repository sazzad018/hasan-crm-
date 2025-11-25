

export enum AttachmentType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  FILE = 'file',
  FALLBACK = 'fallback'
}

export type LeadStatus = 'new_lead' | 'interested' | 'negotiation' | 'converted' | 'active_client' | 'cold' | 'archived';

export type LeadSource = 'facebook' | 'manual';

export type TransactionCategory = 'ad_spend' | 'web_dev' | 'service_fee' | 'payment' | 'other';

export interface TransactionMetadata {
  impressions?: number;
  reach?: number;
  messages?: number;
  conversions?: number; // Sales or Leads
}

export interface Transaction {
  id: string;
  date: Date;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category?: TransactionCategory; // New field to categorize spend
  metadata?: TransactionMetadata; // New field for detailed ad metrics
  status: 'completed' | 'pending';
}

export interface ClientTask {
  id: string;
  title: string;
  type: 'weekly' | 'monthly';
  priority?: 'high' | 'medium' | 'low'; // New field
  deadline?: Date; // New field
  isCompleted: boolean;
  assignedDate: Date;
}

export interface AdminTask {
    id: string;
    title: string;
    description?: string;
    relatedClientId?: string; // Optional link to a client
    relatedClientName?: string;
    isCompleted: boolean;
    createdAt: Date;
}

export interface FbMessage {
  id: number;
  messageText: string;
  attachmentType: AttachmentType;
  attachmentUrl?: string;
  fbMid: string;
  isFromPage?: boolean; // To distinguish admin replies vs user messages
  createdTime: Date;
}

export interface PortalPermissions {
  viewBalance: boolean;
  allowTopUp: boolean;
  viewHistory: boolean;
}

export interface Conversation {
  psid: string;
  userName: string;
  profilePic?: string; // URL for avatar
  messages: FbMessage[];
  status: LeadStatus;
  source: LeadSource; // New field to track origin
  notes?: string;
  aiSummary?: string; // Automated 1-2 line summary
  lastActive: Date;
  unreadCount: number;
  
  // Advanced CRM Features
  tags: string[]; // e.g., "VIP", "High Budget", "Complainer"
  dealValue?: number; // Potential revenue amount
  
  // Client Portal / Financials
  walletBalance?: number;
  transactions?: Transaction[];
  tasks?: ClientTask[]; // New field for Growth Tasks
  portalPermissions?: PortalPermissions; // Controls what the client sees
  
  // Detailed Profile Info
  clientEmail?: string;
  clientAddress?: string;
  servicePackage?: string; // e.g., "Gold SEO Plan"
  
  // Portal Administration
  portalAnnouncement?: string; // Message shown to client on dashboard
  isPortalSuspended?: boolean; // If true, client cannot access portal
  
  // Auto-extracted Data
  extractedMobile?: string;
  extractedWebsite?: string;
  extractedFbLink?: string;
  
  // Usage Stats
  downloadCount: number; // Tracks how many times this lead was exported
}

export interface SavedReply {
  id: string;
  label: string;
  text: string;
  status: string[]; // Which statuses this reply is relevant for
}

export interface Meeting {
  id: string;
  psid: string;
  clientName: string;
  title: string; // Agenda
  date: Date;
  status: 'pending' | 'completed';
}

export interface PluginSettings {
  pageAccessToken: string;
  verifyToken: string;
  appId: string;
  appSecret: string;
  webhookUrl: string;
  // Google Sheets Config
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