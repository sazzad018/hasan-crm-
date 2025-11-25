

import React, { useState } from 'react';
import { Conversation, LeadStatus } from '../types';
import { Download, Search, Globe, Facebook, Phone, Filter, User, DownloadCloud, Plus, X, CheckSquare, Square, ChevronDown, ChevronUp, Database, Smartphone, FileSpreadsheet, RefreshCw, Briefcase, Star, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

interface LeadDatabaseProps {
  conversations: Conversation[];
  onExport: (psids: string[]) => void;
  onAddManualLead: (lead: Partial<Conversation>) => void;
  onUpdateStatus: (psid: string, status: LeadStatus) => void;
}

interface ExportColumn {
    id: string;
    label: string;
    key: keyof Conversation | 'custom_source'; // custom_source maps to source logic
    isSelected: boolean;
}

const LeadDatabase: React.FC<LeadDatabaseProps> = ({ conversations, onExport, onAddManualLead, onUpdateStatus }) => {
  // Tab State
  const [activeTab, setActiveTab] = useState<'leads' | 'active_clients'>('leads');

  // Filters
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [websiteFilter, setWebsiteFilter] = useState<'all'|'has_website'|'no_website'>('all');
  const [mobileFilter, setMobileFilter] = useState<'all'|'has_mobile'>('all'); 
  
  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);

  // Export Configuration
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportColumns, setExportColumns] = useState<ExportColumn[]>([
      { id: '1', label: 'User Name', key: 'userName', isSelected: true },
      { id: '2', label: 'Mobile Number', key: 'extractedMobile', isSelected: true },
      { id: '3', label: 'Source (FB/Manual)', key: 'source', isSelected: true },
      { id: '4', label: 'Status', key: 'status', isSelected: true },
      { id: '5', label: 'Facebook Link', key: 'extractedFbLink', isSelected: false },
      { id: '6', label: 'Website URL', key: 'extractedWebsite', isSelected: false },
      { id: '7', label: 'Last Active Date', key: 'lastActive', isSelected: false },
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualLead, setManualLead] = useState({
      userName: '',
      extractedMobile: '',
      extractedWebsite: '',
      extractedFbLink: '',
      status: 'new_lead' as LeadStatus
  });

  // --- Statistics Calculation ---
  const stats = {
      total: conversations.length,
      activeClients: conversations.filter(c => c.status === 'active_client').length,
      mobile: conversations.filter(c => c.extractedMobile).length,
      facebook: conversations.filter(c => c.extractedFbLink).length,
      website: conversations.filter(c => c.extractedWebsite).length
  };

  // --- Filtering Logic ---
  const filteredLeads = conversations.filter(lead => {
    // 0. Tab Logic
    if (activeTab === 'active_clients') {
        if (lead.status !== 'active_client') return false;
    } else {
        // In "Leads" tab, typically we might want to exclude active clients or show everything.
        // Let's exclude active clients from the main pool to make the "Promote" feature more logical.
        if (lead.status === 'active_client') return false;
    }

    // 1. Mobile Filter
    if (mobileFilter === 'has_mobile' && !lead.extractedMobile) return false;

    // 2. Text Search
    const matchesText = 
      lead.userName.toLowerCase().includes(filterText.toLowerCase()) ||
      (lead.extractedMobile && lead.extractedMobile.includes(filterText)) ||
      (lead.extractedWebsite && lead.extractedWebsite.includes(filterText));

    // 3. Status Dropdown
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    // 4. Website Dropdown
    let matchesWebsite = true;
    if (websiteFilter === 'has_website') matchesWebsite = !!lead.extractedWebsite;
    if (websiteFilter === 'no_website') matchesWebsite = !lead.extractedWebsite;

    return matchesText && matchesStatus && matchesWebsite;
  });

  // --- Export Logic ---
  const toggleColumn = (id: string) => {
      setExportColumns(exportColumns.map(col => 
          col.id === id ? { ...col, isSelected: !col.isSelected } : col
      ));
  };

  const handleExport = () => {
    if (filteredLeads.length === 0) return;

    // 1. Get Headers from selected columns
    const selectedCols = exportColumns.filter(c => c.isSelected);
    const headers = selectedCols.map(c => c.label);
    
    // 2. Build Rows
    const rows = filteredLeads.map(lead => {
        return selectedCols.map(col => {
            let val = lead[col.key as keyof Conversation];
            
            // Handle specific formatting
            if (col.key === 'lastActive') {
                return format(lead.lastActive, 'yyyy-MM-dd HH:mm');
            }
            if (col.key === 'source') {
                return lead.source === 'facebook' ? 'Facebook Auto' : 'Manual Entry';
            }
            
            return val ? `"${val}"` : '""'; // CSV escaping
        });
    });

    // 3. Generate CSV
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `custom_leads_export_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Update the download count in parent state
    onExport(filteredLeads.map(c => c.psid));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onAddManualLead(manualLead);
      setIsModalOpen(false);
      setManualLead({
          userName: '',
          extractedMobile: '',
          extractedWebsite: '',
          extractedFbLink: '',
          status: 'new_lead'
      });
      // Simulate sync
      simulateSync();
  };

  const simulateSync = () => {
      setIsSyncing(true);
      setTimeout(() => {
          setIsSyncing(false);
          alert("Successfully synced with Google Sheets!");
      }, 1500);
  };

  const getStatusBadge = (status: LeadStatus) => {
      const colors: Record<string, string> = {
          'new_lead': 'bg-blue-100 text-blue-700',
          'converted': 'bg-emerald-100 text-emerald-700',
          'active_client': 'bg-violet-100 text-violet-700 border-violet-200',
          'negotiation': 'bg-orange-100 text-orange-700',
          'interested': 'bg-indigo-100 text-indigo-700',
          'cold': 'bg-slate-100 text-slate-600'
      };
      
      const icon = status === 'active_client' ? <Star size={10} className="fill-violet-700" /> : null;

      return (
          <span className={`flex items-center gap-1 w-fit text-[10px] px-2 py-0.5 rounded-full font-medium uppercase border border-transparent ${colors[status] || colors['cold']}`}>
              {icon}
              {status.replace('_', ' ')}
          </span>
      );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. NEW SUMMARY DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Database size={24} />
              </div>
              <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Leads</p>
                  <h3 className="text-2xl font-bold text-slate-800">{stats.total}</h3>
              </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-violet-100 to-transparent rounded-bl-full opacity-50"></div>
              <div className="p-3 bg-violet-50 text-violet-600 rounded-lg relative z-10">
                  <Briefcase size={24} />
              </div>
              <div className="relative z-10">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Clients</p>
                  <h3 className="text-2xl font-bold text-slate-800">{stats.activeClients}</h3>
              </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Smartphone size={24} />
              </div>
              <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">With Phone</p>
                  <h3 className="text-2xl font-bold text-slate-800">{stats.mobile}</h3>
              </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                  <Globe size={24} />
              </div>
              <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">With Website</p>
                  <h3 className="text-2xl font-bold text-slate-800">{stats.website}</h3>
              </div>
          </div>
      </div>

      {/* TABS Navigation */}
      <div className="flex gap-4 border-b border-slate-200">
          <button
            onClick={() => { setActiveTab('leads'); setStatusFilter('all'); }}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'leads' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
              <Database size={16} /> All Leads
          </button>
          <button
            onClick={() => { setActiveTab('active_clients'); setStatusFilter('active_client'); }}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'active_clients' 
                ? 'border-violet-600 text-violet-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
              <Briefcase size={16} /> 🚀 Active Clients
              <span className="bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full text-[10px]">
                  {stats.activeClients}
              </span>
          </button>
      </div>

      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Filter size={20} className={activeTab === 'active_clients' ? 'text-violet-600' : 'text-blue-600'} />
                {activeTab === 'active_clients' ? 'Active Client List' : 'Lead Management'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Found <span className="font-bold text-slate-800">{filteredLeads.length}</span> records matching criteria.
            </p>
          </div>
          <div className="flex gap-2">
              <button 
                onClick={simulateSync}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border transition-all ${
                    isSyncing 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-green-400 hover:text-green-600'
                }`}
                disabled={isSyncing}
              >
                  <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing ? 'Syncing...' : 'Sync to Sheet'}
              </button>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
              >
                  <Plus size={18} /> Add Manual Lead
              </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 mb-4">
            {/* 1. Text Search */}
            <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                type="text" 
                placeholder="Search name, phone..." 
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                />
            </div>
            
            {/* 2. Mobile Filter */}
            <div className="md:col-span-1">
                <select 
                    value={mobileFilter}
                    onChange={(e) => setMobileFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700"
                >
                    <option value="all">👥 All Leads</option>
                    <option value="has_mobile">📱 Has Mobile Number</option>
                </select>
            </div>
          
            {/* 3. Status Filter (Hidden if in Active Clients tab to avoid confusion, or disabled) */}
            <div className="md:col-span-1">
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    disabled={activeTab === 'active_clients'}
                    className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 ${activeTab === 'active_clients' ? 'opacity-50 bg-slate-100 cursor-not-allowed' : ''}`}
                >
                    <option value="all">Status: All</option>
                    <option value="new_lead">Status: New Lead</option>
                    <option value="negotiation">Status: Negotiation</option>
                    <option value="converted">Status: Converted</option>
                    <option value="active_client">Status: Active Client</option>
                </select>
            </div>

            {/* 4. Website Filter */}
            <div className="md:col-span-1">
                <select 
                    value={websiteFilter}
                    onChange={(e) => setWebsiteFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                    <option value="all">Website: All</option>
                    <option value="has_website">Has Website ✅</option>
                    <option value="no_website">No Website ❌</option>
                </select>
            </div>
        </div>

        {/* CUSTOM EXPORT SECTION */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button 
                onClick={() => setShowExportOptions(!showExportOptions)}
                className={`w-full flex items-center justify-between px-5 py-3 text-sm font-bold transition-colors ${showExportOptions ? 'bg-slate-50 text-slate-800' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
                <div className="flex items-center gap-2">
                    <Download size={18} className="text-emerald-600" />
                    Custom CSV Export
                </div>
                {showExportOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showExportOptions && (
                <div className="p-5 bg-slate-50 border-t border-slate-200 animate-in slide-in-from-top-2">
                    <div className="mb-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select columns to download:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {exportColumns.map(col => (
                                <button 
                                    key={col.id}
                                    onClick={() => toggleColumn(col.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                                        col.isSelected 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                                    }`}
                                >
                                    {col.isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                    {col.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-2">
                        <div className="text-xs text-slate-500">
                            Will export <span className="font-bold text-slate-800">{filteredLeads.length}</span> rows with <span className="font-bold text-slate-800">{exportColumns.filter(c => c.isSelected).length}</span> columns.
                        </div>
                        <button 
                            onClick={handleExport}
                            disabled={filteredLeads.length === 0 || exportColumns.filter(c => c.isSelected).length === 0}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm
                                ${filteredLeads.length > 0 && exportColumns.some(c => c.isSelected)
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' 
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            <DownloadCloud size={18} />
                            Download CSV
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                 <thead>
                     <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                         <th className="px-6 py-4">Client Name</th>
                         <th className="px-6 py-4">Source</th>
                         <th className="px-6 py-4">Mobile</th>
                         <th className="px-6 py-4">Web/Social</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4 text-center">Exported</th>
                         <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                     {filteredLeads.length > 0 ? (
                         filteredLeads.map((lead) => (
                             <tr key={lead.psid} className="hover:bg-slate-50 transition-colors group">
                                 <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                         <div className={`w-10 h-10 rounded-full flex items-center justify-center text-slate-500 font-bold border ${lead.status === 'active_client' ? 'bg-violet-100 border-violet-200 text-violet-600' : 'bg-slate-100 border-slate-200'}`}>
                                             {lead.userName.charAt(0)}
                                         </div>
                                         <div>
                                             <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                 {lead.userName}
                                                 {lead.status === 'active_client' && <Star size={12} className="fill-violet-500 text-violet-500" />}
                                             </div>
                                             <div className="text-[10px] text-slate-400 font-mono">ID: {lead.psid.substring(0,8)}...</div>
                                         </div>
                                     </div>
                                 </td>
                                 <td className="px-6 py-4">
                                     {lead.source === 'facebook' ? (
                                         <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                                             <Facebook size={12} /> Auto
                                         </span>
                                     ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-50 text-orange-700 text-xs font-medium border border-orange-100">
                                            <User size={12} /> Manual
                                        </span>
                                     )}
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        {lead.extractedMobile ? (
                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                <Phone size={14} className="text-emerald-500" />
                                                <span className="font-mono bg-emerald-50 px-1.5 rounded text-emerald-800 font-bold">
                                                    {lead.extractedMobile}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">No number</span>
                                        )}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="space-y-2">
                                        {lead.extractedWebsite ? (
                                            <a href={lead.extractedWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-medium text-blue-600 hover:underline bg-blue-50 w-fit px-2 py-1 rounded">
                                                <Globe size={12} />
                                                <span className="truncate max-w-[150px]">{lead.extractedWebsite.replace('https://', '')}</span>
                                            </a>
                                        ) : (
                                            <span className="flex items-center gap-2 text-xs text-slate-400 opacity-60">
                                                <Globe size={12} /> N/A
                                            </span>
                                        )}
                                        
                                        {lead.extractedFbLink && (
                                            <a href={lead.extractedFbLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-blue-700 hover:text-blue-900">
                                                <Facebook size={12} />
                                                <span>Profile</span>
                                            </a>
                                        )}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                     <div className="flex flex-col gap-1">
                                        {getStatusBadge(lead.status)}
                                     </div>
                                 </td>
                                 <td className="px-6 py-4">
                                     <div className="flex flex-col items-center justify-center">
                                         {lead.downloadCount > 0 ? (
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200" title={`Downloaded ${lead.downloadCount} times`}>
                                                <DownloadCloud size={14} className="text-blue-500" />
                                                {lead.downloadCount}
                                            </div>
                                         ) : (
                                             <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300">
                                                 <span className="text-xs">-</span>
                                             </div>
                                         )}
                                     </div>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    {lead.status !== 'active_client' && (
                                        <button 
                                            onClick={() => onUpdateStatus(lead.psid, 'active_client')}
                                            className="inline-flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md"
                                            title="Promote to Active Client"
                                        >
                                            <ArrowUpRight size={14} /> Promote
                                        </button>
                                    )}
                                 </td>
                             </tr>
                         ))
                     ) : (
                         <tr>
                             <td colSpan={7} className="px-6 py-20 text-center">
                                 <div className="flex flex-col items-center justify-center text-slate-400">
                                     <Filter size={48} className="mb-4 opacity-20" />
                                     <p className="text-lg font-medium text-slate-600">No records found</p>
                                     <p className="text-sm max-w-md mx-auto mt-2">
                                        Try adjusting your filters or search terms.
                                     </p>
                                 </div>
                             </td>
                         </tr>
                     )}
                 </tbody>
             </table>
         </div>
      </div>

      {/* Manual Input Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-800">Add Manual Lead</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>
                  <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name <span className="text-red-500">*</span></label>
                          <input 
                            required
                            type="text" 
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={manualLead.userName}
                            onChange={e => setManualLead({...manualLead, userName: e.target.value})}
                            placeholder="Client Name"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mobile Number</label>
                          <input 
                            type="text" 
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={manualLead.extractedMobile}
                            onChange={e => setManualLead({...manualLead, extractedMobile: e.target.value})}
                            placeholder="e.g. 01711000000"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Website URL</label>
                              <input 
                                type="text" 
                                className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={manualLead.extractedWebsite}
                                onChange={e => setManualLead({...manualLead, extractedWebsite: e.target.value})}
                                placeholder="https://..."
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Facebook URL</label>
                              <input 
                                type="text" 
                                className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={manualLead.extractedFbLink}
                                onChange={e => setManualLead({...manualLead, extractedFbLink: e.target.value})}
                                placeholder="https://facebook.com/..."
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                          <select 
                             className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                             value={manualLead.status}
                             onChange={e => setManualLead({...manualLead, status: e.target.value as LeadStatus})}
                          >
                             <option value="new_lead">New Lead</option>
                             <option value="interested">Interested</option>
                             <option value="negotiation">Negotiation</option>
                             <option value="converted">Converted</option>
                             <option value="active_client">Active Client 🚀</option>
                          </select>
                      </div>

                      <div className="bg-emerald-50 p-3 rounded text-xs text-emerald-800 border border-emerald-100 flex items-center gap-2">
                           <FileSpreadsheet size={16} />
                           <span>This data will be synced to Google Sheets upon save.</span>
                      </div>

                      <div className="pt-4 flex gap-3">
                          <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
                              Save & Sync
                          </button>
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 bg-slate-100 text-slate-600 font-bold py-2.5 rounded-lg hover:bg-slate-200 transition-colors">
                              Cancel
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default LeadDatabase;