
import React from 'react';
import { LayoutDashboard, Settings, MessageSquare, Radio, Users, Database, Calendar, PieChart, ClipboardList, Receipt } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Agency Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Daily Tasks', icon: ClipboardList }, 
    { id: 'messages', label: 'CRM & Inbox', icon: MessageSquare }, 
    { id: 'invoices', label: 'Invoice Generator', icon: Receipt }, // New Item
    { id: 'schedules', label: 'Schedules', icon: Calendar }, 
    { id: 'leads', label: 'Lead Database', icon: Database }, 
    { id: 'client_report', label: 'Client Report', icon: PieChart },
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
          <h1 className="font-bold text-lg leading-tight">WP Messenger</h1>
          <p className="text-xs text-slate-400">Agency CRM</p>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1">
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