import React, { useState, useRef, useMemo } from 'react';
import { Palette, X, Search, Upload } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SvgPickerProps {
  currentIcon: string;
  currentSvgContent?: string;
  accentColor: string;
  onSelect: (icon: string, svgContent?: string) => void;
  onClose: () => void;
}

const COMMON_ICONS = [
  'Phone', 'IdCard', 'User', 'CalendarCheck', 'Fingerprint', 'Compass', 'Database', 'Percent',
  'Mail', 'Award', 'MessageSquare', 'Scale', 'BookOpen', 'FileText', 'Globe', 'UserMinus',
  'MinusCircle', 'Eye', 'Sparkles', 'GitBranch', 'ClipboardList', 'Map', 'QrCode', 'HardDrive',
  'FileSpreadsheet', 'Users', 'HelpCircle', 'Home', 'Calculator', 'Coins', 'FolderOpen', 'Cloud',
  'Clock', 'List', 'DollarSign', 'Table', 'UserCheck', 'CreditCard', 'BarChart', 'GraduationCap',
  'Presentation', 'Book', 'TrendingUp', 'Briefcase', 'Search', 'Settings', 'Activity', 'AlertCircle',
  'CheckCircle', 'ExternalLink', 'Gift', 'Palette', 'Star', 'Heart', 'Flag', 'Bell', 'Camera',
  'Download', 'Upload', 'RotateCcw', 'Lock', 'Unlock', 'Key', 'Shield', 'Zap', 'Sun', 'Moon',
  'AlertTriangle', 'Info', 'Plus', 'X', 'Check', 'Edit3', 'Link', 'Paperclip', 'Image'
];

export function SvgPicker({ currentIcon, currentSvgContent, accentColor, onSelect, onClose }: SvgPickerProps) {
  const [tab, setTab] = useState<'icons' | 'custom'>('icons');
  const [search, setSearch] = useState('');
  const [customSvg, setCustomSvg] = useState(currentSvgContent || '');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return COMMON_ICONS;
    const q = search.toLowerCase();
    return COMMON_ICONS.filter(n => n.toLowerCase().includes(q))
      .concat(
        Object.keys(LucideIcons).filter(k =>
          k.toLowerCase().includes(q) && !COMMON_ICONS.includes(k)
        )
      );
  }, [search]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.svg')) {
      setMessage('Please select an .svg file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const svgText = ev.target?.result as string;
      if (svgText.includes('<svg') || svgText.includes('<SVG')) {
        setCustomSvg(svgText);
        setMessage('SVG loaded successfully');
      } else {
        setMessage('File does not contain valid SVG markup');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-850 rounded-2xl text-sm overflow-hidden"
        style={{ zIndex: 100 }}
      >
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-800">
          <Palette size={16} className="text-cyan-400" />
          <h3 className="font-extrabold text-white text-base">Choose Icon</h3>
          <div className="flex ml-auto gap-1 bg-slate-800 rounded-full p-0.5">
            <button
              onClick={() => setTab('icons')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${tab === 'icons' ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >Icons</button>
            <button
              onClick={() => setTab('custom')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${tab === 'custom' ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >Custom SVG</button>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        {tab === 'icons' && (
          <div className="p-4">
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-slate-200 outline-none focus:border-cyan-500 text-xs"
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-8 gap-2 max-h-60 overflow-y-auto pr-1">
              {filteredIcons.slice(0, 160).map((iconName) => {
                const IconComp = (LucideIcons as any)[iconName];
                if (!IconComp) return null;
                const isSelected = iconName === currentIcon && !currentSvgContent;
                return (
                  <button
                    key={iconName}
                    onClick={() => onSelect(iconName)}
                    className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl transition ${
                      isSelected
                        ? 'bg-cyan-900/50 border border-cyan-500/40'
                        : 'hover:bg-slate-800 border border-transparent'
                    }`}
                    title={iconName}
                  >
                    <IconComp size={18} style={{ color: isSelected ? accentColor : '#94a3b8' }} />
                    <span className="text-[7px] text-slate-500 truncate w-full text-center leading-tight">{iconName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'custom' && (
          <div className="p-4 flex flex-col gap-3">
            <div>
              <label className="block text-xs text-slate-400 font-bold mb-1">Paste SVG code</label>
              <textarea
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 outline-none focus:border-cyan-500 font-mono text-xs min-h-[120px] resize-y"
                placeholder={`<svg viewBox="0 0 24 24" ...>...</svg>`}
                value={customSvg}
                onChange={(e) => setCustomSvg(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition flex items-center gap-2"
              >
                <Upload size={12} />
                Upload .svg file
              </button>
              <input ref={fileInputRef} type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />
              <button
                onClick={() => { setCustomSvg(''); setMessage('Cleared'); }}
                className="px-3 py-2 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition"
              >
                Clear
              </button>
            </div>

            {customSvg && (
              <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/50 flex items-center gap-3">
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: customSvg }}
                  style={{ color: accentColor }}
                />
                <span className="text-[10px] text-slate-500 font-mono break-all">{customSvg.length} chars</span>
              </div>
            )}

            {message && (
              <p className={`text-[11px] ${message.includes('Error') || message.includes('not') ? 'text-rose-400' : 'text-emerald-400'}`}>
                {message}
              </p>
            )}

            <div className="flex gap-2.5 justify-end mt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded-full text-xs font-semibold text-slate-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (customSvg.trim() && (customSvg.includes('<svg') || customSvg.includes('<SVG'))) {
                    onSelect('', customSvg.trim());
                  } else if (!customSvg.trim()) {
                    setMessage('Please paste SVG code or upload an .svg file');
                  } else {
                    setMessage('Invalid SVG markup — must contain <svg> tag');
                  }
                }}
                className="px-5 py-2 bg-gradient-to-tr from-cyan-600 to-indigo-600 hover:opacity-90 rounded-full text-xs font-extrabold text-white transition shadow-lg shadow-cyan-900/20"
              >
                Apply SVG
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}