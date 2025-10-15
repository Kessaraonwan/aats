import { ApplyWizard } from '../../components/candidate';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import api from '../../services/api';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import EmailService from '../../services/emailService';

export function ApplyPage({ jobId, onCancel, onSuccess }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลงานจาก API
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await jobService.getJob(jobId);
        if (!cancel) setJob(res?.data || null);
      } catch (e) {
        toast.error(e.message || 'โหลดข้อมูลงานไม่สำเร็จ');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-muted-foreground">กำลังโหลดข้อมูลตำแหน่งงาน...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">ไม่พบตำแหน่งงาน</h2>
          <p className="text-muted-foreground mt-2">ตำแหน่งงานที่คุณต้องการสมัครไม่พบในระบบ</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data) => {
    // ส่งใบสมัครเข้า API จริง (อัปโหลดเรซูเม่ถ้ามี) แล้วค่อยส่งอีเมลยืนยัน
    try {
      let resumeUrl = '';
      if (data.resume instanceof File) {
        const fd = new FormData();
        fd.append('file', data.resume);
        const up = await api.post('/uploads/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        resumeUrl = up?.url || '';
      }
      const payload = {
        job_id: (job && job.id) || jobId,
        resume: resumeUrl,
        cover_letter: data.coverLetter || '',
        education: JSON.stringify(data.education || {}),
        experience: data.workExperience || '',
        skills: JSON.stringify(data.skills || []),
      };
      const res = await applicationService.createApplication(payload);
      if (res?.ok) {
        toast.success('ส่งใบสมัครสำเร็จ');
        setShowSuccess(true);
      } else {
        // backend may return { error: '...' } on 200-like responses
        const msg = res?.error || res?.message || 'ส่งใบสมัครไม่สำเร็จ';
        toast.error(msg);
      }
    } catch (err) {
      // axios errors: err.response.data.error is preferred
      const backendMsg = err?.response?.data?.error || err?.response?.data?.message;
      if (backendMsg) {
        toast.error(backendMsg);
      } else {
        toast.error(err.message || 'เกิดข้อผิดพลาดในการส่งใบสมัคร');
      }
    }
    return;
    console.log('Application submitted:', data);
    
    // Send confirmation email
    try {
      const emailService = new EmailService();
      await emailService.sendApplicationSubmitted({
        candidateEmail: data.email,
        candidateName: data.fullName,
        jobTitle: job.title,
        department: job.department,
        submittedDate: new Date().toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        applicationId: `APP-${Date.now()}`,
        trackUrl: `${window.location.origin}/#/track`
      });
      
      toast.success('ส่งอีเมลยืนยันแล้ว');
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('ไม่สามารถส่งอีเมลยืนยันได้ แต่ใบสมัครของคุณถูกบันทึกแล้ว');
    }
    
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onSuccess();
  };

  return (
  <div className="min-h-screen bg-muted py-8">
      <div className="container mx-auto px-4">
        <ApplyWizard
          job={job}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      </div>

      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ส่งใบสมัครสำเร็จ!</AlertDialogTitle>
                <AlertDialogDescription>
                  ขอบคุณที่สนใจสมัครงานกับเรา เราจะติดต่อกลับโดยเร็วที่สุด
                  คุณสามารถติดตามสถานะใบสมัครได้ที่หน้า "ติดตามสถานะ"
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={handleSuccessClose}>เข้าใจแล้ว</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
    </div>
  );
}
