
import React, { useState } from 'react';
import { EventData } from '../types';
import { Icons } from '../constants';

interface AdminPanelProps {
  onAddEvent: (event: Omit<EventData, 'id'>) => void;
  onClose: () => void;
  initialDate?: Date;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onAddEvent, onClose, initialDate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: initialDate ? initialDate.toISOString().split('T')[0] : '',
    time: '09:00',
    durationMinutes: 60,
    location: 'CSE Block',
    room: '',
    resourcesUrl: '',
    imageUrl: 'https://picsum.photos/seed/' + Math.random().toString(36).substring(7) + '/800/400',
    type: 'Other' as EventData['type'],
    reminderMinutes: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;
    onAddEvent(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass rounded-[40px] w-full max-w-xl overflow-hidden border border-adaptive shadow-pro animate-in zoom-in duration-300">
        <div className="p-10 border-b border-adaptive flex justify-between items-center bg-black/5">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-adaptive">Event Protocol</h2>
          <button onClick={onClose} className="p-3 hover:bg-black/10 rounded-2xl transition-all text-adaptive"><Icons.X /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto bg-input">
          <div>
            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">Primary Subject</label>
            <input 
              type="text" required
              className="w-full bg-input border border-adaptive rounded-2xl px-6 py-4 text-sm font-bold focus:ring-1 focus:ring-adaptive outline-none text-adaptive"
              placeholder="System Architecture 101"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">Timestamp</label>
              <input 
                type="date" required
                className="w-full bg-input border border-adaptive rounded-2xl px-6 py-4 text-sm font-bold outline-none text-adaptive"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">Start Clock</label>
              <input 
                type="time" required
                className="w-full bg-input border border-adaptive rounded-2xl px-6 py-4 text-sm font-bold outline-none text-adaptive"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">Duration (Min)</label>
              <input 
                type="number" required
                className="w-full bg-input border border-adaptive rounded-2xl px-6 py-4 text-sm font-bold outline-none text-adaptive"
                value={formData.durationMinutes}
                onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">Classification</label>
              <select 
                className="w-full bg-input border border-adaptive rounded-2xl px-6 py-4 text-sm font-bold outline-none appearance-none text-adaptive"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="Lecture">Lecture</option>
                <option value="Workshop">Workshop</option>
                <option value="Exam">Exam</option>
                <option value="Holiday">Holiday</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ 
              backgroundColor: 'var(--text-primary)', 
              color: 'var(--bg-gradient)' 
            }}
          >
            Authorize Entry
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
