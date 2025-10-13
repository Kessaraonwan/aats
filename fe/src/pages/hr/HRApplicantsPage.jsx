import { ApplicantsTable } from '../../components/hr';
import { mockApplications } from '../../data/mockData';

export function HRApplicantsPage({ onViewDetails }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">จัดการผู้สมัครงาน</h1>
        <p className="text-muted-foreground">
          รายชื่อผู้สมัครทั้งหมดพร้อมเครื่องมือกรองและจัดเรียง
        </p>
      </div>

      <ApplicantsTable
        applications={mockApplications}
        onViewDetails={onViewDetails}
      />
    </div>
  );
}