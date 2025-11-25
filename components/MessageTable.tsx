import React from 'react';
import { FbMessage, AttachmentType } from '../types';
import { MessageSquare, Image as ImageIcon, Mic, FileText, ExternalLink, User } from 'lucide-react';
import { format } from 'date-fns';

// Define extended interface for messages in the table view which require user context
export interface MessageWithUser extends FbMessage {
  userName: string;
  psid: string;
}

interface MessageTableProps {
  messages: MessageWithUser[];
}

const MessageTable: React.FC<MessageTableProps> = ({ messages }) => {
  
  const renderAttachment = (msg: FbMessage) => {
    switch (msg.attachmentType) {
      case AttachmentType.IMAGE:
        return (
          <div className="group relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
            <img 
              src={msg.attachmentUrl} 
              alt="Attachment" 
              className="w-full h-full object-cover" 
            />
            <a 
              href={msg.attachmentUrl} 
              target="_blank" 
              rel="noreferrer"
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ExternalLink size={16} className="text-white" />
            </a>
          </div>
        );
      case AttachmentType.AUDIO:
        return (
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-full w-fit border border-slate-200">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
               <Mic size={16} />
            </div>
            <audio controls className="h-8 w-48" src={msg.attachmentUrl}>
              Your browser does not support audio.
            </audio>
          </div>
        );
      case AttachmentType.FILE:
        return (
            <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 underline bg-blue-50 px-3 py-2 rounded-lg w-fit">
                <FileText size={16} />
                <span>Download File</span>
            </a>
        );
      case AttachmentType.TEXT:
      default:
        return <p className="text-slate-700 text-sm leading-relaxed">{msg.messageText}</p>;
    }
  };

  const getIconForType = (type: AttachmentType) => {
      switch(type) {
          case AttachmentType.AUDIO: return <Mic size={14} className="text-purple-500" />;
          case AttachmentType.IMAGE: return <ImageIcon size={14} className="text-green-500" />;
          case AttachmentType.FILE: return <FileText size={14} className="text-orange-500" />;
          default: return <MessageSquare size={14} className="text-slate-400" />;
      }
  };

  if (messages.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-400">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p>No messages found in database.</p>
              <p className="text-xs mt-2">Use the Simulator to receive new messages.</p>
          </div>
      )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Messages (wp_mfb_messages)</h2>
        <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
          {messages.length} Total
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
              <th className="px-6 py-4 w-16">ID</th>
              <th className="px-6 py-4 w-48">User (PSID)</th>
              <th className="px-6 py-4">Content</th>
              <th className="px-6 py-4 w-40">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {messages.map((msg) => (
              <tr key={msg.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                  #{msg.id}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                        <User size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{msg.userName}</div>
                      <div className="text-xs text-slate-400 font-mono" title={msg.psid}>
                        {msg.psid.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-1">
                            {getIconForType(msg.attachmentType)}
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                {msg.attachmentType}
                            </span>
                        </div>
                        {renderAttachment(msg)}
                        <div className="text-[10px] text-slate-300 mt-1 font-mono">MID: {msg.fbMid}</div>
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                  {format(msg.createdTime, 'MMM d, h:mm a')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MessageTable;