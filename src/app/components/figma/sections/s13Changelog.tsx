import { useState } from 'react';
import { useStore } from '../store';
import { PageHeader, BtnPrimary } from '../components/ui';
import { LogChangeModal } from '../components/LogChangeModal';
import { ChangelogEntry } from '../types';
import { Plus } from 'lucide-react';

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  MAJOR: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30' },
  MINOR: { bg: 'bg-primary/10',     text: 'text-primary',     border: 'border-primary/30' },
  PATCH: { bg: 'bg-success/10',     text: 'text-success',     border: 'border-success/30' },
  INFO:  { bg: 'bg-muted',          text: 'text-muted-foreground', border: 'border-border' },
};

type Filter = 'All' | 'MAJOR' | 'MINOR' | 'PATCH' | 'INFO';

export function S13Changelog() {
  const { currentProject } = useStore();
  const [showLog, setShowLog] = useState(false);
  const [filter, setFilter]   = useState<Filter>('All');

  if (!currentProject) return null;

  const changelog = currentProject.changelog ?? [];
  const filtered  = filter === 'All' ? changelog : changelog.filter(e => e.type === filter);

  const FILTERS: Filter[] = ['All', 'MAJOR', 'MINOR', 'PATCH', 'INFO'];

  return (
    <div>
      <div className="flex items-start justify-between mb-7 pb-5 border-b border-border">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">13</p>
          <h2 className="text-foreground mb-1">Changelog</h2>
          <p className="text-sm text-muted-foreground">Track every design decision and version increment.</p>
        </div>
        <BtnPrimary onClick={() => setShowLog(true)}>
          <Plus size={14} /> Log design change
        </BtnPrimary>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {(['MAJOR','MINOR','PATCH','INFO'] as const).map(type => {
          const count = changelog.filter(e => e.type === type).length;
          const s = TYPE_STYLES[type];
          return (
            <div key={type} className={`border rounded p-4 text-center ${s.bg} ${s.border}`}>
              <p className={`text-2xl ${s.text}`} style={{ fontWeight: 600 }}>{count}</p>
              <p className={`text-xs mt-0.5 ${s.text}`}>{type}</p>
            </div>
          );
        })}
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'
            }`}>
            {f} {f !== 'All' && `(${changelog.filter(e => e.type === f).length})`}
          </button>
        ))}
      </div>

      {/* Entries */}
      {filtered.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded">
          <p className="text-muted-foreground mb-2">No changelog entries yet.</p>
          <p className="text-xs text-muted-foreground">Status and phase changes are logged automatically. Use "Log design change" to add a version bump.</p>
        </div>
      )}

      <div className="relative">
        {/* Timeline line */}
        {filtered.length > 0 && (
          <div className="absolute left-[1.6rem] top-0 bottom-0 w-px bg-border" />
        )}

        <div className="space-y-3">
          {filtered.map((entry, i) => {
            const s = TYPE_STYLES[entry.type] ?? TYPE_STYLES['INFO'];
            const isVersion = entry.type !== 'INFO';
            return (
              <div key={entry.id} className="flex gap-4 relative">
                {/* Timeline dot */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-3 relative z-10 ${
                  isVersion ? 'border-primary bg-primary' : 'border-border bg-card'
                }`}>
                  {isVersion && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                </div>

                {/* Entry card */}
                <div className={`flex-1 bg-card border rounded p-4 ${s.border}`}>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                      {entry.type}
                    </span>
                    {isVersion && (
                      <span className="text-xs px-2 py-0.5 bg-muted border border-border rounded text-muted-foreground">
                        {entry.version}
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded border border-border bg-muted text-muted-foreground">
                      {entry.category}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">{entry.date}</span>
                  </div>
                  <p className="text-sm text-foreground">{entry.description}</p>
                  {entry.screens && entry.screens !== '—' && (
                    <p className="text-xs text-muted-foreground mt-1">Screens: {entry.screens}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showLog && <LogChangeModal onClose={() => setShowLog(false)} />}
    </div>
  );
}
