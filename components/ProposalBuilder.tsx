
import React, { useState } from 'react';
import { Conversation, Proposal, InvoiceItem } from '../types';
import { FileSignature, Plus, Trash2, CheckCircle, Eye, Send, Download, ChevronLeft, Search, User, Check, Save, Copy, Loader2, X, Link as LinkIcon } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface ProposalBuilderProps {
    conversations: Conversation[];
    proposals: Proposal[];
    onSaveProposal: (proposal: Proposal) => void;
    onAcceptProposal: (proposalId: string) => void;
}

const ProposalBuilder: React.FC<ProposalBuilderProps> = ({ conversations, proposals, onSaveProposal, onAcceptProposal }) => {
    const [view, setView] = useState<'list' | 'edit' | 'preview'>('list');
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    
    // Form State
    const [title, setTitle] = useState('');
    const [clientId, setClientId] = useState('');
    const [coverLetter, setCoverLetter] = useState("We are pleased to submit this proposal for your review. Based on our discussion, we have outlined a strategy that aligns with your business goals.\n\nOur team is ready to start immediately upon acceptance.");
    const [items, setItems] = useState<InvoiceItem[]>([{ id: '1', description: 'Facebook Ad Management', quantity: 1, rate: 5000, amount: 5000 }]);

    // Calculated
    const totalAmount = items.reduce((acc, item) => acc + item.amount, 0);

    const handleCreateNew = () => {
        setSelectedProposal(null);
        setTitle('Digital Marketing Strategy Proposal');
        setClientId('');
        setItems([{ id: Date.now().toString(), description: 'Facebook Ad Management', quantity: 1, rate: 5000, amount: 5000 }]);
        setView('edit');
    };

    const handleEditItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'quantity' || field === 'rate') updated.amount = updated.quantity * updated.rate;
                return updated;
            }
            return item;
        }));
    };

    const handleSave = () => {
        if(!clientId || !title) return alert("Please select a client and title");
        
        const client = conversations.find(c => c.psid === clientId);
        const newProposal: Proposal = {
            id: selectedProposal?.id || Date.now().toString(),
            clientId,
            clientName: client?.userName || 'Unknown',
            title,
            coverLetter,
            items,
            totalAmount,
            status: selectedProposal?.status || 'draft',
            createdDate: new Date(),
            validUntil: addDays(new Date(), 7)
        };
        onSaveProposal(newProposal);
        setView('list');
    };

    const handlePreview = (proposal: Proposal) => {
        setSelectedProposal(proposal);
        setView('preview');
    };

    const handleDownloadPDF = () => {
        const element = document.getElementById('proposal-preview-container');
        if (!element) {
            alert("Error: Preview not found. Please try again.");
            return;
        }

        setIsDownloading(true);
        
        // Function to run generation
        const runGeneration = () => {
            const opt = {
                margin: 0,
                filename: `Proposal_${selectedProposal?.clientName.replace(/\s+/g, '_') || 'Draft'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, scrollY: 0, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // @ts-ignore
            if (window.html2pdf) {
                // @ts-ignore
                window.html2pdf().set(opt).from(element).save()
                    .then(() => setIsDownloading(false))
                    .catch((err: any) => {
                        console.error(err);
                        setIsDownloading(false);
                        alert("Failed to generate PDF. Please try again.");
                    });
            } else {
                alert("PDF engine not loaded yet. Please wait a moment and try again.");
                setIsDownloading(false);
            }
        };

        // Load html2pdf dynamically if not present
        if (!(window as any).html2pdf) {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
            script.onload = runGeneration;
            script.onerror = () => {
                setIsDownloading(false);
                alert("Failed to load PDF generator. Please check your internet connection.");
            };
            document.body.appendChild(script);
        } else {
            runGeneration();
        }
    };

    const copyLink = () => {
        if(selectedProposal) {
            const link = `https://portal.socialadsexpert.com/proposal/${selectedProposal.id}`;
            navigator.clipboard.writeText(link);
            alert("Client View Link Copied! Send this to your client.");
            setShowShareModal(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col relative">
            
            {view === 'list' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <FileSignature className="text-[#9B7BE3]" /> Proposal Builder
                            </h2>
                            <p className="text-sm text-slate-500">Create professional proposals and convert them to invoices instantly.</p>
                        </div>
                        <button onClick={handleCreateNew} className="bg-[#9B7BE3] hover:bg-violet-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all">
                            <Plus size={18} /> Create Proposal
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {proposals.map(prop => (
                            <div key={prop.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                                <div className="p-5 border-b border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${prop.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : prop.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {prop.status}
                                        </span>
                                        <p className="text-xs text-slate-400">{format(new Date(prop.createdDate), 'MMM d')}</p>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-1">{prop.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <User size={14} /> {prop.clientName}
                                    </div>
                                </div>
                                <div className="p-5 bg-slate-50 flex justify-between items-center">
                                    <span className="font-bold text-slate-800 text-lg">${prop.totalAmount.toLocaleString()}</span>
                                    <button onClick={() => handlePreview(prop)} className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                                        Open <Eye size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {proposals.length === 0 && (
                            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                                <FileSignature size={48} className="mx-auto mb-2 opacity-20" />
                                <p>No proposals created yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {view === 'edit' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <button onClick={() => setView('list')} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold text-sm">
                            <ChevronLeft size={16} /> Back
                        </button>
                        <h3 className="font-bold text-slate-800">Edit Proposal</h3>
                        <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors flex items-center gap-2">
                            <Save size={16} /> Save Draft
                        </button>
                    </div>
                    
                    <div className="p-8 overflow-y-auto space-y-8 flex-1">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Proposal Title</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 font-bold text-slate-800 focus:ring-2 focus:ring-[#9B7BE3] outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Client</label>
                                <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 bg-white focus:ring-2 focus:ring-[#9B7BE3] outline-none">
                                    <option value="">-- Choose Client --</option>
                                    {conversations.map(c => <option key={c.psid} value={c.psid}>{c.userName}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cover Letter / Scope</label>
                            <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} className="w-full h-32 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#9B7BE3] outline-none resize-none" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase">Pricing & Packages</label>
                                <button onClick={() => setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, rate: 0, amount: 0 }])} className="text-xs font-bold text-blue-600 hover:underline">+ Add Item</button>
                            </div>
                            {items.map((item, idx) => (
                                <div key={item.id} className="flex gap-3 items-center">
                                    <input value={item.description} onChange={e => handleEditItem(item.id, 'description', e.target.value)} placeholder="Item description" className="flex-1 border border-slate-200 rounded p-2 text-sm" />
                                    <input type="number" value={item.rate} onChange={e => handleEditItem(item.id, 'rate', parseFloat(e.target.value))} className="w-24 border border-slate-200 rounded p-2 text-sm" placeholder="Rate" />
                                    <input type="number" value={item.quantity} onChange={e => handleEditItem(item.id, 'quantity', parseFloat(e.target.value))} className="w-16 border border-slate-200 rounded p-2 text-sm" placeholder="Qty" />
                                    <div className="w-24 text-right font-bold text-slate-700">${item.amount}</div>
                                    <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            ))}
                            <div className="flex justify-end pt-4">
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 uppercase font-bold">Total Estimate</p>
                                    <p className="text-2xl font-bold text-[#9B7BE3]">${totalAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {view === 'preview' && selectedProposal && (
                <div className="bg-slate-100 h-full flex flex-col">
                    
                    {/* Action Bar */}
                    <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setView('list')} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold text-sm">
                                <ChevronLeft size={16} /> Back
                            </button>
                            <div className="h-6 w-px bg-slate-200"></div>
                            <span className="text-sm font-medium text-slate-500">Previewing as <span className="text-slate-800 font-bold">Client</span></span>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowShareModal(true)}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 flex items-center gap-2"
                            >
                                <Send size={16} /> Share / Send
                            </button>
                            <button 
                                onClick={handleDownloadPDF}
                                disabled={isDownloading}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70 transition-all"
                            >
                                {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                {isDownloading ? 'Generating...' : 'Download PDF'}
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Preview Area */}
                    <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-100">
                        {/* A4 Paper Container - Ensure dimensions match html2pdf expectations */}
                        <div id="proposal-preview-container" className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-12 relative flex flex-col mx-auto">
                            
                            {/* Status Stamp */}
                            {selectedProposal.status === 'accepted' && (
                                <div className="absolute top-12 right-12 border-4 border-emerald-500 text-emerald-500 text-4xl font-black uppercase px-4 py-2 transform rotate-12 opacity-30 rounded-lg pointer-events-none">
                                    ACCEPTED
                                </div>
                            )}

                            {/* Header */}
                            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                                <div>
                                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Proposal</h1>
                                    <p className="text-[#9B7BE3] font-bold text-lg mt-1">Prepared for {selectedProposal.clientName}</p>
                                </div>
                                <div className="text-right text-sm text-slate-500">
                                    <p className="font-bold text-slate-900">Social Ads Expert</p>
                                    <p>Dhaka, Bangladesh</p>
                                    <p>{format(new Date(selectedProposal.createdDate), 'MMM d, yyyy')}</p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="space-y-8 flex-1">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Executive Summary</h2>
                                    <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm text-justify">{selectedProposal.coverLetter}</p>
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Investment Required</h2>
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                            <tr>
                                                <th className="p-3">Service</th>
                                                <th className="p-3 text-right">Rate</th>
                                                <th className="p-3 text-center">Qty</th>
                                                <th className="p-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedProposal.items.map(item => (
                                                <tr key={item.id}>
                                                    <td className="p-3 text-slate-700 font-medium text-sm">{item.description}</td>
                                                    <td className="p-3 text-right text-slate-500 text-sm">${item.rate.toLocaleString()}</td>
                                                    <td className="p-3 text-center text-slate-500 text-sm">{item.quantity}</td>
                                                    <td className="p-3 text-right font-bold text-slate-800 text-sm">${item.amount.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="flex justify-end mt-6">
                                        <div className="bg-[#9B7BE3] text-white p-4 rounded-lg shadow-md min-w-[200px] text-right">
                                            <p className="text-xs uppercase font-bold opacity-80">Total Investment</p>
                                            <p className="text-2xl font-bold">${selectedProposal.totalAmount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Acceptance Section (Visible in PDF and Screen) */}
                            <div className="mt-16 border-t-2 border-slate-200 pt-8 avoid-break">
                                {selectedProposal.status === 'accepted' ? (
                                    <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl text-center">
                                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <CheckCircle size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-emerald-800">Proposal Accepted</h3>
                                        <p className="text-emerald-600 text-sm">This proposal has been approved.</p>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-sm text-slate-500 font-medium">To accept this proposal and proceed with the invoice, please click below.</p>
                                        {/* This button is for the interactive view, hidden in print usually, but we keep it for PDF context or remove via CSS if needed */}
                                        <button 
                                            onClick={() => { onAcceptProposal(selectedProposal.id); setView('list'); }}
                                            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-black shadow-xl transition-transform hover:scale-105 flex items-center gap-2 mx-auto"
                                            data-html2canvas-ignore="true" // Don't render button in PDF
                                        >
                                            <Check size={18} /> Accept & Start Project
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {/* Footer */}
                            <div className="mt-12 pt-6 border-t border-slate-200 text-center">
                                <p className="text-xs text-slate-400 uppercase tracking-widest">Social Ads Expert Agency • Confidential</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && selectedProposal && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-800">Send Proposal</h3>
                            <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">Choose how you want to deliver this proposal to <strong>{selectedProposal.clientName}</strong>.</p>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={copyLink}
                                    className="flex flex-col items-center justify-center gap-2 p-4 border border-slate-200 rounded-xl hover:border-[#9B7BE3] hover:bg-violet-50 transition-all group"
                                >
                                    <div className="p-3 bg-slate-100 text-slate-600 rounded-full group-hover:bg-[#9B7BE3] group-hover:text-white transition-colors">
                                        <LinkIcon size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">Copy Link</span>
                                </button>
                                <button 
                                    onClick={() => { handleDownloadPDF(); setShowShareModal(false); }}
                                    className="flex flex-col items-center justify-center gap-2 p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                >
                                    <div className="p-3 bg-slate-100 text-slate-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Download size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">Download PDF</span>
                                </button>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-xs text-slate-500 mb-1 uppercase font-bold">Magic Link</p>
                                <code className="block w-full font-mono text-xs text-slate-700 truncate">
                                    https://portal.socialadsexpert.com/proposal/{selectedProposal.id}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProposalBuilder;
