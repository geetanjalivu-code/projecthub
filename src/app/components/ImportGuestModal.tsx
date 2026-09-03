export function ImportGuestModal({
  projectCount,
  hasAiKey,
  onImport,
  onLater,
  onDiscard,
}: {
  projectCount: number;
  hasAiKey: boolean;
  onImport: () => void;
  onLater: () => void;
  onDiscard: () => void;
}) {
  const bits: string[] = [];
  if (projectCount > 0) bits.push(`${projectCount} guest project${projectCount === 1 ? '' : 's'}`);
  if (hasAiKey) bits.push('a Hub Guide API key');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/25 backdrop-blur-sm" />
      <div className="relative bg-card border border-border shadow-2xl w-full max-w-md p-6">
        <h3 className="text-foreground mb-2">Copy guest work into this account?</h3>
        <p className="text-sm text-muted-foreground mb-5">
          This browser has {bits.join(' and ')} from a guest session. Guest storage is separate from each signed-in account.
          Import copies it into this account only.
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onDiscard}
            className="px-4 py-2 text-sm border border-border hover:bg-muted">
            Discard guest copy
          </button>
          <button type="button" onClick={onLater}
            className="px-4 py-2 text-sm border border-border hover:bg-muted">
            Keep in guest
          </button>
          <button type="button" onClick={onImport}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-neutral-700"
            style={{ fontWeight: 600 }}>
            Import into this account
          </button>
        </div>
      </div>
    </div>
  );
}
