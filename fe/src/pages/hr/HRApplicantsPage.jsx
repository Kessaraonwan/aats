import { useEffect, useState } from 'react';
import { ApplicantsTable } from '../../components/hr';
import { applicationService } from '../../services/applicationService';

export function HRApplicantsPage({ onViewDetails }) {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const resp = await applicationService.getApplications();
        const apps = Array.isArray(resp?.data) ? resp.data : resp || [];
        if (!mounted) return;
        setApplications(apps);
      } catch (err) {
        console.error('failed to load applications for HRApplicantsPage', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">ข้อมูลผู้สมัคร</h1>
        <p className="text-muted-foreground">รวบรวมใบสมัครที่เข้ามาและสถานะการคัดเลือก</p>
      </div>

      <ApplicantsTable
        applications={applications}
        onViewDetails={onViewDetails}
        isLoading={isLoading}
      />
    </div>
  );
}