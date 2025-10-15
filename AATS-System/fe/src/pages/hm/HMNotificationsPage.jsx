import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Bell,
  BellOff,
  Clock,
  CheckCircle2,
  Users,
  Briefcase,
  Calendar,
  Mail,
  Check,
  X,
} from 'lucide-react';
import { useRecruitmentData } from '../../hooks/useRecruitmentData';

const formatDate = (value) => {
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

export function HMNotificationsPage({ onNavigate, onReview }) {
  const {
    applications,
    details,
    loading,
    error,
    refresh,
  } = useRecruitmentData({ includeDetails: true });

  const [selectedTab, setSelectedTab] = useState('all');
  const [readSet, setReadSet] = useState(new Set());

  const notifications = useMemo(() => {
    const items = [];
    applications.forEach((app) => {
      const detail = details[app.id];
      const applicant = detail?.applicant;
      const job = detail?.job;
      const evaluation = detail?.evaluation;

      const candidateName = applicant?.name || 'ไม่ระบุ';
      const jobTitle = job?.title || job?.Title || '-';

      if (app.status === 'interview' && !evaluation) {
        items.push({
          id: `pending-${app.id}`,
          type: 'pending',
          priority: 'high',
          title: 'ผู้สมัครรอการประเมิน',
          message: `${candidateName} (${jobTitle}) กำลังรอการประเมิน`,
          timestamp: app.submittedDate || new Date(),
          actionLabel: 'เริ่มประเมิน',
          onAction: () => onReview?.(app.id),
          meta: {
            candidateName,
            jobTitle,
          },
        });
      }

      if (evaluation) {
        items.push({
          id: `evaluated-${app.id}`,
          type: 'info',
          priority: 'normal',
          title: 'การประเมินเสร็จสมบูรณ์',
          message: `${candidateName} ได้รับคะแนน ${evaluation.overallScore}/5`,
          timestamp: evaluation.evaluatedAt ? new Date(evaluation.evaluatedAt) : new Date(),
          actionLabel: 'ดูรายละเอียด',
          onAction: () => onReview?.(app.id),
          meta: {
            candidateName,
            jobTitle,
            evaluator: evaluation.evaluatorName,
          },
        });
      }
    });

    return items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [applications, details, onReview]);

  const filteredNotifications = useMemo(() => {
    switch (selectedTab) {
      case 'unread':
        return notifications.filter((n) => !readSet.has(n.id));
      case 'pending':
        return notifications.filter((n) => n.type === 'pending');
      case 'info':
        return notifications.filter((n) => n.type === 'info');
      case 'read':
        return notifications.filter((n) => readSet.has(n.id));
      default:
        return notifications;
    }
  }, [notifications, selectedTab, readSet]);

  const markAsRead = (id) => {
    setReadSet((prev) => new Set([...prev, id]));
  };

  const markAsUnread = (id) => {
    setReadSet((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
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

  const unreadCount = notifications.filter((n) => !readSet.has(n.id)).length;
  const pendingCount = notifications.filter((n) => n.type === 'pending').length;
  const infoCount = notifications.filter((n) => n.type === 'info').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">การแจ้งเตือน</h1>
          <p className="text-muted-foreground">ติดตามผู้สมัครที่ต้องการความสนใจจากคุณ</p>
        </div>
      </div>

      <Card className="premium-card">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="all">ทั้งหมด ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">ยังไม่อ่าน ({unreadCount})</TabsTrigger>
            <TabsTrigger value="pending">รอดำเนินการ ({pendingCount})</TabsTrigger>
            <TabsTrigger value="info">ข้อมูล ({infoCount})</TabsTrigger>
            <TabsTrigger value="read">อ่านแล้ว ({readSet.size})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            {filteredNotifications.length ? (
              filteredNotifications.map((notif) => {
                const isRead = readSet.has(notif.id);
                // color classes per type
                const typeAccent = notif.type === 'pending' ? 'amber' : 'sky';
                const leftBorder = notif.type === 'pending' ? 'border-l-4 border-amber-400' : 'border-l-4 border-sky-400';
                const bgUnread = !isRead ? (notif.type === 'pending' ? 'bg-amber-50/40' : 'bg-sky-50/18') : '';
                const badgeClass = notif.type === 'pending' ? 'bg-amber-600 text-white' : 'bg-sky-600 text-white';
                const actionClass = notif.type === 'pending' ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-sky-600 text-white hover:bg-sky-700';
                return (
                  <Card key={notif.id} className={`${leftBorder} ${bgUnread} ${isRead ? '' : 'shadow-sm'}`}>
                    <CardContent className="py-5">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded ${badgeClass} text-xs font-medium`}>{notif.type === 'pending' ? 'ต้องดำเนินการ' : 'ข้อมูล'}</span>
                            {!isRead && <span className="text-xs text-primary">ใหม่</span>}
                          </div>
                          <h3 className="text-lg font-semibold">{notif.title}</h3>
                          <p className="text-sm text-muted-foreground">{notif.message}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3" /> {formatDate(notif.timestamp)}
                            </span>
                            {notif.meta?.jobTitle && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="size-3" /> {notif.meta.jobTitle}
                              </span>
                            )}
                            {notif.meta?.candidateName && (
                              <span className="flex items-center gap-1">
                                <Users className="size-3" /> {notif.meta.candidateName}
                              </span>
                            )}
                            {notif.meta?.evaluator && (
                              <span className="flex items-center gap-1">
                                <Mail className="size-3" /> {notif.meta.evaluator}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            className={`${actionClass} px-3`}
                            onClick={() => {
                              markAsRead(notif.id);
                              notif.onAction?.();
                            }}
                            size="sm"
                          >
                            {notif.actionLabel}
                          </Button>
                          {!isRead ? (
                            <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)}>
                              <Check className="size-4 mr-1" /> ทำเครื่องหมายว่าอ่านแล้ว
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => markAsUnread(notif.id)}>
                              <X className="size-4 mr-1" /> ทำเครื่องหมายว่ายังไม่อ่าน
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BellOff className="size-16 mx-auto mb-4 opacity-50" />
                <p>ไม่มีการแจ้งเตือนในหมวดนี้</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
