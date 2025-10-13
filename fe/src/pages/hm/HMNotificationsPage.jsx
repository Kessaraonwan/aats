import { useState, useMemo } from 'react';
import { mockApplications } from '../../data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Bell, BellOff, Clock, CheckCircle2, User, Briefcase, 
  Calendar, TrendingUp, AlertCircle, Mail, Check, X
} from 'lucide-react';

export function HMNotificationsPage({ onNavigate, onReview }) {
  const [selectedTab, setSelectedTab] = useState('all');
  const [readNotifications, setReadNotifications] = useState(new Set());

  // Generate notifications from applications
  const notifications = useMemo(() => {
    const notifs = [];

    // New applicants waiting for evaluation
    const pendingApps = mockApplications.filter(
      app => app.status === 'interview' && !app.evaluation
    );

    pendingApps.forEach(app => {
      const daysSince = Math.floor(
        (new Date() - new Date(app.submittedDate)) / (1000 * 60 * 60 * 24)
      );

      notifs.push({
        id: `pending-${app.id}`,
        type: 'pending',
        priority: daysSince > 7 ? 'high' : daysSince > 3 ? 'medium' : 'normal',
        title: 'ผู้สมัครใหม่รอการประเมิน',
        message: `${app.candidateName} สมัครตำแหน่ง ${app.jobTitle}`,
        timestamp: app.submittedDate,
        action: () => onReview(app.id),
        actionLabel: 'เริ่มประเมิน',
        metadata: {
          candidateName: app.candidateName,
          position: app.jobTitle,
          score: app.preScreeningScore,
          daysSince
        }
      });
    });

    // High score applicants
    const highScoreApps = mockApplications.filter(
      app => app.preScreeningScore >= 85 && app.status === 'interview' && !app.evaluation
    );

    highScoreApps.forEach(app => {
      notifs.push({
        id: `high-score-${app.id}`,
        type: 'important',
        priority: 'high',
        title: 'ผู้สมัครคะแนนสูง',
        message: `${app.candidateName} ได้คะแนนคัดกรอง ${app.preScreeningScore} จาก 100`,
        timestamp: app.submittedDate,
        action: () => onReview(app.id),
        actionLabel: 'ดูโปรไฟล์',
        metadata: {
          candidateName: app.candidateName,
          position: app.jobTitle,
          score: app.preScreeningScore
        }
      });
    });

    // Recently evaluated (informational)
    const recentEvaluated = mockApplications
      .filter(app => app.evaluation)
      .sort((a, b) => new Date(b.evaluation.evaluatedAt) - new Date(a.evaluation.evaluatedAt))
      .slice(0, 5);

    recentEvaluated.forEach(app => {
      notifs.push({
        id: `evaluated-${app.id}`,
        type: 'info',
        priority: 'normal',
        title: 'การประเมินเสร็จสมบูรณ์',
        message: `คุณได้ประเมิน ${app.candidateName} แล้ว (${app.evaluation.overallScore}/5.0)`,
        timestamp: app.evaluation.evaluatedAt,
        action: () => onReview(app.id),
        actionLabel: 'ดูผลประเมิน',
        metadata: {
          candidateName: app.candidateName,
          position: app.jobTitle,
          score: app.evaluation.overallScore,
          recommendation: app.evaluation.hiringRecommendation
        }
      });
    });

    // Sort by timestamp (newest first)
    return notifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [onReview]);

  // Filter notifications by type
  const filteredNotifications = useMemo(() => {
    switch (selectedTab) {
      case 'unread':
        return notifications.filter(n => !readNotifications.has(n.id));
      case 'pending':
        return notifications.filter(n => n.type === 'pending');
      case 'important':
        return notifications.filter(n => n.type === 'important');
      case 'read':
        return notifications.filter(n => readNotifications.has(n.id));
      default:
        return notifications;
    }
  }, [notifications, selectedTab, readNotifications]);

  const unreadCount = notifications.filter(n => !readNotifications.has(n.id)).length;
  const pendingCount = notifications.filter(n => n.type === 'pending').length;
  const importantCount = notifications.filter(n => n.type === 'important').length;

  const markAsRead = (notifId) => {
    setReadNotifications(prev => new Set([...prev, notifId]));
  };

  const markAsUnread = (notifId) => {
    setReadNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(notifId);
      return newSet;
    });
  };

  const markAllAsRead = () => {
    setReadNotifications(new Set(notifications.map(n => n.id)));
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'pending': return <Clock className="size-5 text-yellow-600" />;
      case 'important': return <AlertCircle className="size-5 text-red-600" />;
      case 'info': return <CheckCircle2 className="size-5 text-green-600" />;
      default: return <Bell className="size-5 text-blue-600" />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">สำคัญมาก</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">ปานกลาง</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-2 text-primary">
            <Bell className="size-7" />
            การแจ้งเตือน
          </h1>
          <p className="text-muted-foreground">
            รับการแจ้งเตือนเกี่ยวกับผู้สมัครใหม่และการประเมิน
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="premium-btn premium-btn--outline"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="size-4 mr-2" />
            อ่านทั้งหมด
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="premium-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">ทั้งหมด</p>
                <h3 className="text-2xl font-bold">{notifications.length}</h3>
              </div>
              <Bell className="size-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">ยังไม่ได้อ่าน</p>
                <h3 className="text-2xl font-bold text-blue-600">{unreadCount}</h3>
              </div>
              <Mail className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">รอการประเมิน</p>
                <h3 className="text-2xl font-bold text-yellow-600">{pendingCount}</h3>
              </div>
              <Clock className="size-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">สำคัญ</p>
                <h3 className="text-2xl font-bold text-red-600">{importantCount}</h3>
              </div>
              <AlertCircle className="size-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card className="premium-card">
        <CardHeader>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="gap-2">
                ทั้งหมด
                <Badge variant="secondary" className="text-xs">{notifications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="gap-2">
                ยังไม่ได้อ่าน
                {unreadCount > 0 && (
                  <Badge variant="default" className="text-xs">{unreadCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending" className="gap-2">
                รอประเมิน
                {pendingCount > 0 && (
                  <Badge variant="secondary" className="text-xs">{pendingCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="important" className="gap-2">
                สำคัญ
                {importantCount > 0 && (
                  <Badge variant="destructive" className="text-xs">{importantCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="read">
                อ่านแล้ว
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length > 0 ? (
            <div className="space-y-2">
              {filteredNotifications.map((notif) => {
                const isRead = readNotifications.has(notif.id);
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                      isRead 
                        ? 'bg-muted' 
                        : 'bg-white hover:bg-muted'
                    }`}
                  >
                    {/* Icon */}
                    <div className="mt-1">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{notif.title}</h4>
                          {getPriorityBadge(notif.priority)}
                          {!isRead && (
                            <div className="h-2 w-2 rounded-full bg-blue-600" title="ยังไม่ได้อ่าน" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(notif.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {notif.message}
                      </p>

                      {/* Metadata */}
                      {notif.metadata && (
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                          {notif.metadata.position && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="size-3" />
                              {notif.metadata.position}
                            </span>
                          )}
                          {notif.metadata.score && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="size-3" />
                              คะแนน: {notif.metadata.score}
                            </span>
                          )}
                          {notif.metadata.daysSince && (
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3" />
                              {notif.metadata.daysSince} วันที่แล้ว
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            markAsRead(notif.id);
                            notif.action();
                          }}
                        >
                          {notif.actionLabel}
                        </Button>
                        {!isRead ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notif.id)}
                          >
                            <Check className="size-4 mr-1" />
                            ทำเครื่องหมายว่าอ่านแล้ว
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsUnread(notif.id)}
                          >
                            <X className="size-4 mr-1" />
                            ทำเครื่องหมายว่ายังไม่อ่าน
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BellOff className="size-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">ไม่มีการแจ้งเตือน</h3>
              <p className="text-sm">
                {selectedTab === 'unread' && 'คุณได้อ่านการแจ้งเตือนทั้งหมดแล้ว'}
                {selectedTab === 'pending' && 'ไม่มีผู้สมัครที่รอการประเมิน'}
                {selectedTab === 'important' && 'ไม่มีการแจ้งเตือนที่สำคัญ'}
                {selectedTab === 'read' && 'ยังไม่มีการแจ้งเตือนที่อ่านแล้ว'}
                {selectedTab === 'all' && 'ยังไม่มีการแจ้งเตือนในขณะนี้'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
