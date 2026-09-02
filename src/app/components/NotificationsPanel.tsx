import { useEffect, useRef, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { supabase, isSupabaseConfigured, DbNotification } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const MOCK: DbNotification[] = [
  { id: '1', user_id: 'local', title: 'Welcome to BELEG!', body: 'Connect Supabase to sync projects across devices.', read: false, created_at: new Date().toISOString() },
];

export function NotificationsPanel() {
  const { user } = useAuth();
  const [open, setOpen]   = useState(false);
  const [items, setItems] = useState<DbNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!isSupabaseConfigured || !user || user.id === 'local') {
      setItems(MOCK);
      return;
    }
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setItems((data as DbNotification[]) ?? []);
  };

  useEffect(() => { load(); }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unread = items.filter(n => !n.read).length;

  const markRead = async (id: string) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (isSupabaseConfigured) await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  const markAllRead = async () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })));
    if (isSupabaseConfigured && user) await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded hover:bg-muted text-muted-foreground transition-colors">
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
            style={{ fontSize: '0.6rem', fontWeight: 600 }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>Notifications</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Check size={11} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-0.5">
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</div>
            ) : (
              items.map(n => (
                <div key={n.id}
                  className={`px-4 py-3 border-b border-border last:border-0 flex items-start gap-3 cursor-pointer hover:bg-muted/40 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                  onClick={() => markRead(n.id)}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground" style={{ fontWeight: n.read ? 400 : 600 }}>{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>}
                    <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
