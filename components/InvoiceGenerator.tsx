
import React, { useState, useEffect } from 'react';
import { Conversation, InvoiceRecord } from '../types';
import { Download, Plus, Trash2, User, FileText, ChevronDown, MapPin, Mail, Phone, Calculator, Search, X, Check, Loader2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceGeneratorProps {
  conversations: Conversation[];
  onSaveInvoice?: (psid: string, invoice: InvoiceRecord) => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ conversations, onSaveInvoice }) => {
  // Company Information
  const companyInfo = {
    name: "Social Ads Expert",
    phone: "+880 1798-205143",
    address: "Chandrima Model Town, Road # 5, Block # A, Mohammadpur, Dhaka."
  };

  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${format(new Date(), 'yyMMdd')}-001`);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Advanced Client Search State
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClientPsid, setSelectedClientPsid] = useState<string | null>(null);

  // Form Fields
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // PDF Generation State
  const [isDownloading, setIsDownloading] = useState(false);

  // Invoice Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Facebook Ad Campaign Setup', quantity: 1, rate: 5000, amount: 5000 }
  ]);

  const [notes, setNotes] = useState('Thank you for your business. Please make payment within 7 days.');
  const [discount, setDiscount] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState(0);

  // Suggested Services
  const suggestedServices = [
    { label: 'FB Ad Setup', price: 2000 },
    { label: 'Ad Creative Design', price: 1000 },
    { label: 'Monthly Management Fee', price: 10000 },
    { label: 'Pixel Setup', price: 1500 },
    { label: 'Audience Research', price: 2000 }
  ];

  // Filter clients for dropdown
  const filteredClients = conversations.filter(c => 
      c.userName.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      (c.extractedMobile && c.extractedMobile.includes(clientSearchTerm))
  );

  const handleClientSelect = (client: Conversation) => {
    setSelectedClientPsid(client.psid);
    setClientSearchTerm(client.userName);
    setClientName(client.userName);
    setClientAddress(client.clientAddress || '');
    setClientEmail(client.clientEmail || '');
    setClientPhone(client.extractedMobile || '');
    setShowClientDropdown(false);
  };

  const clearClientSelection = () => {
    setSelectedClientPsid(null);
    setClientSearchTerm('');
    setClientName('');
    setClientAddress('');
    setClientEmail('');
    setClientPhone('');
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.rate);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const addSuggestedItem = (label: string, price: number) => {
     setItems([...items, { id: Date.now().toString(), description: label, quantity: 1, rate: price, amount: price }]);
  };

  const calculateSubtotal = () => items.reduce((sum, item) => sum + item.amount, 0);
  const calculateTotal = () => calculateSubtotal() - discount;
  const calculateDue = () => Math.max(0, calculateTotal() - advanceAmount);

  // PDF Generation Logic using html2pdf
  const handleDownloadPDF = async () => {
    if (onSaveInvoice) {
        // Check if a client is actually linked
        if (selectedClientPsid) {
            const record: InvoiceRecord = {
                id: Date.now().toString(),
                invoiceNumber,
                date: new Date(date),
                totalAmount: calculateTotal(),
                items: items,
                status: calculateDue() <= 0 ? 'paid' : 'unpaid'
            };
            onSaveInvoice(selectedClientPsid, record);
        } else {
            // Warn user if saving is not possible
            const proceed = window.confirm("⚠️ No client selected from database!\n\nThis invoice will download but WILL NOT be saved to any client profile history. \n\nDo you want to continue?");
            if (!proceed) {
                return;
            }
        }
    }

    setIsDownloading(true);

    // Dynamically load html2pdf if not present
    if (!(window as any).html2pdf) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = generatePDF;
        document.body.appendChild(script);
    } else {
        generatePDF();
    }
  };

  const generatePDF = () => {
      const element = document.getElementById('invoice-preview-container');
      const opt = {
        margin:       0,
        filename:     `${invoiceNumber}_${clientName.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // @ts-ignore
      window.html2pdf().set(opt).from(element).save().then(() => {
          setIsDownloading(false);
      });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      
      {/* LEFT SIDE: EDITOR */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6 no-print overflow-y-auto pr-2 pb-10">
        
        {/* Advanced Client Selection */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
             <User size={16} className="text-[#9B7BE3]" /> Bill To (Client)
           </h3>
           
           <div className="space-y-4">
             {/* Search Box */}
             <div className="relative">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Search Client Database</label>
                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Type to search clients..."
                        className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#9B7BE3] outline-none"
                        value={clientSearchTerm}
                        onChange={(e) => {
                            setClientSearchTerm(e.target.value);
                            setShowClientDropdown(true);
                            if(e.target.value === '') setSelectedClientPsid(null);
                        }}
                        onFocus={() => setShowClientDropdown(true)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    {clientSearchTerm && (
                        <button onClick={clearClientSelection} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Dropdown Results */}
                {showClientDropdown && clientSearchTerm && !selectedClientPsid && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl mt-1 z-20 max-h-60 overflow-y-auto">
                        {filteredClients.length > 0 ? (
                            filteredClients.map(client => (
                                <div 
                                    key={client.psid}
                                    onClick={() => handleClientSelect(client)}
                                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-center justify-between group"
                                >
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{client.userName}</p>
                                        <p className="text-xs text-slate-500">{client.extractedMobile || 'No Phone'}</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 text-[#9B7BE3]">
                                        <Plus size={16} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-xs text-slate-400">No clients found matching "{clientSearchTerm}"</div>
                        )}
                    </div>
                )}
             </div>

             {/* Selected Client Card / Manual Inputs */}
             <div className={`space-y-3 transition-all duration-300 ${selectedClientPsid ? 'bg-[#9B7BE3]/10 p-4 rounded-xl border border-[#9B7BE3]/20' : ''}`}>
                 {selectedClientPsid ? (
                     <div className="flex items-center gap-2 mb-2 text-[#9B7BE3] text-xs font-bold uppercase">
                         <Check size={12} /> Client Linked to Profile
                     </div>
                 ) : (
                     <div className="flex items-center gap-2 mb-2 text-orange-500 text-[10px] font-bold uppercase bg-orange-50 p-2 rounded border border-orange-100">
                         <AlertTriangle size={12} /> Not Linked (Manual Entry)
                     </div>
                 )}
                 
                 <div className="grid grid-cols-1 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                        <input 
                          className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-[#9B7BE3] bg-white"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone</label>
                          <input 
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-[#9B7BE3] bg-white"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email</label>
                          <input 
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-[#9B7BE3] bg-white"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                          />
                      </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Address</label>
                        <textarea 
                          rows={2}
                          className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-[#9B7BE3] resize-none bg-white"
                          value={clientAddress}
                          onChange={(e) => setClientAddress(e.target.value)}
                        />
                    </div>
                 </div>
             </div>
           </div>
        </div>

        {/* Invoice Metadata - REDESIGNED */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
             <FileText size={18} className="text-[#9B7BE3]" /> Invoice Details
           </h3>
           <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1.5 ml-1">Invoice #</label>
                <input 
                  className="w-full border-2 border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm font-mono font-bold text-slate-800 outline-none focus:border-[#9B7BE3] focus:bg-white transition-all"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div>
                 <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1.5 ml-1">Issue Date</label>
                 <input 
                   type="date"
                   className="w-full border-2 border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#9B7BE3] focus:bg-white transition-all"
                   value={date}
                   onChange={(e) => setDate(e.target.value)}
                 />
              </div>
           </div>
        </div>

        {/* Payment Logic - REDESIGNED */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
             <Calculator size={18} className="text-[#9B7BE3]" /> Financials
           </h3>
           <div className="space-y-4">
               <div className="grid grid-cols-2 gap-5">
                   <div>
                      <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1.5 ml-1">Discount (BDT)</label>
                      <input 
                          type="number"
                          className="w-full border-2 border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#9B7BE3] focus:bg-white transition-all placeholder-slate-400"
                          value={discount}
                          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1.5 ml-1">Advance (BDT)</label>
                      <input 
                          type="number"
                          className="w-full border-2 border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#9B7BE3] focus:bg-white transition-all placeholder-slate-400"
                          value={advanceAmount}
                          onChange={(e) => setAdvanceAmount(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                      />
                   </div>
               </div>
               <div className="pt-4 border-t-2 border-slate-100 flex justify-between items-center bg-[#9B7BE3]/5 p-4 rounded-xl border border-[#9B7BE3]/20">
                   <span className="font-extrabold text-slate-700 text-sm uppercase tracking-wide">Net Due Amount</span>
                   <span className="font-black text-[#9B7BE3] text-xl">{calculateDue().toLocaleString()} BDT</span>
               </div>
           </div>
        </div>

        {/* Line Items Editor */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">Services / Items</h3>
              <button onClick={addItem} className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded font-bold hover:bg-black flex items-center gap-1 transition-colors">
                 <Plus size={12} /> Add Item
              </button>
           </div>
           
           <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 relative group transition-all hover:border-[#9B7BE3]/30 hover:shadow-sm">
                   <div className="grid grid-cols-12 gap-2 mb-2">
                      <div className="col-span-12">
                         <input 
                            placeholder="Service Description"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-sm outline-none focus:border-[#9B7BE3] font-medium"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                         />
                      </div>
                   </div>
                   <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                         <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Qty</label>
                         <input 
                            type="number"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-sm outline-none focus:border-[#9B7BE3] text-center"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                         />
                      </div>
                      <div className="col-span-4">
                         <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Rate</label>
                         <input 
                            type="number"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-sm outline-none focus:border-[#9B7BE3]"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value))}
                         />
                      </div>
                      <div className="col-span-4 text-right">
                         <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Total</label>
                         <span className="font-bold text-sm text-slate-800">{item.amount.toLocaleString()}</span>
                      </div>
                      <div className="col-span-1 text-right flex items-end justify-end h-full pt-4">
                         <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                         </button>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           {/* Quick Add Suggestions */}
           <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Quick Add Services</p>
              <div className="flex flex-wrap gap-2">
                 {suggestedServices.map(service => (
                    <button 
                      key={service.label}
                      onClick={() => addSuggestedItem(service.label, service.price)}
                      className="text-[10px] bg-white text-slate-600 hover:text-[#9B7BE3] hover:border-[#9B7BE3] px-2 py-1 rounded border border-slate-200 transition-all font-medium"
                    >
                       + {service.label}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        <button 
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="w-full bg-[#9B7BE3] text-white font-bold py-4 rounded-xl hover:bg-violet-600 transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-2 mb-8 disabled:opacity-70 disabled:cursor-not-allowed"
        >
           {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
           {isDownloading ? 'Generating PDF...' : 'Download & Save Invoice'}
        </button>

      </div>

      {/* RIGHT SIDE: PREVIEW */}
      {/* CHANGED: Replaced flex flex-col center with block to allow natural scrolling */}
      <div className="flex-1 bg-slate-200/50 rounded-xl overflow-auto p-4 md:p-8 shadow-inner block min-w-0">
          
          {/* A4 Paper Simulation - FIXED HEIGHT TO PREVENT OVERFLOW BLANK PAGE */}
          <div id="invoice-preview-container" className="bg-white w-[210mm] h-[296mm] shadow-2xl flex flex-col justify-between text-slate-800 relative overflow-hidden mx-auto flex-shrink-0 my-auto">
              
              {/* STATUS BADGE */}
              <div className="absolute top-12 right-12 z-10 transform rotate-12 opacity-20 pointer-events-none border-4 border-slate-800 rounded-lg p-2">
                  <span className={`text-6xl font-black uppercase tracking-widest ${calculateDue() > 0 ? 'text-red-600 border-red-600' : 'text-emerald-600 border-emerald-600'}`}>
                      {calculateDue() > 0 ? 'UNPAID' : 'PAID'}
                  </span>
              </div>

              <div>
                  {/* 1. Modern Header Area */}
                  <div className="flex justify-between items-start p-12 pb-8 bg-white">
                      <div>
                          <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-[#9B7BE3] rounded-lg flex items-center justify-center text-white font-extrabold text-xl">
                                  S
                              </div>
                              <h1 className="text-2xl font-extrabold text-slate-900 uppercase tracking-wider">{companyInfo.name}</h1>
                          </div>
                          <div className="text-sm text-slate-500 space-y-1.5">
                              <p className="text-slate-600 max-w-xs leading-relaxed">{companyInfo.address}</p>
                              <p className="font-bold">{companyInfo.phone}</p>
                              <p>contact@socialadsexpert.com</p>
                          </div>
                      </div>
                      <div className="text-right relative z-20">
                          <h2 className="text-5xl font-black text-slate-100 tracking-tighter mb-2">INVOICE</h2>
                          <p className="font-mono font-bold text-[#9B7BE3] text-lg tracking-wide">#{invoiceNumber}</p>
                          <p className="text-sm text-slate-500 mt-1 font-medium">Issue Date: {format(new Date(date), 'MMM d, yyyy')}</p>
                      </div>
                  </div>

                  {/* Accent Separator */}
                  <div className="h-1.5 bg-[#9B7BE3] w-full mb-8"></div>

                  {/* 2. Client & Invoice Details */}
                  <div className="px-12 mb-10 grid grid-cols-2 gap-12">
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Billed To</p>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{clientName || 'Client Name'}</h3>
                          <div className="text-sm text-slate-600 space-y-1">
                              {clientAddress && <p className="max-w-xs leading-relaxed">{clientAddress}</p>}
                              {clientPhone && <p>{clientPhone}</p>}
                              {clientEmail && <p>{clientEmail}</p>}
                          </div>
                      </div>
                      <div className="text-right flex flex-col justify-start items-end">
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 w-full max-w-[200px]">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Due</p>
                              <p className="text-2xl font-bold text-[#9B7BE3]">{calculateDue().toLocaleString()} BDT</p>
                          </div>
                      </div>
                  </div>

                  {/* 3. Table */}
                  <div className="px-12 mb-8">
                      <table className="w-full">
                          <thead>
                              <tr className="bg-slate-50 text-slate-700">
                                  <th className="py-3 pl-4 text-left text-xs font-extrabold uppercase tracking-wider rounded-l-lg w-16">No.</th>
                                  <th className="py-3 text-left text-xs font-extrabold uppercase tracking-wider">Description</th>
                                  <th className="py-3 text-right text-xs font-extrabold uppercase tracking-wider w-32">Rate</th>
                                  <th className="py-3 text-center text-xs font-extrabold uppercase tracking-wider w-20">Qty</th>
                                  <th className="py-3 pr-4 text-right text-xs font-extrabold uppercase tracking-wider rounded-r-lg w-40">Amount</th>
                              </tr>
                          </thead>
                          <tbody>
                              {items.map((item, idx) => (
                                  <tr key={item.id} className="border-b border-slate-100 last:border-0">
                                      <td className="py-5 pl-4 text-sm text-slate-400 font-bold">{String(idx + 1).padStart(2, '0')}</td>
                                      <td className="py-5 text-sm font-bold text-slate-700">{item.description}</td>
                                      <td className="py-5 text-right text-sm text-slate-600">{item.rate.toLocaleString()}</td>
                                      <td className="py-5 text-center text-sm text-slate-600">{item.quantity}</td>
                                      <td className="py-5 pr-4 text-right text-sm font-bold text-slate-900">{item.amount.toLocaleString()}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>

              {/* 4. Footer & Totals */}
              <div>
                  <div className="px-12 flex justify-end mb-12">
                      <div className="w-80 space-y-3">
                          <div className="flex justify-between text-sm text-slate-600">
                              <span className="font-medium">Subtotal</span>
                              <span className="font-bold text-slate-800">{calculateSubtotal().toLocaleString()}</span>
                          </div>
                          {discount > 0 && (
                              <div className="flex justify-between text-sm text-slate-600">
                                  <span className="font-medium">Discount</span>
                                  <span className="text-red-500 font-bold">-{discount.toLocaleString()}</span>
                              </div>
                          )}
                          {advanceAmount > 0 && (
                               <div className="flex justify-between text-sm text-slate-600">
                                   <span className="font-medium">Advance Paid</span>
                                   <span className="text-emerald-600 font-bold">-{advanceAmount.toLocaleString()}</span>
                               </div>
                          )}
                          
                          <div className="mt-4 bg-[#9B7BE3] text-white p-3 rounded-lg flex justify-between items-center shadow-md">
                              <span className="text-sm font-bold uppercase tracking-wide">Net Due</span>
                              <span className="text-xl font-extrabold">{calculateDue().toLocaleString()} BDT</span>
                          </div>
                      </div>
                  </div>

                  <div className="px-12 pb-12 grid grid-cols-2 gap-12 items-end">
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Terms & Payment Info</p>
                          <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap font-medium bg-slate-50 p-4 rounded-lg border border-slate-100">
                              {notes}
                          </p>
                      </div>
                      <div className="text-right">
                          <div className="inline-block text-right">
                              {/* DIGITAL SIGNATURE SECTION */}
                              <div className="relative mb-2 flex flex-col items-end">
                                  {/* Faux Handwritten Signature using Serif Italic */}
                                  <p className="font-serif italic text-4xl text-slate-700 pr-4 mb-[-10px] opacity-80" style={{fontFamily: 'Times New Roman, serif'}}>Social Ads Expert</p>
                                  <div className="h-px bg-slate-800 w-64 mt-2"></div>
                              </div>
                              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Authorized Signature</p>
                              <p className="text-[10px] font-bold text-[#9B7BE3]">Social Ads Expert Agency</p>
                          </div>
                      </div>
                  </div>
                  
                  <div className="bg-slate-900 text-white p-4 text-center flex justify-between items-center px-12">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Thank you for your business</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B7BE3]">socialadsexpert.com</p>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};

export default InvoiceGenerator;
    