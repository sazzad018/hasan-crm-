
import React, { useState } from 'react';
import { Plus, Trash2, CreditCard, Copy, Building2, Smartphone, QrCode, CheckCircle, Wallet, Banknote, ArrowRightLeft, Check, User, Store, Users } from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentSettingsProps {
  paymentMethods: PaymentMethod[];
  onAddPaymentMethod: (method: PaymentMethod) => void;
  onDeletePaymentMethod: (id: string) => void;
}

const PaymentSettings: React.FC<PaymentSettingsProps> = ({ paymentMethods, onAddPaymentMethod, onDeletePaymentMethod }) => {
  
  const [methodType, setMethodType] = useState<'mobile' | 'bank'>('mobile');
  const [newPay, setNewPay] = useState<Partial<PaymentMethod>>({
      provider: 'Bkash',
      type: 'Personal',
      accountNumber: '',
      instructions: '',
      accountName: '',
      branchName: '',
      routingNumber: ''
  });

  // Helper for Payment Styles (List View)
  const getProviderStyle = (provider: string, category: string) => {
      if (category === 'bank') return { bg: 'bg-white', border: 'border-slate-300', text: 'text-slate-800', iconBg: 'bg-slate-100' };
      
      const p = provider.toLowerCase();
      if (p.includes('bkash')) return { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-700', iconBg: 'bg-pink-200' };
      if (p.includes('nagad')) return { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', iconBg: 'bg-orange-200' };
      if (p.includes('rocket')) return { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', iconBg: 'bg-purple-200' };
      if (p.includes('upay')) return { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', iconBg: 'bg-blue-200' };
      return { bg: 'bg-white', border: 'border-slate-300', text: 'text-slate-800', iconBg: 'bg-slate-100' };
  };

  const handleAddPayment = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newPay.accountNumber || !newPay.provider) return;

      onAddPaymentMethod({
          id: Date.now().toString(),
          category: methodType,
          provider: newPay.provider!,
          type: newPay.type || (methodType === 'bank' ? 'Current' : 'Personal'),
          accountNumber: newPay.accountNumber!,
          accountName: newPay.accountName,
          branchName: newPay.branchName,
          routingNumber: newPay.routingNumber,
          instructions: newPay.instructions
      });

      // Reset form
      setNewPay({ 
          provider: methodType === 'mobile' ? 'Bkash' : '', 
          type: methodType === 'mobile' ? 'Personal' : 'Current', 
          accountNumber: '', 
          instructions: '', 
          accountName: '',
          branchName: '',
          routingNumber: ''
      });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
            <div className="p-3 bg-violet-100 text-violet-600 rounded-lg">
                <Wallet size={28} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Payment Methods Manager</h2>
                <p className="text-sm text-slate-500">Manage the bank accounts and mobile wallets displayed to clients.</p>
            </div>
        </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Left Column: List of Methods (Span 7) */}
           <div className="lg:col-span-7 space-y-8">
               
               {/* Mobile Banking List */}
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                   <div className="p-4 bg-slate-50 border-b border-slate-200">
                       <h3 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                           <Smartphone size={16} className="text-blue-600" /> Mobile Wallets
                       </h3>
                   </div>
                   <div className="p-4">
                       {paymentMethods.filter(m => m.category === 'mobile').length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {paymentMethods.filter(m => m.category === 'mobile').map(method => {
                                   const style = getProviderStyle(method.provider, 'mobile');
                                   return (
                                       <div key={method.id} className={`border rounded-xl p-4 shadow-sm relative group transition-all ${style.bg} ${style.border}`}>
                                           <div className="flex justify-between items-start mb-3">
                                               <div className="flex items-center gap-3">
                                                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.iconBg} ${style.text} shadow-sm`}>
                                                       <CreditCard size={20} />
                                                   </div>
                                                   <div>
                                                       <span className={`font-bold block text-sm ${style.text}`}>{method.provider}</span>
                                                       <span className="text-[10px] bg-white/80 border border-black/5 px-2 py-0.5 rounded-full text-slate-600 uppercase font-bold tracking-wide">{method.type}</span>
                                                   </div>
                                               </div>
                                               <button 
                                                  onClick={() => onDeletePaymentMethod(method.id)}
                                                  className="text-slate-400 hover:text-red-600 bg-white p-1.5 rounded-full shadow-sm hover:shadow transition-all border border-transparent hover:border-red-100"
                                               >
                                                   <Trash2 size={14} />
                                               </button>
                                           </div>
                                           
                                           <div className="bg-white p-2.5 rounded-lg border border-black/5 flex justify-between items-center mb-2">
                                               <code className="font-mono text-sm text-slate-800 font-bold tracking-wide">{method.accountNumber}</code>
                                               <button 
                                                  onClick={() => {navigator.clipboard.writeText(method.accountNumber); alert('Copied!');}}
                                                  className="text-slate-400 hover:text-blue-600"
                                               >
                                                   <Copy size={14} />
                                               </button>
                                           </div>

                                           {method.instructions && (
                                               <p className="text-[10px] text-slate-500 bg-black/5 p-1.5 rounded px-2 truncate">
                                                   Note: {method.instructions}
                                               </p>
                                           )}
                                       </div>
                                   );
                               })}
                           </div>
                       ) : (
                           <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                               <Smartphone size={32} className="mx-auto mb-2 opacity-20" />
                               <p className="text-xs">No mobile wallets added.</p>
                           </div>
                       )}
                   </div>
               </div>

               {/* Bank Accounts List */}
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                   <div className="p-4 bg-slate-50 border-b border-slate-200">
                       <h3 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                           <Building2 size={16} className="text-slate-600" /> Bank Accounts
                       </h3>
                   </div>
                   <div className="p-4">
                       {paymentMethods.filter(m => m.category === 'bank').length > 0 ? (
                           <div className="space-y-3">
                               {paymentMethods.filter(m => m.category === 'bank').map(method => (
                                   <div key={method.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-blue-300 transition-all">
                                       <div className="flex justify-between items-start mb-3">
                                           <div className="flex items-center gap-4">
                                               <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 border border-slate-200">
                                                   <Building2 size={24} />
                                               </div>
                                               <div>
                                                   <h4 className="font-bold text-slate-800 text-base">{method.provider}</h4>
                                                   <p className="text-xs text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded w-fit mt-1 border border-slate-100">
                                                       {method.branchName ? `${method.branchName} Branch` : 'Main Branch'}
                                                   </p>
                                               </div>
                                           </div>
                                           <button 
                                              onClick={() => onDeletePaymentMethod(method.id)}
                                              className="text-slate-300 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                           >
                                               <Trash2 size={16} />
                                           </button>
                                       </div>
                                       
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                           <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                                               <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Account Name</p>
                                               <p className="font-bold text-slate-700">{method.accountName}</p>
                                           </div>
                                           <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                                               <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Account Number</p>
                                               <p className="font-mono font-bold text-slate-800">{method.accountNumber}</p>
                                           </div>
                                           {method.routingNumber && (
                                               <div className="bg-slate-50 p-2.5 rounded border border-slate-200 md:col-span-2 flex justify-between">
                                                   <span className="text-[9px] font-bold text-slate-400 uppercase">Routing Number</span>
                                                   <span className="font-mono font-bold text-slate-700">{method.routingNumber}</span>
                                               </div>
                                           )}
                                       </div>
                                   </div>
                               ))}
                           </div>
                       ) : (
                           <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                               <Building2 size={32} className="mx-auto mb-2 opacity-20" />
                               <p className="text-xs">No bank accounts added.</p>
                           </div>
                       )}
                   </div>
               </div>

           </div>

           {/* Right Column: Add New Form (Span 5) */}
           <div className="lg:col-span-5">
               <div className="bg-white rounded-2xl border border-slate-200 shadow-xl sticky top-6 overflow-hidden">
                   
                   <div className="bg-slate-900 p-5 text-white">
                        <h3 className="text-sm font-bold uppercase flex items-center gap-2 mb-4">
                            <Plus size={16} className="text-[#9B7BE3]" /> Add New Method
                        </h3>
                        {/* Type Toggle */}
                        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                            <button 
                                type="button"
                                onClick={() => setMethodType('mobile')}
                                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${methodType === 'mobile' ? 'bg-[#9B7BE3] text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                            >
                                <Smartphone size={14} /> Mobile Banking
                            </button>
                            <button 
                                type="button"
                                onClick={() => setMethodType('bank')}
                                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${methodType === 'bank' ? 'bg-[#9B7BE3] text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                            >
                                <Building2 size={14} /> Bank Transfer
                            </button>
                        </div>
                   </div>

                   <form onSubmit={handleAddPayment} className="p-6 space-y-5">
                       
                       {methodType === 'mobile' ? (
                           <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                               
                               {/* Provider Selection Grid */}
                               <div>
                                   <label className="block text-xs font-extrabold text-slate-600 uppercase mb-3">Select Provider</label>
                                   <div className="grid grid-cols-2 gap-3">
                                       {[
                                           { name: 'Bkash', color: 'text-pink-600', border: 'border-pink-500', bg: 'bg-pink-50' }, 
                                           { name: 'Nagad', color: 'text-orange-600', border: 'border-orange-500', bg: 'bg-orange-50' }, 
                                           { name: 'Rocket', color: 'text-purple-600', border: 'border-purple-600', bg: 'bg-purple-50' }, 
                                           { name: 'Upay', color: 'text-blue-600', border: 'border-blue-600', bg: 'bg-blue-50' }
                                       ].map(p => (
                                           <button
                                               key={p.name}
                                               type="button"
                                               onClick={() => setNewPay({...newPay, provider: p.name})}
                                               className={`relative py-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                                                   newPay.provider === p.name 
                                                   ? `${p.border} ${p.bg} shadow-sm ring-1 ring-offset-0` 
                                                   : 'border-slate-100 hover:border-slate-300 bg-white text-slate-500 hover:bg-slate-50'
                                               }`}
                                           >
                                               <span className={`font-extrabold text-sm ${newPay.provider === p.name ? p.color : ''}`}>{p.name}</span>
                                               {newPay.provider === p.name && (
                                                   <div className="absolute top-1 right-1 text-emerald-500">
                                                       <CheckCircle size={12} className="fill-emerald-100" />
                                                   </div>
                                               )}
                                           </button>
                                       ))}
                                   </div>
                               </div>

                               {/* Account Type Tabs */}
                               <div>
                                   <label className="block text-xs font-extrabold text-slate-600 uppercase mb-3">Wallet Type</label>
                                   <div className="flex bg-slate-100 p-1 rounded-xl">
                                       {[
                                           { id: 'Personal', icon: User }, 
                                           { id: 'Merchant', icon: Store }, 
                                           { id: 'Agent', icon: Users }
                                       ].map(t => (
                                           <button
                                               key={t.id}
                                               type="button"
                                               onClick={() => setNewPay({...newPay, type: t.id})}
                                               className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                                   newPay.type === t.id 
                                                   ? 'bg-white text-slate-800 shadow-sm border border-slate-200' 
                                                   : 'text-slate-500 hover:bg-slate-200'
                                               }`}
                                           >
                                               <t.icon size={12} /> {t.id}
                                           </button>
                                       ))}
                                   </div>
                               </div>

                               {/* Mobile Number Input */}
                               <div>
                                    <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1.5">Mobile Number</label>
                                    <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden bg-white focus-within:border-slate-800 transition-all">
                                        <div className="bg-slate-100 px-3 py-3 border-r border-slate-200 text-slate-500 font-bold text-sm">
                                            +880
                                        </div>
                                        <input 
                                            value={newPay.accountNumber}
                                            onChange={(e) => setNewPay({...newPay, accountNumber: e.target.value})}
                                            className="w-full px-4 py-3 text-base font-mono font-bold text-slate-900 outline-none placeholder-slate-300 bg-white"
                                            placeholder="1711..."
                                        />
                                    </div>
                               </div>
                           </div>
                       ) : (
                           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                               <div>
                                   <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1.5">Bank Name</label>
                                   <input 
                                      value={newPay.provider}
                                      onChange={(e) => setNewPay({...newPay, provider: e.target.value})}
                                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-slate-800 transition-all bg-white"
                                      placeholder="e.g. City Bank, Islami Bank"
                                   />
                               </div>
                               <div>
                                   <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1.5">Account Name</label>
                                   <input 
                                      value={newPay.accountName || ''}
                                      onChange={(e) => setNewPay({...newPay, accountName: e.target.value})}
                                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-slate-800 transition-all bg-white"
                                      placeholder="e.g. Md Rahim Uddin"
                                   />
                               </div>
                               <div className="grid grid-cols-2 gap-3">
                                   <div>
                                       <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1.5">Branch</label>
                                       <input 
                                          value={newPay.branchName || ''}
                                          onChange={(e) => setNewPay({...newPay, branchName: e.target.value})}
                                          className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-slate-800 bg-white"
                                          placeholder="e.g. Gulshan"
                                      />
                                   </div>
                                   <div>
                                       <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1.5">Routing No</label>
                                       <input 
                                          value={newPay.routingNumber || ''}
                                          onChange={(e) => setNewPay({...newPay, routingNumber: e.target.value})}
                                          className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono font-medium text-slate-800 outline-none focus:border-slate-800 bg-white"
                                          placeholder="XXX..."
                                      />
                                   </div>
                               </div>
                               <div>
                                    <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1.5">Account Number</label>
                                    <input 
                                        value={newPay.accountNumber}
                                        onChange={(e) => setNewPay({...newPay, accountNumber: e.target.value})}
                                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-800 outline-none focus:border-slate-800 bg-white"
                                        placeholder="Account Number"
                                    />
                               </div>
                           </div>
                       )}

                       <div className="pt-2">
                            <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1.5">Instruction / Note (Optional)</label>
                            <input 
                                value={newPay.instructions || ''}
                                onChange={(e) => setNewPay({...newPay, instructions: e.target.value})}
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 outline-none focus:border-slate-800 bg-white"
                                placeholder={methodType === 'mobile' ? "e.g. Send Money only" : "e.g. Use Invoice ID as Ref"}
                            />
                       </div>
                       
                       <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl text-sm shadow-lg shadow-slate-300 transition-all flex items-center justify-center gap-2 mt-4">
                           <CheckCircle size={18} /> Add {methodType === 'mobile' ? 'Wallet' : 'Account'}
                       </button>
                   </form>
               </div>

           </div>
       </div>
    </div>
  );
};

export default PaymentSettings;
