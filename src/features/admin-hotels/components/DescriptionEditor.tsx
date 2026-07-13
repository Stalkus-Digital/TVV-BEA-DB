import { Bold, Italic, Underline, Strikethrough, AlignLeft, List } from "lucide-react";

interface DescriptionEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

export function DescriptionEditor({ label, value, onChange, rows = 6 }: DescriptionEditorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="border border-border rounded-lg overflow-hidden bg-white">
        {/* Fake Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-slate-50/50">
          <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors" title="Bold">
            <Bold className="h-4 w-4" />
          </button>
          <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors" title="Italic">
            <Italic className="h-4 w-4" />
          </button>
          <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors" title="Underline">
            <Underline className="h-4 w-4" />
          </button>
          <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors" title="Strikethrough">
            <Strikethrough className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors" title="Align Left">
            <AlignLeft className="h-4 w-4" />
          </button>
          <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors" title="Bullet List">
            <List className="h-4 w-4" />
          </button>
        </div>
        
        {/* Text Area */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full p-4 resize-y outline-none text-sm leading-relaxed"
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      </div>
    </div>
  );
}
