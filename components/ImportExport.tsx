import React, { useState, useRef } from 'react';
import { Icons } from '../constants';
import { EventData } from '../types';

interface ImportExportProps {
  onImport: (data: string) => { success: boolean; count: number; error?: string };
  onExport: () => string;
}

const ImportExport: React.FC<ImportExportProps> = ({ onImport, onExport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = onExport();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visionhub-events-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = onImport(content);
      
      if (result.success) {
        setImportSuccess(`Successfully imported ${result.count} events`);
        setImportError(null);
        setTimeout(() => setImportSuccess(null), 3000);
      } else {
        setImportError(result.error || 'Failed to import events');
        setImportSuccess(null);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleICSImport = () => {
    // TODO: Implement ICS parsing
    setImportError('ICS import coming soon!');
    setTimeout(() => setImportError(null), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 glass rounded-full hover:bg-white/5 transition-all text-adaptive"
        aria-label="Import/Export events"
        aria-expanded={isOpen}
      >
        <Icons.Download />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 glass-dark rounded-2xl p-4 shadow-pro z-50 border border-adaptive animate-in fade-in slide-in-from-top-2">
            <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-4">
              Import / Export
            </div>

            {importError && (
              <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[10px] font-bold">
                {importError}
              </div>
            )}

            {importSuccess && (
              <div className="mb-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-[10px] font-bold">
                {importSuccess}
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-3 px-4 py-3 glass rounded-xl hover:bg-white/5 transition-all"
              >
                <Icons.Download />
                <div className="text-left">
                  <div className="text-xs font-black text-adaptive">Export JSON</div>
                  <div className="text-[9px] text-muted">Download all events</div>
                </div>
              </button>

              <label className="w-full flex items-center gap-3 px-4 py-3 glass rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                <Icons.Upload />
                <div className="text-left">
                  <div className="text-xs font-black text-adaptive">Import JSON</div>
                  <div className="text-[9px] text-muted">Load from file</div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleICSImport}
                className="w-full flex items-center gap-3 px-4 py-3 glass rounded-xl hover:bg-white/5 transition-all opacity-50"
              >
                <Icons.Calendar />
                <div className="text-left">
                  <div className="text-xs font-black text-adaptive">Import ICS</div>
                  <div className="text-[9px] text-muted">Coming soon</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImportExport;
