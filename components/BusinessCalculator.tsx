
import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, MessageCircle, TrendingUp, RefreshCw } from 'lucide-react';

const BusinessCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ads' | 'profit'>('ads');

  // --- AD METRICS STATE ---
  const [totalSpend, setTotalSpend] = useState<string>('50');
  const [totalMessages, setTotalMessages] = useState<string>('120');
  const [targetBudget, setTargetBudget] = useState<string>('100');
  
  // Derived Ad Stats
  const costPerMsg = parseFloat(totalSpend) > 0 && parseFloat(totalMessages) > 0 
    ? parseFloat(totalSpend) / parseFloat(totalMessages) 
    : 0;
  
  const estimatedMessages = costPerMsg > 0 && parseFloat(targetBudget) > 0
    ? Math.floor(parseFloat(targetBudget) / costPerMsg)
    : 0;

  // --- PROFITABILITY STATE ---
  const [productCost, setProductCost] = useState<string>('200'); // কেনা দাম
  const [marketingCost, setMarketingCost] = useState<string>('100'); // মার্কেটিং খরচ
  const [deliveryCost, setDeliveryCost] = useState<string>('60'); // ডেলিভারি চার্জ
  const [sellingPrice, setSellingPrice] = useState<string>('550'); // বিক্রয় মূল্য
  
  // Derived Profit Stats
  const totalCost = (parseFloat(productCost) || 0) + (parseFloat(marketingCost) || 0) + (parseFloat(deliveryCost) || 0);
  const netProfit = (parseFloat(sellingPrice) || 0) - totalCost;
  const margin = parseFloat(sellingPrice) > 0 ? (netProfit / parseFloat(sellingPrice)) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Calculator size={18} className="text-blue-600" /> 
          Business Calculator
        </h3>
        <div className="flex bg-white rounded-lg border border-slate-200 p-1">
            <button 
                onClick={() => setActiveTab('ads')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'ads' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Ad Metrics
            </button>
            <button 
                onClick={() => setActiveTab('profit')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'profit' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Profit Calc
            </button>
        </div>
      </div>

      <div className="p-5">
        
        {/* TAB 1: AD METRICS */}
        {activeTab === 'ads' && (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Total Spent ($)</label>
                        <input 
                            type="number" 
                            value={totalSpend}
                            onChange={(e) => setTotalSpend(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-extrabold text-black focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Total Messages</label>
                        <input 
                            type="number" 
                            value={totalMessages}
                            onChange={(e) => setTotalMessages(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-extrabold text-black focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-blue-800 font-bold uppercase">Cost Per Message</p>
                        <p className="text-[10px] text-blue-600">Average Cost</p>
                    </div>
                    <p className="text-xl font-extrabold text-blue-800">${costPerMsg.toFixed(2)}</p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                    <p className="text-xs font-bold text-slate-600 uppercase mb-2 flex items-center gap-1">
                        <TrendingUp size={12} /> Prediction
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-slate-700 font-bold">If budget is:</span>
                        <div className="relative w-32">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">$</span>
                            <input 
                                type="number"
                                value={targetBudget}
                                onChange={(e) => setTargetBudget(e.target.value)}
                                className="w-full border border-slate-300 rounded pl-5 pr-2 py-1.5 text-sm font-extrabold text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    </div>
                    <div className="bg-slate-800 text-white p-3 rounded-lg flex items-center justify-between shadow-lg">
                         <span className="text-xs font-medium opacity-90">You will get approx:</span>
                         <span className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                             <MessageCircle size={16} /> {estimatedMessages} Msgs
                         </span>
                    </div>
                </div>
            </div>
        )}

        {/* TAB 2: PROFIT CALCULATOR */}
        {activeTab === 'profit' && (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Product Cost (কেনা)</label>
                        <input 
                            type="number" 
                            value={productCost}
                            onChange={(e) => setProductCost(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-extrabold text-black outline-none shadow-sm focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Marketing (অ্যাড)</label>
                        <input 
                            type="number" 
                            value={marketingCost}
                            onChange={(e) => setMarketingCost(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-extrabold text-black outline-none shadow-sm focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Delivery / Other</label>
                        <input 
                            type="number" 
                            value={deliveryCost}
                            onChange={(e) => setDeliveryCost(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-extrabold text-black outline-none shadow-sm focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-emerald-700 uppercase mb-1">Selling Price (বিক্রয়)</label>
                        <input 
                            type="number" 
                            value={sellingPrice}
                            onChange={(e) => setSellingPrice(e.target.value)}
                            className="w-full border border-emerald-300 bg-emerald-50 rounded-lg p-2.5 text-sm font-extrabold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                <div className={`p-4 rounded-xl border-2 flex justify-between items-center shadow-sm ${netProfit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                    <div>
                        <p className={`text-xs font-bold uppercase ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            {netProfit >= 0 ? 'Net Profit (লাভ)' : 'Net Loss (লস)'}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-1 font-medium">Margin: {margin.toFixed(1)}%</p>
                    </div>
                    <p className={`text-3xl font-extrabold ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {netProfit.toFixed(0)} ৳
                    </p>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default BusinessCalculator;
