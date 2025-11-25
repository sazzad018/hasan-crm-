import React, { useState } from 'react';
import { Send, Image, Mic, MessageSquare } from 'lucide-react';
import { AttachmentType } from '../types';

interface WebhookSimulatorProps {
  onSimulateMessage: (
    text: string | null, 
    type: AttachmentType, 
    url?: string, 
    psid?: string
  ) => void;
}

const WebhookSimulator: React.FC<WebhookSimulatorProps> = ({ onSimulateMessage }) => {
  const [psid, setPsid] = useState('1234567890123456');
  const [text, setText] = useState('Hello from Facebook!');
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'audio'>('text');
  
  // Mock URLs for testing
  const mockImage = "https://picsum.photos/400/300";
  const mockAudio = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  const handleSend = () => {
    switch(activeTab) {
      case 'text':
        onSimulateMessage(text, AttachmentType.TEXT, undefined, psid);
        break;
      case 'image':
        onSimulateMessage(null, AttachmentType.IMAGE, mockImage, psid);
        break;
      case 'audio':
        onSimulateMessage(null, AttachmentType.AUDIO, mockAudio, psid);
        break;
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Webhook Simulator</h2>
          <p className="text-sm text-slate-500 mb-6">
            Since we don't have a live Facebook server, use this tool to simulate incoming <code>POST</code> requests to your webhook URL.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase text-slate-500 mb-1">Sender PSID</label>
              <input 
                type="text" 
                value={psid} 
                onChange={(e) => setPsid(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-mono"
              />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <label className="block text-xs font-medium uppercase text-slate-500 mb-3">Message Type</label>
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => setActiveTab('text')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'text' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <MessageSquare size={16} /> Text
                </button>
                <button 
                  onClick={() => setActiveTab('image')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'image' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Image size={16} /> Image
                </button>
                <button 
                  onClick={() => setActiveTab('audio')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'audio' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Mic size={16} /> Audio
                </button>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                {activeTab === 'text' && (
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    placeholder="Type the message content..."
                  />
                )}

                {activeTab === 'image' && (
                  <div className="text-center">
                    <img src={mockImage} alt="Preview" className="h-32 mx-auto rounded-lg shadow-sm border border-slate-200 mb-2" />
                    <p className="text-xs text-slate-500">Will send: {mockImage}</p>
                  </div>
                )}

                {activeTab === 'audio' && (
                   <div className="text-center py-4">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Mic size={24} />
                      </div>
                      <p className="text-sm font-medium text-slate-700">Voice Clip.mp3</p>
                      <p className="text-xs text-slate-500 mt-1 truncate px-4">{mockAudio}</p>
                   </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleSend}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Send size={16} />
              Simulate Webhook Event (POST)
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-xs overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
            <span className="font-bold text-white">Payload Preview</span>
            <span className="bg-slate-800 px-2 py-1 rounded text-[10px]">JSON</span>
          </div>
          <pre className="whitespace-pre-wrap break-all">
{JSON.stringify({
  object: "page",
  entry: [{
    id: "PAGE_ID",
    time: Date.now(),
    messaging: [{
      sender: { id: psid },
      recipient: { id: "PAGE_ID" },
      timestamp: Date.now(),
      message: activeTab === 'text' 
        ? { mid: "mid.$...xyz", text: text }
        : { 
            mid: "mid.$...xyz", 
            attachments: [{ 
              type: activeTab, 
              payload: { url: activeTab === 'image' ? mockImage : mockAudio } 
            }] 
          }
    }]
  }]
}, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-sm font-semibold text-slate-800 mb-2">How it works</h3>
           <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
             <li>The real plugin receives this JSON at <code>/index.php?mfb_webhook=1</code>.</li>
             <li>It parses <code>entry[0].messaging[0]</code>.</li>
             <li>It queries Graph API for <code>sender.id</code> to get the name.</li>
             <li>It inserts into <code>wp_mfb_messages</code>.</li>
           </ul>
        </div>
      </div>
    </div>
  );
};

export default WebhookSimulator;