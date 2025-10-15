import { useEffect, useState } from 'react';
import { ApplicantsTable } from '../../components/hr';
import { useRecruitmentData } from '../../hooks/useRecruitmentData';
import { Card, CardContent } from '../../components/ui/card';

export function HRApplicantsPage({ onViewDetails }) {
  const [applications, setApplications] = useState([]);
  // Use the recruitment data hook to fetch applications + aggregated details
  const { applications: adaptedApps, details, loading, error, refresh } = useRecruitmentData({ includeDetails: true });

  // Map hook output into ApplicantsTable shape
  useEffect(() => {
    const mapped = (adaptedApps || []).map((a) => {
      const det = details && details[a.id] ? details[a.id] : null;
      const applicant = det?.applicant || {};
      const job = det?.job || {};
      const jobTitle = job.title || job.Title || '';
      const candidateName = applicant.name || applicant.Name || '';
      const candidateEmail = applicant.email || applicant.Email || '';
      const candidatePhone = applicant.phone || applicant.Phone || '';
      const evaluation = det?.evaluation ? { overallScore: det.evaluation.overall_score || det.evaluation.OverallScore || det.evaluation.overallScore } : undefined;

      // submittedDate may be a Date object from the hook; normalize to ISO string so
      // ApplicantsTable's date parsing (new Date(...)) handles it consistently.
      const submittedDate = a.submittedDate && a.submittedDate.toISOString ? a.submittedDate.toISOString() : a.submittedDate || a.submittedDateRaw || '';

      return {
        id: a.id,
        jobId: a.jobId,
        status: a.status || '',
        submittedDate,
        jobTitle,
        candidateName,
        candidateEmail,
        candidatePhone,
        evaluation,
        preScreeningScore: det?.raw?.pre_screen_score || a.preScreeningScore || 0,
      };
    });

    setApplications(mapped);
  }, [adaptedApps, details]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">จัดการผู้สมัครงาน</h1>
        <p className="text-muted-foreground">รายชื่อผู้สมัครทั้งหมดพร้อมเครื่องมือกรองและจัดเรียง</p>
      </div>

      {error && <div className="text-red-600">{error}</div>}
      {loading ? (
        <Card><CardContent className="py-12 text-center">กำลังโหลดข้อมูล...</CardContent></Card>
      ) : (
        <ApplicantsTable applications={applications} onViewDetails={onViewDetails} />
      )}
    </div>
  );
}
