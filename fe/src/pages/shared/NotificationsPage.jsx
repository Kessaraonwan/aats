import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Mail,
  Calendar,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { useState, useEffect } from 'react';

const mockNotifications = [
  { id: 'notif-1', type: 'success', title: 'คุณได้รับเชิญเข้าสัมภาษณ์!', message: 'สำหรับตำแหน่ง Senior Frontend Developer - กรุณาตรวจสอบอีเมลเพื่อดูรายละเอียดและยืนยันนัดหมาย', date: '2025-10-08T10:30:00', read: false, actionLabel: 'ดูรายละเอียด' },
  { id: 'notif-2', type: 'info', title: 'ใบสมัครของคุณกำลังถูกตรวจสอบ', message: 'ทีม HR กำลังพิจารณาใบสมัครของคุณสำหรับตำแหน่ง Backend Developer', date: '2025-10-07T14:20:00', read: false },
  { id: 'notif-3', type: 'email', title: 'อีเมลจากทีม HR', message: 'คุณได้รับอีเมลใหม่เกี่ยวกับการสัมภาษณ์งาน - กรุณาตรวจสอบกล่องจดหมายของคุณ', date: '2025-10-06T09:15:00', read: true },
  { id: 'notif-4', type: 'warning', title: 'เตือน: กำหนดเวลายืนยันการสัมภาษณ์', message: 'กรุณายืนยันการเข้าสัมภาษณ์ภายในวันที่ 10 ตุลาคม 2025', date: '2025-10-05T16:45:00', read: false },
  { id: 'notif-5', type: 'info', title: 'ใบสมัครได้รับการบันทึกแล้ว', message: 'ขอบคุณที่สมัครงานกับเรา ใบสมัครของคุณถูกบันทึกเรียบร้อยแล้ว', date: '2025-10-04T11:00:00', read: true },
  { id: 'notif-6', type: 'success', title: 'ยินดีด้วย! ผ่านการคัดเลือกรอบแรก', message: 'คุณผ่านการคัดเลือกเบื้องต้นสำหรับตำแหน่ง UX/UI Designer', date: '2025-10-03T13:30:00', read: false }
];

export function NotificationsPage({ onBack }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.__mockNotifications) return window.__mockNotifications;
    } catch(e) {}
    return mockNotifications;
  });
  // Rehydrate from window on mount (HMR-safe)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const winNotifs = window.__mockNotifications || mockNotifications;
        const currentIds = Array.isArray(notifications) ? notifications.map(n => n.id).join(',') : '';
        const winIds = Array.isArray(winNotifs) ? winNotifs.map(n => n.id).join(',') : '';
        if (currentIds !== winIds) {
          console.debug('[NotificationsPage] rehydrate from window, count=', winNotifs.length);
          setNotifications(winNotifs);
        } else {
          console.debug('[NotificationsPage] already in sync with window, count=', notifications.length);
        }
      }
    } catch (e) { console.debug('[NotificationsPage] rehydrate error', e); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Persist notifications to window so HMR doesn't clear them
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const windowNotifs = window.__mockNotifications || [];
        const currentIds = Array.isArray(windowNotifs) ? windowNotifs.map(n => n.id).join(',') : '';
        const localIds = Array.isArray(notifications) ? notifications.map(n => n.id).join(',') : '';
        if (currentIds !== localIds) {
          window.__mockNotifications = notifications;
        }
      }
    } catch (e) {}
  }, [notifications]);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="size-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="size-5 text-yellow-600" />;
      case 'email':
        return <Mail className="size-5 text-blue-600" />;
      case 'info':
      default:
        return <Info className="size-5 text-blue-600" />;
    }
  };

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'email':
        return 'bg-blue-50 border-blue-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.max(1, Math.floor(diffInHours * 60));
      return `${diffInMinutes} นาทีที่แล้ว`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} ชั่วโมงที่แล้ว`;
    } else if (diffInHours < 48) {
      return 'เมื่อวาน';
    } else {
      return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-[#234C6A] text-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            onClick={onBack}
            size="sm"
            className="text-white hover:bg-white mb-6"
          >
            <ArrowLeft className="size-4 mr-2" />
            กลับ
          </Button>

          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <Bell className="size-6" />
              </div>
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-6 min-w-6 px-2 flex items-center justify-center"
                >
                  {unreadCount}
                </Badge>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">การแจ้งเตือน</h1>
              <p className="text-blue-100">
                ติดตามข่าวสารและความคืบหน้าของใบสมัครของคุณ
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Actions Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <Tabs value={filter} onValueChange={(v) => setFilter(v)}>
                  <TabsList>
                    <TabsTrigger value="all">ทั้งหมด ({notifications.length})</TabsTrigger>
                    <TabsTrigger value="unread">ยังไม่ได้อ่าน ({unreadCount})</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex gap-2 flex-wrap">
                  {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                      <CheckCircle2 className="size-4 mr-1.5" />
                      อ่านทั้งหมด
                    </Button>
                  )}
                  
                  {notifications.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (window.confirm('คุณต้องการลบการแจ้งเตือนทั้งหมดใช่หรือไม่?')) {
                          setNotifications([]);
                        }
                      }}
                    >
                      <Trash2 className="size-4 mr-1.5" />
                      ลบทั้งหมด
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Bell className="size-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {filter === 'unread' ? 'ไม่มีการแจ้งเตือนใหม่' : 'ไม่มีการแจ้งเตือน'}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {filter === 'unread'
                    ? 'คุณได้อ่านการแจ้งเตือนทั้งหมดแล้ว'
                    : 'เมื่อมีการอัพเดทจะแสดงที่นี่'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`${!notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''} transition-all hover:shadow-md`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationBgColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`text-sm ${!notification.read ? 'font-bold' : 'font-medium'}`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>

                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="size-3.5" />
                                <span>{formatDate(notification.date)}</span>
                              </div>

                              {notification.actionLabel && (
                                <Button 
                                  size="sm" 
                                  variant="link" 
                                  className="h-auto p-0 text-xs" 
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  {notification.actionLabel} →
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 flex-shrink-0">
                            {!notification.read && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                onClick={() => markAsRead(notification.id)} 
                                title="ทำเครื่องหมายว่าอ่านแล้ว"
                              >
                                <CheckCircle2 className="size-4" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-destructive/10"
                              onClick={() => deleteNotification(notification.id)} 
                              title="ลบการแจ้งเตือน"
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Settings Card */}
          <Card className="border-dashed mt-6">
            <CardHeader className="pb-3">
              <h3 className="font-semibold">การตั้งค่าการแจ้งเตือน</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-4 py-2">
                <div className="flex-1">
                  <div className="font-medium text-sm">แจ้งเตือนผ่านอีเมล</div>
                  <p className="text-xs text-muted-foreground mt-0.5">รับการแจ้งเตือนเมื่อมีการอัพเดทสถานะใบสมัคร</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  เปิดใช้งาน
                </Badge>
              </div>

              <div className="flex items-start justify-between gap-4 py-2 border-t">
                <div className="flex-1">
                  <div className="font-medium text-sm">แจ้งเตือนเมื่อมีข้อความใหม่</div>
                  <p className="text-xs text-muted-foreground mt-0.5">รับการแจ้งเตือนเมื่อทีมงานส่งข้อความถึงคุณ</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  เปิดใช้งาน
                </Badge>
              </div>

              <div className="flex items-start justify-between gap-4 py-2 border-t">
                <div className="flex-1">
                  <div className="font-medium text-sm">แจ้งเตือนการนัดหมาย</div>
                  <p className="text-xs text-muted-foreground mt-0.5">รับการแจ้งเตือนล่วงหน้าก่อนถึงเวลานัดสัมภาษณ์</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  เปิดใช้งาน
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
