
import React, { useState } from 'react';
import { Conversation, LeadStatus, ServiceType } from '../types';
import { Download, Search, Globe, Facebook, Phone, User, Plus, X, LayoutGrid, List, MessageCircle, DollarSign, TrendingUp, Briefcase, Calendar, Filter, ExternalLink, Share2, MoreHorizontal, Clock, AlertCircle, CheckCircle2, ChevronDown, FileSpreadsheet, Eye, Zap, Layers, BarChart3, PieChart, ArrowRight, Flame, Snowflake, ThermometerSun, CheckSquare, Square, Trash2, RefreshCw, MessageSquare, Mail, Tag, CreditCard, MapPin, Star, StickyNote, Save, ShoppingBag, Utensils, Home, Smartphone, GraduationCap, HeartPulse, Megaphone, Monitor, Code, Video, PenTool, Flag, PauseCircle } from 'lucide-react';
import { format, differenceInDays, isSameDay, isSameMonth, isWithinInterval, endOfDay, addDays } from 'date-fns';

interface LeadDatabaseProps {
  conversations: Conversation[];
  onExport: (psids: string[]) => void;
  onAddManualLead: (lead: Partial<Conversation>) => void;
  onUpdateStatus: (psid: string, status: LeadStatus) => void;
  onOpenPublicLink: () => void; 
  onToggleBestQuality: (psid: string) => void;
  onUpdateNotes: (psid: string, notes: string) => void;
  onUpdateIndustry: (psid: string, industry: string) => void;
  onUpdateServiceType: (psid: string, service: string) => void;
}

const LeadDatabase: React.FC<LeadDatabaseProps> = ({ conversations, onExport, onAddManualLead, onUpdateStatus, onOpenPublicLink, onToggleBestQuality, onUpdateNotes, onUpdateIndustry, onUpdateServiceType }) => {
  // View State
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [viewLead, setViewLead] = useState<Conversation | null>(null); // State for Detail Modal
  const [noteInput, setNoteInput] = useState('');

  // Filters
  const [filterText, setFilterText] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'facebook' | 'manual' | 'web'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // New Status Filter
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | 'month' | 'custom'>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all'); 
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Quick Filters (Insights Click)
  const [quickFilter, setQuickFilter] = useState<'all' | 'has_phone' | 'has_website' | 'has_facebook' | 'best_quality'>('all');
  
  // Bulk Selection State
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualLead, setManualLead] = useState({
      userName: '',
      extractedMobile: '',
      extractedWebsite: '',
      extractedFbLink: '',
      businessInfo: '',
      status: 'new_lead' as LeadStatus,
      dealValue: 0
  });

  // Public Link Logic
  const publicLink = `${window.location.origin}/form/lead-gen`;
  const [showLinkModal, setShowLinkModal] = useState(false);

  const copyPublicLink = () => {
      navigator.clipboard.writeText(publicLink);
      alert("Link Copied to Clipboard!");
  };

  // --- Filtering Logic ---
  const filteredLeads = conversations.filter(lead => {
    // 1. Text Search
    const matchesText = 
      lead.userName.toLowerCase().includes(filterText.toLowerCase()) ||
      (lead.extractedMobile && lead.extractedMobile.includes(filterText)) ||
      (lead.extractedWebsite && lead.extractedWebsite.includes(filterText));

    // 2. Source Filter
    let matchesSource = true;
    if (sourceFilter === 'facebook') matchesSource = lead.source === 'facebook';
    if (sourceFilter === 'manual') matchesSource = lead.source === 'manual';
    if (sourceFilter === 'web') matchesSource = lead.source === 'web_form';

    // 3. Status Filter
    let matchesStatus = true;
    if (statusFilter !== 'all') {
        matchesStatus = lead.status === statusFilter;
    }

    // 4. Date Filter
    let matchesDate = true;
    const leadDate = new Date(lead.lastActive); 
    const now = new Date();
    
    if (dateFilter === 'today') {
        matchesDate = isSameDay(leadDate, now);
    } else if (dateFilter === '7days') {
        matchesDate = leadDate >= addDays(now, -7);
    } else if (dateFilter === 'month') {
        matchesDate = isSameMonth(leadDate, now);
    } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
        matchesDate = isWithinInterval(leadDate, {
            start: new Date(customStartDate + 'T00:00:00'),
            end: endOfDay(new Date(customEndDate + 'T00:00:00'))
        });
    }

    // 5. Service Filter
    let matchesService = true;
    if (serviceFilter !== 'all') {
        matchesService = lead.serviceType === serviceFilter;
    }

    // 6. Quick Filter (Insight Cards)
    let matchesQuickFilter = true;
    if (quickFilter === 'has_phone') matchesQuickFilter = !!lead.extractedMobile;
    if (quickFilter === 'has_website') matchesQuickFilter = !!lead.extractedWebsite;
    if (quickFilter === 'has_facebook') matchesQuickFilter = !!lead.extractedFbLink || lead.source === 'facebook';
    if (quickFilter === 'best_quality') matchesQuickFilter = !!lead.isBestQuality;

    return matchesText && matchesSource && matchesStatus && matchesDate && matchesService && matchesQuickFilter;
  });

  // --- Bulk Logic ---
  const handleSelectAll = () => {
      if (selectedLeads.length === filteredLeads.length) {
          setSelectedLeads([]);
      } else {
          setSelectedLeads(filteredLeads.map(c => c.psid));
      }
  };

  const handleSelectOne = (psid: string) => {
      if (selectedLeads.includes(psid)) {
          setSelectedLeads(selectedLeads.filter(id => id !== psid));
      } else {
          setSelectedLeads([...selectedLeads, psid]);
      }
  };

  const handleBulkStatusChange = (newStatus: LeadStatus) => {
      selectedLeads.forEach(psid => onUpdateStatus(psid, newStatus));
      setSelectedLeads([]); // Clear selection after action
  };

  // --- Helper: Calculate Lead Temperature ---
  const getLeadScore = (lead: Conversation) => {
      const daysInactive = differenceInDays(new Date(), new Date(lead.lastActive));
      const hasMoney = (lead.dealValue || 0) > 500;
      const isNew = lead.status === 'new_lead' || lead.status === 'interested';
      
      if (daysInactive > 7) return { label: 'Cold', icon: Snowflake, color: 'text-blue-400', bg: 'bg-blue-50' };
      if (hasMoney && daysInactive < 3) return { label: 'Hot 🔥', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' };
      if (isNew && daysInactive < 2) return { label: 'Warm', icon: ThermometerSun, color: 'text-amber-500', bg: 'bg-amber-50' };
      
      return { label: 'Neutral', icon: CheckCircle2, color: 'text-slate-400', bg: 'bg-slate-50' };
  };

  // --- Helper: Get Last Message ---
  const getLastMessage = (lead: Conversation) => {
      if (lead.messages && lead.messages.length > 0) {
          const lastMsg = lead.messages[lead.messages.length - 1];
          return lastMsg.messageText || '(Attachment)';
      }
      return 'No messages yet';
  };

  // --- Helper: Get Industry Icon ---
  const getIndustryIcon = (industry?: string) => {
      switch(industry) {
          case 'Clothing': return <ShoppingBag size={12} className="text-pink-500" />;
          case 'Food': return <Utensils size={12} className="text-orange-500" />;
          case 'RealEstate': return <Home size={12} className="text-blue-500" />;
          case 'Tech': return <Smartphone size={12} className="text-slate-600" />;
          case 'Education': return <GraduationCap size={12} className="text-emerald-600" />;
          case 'Health': return <HeartPulse size={12} className="text-red-500" />;
          default: return <Briefcase size={12} className="text-slate-400" />;
      }
  };

  // --- Helper: Get Service Badge ---
  const getServiceBadge = (service?: string) => {
      switch(service) {
          case 'fb_ads': 
            return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded text-[9px] font-bold"><Megaphone size={10} /> FB Ads</span>;
          case 'web_dev':
            return <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200 px-1.5 py-0.5 rounded text-[9px] font-bold"><Monitor size={10} /> Web Dev</span>;
          case 'funnel':
            return <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded text-[9px] font-bold"><Filter size={10} /> Funnel</span>;
          case 'seo':
            return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold"><Search size={10} /> SEO</span>;
          case 'video_editing':
            return <span className="inline-flex items-center gap-1 bg-pink-50 text-pink-700 border border-pink-200 px-1.5 py-0.5 rounded text-[9px] font-bold"><Video size={10} /> Video</span>;
          default:
            return null;
      }
  };

  // --- Pipeline Statistics ---
  const totalValue = filteredLeads.reduce((sum, lead) => sum + (lead.dealValue || 0), 0);
  const activeCount = filteredLeads.filter(c => c.status === 'active_client' || c.status === 'converted').length;
  const conversionRate = filteredLeads.length > 0 ? ((activeCount / filteredLeads.length) * 100).toFixed(1) : '0';
  const newLeadsCount = filteredLeads.filter(c => c.status === 'new_lead').length;

  // --- Data Quality Stats ---
  const countMobile = conversations.filter(l => l.extractedMobile).length;
  const countWebsite = conversations.filter(l => l.extractedWebsite).length;
  const countFB = conversations.filter(l => l.extractedFbLink || l.source === 'facebook').length;
  const countBestQuality = conversations.filter(l => l.isBestQuality).length;

  // --- Export Logic Helper ---
  const generateCSV = (data: Conversation[], filenamePrefix: string) => {
      if (data.length === 0) {
          alert("No leads found for this selection.");
          return;
      }
      const headers = ['User Name', 'Mobile Number', 'Website', 'Facebook Link', 'Source', 'Current Status', 'Deal Value', 'Best Quality', 'Tags', 'Notes', 'Last Active Date', 'Industry', 'Service Type'];
      const rows = data.map(lead => [
          `"${lead.userName}"`,
          `"${lead.extractedMobile || ''}"`,
          `"${lead.extractedWebsite || ''}"`,
          `"${lead.extractedFbLink || ''}"`,
          lead.source,
          lead.status,
          lead.dealValue || 0,
          lead.isBestQuality ? 'Yes' : 'No',
          `"${lead.tags?.join(', ') || ''}"`,
          `"${lead.notes || ''}"`,
          format(new Date(lead.lastActive), 'yyyy-MM-dd HH:mm'),
          lead.industry || 'Other',
          lead.serviceType || 'Not Assigned'
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      
      const fileName = `${filenamePrefix}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Update stats
      onExport(data.map(c => c.psid));
      setShowExportMenu(false);
  };

  // Specific Export Handlers
  const handleExportFiltered = () => generateCSV(filteredLeads, `Leads_Filtered`);
  const handleExportAll = () => generateCSV(conversations, `All_Leads_Backup`);
  const handleExportWithWebsite = () => {
      const withSite = conversations.filter(c => c.extractedWebsite && c.extractedWebsite.length > 3);
      generateCSV(withSite, `Leads_With_Websites`);
  };
  const handleExportFbOnly = () => {
      const fbOnly = conversations.filter(c => (!c.extractedWebsite || c.extractedWebsite.length < 3) && (c.source === 'facebook' || c.extractedFbLink));
      generateCSV(fbOnly, `Leads_Facebook_Only`);
  };

  // Handlers for quick card downloads
  const handleDownloadPhoneLeads = (e: React.MouseEvent) => {
      e.stopPropagation();
      const phoneLeads = conversations.filter(c => c.extractedMobile);
      generateCSV(phoneLeads, "Leads_With_Phone");
  };

  const handleDownloadWebsiteLeads = (e: React.MouseEvent) => {
      e.stopPropagation();
      const websiteLeads = conversations.filter(c => c.extractedWebsite);
      generateCSV(websiteLeads, "Leads_With_Websites");
  };

  const handleDownloadFacebookLeads = (e: React.MouseEvent) => {
      e.stopPropagation();
      const fbLeads = conversations.filter(c => c.extractedFbLink || c.source === 'facebook');
      generateCSV(fbLeads, "Leads_From_Facebook");
  };

  const handleDownloadBestQualityLeads = (e: React.MouseEvent) => {
      e.stopPropagation();
      const bestLeads = conversations.filter(c => c.isBestQuality);
      generateCSV(bestLeads, "Best_Quality_Leads");
  };

  const handleManualSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onAddManualLead({ ...manualLead, source: 'manual' });
      setIsModalOpen(false);
      setManualLead({ userName: '', extractedMobile: '', extractedWebsite: '', extractedFbLink: '', businessInfo: '', status: 'new_lead', dealValue: 0 });
  };

  const handleOpenDetailModal = (lead: Conversation) => {
      setViewLead(lead);
      setNoteInput(lead.notes || '');
  };

  const handleSaveNote = () => {
      if (viewLead) {
          onUpdateNotes(viewLead.psid, noteInput);
          // Update local view immediately for UX
          setViewLead({ ...viewLead, notes: noteInput });
          alert("Note Saved!");
      }
  };

  // --- Visual Helpers ---
  const getStatusColor = (status: LeadStatus) => {
      switch(status) {
          case 'new_lead': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'interested': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
          case 'negotiation': return 'bg-orange-100 text-orange-700 border-orange-200';
          case 'converted': 
          case 'active_client': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
          case 'past_client': return 'bg-slate-200 text-slate-700 border-slate-300';
          default: return 'bg-slate-100 text-slate-600 border-slate-200';
      }
  };

  const toggleQuickFilter = (filter: typeof quickFilter) => {
      if (quickFilter === filter) {
          setQuickFilter('all');
      } else {
          setQuickFilter(filter);
      }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-4 pb-6 relative">
      
      {/* 1. HERO STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Total Database</p>
                  <h2 className="text-3xl font-bold">{conversations.length}</h2>
                  <div className="flex items-center gap-1 mt-2 text-[10px] bg-blue-800/30 w-fit px-2 py-1 rounded">
                      <ArrowRight size={10} /> All Channels
                  </div>
              </div>
              <Layers className="absolute right-[-10px] bottom-[-10px] opacity-20" size={80} />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pipeline Value</p>
                  <h2 className="text-2xl font-bold text-slate-800">${totalValue.toLocaleString()}</h2>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                  <TrendingUp size={14} /> Potential Revenue
              </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Conversion Rate</p>
                  <h2 className="text-2xl font-bold text-slate-800">{conversionRate}%</h2>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                  <div className="bg-violet-500 h-1.5 rounded-full" style={{width: `${conversionRate}%`}}></div>
              </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Fresh Leads</p>
                  <h2 className="text-2xl font-bold text-slate-800">{newLeadsCount}</h2>
              </div>
              <div className="flex items-center gap-1 text-orange-500 text-xs font-bold">
                  <Zap size={14} /> Needs Action
              </div>
          </div>
      </div>

      {/* 2. DATA INSIGHTS BAR (INTERACTIVE FILTERS & DOWNLOADS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Phone Insight Card */}
          <div 
            onClick={() => toggleQuickFilter('has_phone')}
            className={`cursor-pointer p-3 rounded-xl flex items-center justify-between shadow-sm border transition-all ${quickFilter === 'has_phone' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-emerald-100 hover:border-emerald-300'}`}
          >
              <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                      <Phone size={18} />
                  </div>
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Has Phone</p>
                      <p className="text-lg font-bold text-slate-700">{countMobile}</p>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                  <button 
                    onClick={handleDownloadPhoneLeads}
                    className="p-2 bg-white text-emerald-600 rounded-full border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-colors shadow-sm"
                    title="Download Phone List"
                  >
                      <Download size={14} />
                  </button>
              </div>
          </div>

          {/* Website Insight Card */}
          <div 
            onClick={() => toggleQuickFilter('has_website')}
            className={`cursor-pointer p-3 rounded-xl flex items-center justify-between shadow-sm border transition-all ${quickFilter === 'has_website' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-blue-100 hover:border-blue-300'}`}
          >
              <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                      <Globe size={18} />
                  </div>
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Has Website</p>
                      <p className="text-lg font-bold text-slate-700">{countWebsite}</p>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                  <button 
                    onClick={handleDownloadWebsiteLeads}
                    className="p-2 bg-white text-blue-600 rounded-full border border-blue-100 hover:bg-blue-500 hover:text-white transition-colors shadow-sm"
                    title="Download Website List"
                  >
                      <Download size={14} />
                  </button>
              </div>
          </div>

          {/* Facebook Insight Card */}
          <div 
            onClick={() => toggleQuickFilter('has_facebook')}
            className={`cursor-pointer p-3 rounded-xl flex items-center justify-between shadow-sm border transition-all ${quickFilter === 'has_facebook' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-indigo-100 hover:border-indigo-300'}`}
          >
              <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                      <Facebook size={18} />
                  </div>
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Facebook</p>
                      <p className="text-lg font-bold text-slate-700">{countFB}</p>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                  <button 
                    onClick={handleDownloadFacebookLeads}
                    className="p-2 bg-white text-indigo-600 rounded-full border border-indigo-100 hover:bg-indigo-500 hover:text-white transition-colors shadow-sm"
                    title="Download Facebook List"
                  >
                      <Download size={14} />
                  </button>
              </div>
          </div>

          {/* Best Quality Insight Card */}
          <div 
            onClick={() => toggleQuickFilter('best_quality')}
            className={`cursor-pointer p-3 rounded-xl flex items-center justify-between shadow-sm border transition-all ${quickFilter === 'best_quality' ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500' : 'bg-white border-amber-100 hover:border-amber-300'}`}
          >
              <div className="flex items-center gap-3">
                  <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
                      <Star size={18} className="fill-amber-600" />
                  </div>
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Best Quality</p>
                      <p className="text-lg font-bold text-slate-700">{countBestQuality}</p>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                  <button 
                    onClick={handleDownloadBestQualityLeads}
                    className="p-2 bg-white text-amber-600 rounded-full border border-amber-100 hover:bg-amber-500 hover:text-white transition-colors shadow-sm"
                    title="Download Best Quality List"
                  >
                      <Download size={14} />
                  </button>
              </div>
          </div>
      </div>

      {/* 3. CONTROL BAR (Filters & Actions) */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          
          {/* Left: Search & Tabs */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search database..." 
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#9B7BE3] outline-none transition-all"
                  />
              </div>
              
              {/* Source Filter */}
              <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                  {['all', 'facebook', 'manual', 'web'].map((src) => (
                      <button 
                          key={src}
                          onClick={() => setSourceFilter(src as any)}
                          className={`flex-1 px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all ${sourceFilter === src ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                          {src === 'all' ? 'All' : src === 'web' ? 'Web' : src}
                      </button>
                  ))}
              </div>

              {/* Status Filter (NEW) */}
              <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-[#9B7BE3] cursor-pointer w-full sm:w-auto"
              >
                  <option value="all">📌 All Statuses</option>
                  <option value="new_lead">New Lead</option>
                  <option value="interested">Interested</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="active_client">Active Client</option>
                  <option value="past_client">Paused/Past</option>
                  <option value="cold">Cold</option>
              </select>

              {/* Date Filter */}
              <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-[#9B7BE3] cursor-pointer w-full sm:w-auto"
              >
                  <option value="all">📅 All Time</option>
                  <option value="today">📅 Today</option>
                  <option value="7days">📅 Last 7 Days</option>
                  <option value="month">📅 This Month</option>
                  <option value="custom">📅 Custom Range</option>
              </select>

              {/* Service Filter */}
              <select 
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-[#9B7BE3] cursor-pointer w-full sm:w-auto"
              >
                  <option value="all">🛠️ All Services</option>
                  <option value="fb_ads">📢 Facebook Ads</option>
                  <option value="web_dev">💻 Web Development</option>
                  <option value="funnel">🌪️ Funnel</option>
                  <option value="seo">🔍 SEO</option>
                  <option value="video_editing">🎬 Video Editing</option>
              </select>
              
              {dateFilter === 'custom' && (
                  <div className="flex gap-1 items-center">
                      <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="text-xs border border-slate-200 rounded p-1" />
                      <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="text-xs border border-slate-200 rounded p-1" />
                  </div>
              )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              
              {/* Public Link Button */}
              <button 
                onClick={() => setShowLinkModal(true)} 
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg ring-2 ring-indigo-100"
              >
                  <Globe size={16} /> Public Form Link
              </button>

              {/* Export Dropdown */}
              <div className="relative">
                  <button 
                    onClick={() => setShowExportMenu(!showExportMenu)} 
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                  >
                      <Download size={16} /> Export <ChevronDown size={14} />
                  </button>
                  {showExportMenu && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95">
                          <div className="p-2 space-y-1">
                              <button onClick={handleExportFiltered} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2"><Filter size={14}/> Current Filtered</button>
                              <button onClick={handleExportWithWebsite} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2"><Globe size={14}/> With Websites</button>
                              <button onClick={handleExportFbOnly} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2"><Facebook size={14}/> FB Only</button>
                              <div className="border-t border-slate-100 my-1"></div>
                              <button onClick={handleExportAll} className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center gap-2"><FileSpreadsheet size={14}/> Export All Data</button>
                          </div>
                      </div>
                  )}
              </div>

              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-black shadow-lg transition-all">
                  <Plus size={16} /> Add Lead
              </button>
          </div>
      </div>

      {/* BULK ACTION BAR (Appears when items selected) */}
      {selectedLeads.length > 0 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-4 animate-in slide-in-from-bottom-4">
              <span className="font-bold text-sm">{selectedLeads.length} Selected</span>
              <div className="h-4 w-px bg-slate-700"></div>
              <button onClick={() => handleBulkStatusChange('active_client')} className="text-xs hover:text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Mark Active</button>
              <button onClick={() => handleBulkStatusChange('cold')} className="text-xs hover:text-blue-400 font-bold flex items-center gap-1"><Snowflake size={14} /> Mark Cold</button>
              <div className="h-4 w-px bg-slate-700"></div>
              <button onClick={() => setSelectedLeads([])} className="text-slate-400 hover:text-white"><X size={16} /></button>
          </div>
      )}

      {/* 4. CONTENT AREA */}
      <div className="flex-1 overflow-hidden min-h-0 relative z-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
          
          {/* --- VIEW: MODERN LIST (CARD ROWS) --- */}
          <div className="h-full overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/50">
              
              {/* Header Row */}
              <div className="grid grid-cols-12 px-6 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-1 flex items-center justify-center">
                      <button onClick={handleSelectAll} className="hover:text-slate-600"><CheckSquare size={14} /></button>
                  </div>
                  <div className="col-span-4">Lead Profile & Context</div>
                  <div className="col-span-3">Activity & Score</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Smart Actions</div>
              </div>

              {filteredLeads.map(lead => {
                  const score = getLeadScore(lead);
                  const daysInactive = differenceInDays(new Date(), new Date(lead.lastActive));
                  const isSelected = selectedLeads.includes(lead.psid);

                  return (
                      <div key={lead.psid} className={`grid grid-cols-12 items-center bg-white p-4 rounded-xl border transition-all group hover:shadow-md ${isSelected ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200'}`}>
                          
                          {/* Select */}
                          <div className="col-span-1 flex justify-center">
                              <button onClick={() => handleSelectOne(lead.psid)} className={isSelected ? 'text-blue-600' : 'text-slate-300 hover:text-slate-50'}>
                                  {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                              </button>
                          </div>

                          {/* Profile & Context */}
                          <div className="col-span-4 flex items-center gap-4">
                              <div 
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-sm ${lead.status === 'active_client' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : lead.status === 'past_client' ? 'bg-slate-400' : 'bg-slate-700'}`}
                              >
                                  {lead.userName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                  <h4 
                                    onClick={() => handleOpenDetailModal(lead)}
                                    className="font-bold text-slate-800 text-sm truncate cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2"
                                  >
                                      {lead.userName}
                                      {getIndustryIcon(lead.industry)}
                                  </h4>
                                  
                                  {/* Data Presence Indicators & Best Quality */}
                                  <div className="flex items-center gap-2 mt-1">
                                      {/* SERVICE TYPE BADGE */}
                                      {getServiceBadge(lead.serviceType)}

                                      <div className="flex gap-1 ml-1">
                                          <Phone size={10} className={lead.extractedMobile ? "text-emerald-500" : "text-slate-200"} />
                                          <Globe size={10} className={lead.extractedWebsite ? "text-blue-500" : "text-slate-200"} />
                                          <Facebook size={10} className={lead.extractedFbLink ? "text-indigo-500" : "text-slate-200"} />
                                          
                                          {/* Best Quality Toggle */}
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); onToggleBestQuality(lead.psid); }}
                                            className="hover:scale-110 transition-transform"
                                            title={lead.isBestQuality ? "Best Quality Lead" : "Mark as Best Quality"}
                                          >
                                              <Star 
                                                size={12} 
                                                className={lead.isBestQuality ? "text-amber-500 fill-amber-500" : "text-slate-300 hover:text-amber-400"} 
                                              />
                                          </button>
                                      </div>
                                      <span className="text-slate-300 text-[8px]">|</span>
                                      <div className="text-[10px] text-slate-400 flex items-center gap-1 max-w-[120px] truncate" title={lead.notes || getLastMessage(lead)}>
                                          {lead.notes ? (
                                              <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-1 rounded"><StickyNote size={10} /> Note</span>
                                          ) : (
                                              <><MessageSquare size={10} /> {getLastMessage(lead)}</>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Activity & Score */}
                          <div className="col-span-3">
                              <div className="flex items-center gap-2 mb-1">
                                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${score.bg} ${score.color} border-opacity-50`}>
                                      <score.icon size={10} /> {score.label}
                                  </div>
                                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                      ${lead.dealValue?.toLocaleString() || '0'}
                                  </span>
                                  {lead.downloadCount > 0 && (
                                      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-0.5" title="Download Count">
                                          <Download size={8} /> {lead.downloadCount}
                                      </span>
                                  )}
                              </div>
                              <p className={`text-[10px] font-bold flex items-center gap-1 ${daysInactive > 3 ? 'text-red-500' : 'text-slate-400'}`}>
                                  <Clock size={10} /> {daysInactive === 0 ? 'Active Today' : `Inactive ${daysInactive}d`}
                              </p>
                          </div>

                          {/* Status */}
                          <div className="col-span-2">
                              <div className="relative">
                                  <select 
                                      className={`appearance-none w-full py-1.5 pl-3 pr-8 rounded-lg text-xs font-bold uppercase cursor-pointer outline-none border transition-colors ${getStatusColor(lead.status)}`}
                                      value={lead.status}
                                      onChange={(e) => onUpdateStatus(lead.psid, e.target.value as LeadStatus)}
                                  >
                                      <option value="new_lead">New Lead</option>
                                      <option value="interested">Interested</option>
                                      <option value="negotiation">Negotiation</option>
                                      <option value="active_client">Active Client</option>
                                      <option value="past_client">Paused / Completed</option>
                                      <option value="cold">Cold / Lost</option>
                                  </select>
                                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                              </div>
                          </div>

                          {/* Smart Actions */}
                          <div className="col-span-2 flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                              {lead.extractedMobile && (
                                  <a href={`https://wa.me/${lead.extractedMobile.replace('+', '')}`} target="_blank" rel="noreferrer" className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors" title="WhatsApp">
                                      <MessageCircle size={16} />
                                  </a>
                              )}
                              
                              {/* Context Aware Button */}
                              {lead.status === 'active_client' ? (
                                  <button 
                                    onClick={() => {
                                        if(window.confirm(`Mark project as STOPPED/COMPLETED for ${lead.userName}?\n\nThis will move them to 'Paused / Completed' status and trigger the 7-Step 'Win-Back' automation sequence.`)) {
                                            onUpdateStatus(lead.psid, 'past_client');
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-800 hover:text-white transition-all flex items-center gap-1 border border-slate-200"
                                    title="Pause Project & Start Win-Back Automation"
                                  >
                                      <PauseCircle size={12} /> Pause Project
                                  </button>
                              ) : lead.status === 'past_client' ? (
                                  <button className="px-3 py-1.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-lg cursor-default border border-yellow-200 flex items-center gap-1">
                                      <Zap size={10} className="fill-yellow-600" /> Win-Back Active
                                  </button>
                              ) : lead.status === 'negotiation' ? (
                                  <button className="px-3 py-1.5 bg-violet-100 text-violet-700 text-[10px] font-bold rounded-lg hover:bg-violet-600 hover:text-white transition-all">
                                      Close Deal
                                  </button>
                              ) : lead.status === 'new_lead' ? (
                                  <button className="px-3 py-1.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                                      Qualify
                                  </button>
                              ) : (
                                  <a href={`tel:${lead.extractedMobile}`} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-500 hover:text-white transition-colors" title="Call">
                                      <Phone size={16} />
                                  </a>
                              )}
                          </div>
                      </div>
                  );
              })}
              
              {filteredLeads.length === 0 && (
                  <div className="text-center py-12">
                      <p className="text-slate-400">No leads found matching your criteria.</p>
                  </div>
              )}
          </div>
      </div>

      {/* MODALS */}
      
      {/* 1. DETAIL VIEW MODAL */}
      {viewLead && (
          <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
                  {/* Header */}
                  <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-shrink-0">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-violet-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-lg shadow-violet-200">
                              {viewLead.userName.charAt(0)}
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                {viewLead.userName}
                                {viewLead.isBestQuality && <Star size={16} className="text-amber-500 fill-amber-500" />}
                              </h3>
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase mt-1 ${getStatusColor(viewLead.status)}`}>
                                  {viewLead.status.replace('_', ' ')}
                              </div>
                          </div>
                      </div>
                      <button onClick={() => setViewLead(null)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors">
                          <X size={20} />
                      </button>
                  </div>

                  {/* Body */}
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
                      
                      {/* Column 1: Contact Info */}
                      <div className="space-y-5">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Contact Details</h4>
                          
                          <div className="flex items-center gap-3 group">
                              <div className={`p-2 rounded-lg ${viewLead.extractedMobile ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                  <Phone size={18} />
                              </div>
                              <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Mobile</p>
                                  <p className="text-sm font-medium text-slate-800">{viewLead.extractedMobile || 'Not Available'}</p>
                              </div>
                          </div>

                          <div className="flex items-center gap-3 group">
                              <div className={`p-2 rounded-lg ${viewLead.extractedWebsite ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                  <Globe size={18} />
                              </div>
                              <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Website</p>
                                  {viewLead.extractedWebsite ? (
                                      <a href={viewLead.extractedWebsite} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline truncate block max-w-[200px]">
                                          {viewLead.extractedWebsite}
                                      </a>
                                  ) : (
                                      <p className="text-sm font-medium text-slate-400">Not Available</p>
                                  )}
                              </div>
                          </div>

                          <div className="flex items-center gap-3 group">
                              <div className={`p-2 rounded-lg ${viewLead.extractedFbLink ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                  <Facebook size={18} />
                              </div>
                              <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Facebook</p>
                                  {viewLead.extractedFbLink ? (
                                      <a href={viewLead.extractedFbLink} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:underline truncate block max-w-[200px]">
                                          View Profile
                                      </a>
                                  ) : (
                                      <p className="text-sm font-medium text-slate-400">Not Available</p>
                                  )}
                              </div>
                          </div>

                          <div className="flex items-center gap-3 group">
                              <div className={`p-2 rounded-lg ${viewLead.clientEmail ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                                  <Mail size={18} />
                              </div>
                              <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                                  <p className="text-sm font-medium text-slate-800">{viewLead.clientEmail || 'Not Available'}</p>
                              </div>
                          </div>
                          
                          {/* Customer Journey Timeline */}
                          <div className="pt-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Customer Journey</h4>
                              <div className="relative pl-4 border-l-2 border-slate-200 space-y-6">
                                  {/* Creation */}
                                  <div className="relative">
                                      <div className="absolute -left-[21px] top-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                                      <p className="text-xs font-bold text-slate-700">Lead Created</p>
                                      <p className="text-[10px] text-slate-400">Source: {viewLead.source}</p>
                                  </div>
                                  
                                  {/* Last Active */}
                                  <div className="relative">
                                      <div className="absolute -left-[21px] top-0 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white"></div>
                                      <p className="text-xs font-bold text-slate-700">Last Interaction</p>
                                      <p className="text-[10px] text-slate-400">{format(new Date(viewLead.lastActive), 'MMM d, h:mm a')}</p>
                                  </div>

                                  {/* Current Status */}
                                  <div className="relative">
                                      <div className="absolute -left-[21px] top-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                                      <p className="text-xs font-bold text-slate-700">Current Status</p>
                                      <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${getStatusColor(viewLead.status)}`}>
                                          {viewLead.status.replace('_', ' ')}
                                      </span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Column 2: Business Context */}
                      <div className="space-y-5">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Business Context</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><DollarSign size={10} /> Deal Value</p>
                                  <p className="text-lg font-bold text-slate-800">${viewLead.dealValue?.toLocaleString() || 0}</p>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Briefcase size={10} /> Industry</p>
                                  <div className="flex gap-2">
                                      <div className="flex-1">
                                          <select 
                                              value={viewLead.industry || ''}
                                              onChange={(e) => {
                                                  const newVal = e.target.value;
                                                  setViewLead({...viewLead, industry: newVal as any});
                                                  onUpdateIndustry(viewLead.psid, newVal);
                                              }}
                                              className="w-full bg-white border border-slate-200 rounded text-xs py-1 px-1 outline-none"
                                          >
                                              <option value="">-- Select --</option>
                                              <option value="Clothing">Clothing</option>
                                              <option value="Food">Food / Rest.</option>
                                              <option value="RealEstate">Real Estate</option>
                                              <option value="Tech">Tech / Gadget</option>
                                              <option value="Health">Health</option>
                                              <option value="Education">Education</option>
                                              <option value="Other">Other</option>
                                          </select>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* SERVICE TYPE SELECTOR */}
                          <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><PenTool size={10} /> Service Type</p>
                              <div className="flex flex-wrap gap-2">
                                  {['fb_ads', 'web_dev', 'funnel', 'seo', 'video_editing', 'other'].map(stype => (
                                      <button
                                          key={stype}
                                          onClick={() => {
                                              const newVal = stype;
                                              setViewLead({...viewLead, serviceType: newVal as any});
                                              onUpdateServiceType(viewLead.psid, newVal);
                                          }}
                                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                              viewLead.serviceType === stype 
                                              ? 'bg-slate-800 text-white border-slate-800' 
                                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                          }`}
                                      >
                                          {stype === 'fb_ads' && '📢 FB Ads'}
                                          {stype === 'web_dev' && '💻 Web Dev'}
                                          {stype === 'funnel' && '🌪️ Funnel'}
                                          {stype === 'seo' && '🔍 SEO'}
                                          {stype === 'video_editing' && '🎬 Video'}
                                          {stype === 'other' && 'Other'}
                                      </button>
                                  ))}
                              </div>
                          </div>

                          <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Tag size={10} /> Tags</p>
                              <div className="flex flex-wrap gap-2">
                                  {viewLead.tags && viewLead.tags.length > 0 ? (
                                      viewLead.tags.map(tag => (
                                          <span key={tag} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded border border-slate-200 font-medium">
                                              {tag}
                                          </span>
                                      ))
                                  ) : (
                                      <span className="text-sm text-slate-400 italic">No tags assigned</span>
                                  )}
                              </div>
                          </div>

                          <div>
                              <div className="flex justify-between items-center mb-2">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Admin Note / Context</p>
                                  <button onClick={handleSaveNote} className="text-[10px] flex items-center gap-1 text-blue-600 font-bold hover:underline">
                                      <Save size={10} /> Save Note
                                  </button>
                              </div>
                              <textarea 
                                  value={noteInput}
                                  onChange={(e) => setNoteInput(e.target.value)}
                                  className="w-full h-24 bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-xs text-yellow-900 leading-relaxed outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                                  placeholder="Write specific details about this lead..."
                              />
                          </div>
                      </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end flex-shrink-0">
                      <button onClick={() => setViewLead(null)} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-100 transition-colors">
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* 2. Public Link Modal */}
      {showLinkModal && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-100">
                  <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Globe size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Share Public Form</h3>
                  <p className="text-sm text-slate-500 mb-6">Leads submitted via this link will automatically appear in the database.</p>
                  
                  <div className="flex gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-6 items-center">
                      <code className="flex-1 text-xs font-mono text-slate-600 truncate text-left">{publicLink}</code>
                      <button onClick={copyPublicLink} className="text-blue-600 font-bold text-xs hover:underline px-2">Copy</button>
                  </div>
                  
                  <div className="flex gap-3">
                      <button onClick={onOpenPublicLink} className="flex-1 bg-slate-800 text-white py-3 rounded-xl text-sm font-bold hover:bg-black flex items-center justify-center gap-2 transition-colors">
                          <ExternalLink size={16} /> Preview Form
                      </button>
                      <button onClick={() => setShowLinkModal(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">Close</button>
                  </div>
              </div>
          </div>
      )}

      {/* 3. Add Lead Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-[100] backdrop-blur-md animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-slate-200">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                          <div className="bg-violet-100 p-2 rounded-lg text-violet-600"><User size={20} /></div> 
                          Add New Lead
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 bg-slate-50 p-2 rounded-full hover:bg-red-50 transition-colors"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleManualSubmit} className="space-y-5">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Name</label>
                          <input required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#9B7BE3] outline-none bg-slate-50 focus:bg-white transition-all placeholder-slate-400" 
                              value={manualLead.userName} onChange={e => setManualLead({...manualLead, userName: e.target.value})} placeholder="e.g. John Doe" />
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone</label>
                              <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#9B7BE3] outline-none bg-slate-50 focus:bg-white transition-all placeholder-slate-400" 
                                  value={manualLead.extractedMobile} onChange={e => setManualLead({...manualLead, extractedMobile: e.target.value})} placeholder="017..." />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Potential Value ($)</label>
                              <input type="number" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#9B7BE3] outline-none bg-slate-50 focus:bg-white transition-all placeholder-slate-400" 
                                  value={manualLead.dealValue} onChange={e => setManualLead({...manualLead, dealValue: parseFloat(e.target.value)})} placeholder="0.00" />
                          </div>
                      </div>
                      <button type="submit" className="w-full bg-[#9B7BE3] hover:bg-violet-600 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-violet-200 transition-all flex items-center justify-center gap-2">
                          <Plus size={18} /> Create Lead
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default LeadDatabase;
