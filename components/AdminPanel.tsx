
import React, { useState, useEffect } from 'react';
import { EventData, RecurrenceRule } from '../types';
import { Icons, CUSTOM_COLORS } from '../constants';

interface AdminPanelProps {
  onAddEvent: (event: Omit<EventData, 'id'>) => { success: boolean; conflict?: EventData };
  onUpdateEvent?: (id: string, updates: Partial<EventData>) => { success: boolean; conflict?: EventData };
  onDeleteEvent?: (id: string) => void;
  onClose: () => void;
  initialDate?: Date;
  editEvent?: EventData; // If provided, we're editing
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onAddEvent, 
  onUpdateEvent,
  onDeleteEvent,
  onClose, 
  initialDate,
  editEvent 
}) => {
  const [formData, setFormData] = useState({
    title: editEvent?.title || '',
    description: editEvent?.description || '',
    date: editEvent?.date || (initialDate ? initialDate.toISOString().split('T')[0] : ''),
    time: editEvent?.time || '09:00',
    durationMinutes: editEvent?.durationMinutes || 60,
    location: editEvent?.location || 'CSE Block',
    room: editEvent?.room || '',
    resourcesUrl: editEvent?.resourcesUrl || '',
    imageUrl: editEvent?.imageUrl || 'https://picsum.photos/seed/' + Math.random().toString(36).substring(7) + '/800/400',
    type: (editEvent?.type || 'Other') as EventData['type'],
    reminderMinutes: editEvent?.reminderMinutes || 0,
    color: editEvent?.color || '',
    recurrence: editEvent?.recurrence || null as RecurrenceRule | null,
  });

  const [showRecurrence, setShowRecurrence] = useState(!!editEvent?.recurrence);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<EventData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditing = !!editEvent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;

    const eventData = {
      ...formData,
      recurrence: showRecurrence ? formData.recurrence : undefined,
      color: formData.color || undefined,
    };

    let result;
    if (isEditing && onUpdateEvent) {
      result = onUpdateEvent(editEvent.id, eventData);
    } else {
      result = onAddEvent(eventData);
    }

    if (result.success) {
      onClose();
    } else if (result.conflict) {
      setConflictWarning(result.conflict);
    }
  };

  const handleDelete = () => {
    if (editEvent && onDeleteEvent) {
      onDeleteEvent(editEvent.id);
      onClose();
    }
  };

  const updateRecurrence = (updates: Partial<RecurrenceRule>) => {
    setFormData(prev => ({
      ...prev,
      recurrence: {
        frequency: 'weekly',
        interval: 1,
        ...(prev.recurrence || {}),
        ...updates,
      } as RecurrenceRule,
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass rounded-[40px] w-full max-w-xl overflow-hidden border border-adaptive shadow-pro animate-in zoom-in duration-300">
        <div className="p-8 md:p-10 border-b border-adaptive flex justify-between items-center bg-black/5">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-adaptive">
            {isEditing ? 'Edit Event' : 'Event Protocol'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-black/10 rounded-2xl transition-all text-adaptive"
            aria-label="Close"
          >
            <Icons.X />
          </button>
        </div>

        {conflictWarning && (
          <div className="mx-10 mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-wider mb-1">
              <Icons.Bell />
              Schedule Conflict
            </div>
            <p className="text-xs text-muted">
              This time conflicts with "{conflictWarning.title}" at {conflictWarning.time}
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar bg-input">
          <div>
            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">
              Primary Subject
            </label>
            <input 
              type="text" 
              required
              className="w-full bg-input border border-adaptive rounded-2xl px-6 py-4 text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none text-adaptive transition-all"
              placeholder="System Architecture 101"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              aria-label="Event title"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">
              Description
            </label>
            <textarea 
              className="w-full bg-input border border-adaptive rounded-2xl px-6 py-4 text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none text-adaptive transition-all resize-none h-24"
              placeholder="Event details..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              aria-label="Event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">
                Timestamp
              </label>
              <input 
                type="date" 
                required
                className="w-full bg-input border border-adaptive rounded-2xl px-6 py-4 text-sm font-bold outline-none text-adaptive"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                aria-label="Event date"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">
                Start Clock
              </label>
              <input 
                type="time" 
                required
                className="w-full bg-input border border-adaptive rounded-2xl px-6 py-4 text-sm font-bold outline-none text-adaptive"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                aria-label="Event time"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">
                Duration (Min)
              </label>
              <input 
                type="number" 
                required
                min="15"
                step="15"
                className="w-full bg-input border border-adaptive rounded-2xl px-6 py-4 text-sm font-bold outline-none text-adaptive"
                value={formData.durationMinutes}
                onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })}
                aria-label="Duration in minutes"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">
                Classification
              </label>
              <select 
                className="w-full bg-input border border-adaptive rounded-2xl px-6 py-4 text-sm font-bold outline-none appearance-none text-adaptive"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as EventData['type'] })}
                aria-label="Event type"
              >
                <option value="Lecture">Lecture</option>
                <option value="Workshop">Workshop</option>
                <option value="Exam">Exam</option>
                <option value="Holiday">Holiday</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">
                Location
              </label>
              <input 
                type="text"
                className="w-full bg-input border border-adaptive rounded-2xl px-6 py-4 text-sm font-bold outline-none text-adaptive"
                placeholder="CSE Block"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                aria-label="Location"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">
                Room
              </label>
              <input 
                type="text"
                className="w-full bg-input border border-adaptive rounded-2xl px-6 py-4 text-sm font-bold outline-none text-adaptive"
                placeholder="Lab 402"
                value={formData.room}
                onChange={e => setFormData({ ...formData, room: e.target.value })}
                aria-label="Room"
              />
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">
              Reminder
            </label>
            <select 
              className="w-full bg-input border border-adaptive rounded-2xl px-6 py-4 text-sm font-bold outline-none appearance-none text-adaptive"
              value={formData.reminderMinutes}
              onChange={e => setFormData({ ...formData, reminderMinutes: parseInt(e.target.value) })}
              aria-label="Reminder"
            >
              <option value="0">No reminder</option>
              <option value="5">5 minutes before</option>
              <option value="15">15 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
            </select>
          </div>

          {/* Custom Color */}
          <div>
            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">
              Custom Color
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-2 px-4 py-3 glass rounded-xl text-xs font-bold hover:bg-white/5 transition-all"
              >
                <div 
                  className="w-4 h-4 rounded-full border border-adaptive"
                  style={{ backgroundColor: formData.color || 'transparent' }}
                />
                <span className="text-adaptive">
                  {formData.color ? 'Change Color' : 'Pick Color'}
                </span>
              </button>
              {formData.color && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, color: '' })}
                  className="text-xs text-red-500 font-bold hover:text-red-400"
                >
                  Clear
                </button>
              )}
            </div>
            {showColorPicker && (
              <div className="mt-3 flex flex-wrap gap-2 p-4 glass rounded-xl animate-in fade-in">
                {CUSTOM_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, color });
                      setShowColorPicker(false);
                    }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      formData.color === color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recurrence */}
          <div>
            <button
              type="button"
              onClick={() => setShowRecurrence(!showRecurrence)}
              className="flex items-center gap-2 text-xs font-black text-muted uppercase tracking-wider hover:text-adaptive transition-colors"
            >
              <Icons.Repeat />
              <span>{showRecurrence ? 'Remove Recurrence' : 'Add Recurrence'}</span>
            </button>
            
            {showRecurrence && (
              <div className="mt-4 p-4 glass rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-muted uppercase tracking-widest mb-1">
                      Frequency
                    </label>
                    <select 
                      className="w-full bg-input border border-adaptive rounded-xl px-4 py-3 text-xs font-bold outline-none text-adaptive"
                      value={formData.recurrence?.frequency || 'weekly'}
                      onChange={e => updateRecurrence({ frequency: e.target.value as RecurrenceRule['frequency'] })}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-muted uppercase tracking-widest mb-1">
                      Interval
                    </label>
                    <input 
                      type="number"
                      min="1"
                      className="w-full bg-input border border-adaptive rounded-xl px-4 py-3 text-xs font-bold outline-none text-adaptive"
                      value={formData.recurrence?.interval || 1}
                      onChange={e => updateRecurrence({ interval: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-muted uppercase tracking-widest mb-1">
                    End Date (Optional)
                  </label>
                  <input 
                    type="date"
                    className="w-full bg-input border border-adaptive rounded-xl px-4 py-3 text-xs font-bold outline-none text-adaptive"
                    value={formData.recurrence?.endDate || ''}
                    onChange={e => updateRecurrence({ endDate: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            {isEditing && onDeleteEvent && (
              <>
                {showDeleteConfirm ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-3 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-red-600 transition-colors"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-3 glass rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-white/5 text-adaptive"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-3 glass rounded-2xl font-black text-xs uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <Icons.Trash />
                    Delete
                  </button>
                )}
              </>
            )}
            
            <button 
              type="submit"
              className="flex-1 py-4 md:py-5 rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ 
                backgroundColor: 'var(--text-primary)', 
                color: 'var(--input-bg)' 
              }}
            >
              {isEditing ? 'Update Event' : 'Authorize Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
