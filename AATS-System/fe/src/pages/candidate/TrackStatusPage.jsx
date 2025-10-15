import { useEffect, useState } from 'react';
import { StatusTimeline } from '../../components/candidate';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import notificationService from '../../services/notificationService';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  FileText, 
  Mail, 
  Phone, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell,
  Download,
  MessageSquare
} from 'lucide-react';
// Removed unused type imports

export function TrackStatusPage({ user, onNavigateToNotifications }) {
  const [userApplications, setUserApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // โหลดใบสมัครของผู้ใช้จาก API
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true); setError('');
      try {
        const res = await applicationService.getApplications();
        // Backend may return either a plain application object or a wrapper
        // { application, meta, raw }. Normalize both shapes here so the UI
        // consistently sees: id, jobId, status, submittedDate, jobTitle, notes, timeline
        const rawList = (res?.apps || res?.data || []);
        const apps = rawList.map((entry) => {
          // If server returned a wrapper, prefer the inner application object
          const a = entry && entry.application ? entry.application : entry || {};
          const meta = entry && (entry.meta || entry.raw || {});
          return {
            id: a.id || a.ID || '',
            jobId: a.job_id || a.JobID || a.JobId || '',
            status: (a.status || a.Status || '').toString().toLowerCase(),
            submittedDate: a.submitted_date || a.SubmittedDate || a.submittedDate || null,
            jobTitle: meta.job_title || meta.jobTitle || (entry && entry.job && (entry.job.title || entry.job.Title)) || '',
            notes: (meta.notes || meta.Notes || entry?.raw?.notes || []),
            timeline: (meta.timeline || meta.Timeline || entry?.raw?.timeline || []),
          };
        });
        // เติมชื่อชื่อตำแหน่งงาน
        const uniqueJobIds = [...new Set(apps.map(x => x.jobId).filter(Boolean))];
        const jobsMap = {};
        await Promise.all(uniqueJobIds.map(async (jid) => {
          try { const j = await jobService.getJob(jid); jobsMap[jid] = j?.data || null; } catch (_) {}
        }));
        apps.forEach(a => { const j = jobsMap[a.jobId]; a.jobTitle = j?.title || j?.Title || ''; });
        if (!cancel) {
          setUserApplications(apps);
          setSelectedApplication(apps[0] || null);
        }
      } catch (e) {
        if (!cancel) setError(e.message || 'โหลดข้อมูลใบสมัครไม่สำเร็จ');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  // Notifications unread count (aggregate API + localStorage per-user read set)
  useEffect(() => {
    let cancelled = false;
    const NOTIF_READ_KEY = (uid) => `notifs_read_${uid}`;
    (async () => {
      try {
        const userId = user?.id || user?.ID || user?.user_id || user?.email || '';
        const notifs = await notificationService.getAggregated({ userId, limit: 100 });
        const readJson = localStorage.getItem(NOTIF_READ_KEY(userId)) || '[]';
        let readIds = [];
        try { readIds = JSON.parse(readJson || '[]'); } catch (_) { readIds = []; }
        const readSet = new Set(readIds || []);
        const unread = (notifs || []).filter(n => !readSet.has(n.id)).length;
        if (!cancelled) setUnreadCount(unread);
      } catch (e) {
        // ignore and keep unreadCount at 0
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, user?.ID, user?.user_id, user?.email]);

  // listen for notification updates (so badge updates immediately)
  useEffect(() => {
    const handler = () => {
      (async () => {
        try {
          const userId = user?.id || user?.ID || user?.user_id || user?.email || '';
          const notifs = await notificationService.getAggregated({ userId, limit: 100 });
          const readJson = localStorage.getItem(`notifs_read_${userId}`) || '[]';
          let readIds = [];
          try { readIds = JSON.parse(readJson || '[]'); } catch (_) { readIds = []; }
          const readSet = new Set(readIds || []);
          setUnreadCount((notifs || []).filter(n => !readSet.has(n.id)).length);
        } catch (e) {}
      })();
    };
    window.addEventListener('notifs:updated', handler);
    return () => window.removeEventListener('notifs:updated', handler);
  }, [user?.id, user?.ID, user?.user_id, user?.email]);

  // เมื่อเลือกใบสมัคร ให้โหลดรายละเอียดเพิ่มเติม (timeline/notes)
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!selectedApplication?.id) return;
      try {
        const res = await applicationService.getApplication(selectedApplication.id);
        const tl = (res?.timeline || []).map(t => ({
          id: t.id || t.ID, status: (t.status || t.Status || '').toLowerCase(), description: t.description || t.Description || '', date: t.date || t.Date
        }));
        const notes = (res?.notes || []).map(n => ({
          id: n.id || n.ID, content: n.content || n.Content || '', author: n.author || n.Author || 'ทีมงาน', createdAt: n.created_at || n.CreatedAt
        }));
        const jobTitle = res?.job?.title || res?.job?.Title || selectedApplication.jobTitle;

        // Applicant contact fields (try multiple casings to be defensive)
        const candidateEmail = res?.applicant?.email || res?.applicant?.Email || res?.applicant?.contact_email || res?.applicant?.ContactEmail || '';
        const candidatePhone = res?.applicant?.phone || res?.applicant?.Phone || res?.applicant?.mobile || res?.applicant?.Mobile || '';

        // Application document / misc fields
        const resume = res?.application?.resume || res?.application?.Resume || res?.application?.cv || res?.application?.CV || '';
        const coverLetter = res?.application?.cover_letter || res?.application?.CoverLetter || res?.application?.coverLetter || '';
        const preScreeningScore = res?.application?.pre_screening_score || res?.application?.preScreeningScore || res?.application?.pre_screen_score || null;

        if (!cancel) setSelectedApplication(prev => prev ? { 
          ...prev, 
          timeline: tl, 
          notes, 
          jobTitle,
          candidateEmail,
          candidatePhone,
          resume,
          coverLetter,
          preScreeningScore
        } : prev);
      } catch (e) {
        // optionally log debug info
        // console.debug('[TrackStatus] load detail error', e);
      }
    })();
    return () => { cancel = true; };
  }, [selectedApplication?.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'screening':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'interview':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'offer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'hired':
        // Hired/accepted applicants show same green as offer
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <Clock className="size-4" />;
      case 'screening':
        return <AlertCircle className="size-4" />;
      case 'interview':
        return <MessageSquare className="size-4" />;
      case 'offer':
        return <CheckCircle2 className="size-4" />;
      case 'hired':
        // show check icon for hired
        return <CheckCircle2 className="size-4" />;
      case 'rejected':
        return <XCircle className="size-4" />;
      default:
        return <Clock className="size-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted':
        return 'ส่งใบสมัครแล้ว';
      case 'screening':
        return 'กำลังตรวจสอบ';
      case 'interview':
        return 'นัดสัมภาษณ์';
      case 'offer':
        return 'ได้รับข้อเสนองาน';
      case 'hired':
        return 'ได้รับการจ้างงาน';
      case 'rejected':
        return 'ไม่ผ่านการคัดเลือก';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };

  const formatDateSafe = (d) => {
    if (!d) return '-';
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return '-';
      return dt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return '-';
    }
  };

  // Treat 'offer' and 'hired' as completed states
  const activeApplications = userApplications.filter(app => 
    app.status !== 'rejected' && app.status !== 'offer' && app.status !== 'hired'
  );
  const completedApplications = userApplications.filter(app => 
    app.status === 'rejected' || app.status === 'offer' || app.status === 'hired'
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-[#234C6A] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">ติดตามสถานะใบสมัคร</h1>
              <p className="text-white/90">ตรวจสอบความคืบหน้าของใบสมัครงานทั้งหมดของคุณ</p>
            </div>
            <Button variant="secondary" onClick={onNavigateToNotifications} className="gap-2">
              <Bell className="size-5" />
              การแจ้งเตือน
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1">{unreadCount}</Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="text-center text-red-600 py-4">{error}</div>
        )}
        {loading ? (
          <Card className="max-w-2xl mx-auto"><CardContent className="py-12 text-center">กำลังโหลดข้อมูล...</CardContent></Card>
        ) : userApplications.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <FileText className="size-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">ยังไม่มีใบสมัครงาน</h3>
              <p className="text-muted-foreground mt-2">คุณยังไม่ได้สมัครงานตำแหน่งใด กรุณาเลือกตำแหน่งงานที่สนใจและสมัครเลย!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Applications List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">ใบสมัครทั้งหมด</h3>
                    <Badge variant="secondary">{userApplications.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="active">
                        กำลังดำเนินการ ({activeApplications.length})
                      </TabsTrigger>
                      <TabsTrigger value="completed">
                        เสร็จสิ้น ({completedApplications.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-2 mt-4">
                      {activeApplications.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          ไม่มีใบสมัครที่กำลังดำเนินการ
                        </p>
                      ) : (
                        activeApplications.map((app) => (
                          <button
                            key={app.id}
                            onClick={() => setSelectedApplication(app)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              selectedApplication?.id === app.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <h4 className="line-clamp-1">{app.jobTitle}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              {getStatusIcon(app.status)}
                              <span className="text-muted-foreground">
                                {getStatusText(app.status)}
                              </span>
                            </div>
                            <p className="text-muted-foreground mt-1">
                              {formatDateSafe(app.submittedDate)}
                            </p>
                          </button>
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-2 mt-4">
                      {completedApplications.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          ไม่มีใบสมัครที่เสร็จสิ้น
                        </p>
                      ) : (
                        completedApplications.map((app) => (
                          <button
                            key={app.id}
                            onClick={() => setSelectedApplication(app)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              selectedApplication?.id === app.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <h4 className="line-clamp-1">{app.jobTitle}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              {getStatusIcon(app.status)}
                              <span className="text-muted-foreground">
                                {getStatusText(app.status)}
                              </span>
                            </div>
                            <p className="text-muted-foreground mt-1">
                              {formatDateSafe(app.submittedDate)}
                            </p>
                          </button>
                        ))
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right Content - Application Details */}
            <div className="lg:col-span-2 space-y-6">
              {selectedApplication && (
                <>
                  {/* Application Info Card */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h2 className="text-xl font-semibold">{selectedApplication.jobTitle}</h2>
                          <p className="text-muted-foreground mt-1">
                            รหัสใบสมัคร: {selectedApplication.id}
                          </p>
                        </div>
                        <Badge 
                          className={`${getStatusColor(selectedApplication.status)} border`}
                        >
                          {getStatusIcon(selectedApplication.status)}
                          <span className="ml-2">{getStatusText(selectedApplication.status)}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted rounded-lg p-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Calendar className="size-4" />
                            <span>วันที่สมัคร</span>
                          </div>
                          <p>
                            {formatDateSafe(selectedApplication.submittedDate)}
                          </p>
                        </div>

                        <div className="bg-muted rounded-lg p-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Clock className="size-4" />
                            <span>ระยะเวลา</span>
                          </div>
                          <p>
                            {selectedApplication.submittedDate ? Math.floor((new Date().getTime() - new Date(selectedApplication.submittedDate).getTime()) / (1000 * 60 * 60 * 24)) : '-'} วัน
                          </p>
                        </div>

                        {selectedApplication.preScreeningScore && (
                          <div className="bg-muted rounded-lg p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                              <CheckCircle2 className="size-4" />
                              <span>คะแนนคัดกรอง</span>
                            </div>
                            <p className="text-green-600">
                              {selectedApplication.preScreeningScore}/100
                            </p>
                          </div>
                        )}

                        <div className="bg-muted rounded-lg p-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <MessageSquare className="size-4" />
                            <span>หมายเหตุ</span>
                          </div>
                          <p>{selectedApplication.notes.length} รายการ</p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="border-t pt-6">
                        <h4 className="mb-3">ข้อมูลผู้สมัคร</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <Mail className="size-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-muted-foreground">อีเมล</p>
                              <p>{selectedApplication.candidateEmail}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <Phone className="size-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-muted-foreground">เบอร์โทรศัพท์</p>
                              <p>{selectedApplication.candidatePhone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <FileText className="size-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-muted-foreground">เอกสารประกอบ</p>
                              <div className="flex items-center gap-2">
                                <p className="truncate">{selectedApplication.resume}</p>
                                <Button size="sm" variant="ghost" className="h-6 px-2">
                                  <Download className="size-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cover Letter Section */}
                      {selectedApplication.coverLetter && (
                        <div className="border-t pt-6">
                          <h4 className="mb-3">จดหมายสมัครงาน</h4>
                          <div className="bg-muted rounded-lg p-4">
                            <p className="text-sm whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Timeline Card */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">ประวัติการดำเนินการ</h3>
                      <p className="text-muted-foreground">ติดตามความคืบหน้าของใบสมัครของคุณแบบเรียลไทม์</p>
                    </CardHeader>
                    <CardContent>
                      <StatusTimeline timeline={selectedApplication.timeline} currentStatus={selectedApplication.status} />
                    </CardContent>
                  </Card>

                  {/* Notes Card */}
                  {selectedApplication.notes.length > 0 && (
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-semibold">ข้อความจากทีมงาน</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedApplication.notes.map((note) => (
                            <div key={note.id} className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                                    {note.author.charAt(0)}
                                  </div>
                                  <span>{note.author}</span>
                                </div>
                                <span className="text-muted-foreground">
                                  {new Date(note.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              <p className="text-foreground ml-10">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Next Steps Card */}
                  <Card className="border-2 border-primary/20 bg-[#e7f0f5] shadow-lg">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-[#1B3C53]">ขั้นตอนถัดไป</h3>
                    </CardHeader>
                    <CardContent>
                      {selectedApplication.status === 'submitted' && (
                        <div className="space-y-2">
                          <p>• ทีม HR กำลังตรวจสอบใบสมัครของคุณ</p>
                          <p>• คาดว่าจะได้รับการติดต่อกลับภายใน 3-5 วันทำการ</p>
                          <p className="text-muted-foreground mt-3">
                            เราจะแจ้งเตือนคุณทาง Email เมื่อมีการอัพเดทสถานะ
                          </p>
                        </div>
                      )}
                      {selectedApplication.status === 'screening' && (
                        <div className="space-y-2">
                          <p>• ใบสมัครของคุณกำลังอยู่ในขั้นตอนการพิจารณา</p>
                          <p>• ทีมงานจะติดต่อกลับหากผ่านการคัดเลือก</p>
                          <p className="text-muted-foreground mt-3">
                            โปรดตรวจสอบอีเมลของคุณเป็นประจำ
                          </p>
                        </div>
                      )}
                      {selectedApplication.status === 'interview' && (
                        <div className="space-y-2">
                          <p className="text-green-600">
                             ยินดีด้วย! คุณได้รับเชิญเข้าสัมภาษณ์
                          </p>
                          <p>• กรุณาตรวจสอบอีเมลสำหรับรายละเอียดการนัดหมาย</p>
                          <p>• เตรียมตัวสัมภาษณ์และเอกสารที่เกี่ยวข้อง</p>
                          <p className="text-muted-foreground mt-3">
                            หากมีคำถาม กรุณาติดต่อทีม HR
                          </p>
                        </div>
                      )}
                      {selectedApplication.status === 'offer' && (
                        <div className="space-y-2">
                          <p className="text-green-600">
                             ยินดีด้วย! คุณได้รับข้อเสนองาน
                          </p>
                          <p>• กรุณาตรวจสอบอีเมลสำหรับรายละเอียด Offer Letter</p>
                          <p>• ติดต่อทีม HR หากต้องการสอบถามข้อมูลเพิ่มเติม</p>
                        </div>
                      )}
                      {selectedApplication.status === 'rejected' && (
                        <div className="space-y-2">
                          <p>ขอบคุณสำหรับความสนใจในตำแหน่งงานนี้</p>
                          <p>• เรามีตำแหน่งงานอื่น ๆ ที่อาจเหมาะกับคุณ</p>
                          <p>• คุณสามารถสมัครตำแหน่งอื่นได้ทันที</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
