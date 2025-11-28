
import React, { useState } from 'react';
import { ClientWebsite, Conversation } from '../types';
import { Globe, Server, Copy, Eye, EyeOff, Plus, Search, Trash2, Edit2, Shield, ExternalLink, X, Save, AlertTriangle, FileText, Layout } from 'lucide-react';
import { format } from 'date-fns';

interface WebsiteManagerProps {
  websites: ClientWebsite[];
  conversations: Conversation[];
  onAddWebsite: (site: ClientWebsite) => void;
  onUpdateWebsite: (site: ClientWebsite) => void;
  onDeleteWebsite: (id: string) => void;
}

const PasswordField: React.FC<{ label: string, value: string }> = ({ label, value }) => {
    const [show, setShow] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
                <span>{label}</span>
                {copied && <span className="text-green-600 flex items-center gap-1"><CheckIcon size={10} /> Copied</span>}
            </label>
            <div className="flex items-center gap-2 group">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-sm font-mono flex items-center justify-between transition-colors group-hover:border-blue-200">
                    <span className="truncate">{show ? value : '••••••••••••'}</span>
                </div>
                <button type="button" onClick={() => setShow(!show)} className="p-1.5 bg-white border border-slate-200 rounded text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-colors">
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button type="button" onClick={handleCopy} className={`p-1.5 bg-white border border-slate-200 rounded transition-colors ${copied ? 'text-green-500 border-green-300' : 'text-slate-400 hover:text-blue-600 hover:border-blue-300'}`}>
                    <Copy size={14} />
                </button>
            </div>
        </div>
    );
};

const CheckIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

const WebsiteManager: React.FC<WebsiteManagerProps> = ({ websites, conversations, onAddWebsite, onUpdateWebsite, onDeleteWebsite }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Print State
  const [printSite, setPrintSite] = useState<ClientWebsite | null>(null);

  // Form State
  const initialFormState: ClientWebsite = {
      id: '',
      clientId: '',
      clientName: '',
      websiteUrl: '',
      adminUrl: '',
      provider: '',
      nameServers: '',
      purchaseDate: '',
      expiryDate: '',
      wpUser: '',
      wpPass: '',
      cpanelUrl: '',
      cpanelUser: '',
      cpanelPass: '',
      notes: '',
      cost: '',
      usedFeatures: '',
      conditions: ''
  };
  const [formData, setFormData] = useState<ClientWebsite>(initialFormState);

  const filteredSites = websites.filter(site => 
      site.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      site.websiteUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (site?: ClientWebsite) => {
      if (site) {
          setFormData(site);
          setEditingId(site.id);
      } else {
          setFormData({ ...initialFormState, id: Date.now().toString() });
          setEditingId(null);
      }
      setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Auto-fill client name if ID is selected
      const selectedClient = conversations.find(c => c.psid === formData.clientId);
      const submissionData = {
          ...formData,
          clientName: selectedClient ? selectedClient.userName : 'Unknown Client'
      };

      if (editingId) {
          onUpdateWebsite(submissionData);
      } else {
          onAddWebsite(submissionData);
      }
      setIsModalOpen(false);
  };

  const handlePrint = (site: ClientWebsite) => {
      setPrintSite(site);
      setTimeout(() => {
          window.print();
          // Clear print state after a delay to ensure print dialog catches it
          setTimeout(() => setPrintSite(null), 1000);
      }, 100);
  };

  return (
    <div className="space-y-6">
       {/* Main Content (Hidden during Print) */}
       <div className="print:hidden space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Shield size={24} className="text-blue-600" /> Web Credential Vault
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Securely manage WP Admin, cPanel, and Hosting details for all clients.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                        type="text"
                        placeholder="Search domain or client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-black transition-colors"
                    >
                        <Plus size={18} /> Add Site
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSites.map(site => (
                    <div key={site.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                        {/* Card Header */}
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 bg-white border border-slate-200 text-blue-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                    <Globe size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-800 text-sm truncate" title={site.websiteUrl}>
                                        {site.websiteUrl.replace('https://', '').replace('http://', '')}
                                    </h3>
                                    <p className="text-xs text-slate-500 truncate">{site.clientName}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                                <button onClick={() => handlePrint(site)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Download PDF / Print">
                                    <FileText size={16} />
                                </button>
                                <button onClick={() => handleOpenModal(site)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => onDeleteWebsite(site.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-4 space-y-4 flex-1">
                            
                            {/* Hosting Info */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                                    <span className="block text-slate-400 font-bold uppercase text-[9px] mb-1">Provider</span>
                                    <span className="font-medium text-slate-700 block truncate">{site.provider || 'N/A'}</span>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                                    <span className="block text-slate-400 font-bold uppercase text-[9px] mb-1">Expires</span>
                                    <span className={`font-medium block truncate ${site.expiryDate ? 'text-slate-700' : 'text-slate-400'}`}>{site.expiryDate || 'N/A'}</span>
                                </div>
                            </div>
                            
                            {/* Name Servers - Now Prominent */}
                            {site.nameServers && (
                                <div className="text-xs bg-indigo-50 p-2.5 rounded border border-indigo-100">
                                    <span className="block text-indigo-400 font-bold uppercase text-[9px] mb-1">Name Servers</span>
                                    <span className="font-mono text-indigo-800 break-words whitespace-pre-wrap">{site.nameServers}</span>
                                </div>
                            )}

                            {/* WordPress Credentials */}
                            <div className="border-t border-slate-100 pt-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Layout size={14} className="text-blue-600" />
                                    <span className="text-xs font-bold text-slate-700">WordPress Admin</span>
                                    {site.adminUrl && (
                                        <a href={site.adminUrl} target="_blank" rel="noreferrer" className="ml-auto text-blue-600 hover:underline text-[10px] flex items-center gap-1">
                                            Login <ExternalLink size={10} />
                                        </a>
                                    )}
                                </div>
                                <div className="space-y-2 pl-2 border-l-2 border-blue-100">
                                    <PasswordField label="Username" value={site.wpUser} />
                                    <PasswordField label="Password" value={site.wpPass} />
                                </div>
                            </div>

                            {/* Cost Info (Short) */}
                            {site.cost && (
                                <div className="text-xs flex items-center justify-between border-t border-slate-100 pt-3">
                                    <span className="font-bold text-slate-500 uppercase">Tech Cost:</span>
                                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{site.cost}</span>
                                </div>
                            )}

                            {/* Notes */}
                            {site.notes && (
                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-xs text-yellow-800 flex gap-2">
                                    <AlertTriangle size={14} className="flex-shrink-0 text-yellow-600 mt-0.5" />
                                    <span className="line-clamp-2">{site.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {filteredSites.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                        <Shield size={48} className="mb-4 opacity-20" />
                        <p>No websites found in the vault.</p>
                        <button onClick={() => handleOpenModal()} className="mt-4 text-blue-600 text-sm font-bold hover:underline">
                            Add your first website
                        </button>
                    </div>
                )}
            </div>
       </div>

       {/* Advanced Edit Modal */}
       {isModalOpen && (
           <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm print:hidden">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                   <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
                       <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                           {editingId ? <Edit2 size={20} className="text-blue-600" /> : <Plus size={20} className="text-blue-600" />}
                           {editingId ? 'Edit Credentials' : 'Add New Website'}
                       </h3>
                       <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors">
                           <X size={20} />
                       </button>
                   </div>
                   
                   <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100 h-full">
                           
                           {/* LEFT COLUMN: General & Hosting */}
                           <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                                        <Globe size={16} className="text-blue-600" /> Domain & Hosting
                                    </h4>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Client Owner</label>
                                        <select 
                                            required
                                            value={formData.clientId}
                                            onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        >
                                            <option value="">-- Select Client --</option>
                                            {conversations.map(c => (
                                                <option key={c.psid} value={c.psid}>{c.userName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Website URL</label>
                                            <input 
                                                required
                                                placeholder="https://example.com"
                                                value={formData.websiteUrl}
                                                onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                                                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Provider</label>
                                            <input 
                                                placeholder="e.g. GoDaddy"
                                                value={formData.provider}
                                                onChange={(e) => setFormData({...formData, provider: e.target.value})}
                                                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Expiry Date</label>
                                            <input 
                                                type="date"
                                                value={formData.expiryDate}
                                                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                                                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Name Servers</label>
                                        <textarea 
                                            placeholder="ns1.host.com&#10;ns2.host.com"
                                            value={formData.nameServers || ''}
                                            onChange={(e) => setFormData({...formData, nameServers: e.target.value})}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-20 font-mono text-xs"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Technology Cost</label>
                                        <input 
                                            placeholder="e.g. $50 or 5000 BDT"
                                            value={formData.cost || ''}
                                            onChange={(e) => setFormData({...formData, cost: e.target.value})}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                        />
                                    </div>
                                </div>
                           </div>

                           {/* RIGHT COLUMN: Credentials & Details */}
                           <div className="p-6 space-y-6 bg-slate-50/50">
                                
                                {/* WordPress */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                                        <Layout size={16} className="text-blue-600" /> WordPress & System
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Admin Login URL</label>
                                            <input 
                                                placeholder="https://example.com/wp-admin"
                                                value={formData.adminUrl}
                                                onChange={(e) => setFormData({...formData, adminUrl: e.target.value})}
                                                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Username</label>
                                                <input 
                                                    value={formData.wpUser}
                                                    onChange={(e) => setFormData({...formData, wpUser: e.target.value})}
                                                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Password</label>
                                                <input 
                                                    value={formData.wpPass}
                                                    onChange={(e) => setFormData({...formData, wpPass: e.target.value})}
                                                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* cPanel */}
                                <div className="space-y-4 pt-2">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                                        <Server size={16} className="text-orange-600" /> cPanel / Server
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">cPanel URL</label>
                                            <input 
                                                placeholder="https://example.com:2083"
                                                value={formData.cpanelUrl || ''}
                                                onChange={(e) => setFormData({...formData, cpanelUrl: e.target.value})}
                                                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Username</label>
                                            <input 
                                                value={formData.cpanelUser || ''}
                                                onChange={(e) => setFormData({...formData, cpanelUser: e.target.value})}
                                                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Password</label>
                                            <input 
                                                value={formData.cpanelPass || ''}
                                                onChange={(e) => setFormData({...formData, cpanelPass: e.target.value})}
                                                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Extra Details */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Features Used</label>
                                        <textarea 
                                            value={formData.usedFeatures || ''}
                                            onChange={(e) => setFormData({...formData, usedFeatures: e.target.value})}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-16 bg-white"
                                            placeholder="e.g. React, Node, Cloudflare, etc."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Conditions / Policy</label>
                                        <textarea 
                                            value={formData.conditions || ''}
                                            onChange={(e) => setFormData({...formData, conditions: e.target.value})}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-16 bg-white"
                                            placeholder="e.g. Yearly renewal mandatory, no refund after 30 days."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Notes</label>
                                        <textarea 
                                            value={formData.notes || ''}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-16 bg-white"
                                            placeholder="Any backup codes or special instructions..."
                                        />
                                    </div>
                                </div>
                           </div>
                       </div>
                       
                       <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                           <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors">
                               Cancel
                           </button>
                           <button type="submit" className="px-8 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-black transition-colors flex items-center gap-2 shadow-lg">
                               <Save size={18} /> Save Credentials
                           </button>
                       </div>
                   </form>
               </div>
           </div>
       )}

       {/* HIDDEN PRINT SECTION */}
       {printSite && (
           <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-12 invoice-preview">
               <div className="max-w-3xl mx-auto border border-slate-300 p-10">
                   {/* Header */}
                   <div className="flex justify-between items-start border-b-2 border-slate-800 pb-8 mb-8">
                       <div>
                           <h1 className="text-2xl font-extrabold text-slate-900 uppercase tracking-widest mb-1">Social Ads Expert</h1>
                           <p className="text-sm text-slate-500">Chandrima Model Town, Road # 5,<br/>Block # A, Mohammadpur, Dhaka.</p>
                           <p className="text-sm text-slate-500 mt-1">+880 1798-205143</p>
                       </div>
                       <div className="text-right">
                           <h2 className="text-xl font-bold text-slate-800">Credential Document</h2>
                           <p className="text-sm text-slate-500 mt-1">Generated: {format(new Date(), 'MMM d, yyyy')}</p>
                           <p className="text-sm text-slate-500">Confidentiality: <span className="font-bold text-red-600">HIGH</span></p>
                       </div>
                   </div>

                   {/* Site Details */}
                   <div className="mb-8">
                       <h3 className="text-lg font-bold text-blue-900 border-b border-blue-100 pb-2 mb-4 uppercase">Site Information</h3>
                       <div className="grid grid-cols-2 gap-6 text-sm">
                           <div>
                               <p className="font-bold text-slate-500 uppercase text-xs">Client Name</p>
                               <p className="text-lg font-bold text-slate-800">{printSite.clientName}</p>
                           </div>
                           <div>
                               <p className="font-bold text-slate-500 uppercase text-xs">Website URL</p>
                               <p className="text-lg font-bold text-slate-800">{printSite.websiteUrl}</p>
                           </div>
                           <div>
                               <p className="font-bold text-slate-500 uppercase text-xs">Hosting Provider</p>
                               <p className="text-base text-slate-700">{printSite.provider || 'N/A'}</p>
                           </div>
                           <div>
                               <p className="font-bold text-slate-500 uppercase text-xs">Expiry Date</p>
                               <p className="text-base text-slate-700">{printSite.expiryDate || 'N/A'}</p>
                           </div>
                       </div>
                   </div>

                   {/* Tech Cost & Features */}
                   <div className="mb-8 grid grid-cols-1 gap-6">
                        {printSite.cost && (
                            <div className="bg-emerald-50 p-4 border border-emerald-100">
                                <p className="font-bold text-emerald-800 uppercase text-xs mb-1">Technology Cost</p>
                                <p className="text-xl font-bold text-emerald-700">{printSite.cost}</p>
                            </div>
                        )}
                        {printSite.usedFeatures && (
                            <div>
                                <p className="font-bold text-slate-500 uppercase text-xs mb-2">Features Used</p>
                                <p className="text-sm text-slate-800 leading-relaxed border-l-2 border-blue-500 pl-3">
                                    {printSite.usedFeatures}
                                </p>
                            </div>
                        )}
                   </div>

                   {/* Name Servers */}
                   {printSite.nameServers && (
                        <div className="mb-8 bg-slate-50 p-4 border border-slate-200">
                            <p className="font-bold text-slate-500 uppercase text-xs mb-2">Name Servers</p>
                            <p className="font-mono text-sm text-slate-800 whitespace-pre-wrap">{printSite.nameServers}</p>
                        </div>
                   )}

                   {/* WordPress */}
                   <div className="mb-8">
                       <h3 className="text-lg font-bold text-blue-900 border-b border-blue-100 pb-2 mb-4 uppercase">WordPress Access</h3>
                       <div className="bg-slate-50 p-6 border border-slate-200 rounded">
                           <div className="grid grid-cols-1 gap-4">
                               <div className="flex border-b border-slate-200 pb-2">
                                   <span className="w-32 font-bold text-slate-500 uppercase text-xs">Login URL</span>
                                   <span className="font-mono text-sm text-slate-800 flex-1">{printSite.adminUrl}</span>
                               </div>
                               <div className="flex border-b border-slate-200 pb-2">
                                   <span className="w-32 font-bold text-slate-500 uppercase text-xs">Username</span>
                                   <span className="font-mono text-sm text-slate-800 flex-1">{printSite.wpUser}</span>
                               </div>
                               <div className="flex">
                                   <span className="w-32 font-bold text-slate-500 uppercase text-xs">Password</span>
                                   <span className="font-mono text-sm text-slate-800 flex-1">{printSite.wpPass}</span>
                               </div>
                           </div>
                       </div>
                   </div>

                   {/* cPanel */}
                   {(printSite.cpanelUser || printSite.cpanelUrl) && (
                       <div className="mb-8">
                           <h3 className="text-lg font-bold text-orange-900 border-b border-orange-100 pb-2 mb-4 uppercase">Hosting / cPanel</h3>
                           <div className="bg-orange-50/30 p-6 border border-orange-200 rounded">
                               <div className="grid grid-cols-1 gap-4">
                                   <div className="flex border-b border-orange-100 pb-2">
                                       <span className="w-32 font-bold text-slate-500 uppercase text-xs">Control Panel</span>
                                       <span className="font-mono text-sm text-slate-800 flex-1">{printSite.cpanelUrl || 'N/A'}</span>
                                   </div>
                                   <div className="flex border-b border-orange-100 pb-2">
                                       <span className="w-32 font-bold text-slate-500 uppercase text-xs">Username</span>
                                       <span className="font-mono text-sm text-slate-800 flex-1">{printSite.cpanelUser || 'N/A'}</span>
                                   </div>
                                   <div className="flex">
                                       <span className="w-32 font-bold text-slate-500 uppercase text-xs">Password</span>
                                       <span className="font-mono text-sm text-slate-800 flex-1">{printSite.cpanelPass || 'N/A'}</span>
                                   </div>
                               </div>
                           </div>
                       </div>
                   )}

                   {/* Conditions & Notes */}
                   <div className="mb-8 grid grid-cols-1 gap-6">
                       {printSite.conditions && (
                           <div>
                               <p className="font-bold text-slate-500 uppercase text-xs mb-2">Terms & Conditions</p>
                               <div className="border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                   {printSite.conditions}
                               </div>
                           </div>
                       )}
                       {printSite.notes && (
                           <div>
                               <p className="font-bold text-slate-500 uppercase text-xs mb-2">Additional Notes</p>
                               <div className="border border-slate-200 p-4 text-sm text-slate-600 italic">
                                   {printSite.notes}
                               </div>
                           </div>
                       )}
                   </div>

                   {/* Footer */}
                   <div className="mt-12 pt-6 border-t border-slate-300 text-center">
                       <p className="text-xs text-slate-400 uppercase tracking-widest">
                           This document contains sensitive information. Please handle with care.
                       </p>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default WebsiteManager;
