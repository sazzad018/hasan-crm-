
import React, { useState, useEffect } from 'react';
import { Copy, Tag, RefreshCw, Calendar } from 'lucide-react';

const CampaignGenerator: React.FC = () => {
  const [objective, setObjective] = useState('SALES');
  const [product, setProduct] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [type, setType] = useState('CBO');
  const [audience, setAudience] = useState('');
  const [generatedName, setGeneratedName] = useState('');

  useEffect(() => {
    // Requested Format: PAGE_NAME_BUDGET_DATE_AUDIENCE_OBJECTIVE_TYPE
    // New Date Format: DDMM or DDMM-DDMM (Year removed as requested)
    
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-'); // Expecting YYYY-MM-DD
        if (parts.length === 3) {
            return `${parts[2]}${parts[1]}`; // Returns DDMM
        }
        return dateStr.replace(/-/g, '');
    };

    let dateString = formatDate(startDate);
    if (endDate) {
        dateString += `-${formatDate(endDate)}`;
    }

    const parts = [
      product.toUpperCase().replace(/\s+/g, '_'), // Page Name
      budget ? `$${budget}` : '',                 // Budget
      dateString,                                 // Date Range (DDMM)
      audience.toUpperCase().replace(/\s+/g, '_'), // Audience
      objective,                                  // Objective
      type                                        // Type
    ].filter(p => p !== '');

    setGeneratedName(parts.join('_'));
  }, [objective, product, startDate, endDate, budget, type, audience]);

  const copyToClipboard = () => {
    if (!generatedName) return;
    navigator.clipboard.writeText(generatedName);
    alert('Campaign Name Copied!');
  };

  const resetForm = () => {
    setObjective('SALES');
    setProduct('');
    setBudget('');
    setAudience('');
    setType('CBO');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Tag className="text-blue-600" /> FB Campaign Name Generator
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-blue-600 flex items-center gap-1 text-sm font-bold">
                <RefreshCw size={14} /> Reset
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Page Name / Product</label>
                <input 
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                  placeholder="e.g. MY_PAGE_NAME"
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Daily Budget ($)</label>
                <input 
                  type="number"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  placeholder="50"
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Campaign Type</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
                >
                  <option value="CBO">CBO (Advantage+)</option>
                  <option value="ABO">ABO (Ad Set Budget)</option>
                </select>
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Start Date</label>
                <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full pl-10 p-3 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
                    />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">End Date (Optional)</label>
                <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full pl-10 p-3 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
                    />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Audience</label>
                <input 
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  placeholder="e.g. BROAD / RETARGETING"
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Objective</label>
                <select 
                  value={objective} 
                  onChange={e => setObjective(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
                >
                  <option value="SALES">Sales / Conversion</option>
                  <option value="LEADS">Leads</option>
                  <option value="TRAFFIC">Traffic</option>
                  <option value="ENGAGEMENT">Engagement</option>
                  <option value="AWARENESS">Brand Awareness</option>
                  <option value="APP">App Promotion</option>
                </select>
             </div>
          </div>

          <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
             <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Generated Campaign Name</label>
             <div className="flex items-center gap-4">
                <div className="flex-1 bg-slate-900/50 p-4 rounded-lg border border-slate-600 font-mono text-lg text-white break-all shadow-inner">
                   {generatedName || 'Start typing...'}
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-lg shadow-md transition-colors flex items-center gap-2 font-bold"
                >
                   <Copy size={20} /> Copy
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

export default CampaignGenerator;
