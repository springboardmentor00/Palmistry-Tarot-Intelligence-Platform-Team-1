'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth, useAuthedFetch } from '@/components/auth/auth-provider';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const authedFetch = useAuthedFetch();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const res = await authedFetch('/api/notifications');
        if (res.ok) setNotifications(await res.json());
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifs();
    // Optional: Poll every 30 seconds for new alerts
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user, authedFetch]);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await authedFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="relative h-9 w-9 hover:bg-secondary/40">
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-border/50 flex items-center justify-between bg-secondary/20">
            <h3 className="font-display font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-xs">
                You're all caught up!
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-3.5 border-b border-border/40 hover:bg-secondary/30 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {n.type === 'system' ? (
                        <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className={`text-sm ${!n.isRead ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </div>
                    {!n.isRead && (
                      <button 
                        onClick={(e) => markAsRead(n.id, e)}
                        className="text-[10px] font-medium text-primary hover:underline whitespace-nowrap shrink-0"
                      >
                        Mark read
                      </button>
                    )}
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