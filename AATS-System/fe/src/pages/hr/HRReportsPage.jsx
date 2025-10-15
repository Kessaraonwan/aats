import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  BarChart3,
  Users,
  Briefcase,
  Target,
  TrendingUp,
  Calendar,
  Download,
} from 'lucide-react';
import { useRecruitmentData } from '../../hooks/useRecruitmentData';
import JobListOverview from '../../components/hr/JobListOverview';
import { jobService } from '../../services/jobService';

const timeRanges = [
  { value: 'week', label: '7 วัน' },
  { value: 'month', label: '30 วัน' },
  { value: 'quarter', label: '90 วัน' },
  { value: 'year', label: '1 ปี' },
  { value: 'all', label: 'ทั้งหมด' },
];

const statusLabels = {
  submitted: 'ส่งใบสมัคร',
  screening: 'คัดกรอง',
  interview: 'สัมภาษณ์',
  offer: 'เสนองาน',
  hired: 'จ้างงาน',
  rejected: 'ไม่ผ่าน',
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

export function HRReportsPage() {
  const {
    applications,
    jobs,
    details,
    loading,
    error,
    refresh,
  } = useRecruitmentData({ includeDetails: true });
  const [timeRange, setTimeRange] = useState('quarter');
  // Compute derived data with guards so Hooks are called in the same order every render.
  const filteredApps = useMemo(() => {
    if (loading || error) return [];
    if (timeRange === 'all') return applications;
    const now = Date.now();
    const days = { week: 7, month: 30, quarter: 90, year: 365 }[timeRange] || 0;
    return applications.filter((app) => {
      if (!app.submittedDate) return false;
      const diff = Math.floor((now - app.submittedDate.getTime()) / (1000 * 60 * 60 * 24));
      return diff <= days;
    });
  }, [applications, timeRange, loading, error]);

  const statusCounts = useMemo(() => {
    const counts = {};
    filteredApps.forEach((app) => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  }, [filteredApps]);

  const totalApplications = filteredApps.length;
  const activeJobs = jobs.filter((job) => job.status === 'active').length;
  const closedJobs = jobs.filter((job) => job.status === 'closed').length;

  const conversion = useMemo(() => {
    const submitted = statusCounts.submitted || 0;
    const screening = statusCounts.screening || 0;
    const interview = statusCounts.interview || 0;
    const offer = statusCounts.offer || 0;
    const hired = statusCounts.hired || 0;

    return {
      submitted,
      screening,
      interview,
      offer,
      hired,
      submittedToInterview: submitted ? Math.round((interview / submitted) * 100) : 0,
      interviewToOffer: interview ? Math.round((offer / interview) * 100) : 0,
      offerToHired: offer ? Math.round((hired / offer) * 100) : 0,
    };
  }, [statusCounts]);

  const departmentStats = useMemo(() => {
    const map = {};
    jobs.forEach((job) => {
      const dept = job.department || 'ไม่ระบุ';
      if (!map[dept]) {
        map[dept] = { jobs: 0, applications: 0, hired: 0 };
      }
      map[dept].jobs += 1;
    });

    filteredApps.forEach((app) => {
      const job = jobs.find((j) => j.id === app.jobId);
      const dept = job?.department || 'ไม่ระบุ';
      if (!map[dept]) {
        map[dept] = { jobs: 0, applications: 0, hired: 0 };
      }
      map[dept].applications += 1;
      if (app.status === 'hired') {
        map[dept].hired += 1;
      }
    });

    return Object.entries(map)
      .map(([dept, stats]) => ({
        department: dept,
        jobs: stats.jobs,
        applications: stats.applications,
        hired: stats.hired,
        conversion: stats.applications ? Math.round((stats.hired / stats.applications) * 100) : 0,
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 6);
  }, [filteredApps, jobs]);

  const hiredDetails = useMemo(() => {
    return filteredApps
      .filter((app) => app.status === 'hired')
      .map((app) => ({
        app,
        detail: details[app.id],
      }));
  }, [filteredApps, details]);

  const handleToggleStatus = async (job) => {
    try {
      const nextStatus = job.status === 'active' ? 'closed' : 'active';
      await jobService.updateJob(job.id, { status: nextStatus });
      refresh();
    } catch (err) {
      console.error('อัปเดตสถานะงานไม่สำเร็จ', err);
      alert(err?.message || 'อัปเดตสถานะไม่สำเร็จ');
    }
  };

  const handleDelete = async (job) => {
    if (!confirm(`ยืนยันการลบตำแหน่งงาน "${job.title}" ?`)) return;
    try {
      await jobService.deleteJob(job.id);
      refresh();
    } catch (err) {
      console.error('ลบตำแหน่งงานไม่สำเร็จ', err);
      alert(err?.message || 'ลบตำแหน่งงานไม่สำเร็จ');
    }
  };

  const handleEdit = (job) => {
    // Navigate to job management edit route if exists, fallback to alert
    // This project doesn't include a router helper here; show guidance to user.
    alert('โปรดไปที่หน้าจัดการตำแหน่งเพื่อแก้ไข: /hr/jobs เพื่อแก้ไขตำแหน่ง ' + (job.title || ''));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3 text-muted-foreground">
        <p>กำลังโหลดรายงาน HR...</p>
        <Button variant="outline" size="sm" disabled>
          กำลังโหลด
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
        <p className="text-red-600">{error}</p>
        <Button onClick={refresh}>ลองอีกครั้ง</Button>
      </div>
    );
  }

  const exportData = (format) => {
    const summary = {
      timeRange,
      totalApplications,
      conversion,
      departments: departmentStats.length,
    };
    console.log(`Export ${format}`, summary);
    alert(`กำลังสร้างไฟล์รายงาน (${format.toUpperCase()})...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">รายงานสรรหาบุคลากร</h1>
          <p className="text-muted-foreground">ภาพรวมการรับสมัครและสถานะผู้สมัครรายตำแหน่ง</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportData('pdf')} className="gap-2">
            <Download className="size-4" /> PDF
          </Button>
          <Button variant="outline" onClick={() => exportData('xlsx')} className="gap-2">
            <Download className="size-4" /> Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryTile icon={Users} title="ใบสมัครในช่วงเวลานี้" value={totalApplications} />
        <SummaryTile icon={Briefcase} title="ตำแหน่งที่เปิดรับ" value={activeJobs} />
        <SummaryTile icon={Target} title="ตำแหน่งที่ปิดรับ" value={closedJobs} />
        <SummaryTile icon={TrendingUp} title="อัตราจ้างงาน" value={conversion.offer ? Math.round((conversion.hired / conversion.offer) * 100) || 0 : 0} suffix="%" />
      </div>

      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <BarChart3 className="size-5" /> สถานะผู้สมัคร
          </CardTitle>
          <CardDescription>จำนวนผู้สมัครในแต่ละสถานะการสรรหา</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          {Object.entries(statusLabels).map(([status, label]) => (
            <div key={status} className="p-4 border rounded-lg">
              <p className="text-xs text-muted-foreground uppercase">{label}</p>
              <p className="text-2xl font-semibold text-primary">{statusCounts[status] || 0}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <TrendingUp className="size-5" /> ตัวชี้วัด Conversion
          </CardTitle>
          <CardDescription>เปรียบเทียบอัตราการคัดเลือกในแต่ละขั้นตอน</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3 text-sm">
          <ConversionBox label="ส่งใบสมัคร" value={conversion.submitted} percentage={100} />
          <ConversionBox label="คัดกรอง" value={conversion.screening} percentage={conversion.submitted ? Math.round((conversion.screening / conversion.submitted) * 100) : 0} />
          <ConversionBox label="สัมภาษณ์" value={conversion.interview} percentage={conversion.submittedToInterview} />
          <ConversionBox label="เสนองาน" value={conversion.offer} percentage={conversion.interviewToOffer} />
          <ConversionBox label="จ้างงาน" value={conversion.hired} percentage={conversion.offerToHired} />
        </CardContent>
      </Card>

      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Users className="size-5" /> สถิติรายแผนก
          </CardTitle>
          <CardDescription>แผนกที่มีผู้สมัครสูงสุดและอัตราการจ้างงาน</CardDescription>
        </CardHeader>
        <CardContent>
          {departmentStats.length ? (
            <div className="space-y-3">
              {departmentStats.map((dept) => (
                <div key={dept.department} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{dept.department}</p>
                    <p className="text-xs text-muted-foreground">ตำแหน่ง {dept.jobs} • ผู้สมัคร {dept.applications}</p>
                  </div>
                  <Badge variant="secondary">จ้างงาน {dept.hired} ({dept.conversion}%)</Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="ยังไม่มีข้อมูลผู้สมัครในช่วงเวลานี้" />
          )}
        </CardContent>
      </Card>

      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Calendar className="size-5" /> ผู้สมัครที่ได้รับการจ้างงาน
          </CardTitle>
          <CardDescription>ข้อมูลผู้สมัครที่ผ่านการจ้างงานในช่วงเวลาที่เลือก</CardDescription>
        </CardHeader>
        <CardContent>
          {hiredDetails.length ? (
            <div className="space-y-2">
              {hiredDetails.map(({ app, detail }) => (
                <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{detail?.applicant?.name || 'ไม่ระบุ'}</p>
                    <p className="text-xs text-muted-foreground">
                      {detail?.job?.title || detail?.job?.Title || '-'} • {formatDate(app.submittedDate)}
                    </p>
                  </div>
                  <Badge className="bg-green-600">จ้างงานแล้ว</Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="ยังไม่มีผู้สมัครที่จ้างงานในช่วงเวลานี้" />
          )}
        </CardContent>
      </Card>

      {/* Job list moved to Job Management page to consolidate controls under "จัดการตำแหน่งงาน" */}
    </div>
  );
}

function SummaryTile({ icon: Icon, title, value, suffix }) {
  return (
    <Card className="premium-card">
      <CardContent className="pt-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm mb-1">{title}</p>
          <h2 className="text-2xl font-semibold">{value}<span className="text-base font-normal">{suffix}</span></h2>
        </div>
        <div className="bg-primary/10 text-primary p-3 rounded-lg">
          <Icon className="size-6" />
        </div>
      </CardContent>
    </Card>
  );
}

function ConversionBox({ label, value, percentage }) {
  return (
    <div className="p-4 border rounded-lg">
      <p className="text-xs text-muted-foreground uppercase">{label}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-lg font-semibold text-primary">{value}</span>
        <Badge variant="secondary">{percentage}%</Badge>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <BarChart3 className="size-12 mx-auto mb-4 opacity-50" />
      <p>{message}</p>
    </div>
  );
}
