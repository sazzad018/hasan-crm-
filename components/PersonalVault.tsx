
import React, { useState } from 'react';
import { PersonalAccount } from '../types';
import { KeyRound, Search, Plus, Trash2, Edit2, Eye, EyeOff, Copy, Check, Facebook, MonitorPlay, Film, Wrench, Shield, Save, X, ExternalLink } from 'lucide-react';

interface PersonalVaultProps {
    accounts: PersonalAccount[];
    onAddAccount: (account: PersonalAccount) => void;
    onUpdateAccount: (account: PersonalAccount) => void;
    onDeleteAccount: (id: string) => void;
}

const PersonalVault: React.FC<PersonalVaultProps> = ({ accounts, onAddAccount, onUpdateAccount, onDeleteAccount }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const initialFormState: PersonalAccount = {
        id: '',
        platformName: '',
        category: 'social',
        username: '',
        password: '',
        loginUrl: '',
        notes: ''
    };
    const [formData, setFormData] = useState<PersonalAccount>(initialFormState);

    const filteredAccounts = accounts.filter(acc => {
        const matchesSearch = acc.platformName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              acc.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || acc.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleOpenModal = (account?: PersonalAccount) => {
        if (account) {
            setFormData(account);
            setEditingId(account.id);
        } else {
            setFormData({ ...initialFormState, id: Date.now().toString() });
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            onUpdateAccount(formData);
        } else {
            onAddAccount(formData);
        }
        setIsModalOpen(false);
    };

    const getCategoryIcon = (category: string) => {
        switch(category) {
            case 'social': return <Facebook size={18} />;
            case 'course': return <MonitorPlay size={18} />;
            case 'entertainment': return <Film size={18} />;
            case 'tools': return <Wrench size={18} />;
            default: return <Shield size={18} />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch(category) {
            case 'social': return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'course': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
            case 'entertainment': return 'bg-pink-100 text-pink-600 border-pink-200';
            case 'tools': return 'bg-orange-100 text-orange-600 border-orange-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const PasswordRow = ({ label, value, isPassword = false }: { label: string, value: string, isPassword?: boolean }) => {
        const [show, setShow] = useState(!isPassword);
        const [copied, setCopied] = useState(false);

        const handleCopy = () => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        return (
            <div className="bg-slate-50 p-2 rounded border border-slate-200 flex items-center justify-between group">
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{label}</span>
                    <span className="text-xs font-mono text-slate-700 truncate font-medium">
                        {show ? value : '••••••••••••'}
                    </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isPassword && (
                        <button onClick={() => setShow(!show)} className="p-1 hover:text-blue-600">
                            {show ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    )}
                    <button onClick={handleCopy} className={`p-1 hover:text-blue-600 ${copied ? 'text-green-500' : 'text-slate-400'}`}>
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <KeyRound size={24} className="text-[#9B7BE3]" /> My Accounts Vault
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Securely store your social media, learning, and entertainment credentials.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="flex gap-2">
                        <select 
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                        >
                            <option value="all">All Categories</option>
                            <option value="social">Social Media</option>
                            <option value="course">Learning/Courses</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="tools">Tools/Apps</option>
                        </select>
                        <div className="relative flex-1 md:w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text"
                                placeholder="Search accounts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#9B7BE3]"
                            />
                        </div>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 bg-[#9B7BE3] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-violet-600 transition-colors shadow-lg shadow-violet-200"
                    >
                        <Plus size={18} /> Add New
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAccounts.map(account => (
                    <div key={account.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getCategoryColor(account.category)}`}>
                                    {getCategoryIcon(account.category)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">{account.platformName}</h3>
                                    <span className="text-[10px] font-bold uppercase text-slate-400">{account.category}</span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {account.loginUrl && (
                                    <a href={account.loginUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors">
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                                <button onClick={() => handleOpenModal(account)} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => onDeleteAccount(account.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <PasswordRow label="Username / Email" value={account.username} />
                            <PasswordRow label="Password" value={account.password || ''} isPassword={true} />
                            
                            {account.notes && (
                                <div className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100 mt-2">
                                    {account.notes}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {filteredAccounts.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                        <Shield size={48} className="mb-4 opacity-20" />
                        <p>No accounts found in your vault.</p>
                        <button onClick={() => handleOpenModal()} className="mt-4 text-[#9B7BE3] text-sm font-bold hover:underline">
                            Save your first password
                        </button>
                    </div>
                )}
            </div>

            {/* ADD/EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                                {editingId ? <Edit2 size={20} className="text-[#9B7BE3]" /> : <Plus size={20} className="text-[#9B7BE3]" />}
                                {editingId ? 'Edit Account' : 'Add To Vault'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Platform Name</label>
                                <input 
                                    required
                                    placeholder="e.g. Facebook Personal"
                                    value={formData.platformName}
                                    onChange={(e) => setFormData({...formData, platformName: e.target.value})}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#9B7BE3] outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category</label>
                                    <select 
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#9B7BE3] outline-none"
                                    >
                                        <option value="social">Social Media</option>
                                        <option value="course">Learning/Course</option>
                                        <option value="entertainment">Entertainment</option>
                                        <option value="tools">Tools/Software</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Login URL (Optional)</label>
                                    <input 
                                        placeholder="https://..."
                                        value={formData.loginUrl}
                                        onChange={(e) => setFormData({...formData, loginUrl: e.target.value})}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#9B7BE3] outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Username / Email</label>
                                <input 
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#9B7BE3] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Password</label>
                                <input 
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-[#9B7BE3] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Notes</label>
                                <textarea 
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#9B7BE3] outline-none h-20"
                                    placeholder="Security questions, pins, etc."
                                />
                            </div>

                            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all shadow-lg mt-2 flex justify-center items-center gap-2">
                                <Save size={18} /> Save Credentials
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonalVault;
