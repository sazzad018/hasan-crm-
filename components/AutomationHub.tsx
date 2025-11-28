import React, { useState } from 'react';
import { DripSequence, AutoReportConfig, SmsSettings, Conversation } from '../types';
import { Workflow, Mail, Clock, MessageSquare, Save, Play, Pause, BarChart3, FileText, Send, Eye, Smartphone, CheckCircle, AlertTriangle, Zap, TrendingUp, Calendar } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

interface AutomationHubProps {
    conversations?: Conversation[]; // Added to calculate forecast
    dripSequences: DripSequence[];
    onUpdateDrip: (sequence: DripSequence) => void;
    reportConfig: AutoReportConfig;
    onUpdateReportConfig: (config: AutoReportConfig) => void;
    smsSettings: SmsSettings;
}

const AutomationHub: React.FC<AutomationHubProps> = ({ conversations = [], dripSequences, onUpdateDrip, reportConfig, onUpdateReportConfig, smsSettings }) => {
    const [activeTab, setActiveTab] = useState<'drip' | 'reports'>('drip');

    const handleToggleDrip = (id: string) => {
        const seq = dripSequences.find(s => s.id === id);
        if(seq) onUpdateDrip({ ...seq, isEnabled: !seq.isEnabled });
    };

    const handleStepChange = (seqId: string, stepId: string, field: 'message' | 'dayDelay', value: any) => {
        const seq = dripSequences.find(s => s.id === seqId);
        if(seq) {
            const newSteps = seq.steps.map(step => step.id === stepId ? { ...step, [field]: value } : step);
            onUpdateDrip({ ...seq, steps: newSteps });
        }
    };

    const toggleMetric = (metric: string) => {
        const current = reportConfig.includeMetrics || [];
        const updated = current.includes(metric) 
            ? current.filter(m => m !== metric)
            : [...current, metric];
        onUpdateReportConfig({ ...reportConfig, includeMetrics: updated });
    };

    const handleTestTrigger = (seq: DripSequence) => {
        if (!seq.isEnabled) {
            alert("Sequence is paused. Please enable it to test.");
            return;
        }
        alert(`⚡ Simulation: \n\nA Lead's status just changed to "${seq.triggerStatus.toUpperCase()}".\n\nSystem Scheduled:\n` + 
              seq.steps.map((s, i) => `📅 Day ${s.dayDelay}: "${s.message.substring(0, 30)}..."`).join('\n'));
    };

    // --- FORECAST LOGIC ---
    const getUpcomingAutomations = () => {
        const upcoming: any[] = [];
        const today = new Date();

        conversations.forEach(client => {
            const activeSeq = dripSequences.find(s => s.triggerStatus === client.status && s.isEnabled);
            const statusDate = client.statusChangedDate ? new Date(client.statusChangedDate) : new Date(); 
            
            if (activeSeq) {
                const daysInStatus = differenceInDays(today, statusDate);
                
                activeSeq.steps.forEach(step => {
                    if (step.dayDelay > daysInStatus) {
                        const daysUntilSend = step.dayDelay - daysInStatus;
                        const sendDate = addDays(today, daysUntilSend);
                        
                        // Only show next 7 days
                        if (daysUntilSend <= 7 && daysUntilSend >= 0) {
                            upcoming.push({
                                clientName: client.userName,
                                message: step.message,
                                sendDate: sendDate,
                                sequenceName: activeSeq.triggerStatus
                            });
                        }
                    }
                });
            }
        });
        return upcoming.sort((a, b) => a.sendDate.getTime() - b.sendDate.getTime());
    };

    const upcomingMessages = getUpcomingAutomations();

    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col space-y-6">
            
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl text-white shadow-lg">
                        <Workflow size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Automation Hub</h2>
                        <p className="text-sm text-slate-500">Configure auto-follow ups and scheduled reporting.</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 px-2">
                <button 
                    onClick={() => setActiveTab('drip')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'drip' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <MessageSquare size={16} /> Drip Sequences
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'reports' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <BarChart3 size={16} /> Auto-Reports
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-10">
                
                {/* DRIP MARKETING */}
                {activeTab === 'drip' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* LEFT: SEQUENCES */}
                        <div className="lg:col-span-2 space-y-6">
                            {dripSequences.map(seq => (
                                <div key={seq.id} className={`bg-white rounded-xl border shadow-sm transition-all ${seq.isEnabled ? 'border-violet-200 shadow-violet-100' : 'border-slate-200 opacity-80'}`}>
                                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                        <div>
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                Status: <span className="bg-white border border-slate-200 px-2 py-1 rounded text-xs uppercase tracking-wider text-violet-700 font-bold">{seq.triggerStatus.replace('_', ' ')}</span>
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1">Triggers {seq.steps.length} messages</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleTestTrigger(seq)}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                                title="Simulate this automation"
                                            >
                                                <Zap size={14} /> Test
                                            </button>
                                            <button 
                                                onClick={() => handleToggleDrip(seq.id)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${seq.isEnabled ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                                            >
                                                {seq.isEnabled ? <><Pause size={12}/> Active</> : <><Play size={12}/> Paused</>}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 space-y-6 relative">
                                        {/* Connecting Line */}
                                        <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-slate-100 z-0"></div>

                                        {seq.steps.map((step, idx) => (
                                            <div key={step.id} className="relative z-10 flex gap-4 group">
                                                <div className="w-12 flex flex-col items-center">
                                                    <div className="w-8 h-8 rounded-full bg-violet-50 border-2 border-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 shadow-sm z-10 bg-white">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="mt-2 bg-white border border-slate-200 rounded px-1.5 py-0.5 flex flex-col items-center shadow-sm">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Day</span>
                                                        <input 
                                                            type="number" 
                                                            className="w-8 text-center text-xs font-bold text-slate-800 outline-none border-b border-transparent focus:border-violet-500"
                                                            value={step.dayDelay}
                                                            onChange={(e) => handleStepChange(seq.id, step.id, 'dayDelay', parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="bg-white border border-slate-200 rounded-xl p-4 focus-within:ring-2 focus-within:ring-violet-100 transition-all shadow-sm">
                                                        <div className="flex justify-between mb-2">
                                                            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                                                <Mail size={12} /> Message Template
                                                            </span>
                                                            <Clock size={14} className="text-slate-300" />
                                                        </div>
                                                        <textarea 
                                                            value={step.message}
                                                            onChange={(e) => handleStepChange(seq.id, step.id, 'message', e.target.value)}
                                                            className="w-full text-sm text-slate-700 outline-none resize-none bg-transparent h-20 placeholder-slate-300"
                                                            placeholder="Enter automated message..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
                                        <button className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center justify-end gap-1">
                                            <Save size={14} /> Changes Auto-saved
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* RIGHT: FORECAST DASHBOARD (NEW) */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
                                <div className="p-4 border-b border-slate-100 bg-slate-50">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                        <TrendingUp size={16} className="text-emerald-600" /> Upcoming Messages
                                    </h3>
                                    <p className="text-[10px] text-slate-500 mt-1">Scheduled for next 7 days based on current leads.</p>
                                </div>
                                <div className="p-0 overflow-y-auto max-h-[600px] custom-scrollbar">
                                    {upcomingMessages.length > 0 ? (
                                        <div className="divide-y divide-slate-100">
                                            {upcomingMessages.map((msg, idx) => (
                                                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-bold text-slate-800">{msg.clientName}</span>
                                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">{format(msg.sendDate, 'MMM d')}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 line-clamp-2 mb-2 italic">"{msg.message}"</p>
                                                    <div className="flex items-center gap-1 text-[10px] text-violet-600 font-bold bg-violet-50 w-fit px-2 py-0.5 rounded">
                                                        <Zap size={10} /> {msg.sequenceName.replace('_', ' ')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-slate-400">
                                            <Calendar size={32} className="mx-auto mb-2 opacity-20" />
                                            <p className="text-xs">No upcoming messages scheduled.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* AUTO REPORTING */}
                {activeTab === 'reports' && (
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">White-Label Client Reporting</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Automatically generate and send PDF summaries to your active clients via SMS or Email. 
                                        The report includes Ad Spend, Sales, and ROI metrics for the selected period.
                                    </p>
                                </div>

                                <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-700 text-sm">Enable Auto-Reporting</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={reportConfig.isEnabled}
                                                onChange={(e) => onUpdateReportConfig({...reportConfig, isEnabled: e.target.checked})} 
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Frequency</label>
                                            <select 
                                                value={reportConfig.frequency}
                                                onChange={(e) => onUpdateReportConfig({...reportConfig, frequency: e.target.value as any})}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                                            >
                                                <option value="weekly">Every Week (Monday)</option>
                                                <option value="monthly">Every Month (1st)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Method</label>
                                            <select 
                                                value={reportConfig.method}
                                                onChange={(e) => onUpdateReportConfig({...reportConfig, method: e.target.value as any})}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                                            >
                                                <option value="email">Email PDF Attachment</option>
                                                <option value="sms">SMS / WhatsApp (via API)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Gateway Status Indicator */}
                                    {reportConfig.method === 'sms' && (
                                        <div className={`p-3 rounded-lg border flex items-center gap-2 text-xs ${smsSettings.apiUrl ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                                            {smsSettings.apiUrl ? (
                                                <>
                                                    <CheckCircle size={14} />
                                                    <span>Connected to Gateway: <strong>{new URL(smsSettings.apiUrl).hostname}</strong></span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertTriangle size={14} />
                                                    <span>SMS Gateway not configured. Please set up in "Bulk SMS & API" first.</span>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Include Metrics</label>
                                        <div className="flex gap-3">
                                            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={reportConfig.includeMetrics.includes('spend')}
                                                    onChange={() => toggleMetric('spend')}
                                                    className="accent-violet-600" 
                                                /> 
                                                Ad Spend
                                            </label>
                                            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={reportConfig.includeMetrics.includes('sales')}
                                                    onChange={() => toggleMetric('sales')}
                                                    className="accent-violet-600" 
                                                /> 
                                                Sales/Conversions
                                            </label>
                                            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={reportConfig.includeMetrics.includes('cpa')}
                                                    onChange={() => toggleMetric('cpa')}
                                                    className="accent-violet-600" 
                                                /> 
                                                ROI / CPA
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-80 bg-slate-100 rounded-xl p-6 border border-slate-200 flex flex-col items-center justify-center text-center">
                                <FileText size={48} className="text-slate-300 mb-4" />
                                <h4 className="font-bold text-slate-700 mb-1">Sample Report</h4>
                                <p className="text-xs text-slate-500 mb-6">Preview what your clients will receive.</p>
                                <button 
                                    onClick={() => alert("Generating sample PDF... (Feature simulated)")}
                                    className="bg-white border border-slate-300 text-slate-600 hover:text-violet-600 hover:border-violet-300 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                                >
                                    <Eye size={14} /> View Sample
                                </button>
                                <button 
                                    onClick={() => alert(reportConfig.method === 'sms' ? "Sending test SMS with PDF link..." : "Sending test report to your email...")}
                                    className="mt-2 text-violet-600 hover:underline text-xs font-bold flex items-center gap-1"
                                >
                                    {reportConfig.method === 'sms' ? <Smartphone size={12}/> : <Send size={12} />} 
                                    Send Test ({reportConfig.method === 'sms' ? 'SMS' : 'Email'})
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutomationHub;