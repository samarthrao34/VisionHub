import React from 'react';
import { Icons } from '../constants';
import { KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardNavigation';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass rounded-3xl w-full max-w-md overflow-hidden border border-adaptive shadow-pro animate-in zoom-in duration-200">
        <div className="p-6 border-b border-adaptive flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icons.Keyboard />
            <h2 className="text-lg font-black uppercase tracking-tight text-adaptive">Keyboard Shortcuts</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-black/10 rounded-xl transition-all text-adaptive"
            aria-label="Close"
          >
            <Icons.X />
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-3">
            {KEYBOARD_SHORTCUTS.map(({ key, description }) => (
              <div 
                key={key} 
                className="flex items-center justify-between py-2 border-b border-adaptive last:border-0"
              >
                <span className="text-sm text-muted">{description}</span>
                <kbd className="px-3 py-1.5 bg-white/5 border border-adaptive rounded-lg text-xs font-mono font-bold text-adaptive">
                  {key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
