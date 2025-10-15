import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { StatusTimeline } from '../../components/candidate';
import { ArrowLeft, Mail, Phone, FileText, Calendar, Star } from 'lucide-react';
import { toast } from 'sonner';
import EmailService from '../../services/emailService';
import { applicationService } from '../../services/applicationService';

const statusLabels = {
  submitted: 'ส่งใบสมัคร',
  screening: 'ตรวจสอบ',
  interview: 'สัมภาษณ์',
  offer: 'เสนอตำแหน่ง',
  rejected: 'ไม่ผ่าน',
};

const toLower = (value) => (value || '').toString().toLowerCase();

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function ApplicantDetailsPage({ applicationId, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newNote, setNewNote] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // ดึงรายละเอียดใบสมัครจาก API
  const fetchDetail = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await applicationService.getApplication(applicationId);
      // DEV: log raw response so we can inspect in browser DevTools
      console.debug('[DEBUG] application detail response', res);
      setDetail({
        application: res?.application || res?.Application || null,
        applicant: res?.applicant || res?.Applicant || null,
        job: res?.job || res?.Job || null,
        notes: res?.notes || res?.Notes || [],
        timeline: res?.timeline || res?.Timeline || [],
        evaluation: res?.evaluation || res?.Evaluation || null,
      });
      setError('');
    } catch (e) {
      setError(e.message || 'โหลดข้อมูลใบสมัครไม่สำเร็จ');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail(true);
  }, [applicationId]);

  const application = detail?.application;
  const applicant = detail?.applicant;
  const job = detail?.job;
  const evaluation = detail?.evaluation;

  const timeline = useMemo(
    () => (detail?.timeline || []).map((item) => ({
      id: item.id || item.ID,
      status: toLower(item.status || item.Status),
      description: item.description || item.Description || '',
      date: item.date || item.Date || item.created_at || item.CreatedAt,
    })),
    [detail]
  );

  const notes = useMemo(
    () => (detail?.notes || []).map((item) => ({
      id: item.id || item.ID,
      author: item.author || item.Author || 'ทีมงาน',
      content: item.content || item.Content || '',
      createdAt: item.created_at || item.CreatedAt || item.createdAt,
    })),
    [detail]
  );

  const candidateName = applicant?.name || applicant?.Name || 'ไม่ระบุ';
  const candidateEmail = applicant?.email || applicant?.Email || '-';
  const candidatePhone = applicant?.phone || applicant?.Phone || '-';
  const jobTitle = job?.title || job?.Title || '-';
  const status = toLower(application?.status || application?.Status);
  // Normalize resume URL: backend may store just a filename, a relative path ("/uploads/..") or a full URL
  const rawResume = application?.resume || application?.Resume || '';
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/api\/?$/, '');
  let resume = '';
  if (rawResume) {
    // already absolute URL
    if (/^https?:\/\//i.test(rawResume)) {
      resume = rawResume;
    } else if (rawResume.startsWith('/')) {
      // relative path from backend (e.g. /uploads/resumes/filename)
      resume = `${apiBase}${rawResume}`;
    } else if (rawResume.startsWith('uploads/') || rawResume.startsWith('uploads\\')) {
      resume = `${apiBase}/${rawResume}`;
    } else {
      // assume stored as filename only
      resume = `${apiBase}/uploads/resumes/${rawResume}`;
    }
  }
  const coverLetter = application?.coverLetter || application?.CoverLetter || '';
  const submittedDate = application?.submitted_date || application?.SubmittedDate || application?.submittedDate;
  const preScreeningScore = application?.pre_screening_score || application?.PreScreeningScore || application?.preScreeningScore;

  const evaluationView = evaluation
    ? {
        overallScore: evaluation.overall_score || evaluation.OverallScore,
        technicalSkills: evaluation.technical_skills || evaluation.TechnicalSkills,
        communication: evaluation.communication || evaluation.Communication,
        problemSolving: evaluation.problem_solving || evaluation.ProblemSolving,
        culturalFit: evaluation.cultural_fit || evaluation.CulturalFit,
        strengths: evaluation.strengths || evaluation.Strengths,
        weaknesses: evaluation.weaknesses || evaluation.Weaknesses,
        comments: evaluation.comments || evaluation.Comments,
      }
    : null;

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setNoteSubmitting(true);
    try {
      await applicationService.addNote(applicationId, newNote.trim());
      toast.success('บันทึกหมายเหตุแล้ว');
      setNewNote('');
      await fetchDetail();
    } catch (e) {
      toast.error(e.message || 'บันทึกหมายเหตุไม่สำเร็จ');
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusSubmitting(true);
    try {
      await applicationService.updateApplicationStatus(applicationId, newStatus, statusLabels[newStatus] || '');

      // แจ้งสถานะทางอีเมล (ไม่ให้การส่งอีเมลทำให้การบันทึกหลักล้ม)
      try {
        const emailService = new EmailService();
        const emailData = {
          candidateEmail,
          candidateName,
          jobTitle,
          statusLabel: statusLabels[newStatus],
          previousStatus: statusLabels[status],
          updateDate: new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        };

        if (newStatus === 'interview') {
          await emailService.sendInterviewInvitation({
            ...emailData,
            interviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH'),
            interviewTime: '14:00 น.',
            location: 'สำนักงานใหญ่',
            interviewFormat: 'สัมภาษณ์แบบตัวต่อตัว',
            interviewers: ['ฝ่าย HR', 'Hiring Manager'],
            meetingLink: null,
          });
        } else if (newStatus === 'offer') {
          await emailService.sendOfferLetter({
            ...emailData,
            salary: 'ตามที่ตกลง',
            startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH'),
            contractType: 'พนักงานประจำ',
            benefits: ['ประกันสังคม', 'ประกันสุขภาพ', 'โบนัสประจำปี'],
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH'),
          });
        } else if (newStatus === 'rejected') {
          await emailService.sendApplicationRejected({
            ...emailData,
            feedbackMessage: 'เราขอขอบคุณที่สละเวลามาสัมภาษณ์กับเรา',
          });
        } else {
          await emailService.sendStatusUpdate({
            ...emailData,
            nextSteps: 'เราจะติดต่อกลับภายใน 3-5 วันทำการ',
            message: `สถานะของคุณได้เปลี่ยนเป็น "${statusLabels[newStatus]}" แล้ว`,
          });
        }
      } catch (emailError) {
        console.warn('send status email failed', emailError);
      }

      toast.success('อัปเดตสถานะสำเร็จ');
      await fetchDetail();
    } catch (e) {
      toast.error(e.message || 'อัปเดตสถานะไม่สำเร็จ');
    } finally {
      setStatusSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">กำลังโหลดข้อมูลใบสมัคร...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-600">{error}</p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={() => fetchDetail(true)}>ลองอีกครั้ง</Button>
          <Button onClick={onBack}>
            กลับไปหน้าก่อน
          </Button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">ไม่พบข้อมูลผู้สมัคร</h2>
        <Button onClick={onBack} className="mt-4">
          กลับไปหน้าก่อน
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" />
          กลับไปหน้าก่อน
        </Button>
        <h1 className="text-2xl font-semibold">รายละเอียดผู้สมัคร</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="premium-card">
            <CardHeader className="border-b bg-muted/40">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold">
                    {candidateName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-primary">{candidateName}</h2>
                    <p className="text-muted-foreground">{jobTitle} • {formatDate(submittedDate)}</p>
                  </div>
                </div>
                <Badge variant={status === 'rejected' ? 'destructive' : 'outline'}>{statusLabels[status] || '-'}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-4" />
                    <span>อีเมล</span>
                  </div>
                  <p>{candidateEmail}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4" />
                    <span>เบอร์โทรศัพท์</span>
                  </div>
                  <p>{candidatePhone}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="size-4" />
                    <span>เรซูเม่</span>
                  </div>
                  {resume ? (
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <a href={resume} target="_blank" rel="noopener noreferrer">เปิดไฟล์</a>
                    </Button>
                  ) : (
                    <p className="text-muted-foreground">-</p>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>วันที่สมัคร</span>
                  </div>
                  <p>{formatDate(submittedDate)}</p>
                </div>
              </div>

              {preScreeningScore != null && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <Star className="size-4" />
                    <span>คะแนนคัดกรองเบื้องต้น</span>
                  </div>
                  <Badge variant="outline" className="text-lg">
                    {preScreeningScore}
                  </Badge>
                </div>
              )}

              {coverLetter && (
                <div className="pt-4 border-t space-y-2">
                  <h3 className="font-medium text-primary">จดหมายแนะนำตัว</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{coverLetter}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">ไทม์ไลน์ใบสมัคร</h3>
            </CardHeader>
            <CardContent>
              <StatusTimeline timeline={timeline} currentStatus={status} />
            </CardContent>
          </Card>

          {evaluationView && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">สรุปการประเมินจาก HM</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">คะแนนรวม</p>
                    <p className="text-2xl font-semibold text-primary">{evaluationView.overallScore?.toFixed?.(2) || evaluationView.overallScore}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ทักษะเทคนิค</p>
                    <p>{evaluationView.technicalSkills}/5</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">การสื่อสาร</p>
                    <p>{evaluationView.communication}/5</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">การแก้ปัญหา</p>
                    <p>{evaluationView.problemSolving}/5</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Culture Fit</p>
                    <p>{evaluationView.culturalFit}/5</p>
                  </div>
                </div>

                {evaluationView.comments && (
                  <div>
                    <h4 className="mb-2">ความคิดเห็น</h4>
                    <p className="text-muted-foreground">{evaluationView.comments}</p>
                  </div>
                )}

                {(evaluationView.strengths || evaluationView.weaknesses) && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {evaluationView.strengths && (
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                        <h4 className="text-green-700 font-medium mb-1">จุดแข็ง</h4>
                        <p className="text-muted-foreground">{evaluationView.strengths}</p>
                      </div>
                    )}
                    {evaluationView.weaknesses && (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                        <h4 className="text-amber-700 font-medium mb-1">จุดที่ควรพัฒนา</h4>
                        <p className="text-muted-foreground">{evaluationView.weaknesses}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="premium-card">
              <CardHeader>
                <h3 className="text-lg font-medium text-primary">การดำเนินการ</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {status === 'submitted' && (
                  <Button className="w-full premium-btn" onClick={() => handleStatusChange('screening')} disabled={statusSubmitting}>
                    เริ่มตรวจสอบ
                  </Button>
                )}
                {status === 'screening' && (
                  <>
                    <Button className="w-full premium-btn" onClick={() => handleStatusChange('interview')} disabled={statusSubmitting}>
                      นัดสัมภาษณ์
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={() => handleStatusChange('rejected')} disabled={statusSubmitting}>
                      ปฏิเสธ
                    </Button>
                  </>
                )}
                {status === 'interview' && (
                  <>
                    <Button className="w-full premium-btn" onClick={() => handleStatusChange('offer')} disabled={statusSubmitting}>
                      เสนอตำแหน่ง
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={() => handleStatusChange('rejected')} disabled={statusSubmitting}>
                      ปฏิเสธ
                    </Button>
                  </>
                )}
                {status === 'offer' && (
                  <div className="bg-green-100 text-green-800 rounded-lg p-4 text-center">เสนอตำแหน่งแล้ว</div>
                )}
                {status === 'rejected' && (
                  <div className="bg-red-100 text-red-800 rounded-lg p-4 text-center">ไม่ผ่านการคัดเลือก</div>
                )}
              </CardContent>
            </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">หมายเหตุ</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="เพิ่มหมายเหตุ..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim() || noteSubmitting}>
                  เพิ่มหมายเหตุ
                </Button>
              </div>

              {notes.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-muted rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <div>{note.author}</div>
                        <span className="text-muted-foreground">{formatDate(note.createdAt)}</span>
                      </div>
                      <p className="text-muted-foreground">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
