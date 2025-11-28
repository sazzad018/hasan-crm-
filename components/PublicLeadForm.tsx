
import React, { useState } from 'react';
import { Send, CheckCircle, Globe, Briefcase, User, Phone, Facebook } from 'lucide-react';
import { LeadSource } from '../types';

interface PublicLeadFormProps {
    onSubmit: (data: any) => void;
}

const PublicLeadForm: React.FC<PublicLeadFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        userName: '',
        extractedMobile: '',
        extractedWebsite: '',
        extractedFbLink: '',
        businessInfo: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prepare data for the parent app
        const leadData = {
            ...formData,
            status: 'new_lead',
            source: 'web_form' as LeadSource,
            psid: `web_${Date.now()}`
        };

        onSubmit(leadData);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Thank You!</h2>
                    <p className="text-slate-500 mb-8">
                        Your information has been securely received. Our team will contact you shortly to discuss your business goals.
                    </p>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600">
                        We have sent a confirmation to your system.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
            
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center">
                    <h1 className="text-2xl font-bold mb-2">Business Growth Inquiry</h1>
                    <p className="text-blue-100 text-sm">Fill out the details below to get a custom strategy for your business.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Your Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                required
                                value={formData.userName}
                                onChange={e => setFormData({...formData, userName: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Full Name"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Mobile Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                required
                                value={formData.extractedMobile}
                                onChange={e => setFormData({...formData, extractedMobile: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="017..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Website (Optional)</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    value={formData.extractedWebsite}
                                    onChange={e => setFormData({...formData, extractedWebsite: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Facebook Profile/Page</label>
                            <div className="relative">
                                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    value={formData.extractedFbLink}
                                    onChange={e => setFormData({...formData, extractedFbLink: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                    placeholder="fb.com/..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Business Information</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-4 text-slate-400" size={18} />
                            <textarea 
                                value={formData.businessInfo}
                                onChange={e => setFormData({...formData, businessInfo: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
                                placeholder="Tell us briefly about your business and what you need..."
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4">
                        <Send size={20} /> Submit Information
                    </button>
                    
                    <p className="text-center text-xs text-slate-400 mt-4">
                        Securely powered by WP Messenger CRM
                    </p>
                </form>
            </div>
        </div>
    );
};

export default PublicLeadForm;
