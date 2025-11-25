
import React, { useState, useRef } from 'react';
import { Conversation } from '../types';
import { Printer, Download, Plus, Trash2, Calendar, User, FileText, ChevronDown, MapPin, Mail, Phone } from 'lucide-react';
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
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ conversations }) => {
  // Company Information (English)
  const companyInfo = {
    name: "Social Ads Expert",
    phone: "+880 1798-205143",
    address: "Chandrima Model Town, Road # 5, Block # A, Mohammadpur, Dhaka."
  };

  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${format(new Date(), 'yyMMdd')}-001`);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Client Selection State
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Invoice Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Facebook Ad Campaign Setup', quantity: 1, rate: 5000, amount: 5000 }
  ]);

  const [notes, setNotes] = useState('Thank you for your business. Please make payment within 7 days.');
  const [discount, setDiscount] = useState(0);

  // Suggested Services for Quick Add
  const suggestedServices = [
    { label: 'FB Ad Setup', price: 2000 },
    { label: 'Ad Creative Design', price: 1000 },
    { label: 'Monthly Management Fee', price: 10000 },
    { label: 'Pixel Setup', price: 1500 },
    { label: 'Audience Research', price: 2000 }
  ];

  const handleClientSelect = (psid: string) => {
    setSelectedClientId(psid);
    const client = conversations.find(c => c.psid === psid);
    if (client) {
      setClientName(client.userName);
      setClientAddress(client.clientAddress || '');
      setClientEmail(client.clientEmail || '');
      setClientPhone(client.extractedMobile || '');
    }
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      
      {/* LEFT SIDE: EDITOR (Hidden on Print) */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6 no-print overflow-y-auto pr-2 pb-10">
        
        {/* Client Details Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
             <User size={18} className="text-blue-600" /> Client Details
           </h3>
           
           <div className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Existing Client</label>
               <div className="relative">
                 <select 
                   className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                   value={selectedClientId}
                   onChange={(e) => handleClientSelect(e.target.value)}
                 >
                   <option value="">-- Manual Entry --</option>
                   {conversations.map(c => (
                     <option key={c.psid} value={c.psid}>{c.userName}</option>
                   ))}
                 </select>
                 <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
               </div>
             </div>

             <div className="grid grid-cols-1 gap-3">
                <input 
                  placeholder="Client Name" 
                  className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    placeholder="Phone Number" 
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                  <input 
                    placeholder="Email Address" 
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
                <textarea 
                  placeholder="Billing Address" 
                  rows={2}
                  className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
             </div>
           </div>
        </div>

        {/* Invoice Metadata */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
             <FileText size={18} className="text-blue-600" /> Invoice Info
           </h3>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Invoice #</label>
                <input 
                  className="w-full border border-slate-200 rounded px-3 py-2 text-sm font-mono outline-none focus:border-blue-500"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                 <input 
                   type="date"
                   className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                   value={date}
                   onChange={(e) => setDate(e.target.value)}
                 />
              </div>
           </div>
        </div>

        {/* Line Items Editor */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">Services</h3>
              <button onClick={addItem} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-100 flex items-center gap-1">
                 <Plus size={12} /> Add Row
              </button>
           </div>
           
           <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 relative group">
                   <div className="grid grid-cols-12 gap-2 mb-2">
                      <div className="col-span-12">
                         <input 
                            placeholder="Service Description"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                         />
                      </div>
                   </div>
                   <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                         <input 
                            type="number"
                            placeholder="Qty"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                         />
                      </div>
                      <div className="col-span-4">
                         <input 
                            type="number"
                            placeholder="Rate"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value))}
                         />
                      </div>
                      <div className="col-span-4 text-right font-bold text-sm text-slate-700">
                         {item.amount.toLocaleString()} BDT
                      </div>
                      <div className="col-span-1 text-right">
                         <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500">
                            <Trash2 size={16} />
                         </button>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           {/* Quick Add Suggestions */}
           <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Quick Add</p>
              <div className="flex flex-wrap gap-2">
                 {suggestedServices.map(service => (
                    <button 
                      key={service.label}
                      onClick={() => addSuggestedItem(service.label, service.price)}
                      className="text-[10px] bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 px-2 py-1 rounded border border-slate-200 transition-colors"
                    >
                       + {service.label}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Footer Notes */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-2 text-sm">Notes & Terms</h3>
           <textarea 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 h-20"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
           />
        </div>

        <button 
          onClick={handlePrint}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 mb-8"
        >
           <Download size={20} /> Download PDF Invoice
        </button>

      </div>

      {/* RIGHT SIDE: PREVIEW (Print Area) */}
      <div className="flex-1 bg-slate-200/50 rounded-xl overflow-hidden flex flex-col items-center justify-start p-8 shadow-inner overflow-y-auto print:bg-white print:p-0 print:overflow-visible">
          
          {/* A4 Paper Simulation */}
          <div className="invoice-preview bg-white w-[210mm] min-h-[297mm] shadow-xl print:shadow-none p-10 flex flex-col justify-between text-slate-800">
              
              {/* Header */}
              <div>
                  <div className="flex justify-between items-start mb-8 border-b-2 border-slate-800 pb-6">
                      <div>
                          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2 uppercase">{companyInfo.name}</h1>
                          <div className="text-sm text-slate-500 space-y-1">
                              <p className="font-medium text-slate-700 flex items-center gap-2"><MapPin size={14} /> {companyInfo.address}</p>
                              <p className="flex items-center gap-2"><Phone size={14} /> {companyInfo.phone}</p>
                              <p className="flex items-center gap-2"><Mail size={14} /> contact@socialadsexpert.com</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <div className="bg-slate-900 text-white px-4 py-1 inline-block mb-3">
                             <h2 className="text-xl font-bold uppercase tracking-widest">INVOICE</h2>
                          </div>
                          <p className="font-mono font-bold text-slate-700 text-lg">#{invoiceNumber}</p>
                          <p className="text-sm text-slate-500 mt-1">Date: <span className="font-semibold text-slate-700">{format(new Date(date), 'MMMM d, yyyy')}</span></p>
                      </div>
                  </div>

                  {/* Bill To */}
                  <div className="mb-10 bg-slate-50 p-6 rounded-xl border border-slate-100 flex justify-between items-start">
                      <div className="flex-1">
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Invoice To</p>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{clientName || 'Client Name'}</h3>
                          <div className="text-sm text-slate-600 space-y-1.5">
                              {clientAddress && <p className="max-w-xs">{clientAddress}</p>}
                              {clientPhone && <p><span className="font-semibold text-slate-500">Phone:</span> {clientPhone}</p>}
                              {clientEmail && <p><span className="font-semibold text-slate-500">Email:</span> {clientEmail}</p>}
                          </div>
                      </div>
                      <div className="text-right">
                          {/* Could place Due Date here if needed */}
                      </div>
                  </div>

                  {/* Items Table */}
                  <table className="w-full mb-8">
                      <thead>
                          <tr className="bg-slate-100 text-slate-700 border-y border-slate-200">
                              <th className="py-3 pl-4 text-left text-xs font-extrabold uppercase w-12">#</th>
                              <th className="py-3 text-left text-xs font-extrabold uppercase">Description</th>
                              <th className="py-3 text-right text-xs font-extrabold uppercase w-24">Rate</th>
                              <th className="py-3 text-center text-xs font-extrabold uppercase w-16">Qty</th>
                              <th className="py-3 pr-4 text-right text-xs font-extrabold uppercase w-32">Total</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {items.map((item, idx) => (
                              <tr key={item.id}>
                                  <td className="py-4 pl-4 text-sm text-slate-400 font-medium">{idx + 1}</td>
                                  <td className="py-4 text-sm font-bold text-slate-700">{item.description}</td>
                                  <td className="py-4 text-right text-sm text-slate-600">{item.rate.toLocaleString()}</td>
                                  <td className="py-4 text-center text-sm text-slate-600">{item.quantity}</td>
                                  <td className="py-4 pr-4 text-right text-sm font-bold text-slate-900">{item.amount.toLocaleString()}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>

              {/* Footer Section */}
              <div>
                  <div className="flex justify-end mb-10">
                      <div className="w-64 space-y-3">
                          <div className="flex justify-between text-sm text-slate-600">
                              <span className="font-medium">Subtotal:</span>
                              <span className="font-bold text-slate-800">{calculateSubtotal().toLocaleString()} BDT</span>
                          </div>
                          {discount > 0 && (
                              <div className="flex justify-between text-sm text-slate-600">
                                  <span className="font-medium">Discount:</span>
                                  <span className="text-red-500 font-bold">-{discount.toLocaleString()} BDT</span>
                              </div>
                          )}
                          <div className="flex justify-between text-lg font-bold text-slate-900 border-t-2 border-slate-800 pt-3 mt-2">
                              <span>Total:</span>
                              <span className="text-blue-700">{calculateTotal().toLocaleString()} BDT</span>
                          </div>
                      </div>
                  </div>

                  {/* Terms & Signature */}
                  <div className="grid grid-cols-2 gap-10 border-t border-slate-200 pt-8">
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Terms & Notes</p>
                          <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap font-medium">
                              {notes}
                          </p>
                      </div>
                      <div className="text-right flex flex-col items-end justify-end">
                          <div className="w-40 border-b-2 border-slate-300 mb-2"></div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Authorized Signature</p>
                      </div>
                  </div>
                  
                  <div className="text-center mt-12 pt-6 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest">
                      Thank you for doing business with us
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};

export default InvoiceGenerator;
