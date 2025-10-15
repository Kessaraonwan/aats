import { useEffect, useMemo, useState } from 'react';
import { EvaluationForm } from '../../components/hm';
import { Button } from '../../components/ui/button';
import { applicationService } from '../../services/applicationService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { toast } from 'sonner';

const clampFive = (value) => {
  const num = Number(value) || 0;
  return Math.min(5, Math.max(1, Math.round(num)));
};

const averageScore = (values) => {
  if (!values?.length) return 3;
  const sum = values.reduce((acc, val) => acc + (Number(val) || 0), 0);
  return sum / values.length;
};

// แปลงคะแนนจากแบบฟอร์มให้ตรงกับ schema ของ API
const mapEvaluationToPayload = (formValues) => {
  const technical = clampFive(averageScore([
    formValues.technicalKnowledge,
    formValues.technicalSkills,
    formValues.toolsProficiency,
  ]));
  const communication = clampFive(averageScore([
    formValues.communication,
    formValues.collaboration,
  ]));
  const problemSolving = clampFive(averageScore([
    formValues.problemSolving,
    formValues.leadershipPotential,
    formValues.adaptability,
  ]));
  const culturalFit = clampFive(averageScore([
    formValues.culturalFit,
    formValues.growthMindset,
  ]));

  const overall = Number(((technical + communication + problemSolving + culturalFit) / 4).toFixed(2));

  const comments = [
    formValues.overallComments,
    formValues.recommendation ? `คำแนะนำ: ${formValues.recommendation}` : '',
    formValues.recommendationReason ? `เหตุผล: ${formValues.recommendationReason}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    technical_skills: technical,
    communication,
    problem_solving: problemSolving,
    cultural_fit: culturalFit,
    strengths: formValues.strengths || '',
    weaknesses: formValues.weaknesses || '',
    comments,
    overall_score: overall,
  };
};

export function HMEvaluationPage({ applicationId, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ดึงข้อมูลใบสมัครและผู้สมัครสำหรับหน้าประเมิน
  const fetchDetail = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await applicationService.getApplication(applicationId);
      setDetail({
        application: res?.application || res?.Application || null,
        applicant: res?.applicant || res?.Applicant || null,
        job: res?.job || res?.Job || null,
        evaluation: res?.evaluation || res?.Evaluation || null,
      });
      setError('');
    } catch (e) {
      setError(e.message || 'โหลดข้อมูลผู้สมัครไม่สำเร็จ');
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

  const evaluationFormApplication = useMemo(() => {
    if (!application) return null;
    const candidateName = applicant?.name || applicant?.Name || 'ไม่ระบุ';
    const candidateEmail = applicant?.email || applicant?.Email || '-';
    const candidatePhone = applicant?.phone || applicant?.Phone || '-';
    const jobTitle = job?.title || job?.Title || '-';
    const submittedDate = application?.submitted_date || application?.SubmittedDate || application?.submittedDate;
    const resume = application?.resume || application?.Resume || '';
    const coverLetter = application?.coverLetter || application?.CoverLetter || '';
    const preScreeningScore = application?.pre_screening_score || application?.PreScreeningScore || application?.preScreeningScore;

    return {
      id: application.id || application.ID,
      candidateName,
      candidateEmail,
      candidatePhone,
      jobTitle,
      submittedDate,
      resume,
      coverLetter,
      preScreeningScore,
      evaluation: detail?.evaluation || null,
      // include status so the form can decide whether submission is allowed
      status: application?.status || application?.Status || '',
    };
  }, [application, applicant, job, detail?.evaluation]);

  const handleSubmit = async (formValues) => {
    // บันทึกแบบร่างไว้ใน localStorage เฉพาะฝั่ง FE
    if (formValues.isDraft) {
      localStorage.setItem(`hm-eval-draft-${applicationId}`, JSON.stringify(formValues));
      toast.success('บันทึกแบบร่างไว้ในเครื่องแล้ว');
      return;
    }

    setSubmitting(true);
    try {
      const payload = mapEvaluationToPayload(formValues);
      await applicationService.createEvaluation(applicationId, payload);
      setShowSuccess(true);
      await fetchDetail();
    } catch (e) {
      toast.error(e.message || 'บันทึกการประเมินไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onBack();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">กำลังโหลดข้อมูลผู้สมัคร...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-600">{error}</p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={() => fetchDetail(true)}>ลองอีกครั้ง</Button>
          <Button onClick={onBack}>กลับไปหน้าก่อน</Button>
        </div>
      </div>
    );
  }

  if (!evaluationFormApplication) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">ไม่พบข้อมูลใบสมัครสำหรับการประเมิน</p>
        <Button onClick={onBack} className="mt-4">กลับไปหน้าก่อน</Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <EvaluationForm
        application={evaluationFormApplication}
        onSubmit={handleSubmit}
        onCancel={onBack}
        submitting={submitting}
      />

      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>บันทึกการประเมินสำเร็จ!</AlertDialogTitle>
            <AlertDialogDescription>
              การประเมินของคุณถูกบันทึกเรียบร้อยแล้ว ทีม HR จะได้รับแจ้งและดำเนินการต่อ
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
