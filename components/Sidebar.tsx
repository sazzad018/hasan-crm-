
import React from 'react';
import { LayoutDashboard, Settings, MessageSquare, Radio, Users, Database, Calendar, PieChart, ClipboardList, Receipt, Lock, Smartphone, BrainCircuit, Wand2, KeyRound, CreditCard, FileSignature, Workflow, ScanSearch } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Agency Dashboard', icon: LayoutDashboard },
    { id: 'campaign_gen', label: 'Campaign Name Gen', icon: Wand2 }, 
    { id: 'leads', label: 'Lead Database', icon: Database }, 
    { id: 'audit_tool', label: 'Audit Tool (Lead Magnet)', icon: ScanSearch }, // NEW
    { id: 'messages', label: 'CRM & Inbox', icon: MessageSquare }, 
    { id: 'proposals', label: 'Proposal Builder', icon: FileSignature }, 
    { id: 'automation', label: 'Automation Hub', icon: Workflow }, 
    { id: 'schedules', label: 'Schedules & Reminders', icon: Calendar }, 
    { id: 'payment_methods', label: 'Payment Methods', icon: CreditCard },
    { id: 'client_report', label: 'Client Report', icon: PieChart },
    { id: 'invoices', label: 'Invoice Generator', icon: Receipt }, 
    { id: 'tasks', label: 'Daily Tasks', icon: ClipboardList }, 
    { id: 'bulk_sms', label: 'Bulk SMS & API', icon: Smartphone }, 
    { id: 'ai_brain', label: 'AI Sales Brain', icon: BrainCircuit }, 
    { id: 'web_vault', label: 'Client Web Vault', icon: Lock }, 
    { id: 'my_accounts', label: 'My Accounts Vault', icon: KeyRound }, 
    { id: 'settings', label: 'Plugin Settings', icon: Settings },
    { id: 'simulator', label: 'Webhook Simulator', icon: Radio },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-xl fixed left-0 top-0 z-50 print:hidden">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Users size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm leading-tight">Social Ads Expert</h1>
          <p className="text-xs text-slate-400">Agency CRM</p>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Sync Active
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
