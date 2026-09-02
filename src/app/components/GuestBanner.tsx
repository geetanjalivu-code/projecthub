import { useAuth } from '../auth/AuthProvider';

export function GuestBanner({ onSignIn }: { onSignIn: () => void }) {
  const { isGuest } = useAuth();
  if (!isGuest) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 mb-5 border border-border bg-muted text-sm text-foreground">
      <span className="flex-1 min-w-[200px]">
        You&apos;re a guest. Work is saved in this browser only. Sign in to keep projects in your account.
      </span>
      <button
        onClick={onSignIn}
        className="px-3 py-1.5 bg-primary text-primary-foreground text-xs hover:bg-neutral-700"
        style={{ fontWeight: 600 }}
      >
        Sign in to save
      </button>
    </div>
  );
}
