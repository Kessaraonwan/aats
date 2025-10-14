import { ApplyWizard } from '../../components/candidate';
import { getJobById } from '../../data/mockData';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import EmailService from '../../services/emailService';

export function ApplyPage({ jobId, onCancel, onSuccess }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const job = getJobById(jobId);

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