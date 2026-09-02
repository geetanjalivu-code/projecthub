import { Project } from '../types';

export function ImportGuestModal({
  count,
  onImport,
  onDiscard,
}: {
  count: number;
  onImport: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/25 backdrop-blur-sm" />
      <div className="relative bg-card border border-border shadow-2xl w-full max-w-md p-6">
        <h3 className="text-foreground mb-2">Import guest work?</h3>
        <p className="text-sm text-muted-foreground mb-5">
          You have {count} unsaved guest project{count === 1 ? '' : 's'} on this device.
          Import them into this account, or discard them. Guest storage will be cleared either way.
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onDiscard}
            className="px-4 py-2 text-sm border border-border hover:bg-muted">
            Discard
          </button>
          <button type="button" onClick={onImport}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-neutral-700"
            style={{ fontWeight: 600 }}>
            Import into account
          </button>
        </div>
      </div>
    </div>
  );
}

export type { Project };
