import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Mail,
  Calendar,
  Trash2,
  Check,
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { authService } from '../../services/authService';

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function NotificationsPage({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const user = authService.getUserData();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await notificationService.getAggregated({ userId: user?.id });
        if (!cancelled) setNotifications(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'ไม่สามารถโหลดการแจ้งเตือนได้');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshTrigger]);

  const refresh = () => setRefreshTrigger((t) => t + 1);

  const [filter, setFilter] = useState('all');
  // persist read ids in localStorage per user
  const READ_KEY = `notifs_read_${user?.id || 'anon'}`;
  const [readSet, setReadSet] = useState(() => {
    try {
      const raw = localStorage.getItem(READ_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(READ_KEY, JSON.stringify([...readSet]));
    } catch {}
  }, [readSet]);

  // notifications are now fetched from backend aggregated endpoint
  const filteredNotifications = useMemo(() => {
    const list = notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      timestamp: new Date(n.timestamp * 1000),
      raw: n,
    }));
    return list
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);
  }, [notifications]);

  const filteredNotificationsByTab = useMemo(() => {
    switch (filter) {
      case 'unread':
        return filteredNotifications.filter((n) => !readSet.has(n.id));
      case 'read':
        return filteredNotifications.filter((n) => readSet.has(n.id));
      case 'info':
        return filteredNotifications.filter((n) => n.type === 'info');
      case 'success':
        return filteredNotifications.filter((n) => n.type === 'success');
      default:
        return filteredNotifications;
    }
  }, [filteredNotifications, filter, readSet]);

  const markAsRead = (id) => {
    setReadSet((prev) => {
      const s = new Set(prev);
      s.add(id);
      try { localStorage.setItem(READ_KEY, JSON.stringify([...s])); } catch {}
      try { window.dispatchEvent(new Event('notifs:updated')); } catch {}
      return s;
    });
  };

  const deleteNotification = (id) => {
    // สำหรับตอนนี้แค่ซ่อนจาก UI โดยเพิ่มเข้า readSet
    markAsRead(id);
    // notify others (badge etc.)
    try { window.dispatchEvent(new Event('notifs:updated')); } catch {}
  };

  const markAllAsRead = () => {
    const allIds = filteredNotifications.map(n => n.id);
    setReadSet((prev) => {
      const s = new Set(prev);
      allIds.forEach(id => s.add(id));
      try { localStorage.setItem(READ_KEY, JSON.stringify([...s])); } catch {}
      try { window.dispatchEvent(new Event('notifs:updated')); } catch {}
      return s;
    });
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="size-5 text-green-600" />;
      case 'info':
        return <Info className="size-5 text-blue-600" />;
      default:
        return <AlertCircle className="size-5 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3 text-muted-foreground">
        <p>กำลังโหลดการแจ้งเตือน...</p>
        <Button variant="outline" size="sm" disabled>
          กำลังโหลด
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
        <p className="text-red-600">{error}</p>
        <Button onClick={refresh}>ลองอีกครั้ง</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">การแจ้งเตือน</h1>
          <p className="text-muted-foreground">ติดตามสถานะใบสมัครและการประเมินล่าสุด</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={markAllAsRead} className="gap-2">
            ทำเครื่องหมายว่าอ่านทั้งหมด
          </Button>
          <Button variant="outline" onClick={onBack} className="gap-2">
            <Calendar className="size-4" /> กลับ
          </Button>
        </div>
      </div>

      <Card className="premium-card">
        <Tabs value={filter} onValueChange={setFilter} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
            <TabsTrigger value="unread">ยังไม่อ่าน</TabsTrigger>
            <TabsTrigger value="info">อัปเดตสถานะ</TabsTrigger>
            <TabsTrigger value="success">การประเมิน</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-4">
            {filteredNotificationsByTab.length ? (
              filteredNotificationsByTab.map((notif) => {
                const isRead = readSet.has(notif.id);
                return (
                  <Card key={notif.id} className={isRead ? '' : 'border-primary/30'}>
                    <CardContent className="py-5">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">{renderIcon(notif.type)}</div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{notif.title}</h3>
                              {!isRead && <Badge variant="outline" className="text-xs text-primary border-primary">ใหม่</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{notif.message}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="size-3" /> {formatDateTime(notif.timestamp)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isRead && (
                            <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)} className="gap-1">
                              <Check className="size-4" /> ทำเครื่องหมายว่าอ่านแล้ว
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => deleteNotification(notif.id)} className="text-destructive">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="size-12 mx-auto mb-4 opacity-50" />
                <p>ไม่มีการแจ้งเตือนในหมวดนี้</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
