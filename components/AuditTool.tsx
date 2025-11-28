
import React, { useState } from 'react';
import { Search, Globe, Facebook, Loader2, AlertTriangle, CheckCircle, Zap, FileText, Smartphone, Download, Share2, Settings, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

const AuditTool: React.FC = () => {
    const [url, setUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<any>(null);
    
    // New State to control the narrative of the report
    const [outcomeMode, setOutcomeMode] = useState<'critical' | 'healthy'>('critical');

    const handleScan = () => {
        if (!url) return alert("Please enter a URL");
        
        setIsScanning(true);
        setResult(null);
        setProgress(0);

        // Simulate Scanning Process
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    generateMockResult();
                    setIsScanning(false);
                    return 100;
                }
                return prev + Math.floor(Math.random() * 15);
            });
        }, 500);
    };

    const generateMockResult = () => {
        const isFb = url.includes('facebook.com') || url.includes('fb.me');
        let score, issues;

        if (outcomeMode === 'critical') {
            // SALES MODE: Find problems to sell services
            score = Math.floor(Math.random() * 30) + 30; // Score 30-60
            issues = isFb ? [
                { id: 1, title: 'Cover Photo not optimized for Mobile', severity: 'medium' },
                { id: 2, title: 'Missing Automated Reply Setup', severity: 'high' },
                { id: 3, title: 'No "Book Now" or "WhatsApp" CTA Button', severity: 'high' },
                { id: 4, title: 'Low Engagement Rate on recent posts', severity: 'medium' }
            ] : [
                { id: 1, title: 'Facebook Pixel NOT Found', severity: 'critical' },
                { id: 2, title: 'Slow Mobile Page Load Speed (3.5s)', severity: 'high' },
                { id: 3, title: 'SSL Certificate Warning / Security Issue', severity: 'medium' },
                { id: 4, title: 'Meta Description Missing for SEO', severity: 'medium' }
            ];
        } else {
            // HEALTHY MODE: Show good results
            score = Math.floor(Math.random() * 15) + 85; // Score 85-100
            issues = [
                { id: 1, title: 'SSL Certificate is Valid', severity: 'good' },
                { id: 2, title: 'Mobile Responsiveness is Great', severity: 'good' },
                { id: 3, title: 'Facebook Pixel / Events Found', severity: 'good' },
                { id: 4, title: 'Page Load Speed under 1.2s', severity: 'good' }
            ];
        }

        setResult({
            score,
            platform: isFb ? 'Facebook Page' : 'Website',
            issues,
            timestamp: new Date()
        });
    };

    const downloadReport = () => {
        alert("Downloading PDF Report... (Feature simulated)");
    };

    const sendReport = () => {
        alert("Report link sent to client via SMS! (Simulated)");
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ScanSearchIcon size={32} className="text-blue-400" />
                        AI Audit Tool (Lead Magnet)
                    </h1>
                    <p className="text-slate-300 mt-2 max-w-2xl text-sm leading-relaxed">
                        Generate instant audits for any website or Facebook page. 
                        Use "Critical Mode" to find gaps and sell your services, or "Healthy Mode" to verify good sites.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                    <Globe size={200} />
                </div>
            </div>

            {/* Input Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="max-w-3xl mx-auto space-y-4">
                    
                    <div className="flex justify-between items-center">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                            Client's URL to Scan
                        </label>
                        
                        {/* SIMULATION CONTROL */}
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                            <button 
                                onClick={() => setOutcomeMode('critical')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors flex items-center gap-1 ${outcomeMode === 'critical' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                            >
                                <AlertTriangle size={12} /> Find Errors (Sales)
                            </button>
                            <button 
                                onClick={() => setOutcomeMode('healthy')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors flex items-center gap-1 ${outcomeMode === 'healthy' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                            >
                                <ShieldCheck size={12} /> Good Site
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="e.g. www.client-site.com or facebook.com/page"
                            />
                        </div>
                        <button 
                            onClick={handleScan}
                            disabled={isScanning || !url}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isScanning ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
                            {isScanning ? 'Scanning...' : 'Run Audit'}
                        </button>
                    </div>
                    
                    {/* Progress Bar */}
                    {isScanning && (
                        <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                <span>Analyzing Structure...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 transition-all duration-300 ease-out" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Result Dashboard */}
            {result && !isScanning && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Score Card */}
                    <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                        <h3 className="text-slate-500 font-bold uppercase text-xs tracking-wider mb-4">Overall Health Score</h3>
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                    className={result.score > 70 ? "text-emerald-500" : result.score > 40 ? "text-orange-500" : "text-red-500"}
                                    strokeDasharray={440}
                                    strokeDashoffset={440 - (440 * result.score) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute text-4xl font-black text-slate-800">{result.score}</span>
                        </div>
                        <p className={`mt-4 text-sm font-bold px-3 py-1 rounded-full ${result.score > 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                            {result.score < 50 ? 'Critical Issues Found 🚨' : result.score < 80 ? 'Improvements Needed ⚠️' : 'Site is Optimized ✅'}
                        </p>
                    </div>

                    {/* Issues List */}
                    <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                {result.score > 80 ? <CheckCircle className="text-emerald-500" size={20} /> : <AlertTriangle className="text-red-500" size={20} />}
                                {result.score > 80 ? 'Passed Checks' : 'Critical Issues Found'}
                            </h3>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold ${result.score > 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {result.issues.length} Items
                            </span>
                        </div>

                        <div className="space-y-3">
                            {result.issues.map((issue: any) => (
                                <div key={issue.id} className={`p-4 rounded-xl border flex items-start gap-3 ${issue.severity === 'good' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className={`mt-0.5 p-1 rounded-full ${
                                        issue.severity === 'good' ? 'bg-emerald-100 text-emerald-600' : 
                                        issue.severity === 'critical' || issue.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                        {issue.severity === 'good' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800">{issue.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Status: <span className="font-bold uppercase">{issue.severity}</span> 
                                            {issue.severity !== 'good' && <> • Solution: <span className="text-blue-600 font-bold">Social Ads Expert Service</span></>}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="md:col-span-3 bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h3 className="font-bold text-indigo-900 text-lg">Turn this Lead into a Client?</h3>
                            <p className="text-sm text-indigo-700">Send this professional report to the client instantly.</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button onClick={downloadReport} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-indigo-700 font-bold py-3 px-6 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-200">
                                <FileText size={18} /> Download PDF
                            </button>
                            <button onClick={sendReport} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                <Smartphone size={18} /> Send via SMS
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

const ScanSearchIcon = ({ size, className }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 22h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2" />
        <path d="M8 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h2" />
        <circle cx="12" cy="12" r="3" />
        <path d="m17 17 3 3" />
    </svg>
);

export default AuditTool;
