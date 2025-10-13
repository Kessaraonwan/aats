import { useState } from 'react';
import { EvaluationForm } from '../../components/hm';
import { getApplicationById } from '../../data/mockData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../../components/ui/alert-dialog';

export function HMEvaluationPage({ applicationId, onBack }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const application = getApplicationById(applicationId);

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">ไม่พบข้อมูลผู้สมัคร</h2>
          <p className="text-muted-foreground mt-2">ไม่สามารถโหลดข้อมูลผู้สมัครได้</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (evaluation) => {
    console.log('Evaluation submitted:', evaluation);
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onBack();
  };

  return (
    <div className="py-8">
      <EvaluationForm application={application} onSubmit={handleSubmit} onCancel={onBack} />

      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>บันทึกการประเมินสำเร็จ!</AlertDialogTitle>
            <AlertDialogDescription>
              การประเมินของคุณได้ถูกบันทึกเรียบร้อยแล้ว ทีม HR จะได้รับแจ้งเตือนและดำเนินการต่อไป
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