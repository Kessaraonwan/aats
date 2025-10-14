import { useState } from 'react';
import { getApplicationById } from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { StatusTimeline } from '../../components/candidate';
import { ArrowLeft, Mail, Phone, FileText, Calendar, Star } from 'lucide-react';
import { toast } from 'sonner';
import EmailService from '../../services/emailService';

const statusLabels = {
  submitted: 'ส่งใบสมัคร',
  screening: 'ตรวจสอบ',
  interview: 'สัมภาษณ์',
  offer: 'เสนอตำแหน่ง',
  rejected: 'ไม่ผ่าน'
};

export function ApplicantDetailsPage({ applicationId, onBack }) {
  const application = getApplicationById(applicationId);
  const [newNote, setNewNote] = useState('');

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

  const handleAddNote = () => {
    if (newNote.trim()) {
      console.log('Add note:', newNote);
      setNewNote('');
    }
  };

  const handleStatusChange = async (newStatus) => {
    console.log('Change status to:', newStatus);
    
    // Send status update email
    try {
      const emailService = new EmailService();
      
      // Prepare email data based on status
      const emailData = {
        candidateEmail: application.candidateEmail,
        candidateName: application.candidateName,
        jobTitle: application.jobTitle,
        statusLabel: statusLabels[newStatus],
        previousStatus: statusLabels[application.status],
        updateDate: new Date().toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };

      // Send appropriate email based on status
      if (newStatus === 'interview') {
        // Send interview invitation
        await emailService.sendInterviewInvitation({
          ...emailData,
          interviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH'),
          interviewTime: '14:00 น.',
          location: 'สำนักงานใหญ่',
          interviewFormat: 'สัมภาษณ์แบบตัวต่อตัว',
          interviewers: ['ฝ่าย HR', 'Hiring Manager'],
          meetingLink: null
        });
      } else if (newStatus === 'offer') {
        // Send offer letter
        await emailService.sendOfferLetter({
          ...emailData,
          salary: 'ตามที่ตกลง',
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH'),
          contractType: 'พนักงานประจำ',
          benefits: ['ประกันสังคม', 'ประกันสุขภาพ', 'โบนัสประจำปี'],
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH')
        });
      } else if (newStatus === 'rejected') {
        // Send rejection email
        await emailService.sendApplicationRejected({
          ...emailData,
          feedbackMessage: 'เราขอขอบคุณที่สละเวลามาสัมภาษณ์กับเรา'
        });
      } else {
        // Send general status update
        await emailService.sendStatusUpdate({
          ...emailData,
          nextSteps: 'เราจะติดต่อกลับภายใน 3-5 วันทำการ',
          message: `สถานะของคุณได้เปลี่ยนเป็น "${statusLabels[newStatus]}" แล้ว`
        });
      }
      
      toast.success('เปลี่ยนสถานะและส่งอีเมลแจ้งเตือนแล้ว');
    } catch (error) {
      console.error('Failed to send status email:', error);
      toast.warning('เปลี่ยนสถานะแล้ว แต่ไม่สามารถส่งอีเมลได้');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getScoreBadge = (score) => {
    if (score == null) return null;
    if (score >= 90) return <Badge className="bg-green-600">A ({score})</Badge>;
    if (score >= 80) return <Badge className="bg-blue-600">B ({score})</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-600">C ({score})</Badge>;
    return <Badge variant="secondary">D ({score})</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="size-4 mr-2" />
          กลับ
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-primary">{application.candidateName}</h1>
          <p className="text-muted-foreground">{application.jobTitle}</p>
        </div>
        <Badge variant="secondary">{statusLabels[application.status]}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="premium-card">
            <CardHeader>
              <h3 className="text-lg font-medium text-primary">ข้อมูลผู้สมัคร</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-4" />
                    <span>อีเมล</span>
                  </div>
                  <p>{application.candidateEmail}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4" />
                    <span>เบอร์โทรศัพท์</span>
                  </div>
                  <p>{application.candidatePhone}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="size-4" />
                    <span>เรซูเม่</span>
                  </div>
                  <Button variant="link" className="p-0 h-auto">
                    {application.resume}
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>วันที่สมัคร</span>
                  </div>
                  <p>{formatDate(application.submittedDate)}</p>
                </div>
              </div>

              {/* แสดงคะแนนประเมินจาก HM ถ้ามี ถ้าไม่มีค่อยแสดง Pre-Screen Score */}
              {application.evaluation?.overallScore ? (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="size-4 text-primary" />
                    <span>คะแนนประเมินจากผู้จัดการ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-semibold text-primary">
                      {application.evaluation.overallScore}
                    </div>
                    <span className="text-muted-foreground">/ 5.0</span>
                  </div>
                </div>
              ) : application.preScreeningScore != null ? (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="size-4 text-yellow-600" />
                    <span>คะแนนคัดกรองเบื้องต้น</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getScoreBadge(application.preScreeningScore)}
                    <span className="text-muted-foreground">จากระบบอัตโนมัติ</span>
                  </div>
                </div>
              ) : null}

              {application.coverLetter && (
                <div className="pt-4 border-t">
                  <h4 className="mb-2">จดหมายสมัครงาน</h4>
                  <p className="text-muted-foreground">{application.coverLetter}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <h3 className="text-lg font-medium text-primary">ไทม์ไลน์สถานะ</h3>
            </CardHeader>
            <CardContent>
              <StatusTimeline timeline={application.timeline} currentStatus={application.status} />
            </CardContent>
          </Card>

          {application.evaluation && (
            <Card className="premium-card">
              <CardHeader>
                <h3 className="text-lg font-medium text-primary">ผลการประเมิน</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>ผู้ประเมิน: {application.evaluation.evaluatorName}</div>
                  <span className="text-muted-foreground">{formatDate(application.evaluation.evaluatedAt)}</span>
                </div>

                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-primary">คะแนนรวม</span>
                    <h2 className="text-primary">{application.evaluation.overallScore}</h2>
                    <span className="text-muted-foreground">/ 5.0</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">ทักษะทางเทคนิค</p>
                      <p>{application.evaluation.technicalSkills}/5</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">การสื่อสาร</p>
                      <p>{application.evaluation.communication}/5</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">การแก้ปัญหา</p>
                      <p>{application.evaluation.problemSolving}/5</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Culture Fit</p>
                      <p>{application.evaluation.cultureFit}/5</p>
                    </div>
                  </div>

                  {application.evaluation.comments && (
                    <div>
                      <h4 className="mb-2">ความคิดเห็น</h4>
                      <p className="text-muted-foreground">{application.evaluation.comments}</p>
                    </div>
                  )}
                </div>
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
              {application.status === 'submitted' && (
                <Button className="w-full premium-btn" onClick={() => handleStatusChange('screening')}>
                  เริ่มตรวจสอบ
                </Button>
              )}
              {application.status === 'screening' && (
                <>
                  <Button className="w-full premium-btn" onClick={() => handleStatusChange('interview')}>
                    นัดสัมภาษณ์
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={() => handleStatusChange('rejected')}>
                    ปฏิเสธ
                  </Button>
                </>
              )}
              {application.status === 'interview' && (
                <>
                  <Button className="w-full premium-btn" onClick={() => handleStatusChange('offer')}>
                    เสนอตำแหน่ง
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={() => handleStatusChange('rejected')}>
                    ปฏิเสธ
                  </Button>
                </>
              )}
              {application.status === 'offer' && (
                <div className="bg-green-100 text-green-800 rounded-lg p-4 text-center">เสนอตำแหน่งแล้ว</div>
              )}
              {application.status === 'rejected' && (
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
                <Textarea placeholder="เพิ่มหมายเหตุ..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="min-h-[100px]" />
                <Button onClick={handleAddNote} disabled={!newNote.trim()}>เพิ่มหมายเหตุ</Button>
              </div>

              {application.notes && application.notes.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  {application.notes.map((note) => (
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