import { useEffect, useMemo, useState } from 'react';
import { Users, Briefcase, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useRecruitmentData, adaptApplicationDetail } from '../../hooks/useRecruitmentData';
import { applicationService } from '../../services/applicationService';

const statusLabels = {
  submitted: 'ส่งใบสมัคร',
  screening: 'ตรวจสอบ',
  interview: 'สัมภาษณ์',
  offer: 'เสนอตำแหน่ง',
  hired: 'รับเข้าทำงาน',
  rejected: 'ไม่ผ่าน',
};

const formatDate = (date) => {
  if (!date) return '-';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

export function HRDashboardPage() {
  // Request includeDetails so backend can return aggregated details (timeline/notes/job/applicant)
  // This reduces N+1 calls and ensures the FE is based on DB data returned by BE.
  const { applications, jobs, details, loading, error, refresh } = useRecruitmentData({ includeDetails: true });
  const [recentDetails, setRecentDetails] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadRecentDetails = async () => {
      if (!applications.length) {
        setRecentDetails([]);
        return;
      }
      setRecentLoading(true);
      try {
        const sorted = [...applications]
          .filter((app) => app.submittedDate)
          .sort((a, b) => b.submittedDate - a.submittedDate)
          .slice(0, 5);

        // Use the aggregated `details` returned by useRecruitmentData when available
        const detailsList = sorted.map((app) => {
          const det = details && details[app.id] ? details[app.id] : null;
          return {
            id: app.id,
            status: app.status,
            submittedDate: app.submittedDate,
            candidateName: det?.applicant?.name || 'ไม่ระบุ',
            jobTitle: det?.job?.title || det?.job?.Title || app.jobTitle || 'ไม่ทราบตำแหน่ง',
          };
        });

        if (!cancelled) {
          setRecentDetails(detailsList);
        }
      } finally {
        if (!cancelled) {
          setRecentLoading(false);
        }
      }
    };

    loadRecentDetails();

    return () => {
      cancelled = true;
    };
  }, [applications]);

  const totalApplications = applications.length;

  const statusCounts = useMemo(() => {
    return applications.reduce(
      (acc, app) => {
        const status = app.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {}
    );
  }, [applications]);

  const activeJobs = jobs.filter((job) => {
    const status = (job.status || '').toString().toLowerCase();
    if (status === 'active') return true;
    const closing = job.closingDate || job.ClosingDate || job.closing_date || null;
    if (closing) {
      try {
        const cd = new Date(closing);
        if (!Number.isNaN(cd.getTime())) return cd.getTime() > Date.now();
      } catch (e) {}
    }
    return false;
  }).length;
  const offers = statusCounts.offer || 0;
  const pendingReview = (statusCounts.submitted || 0) + (statusCounts.screening || 0);

  const stats = [
    {
      title: 'ใบสมัครทั้งหมด',
      value: totalApplications,
      icon: Users,
    },
    {
      title: 'ตำแหน่งที่เปิดรับ',
      value: activeJobs,
      icon: Briefcase,
    },
    {
      title: 'รอตรวจสอบ',
      value: pendingReview,
      icon: Clock,
    },
    {
      title: 'เสนอตำแหน่ง',
      value: offers,
      icon: CheckCircle,
    },
  ];

  const jobApplicantCounts = useMemo(() => {
    const counts = jobs.map((job) => ({
      ...job,
      applicantCount: applications.filter((app) => app.jobId === job.id).length,
    }));
    return counts.sort((a, b) => b.applicantCount - a.applicantCount).slice(0, 5);
  }, [jobs, applications]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground space-y-3">
        <p>กำลังโหลดข้อมูลแดชบอร์ด...</p>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="mb-1 text-primary text-2xl font-semibold">แดชบอร์ด HR</h1>
          <p className="text-muted-foreground">ภาพรวมสถานะการสรรหาและตำแหน่งงานที่เปิดอยู่</p>
        </div>
        {/* refresh removed per request */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="premium-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">{stat.title}</p>
                  <h2 className="text-2xl font-semibold">{stat.value}</h2>
                </div>
                <div className="bg-primary/10 text-primary p-3 rounded-lg">
                  <stat.icon className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="premium-card">
          <CardHeader>
            <h3 className="text-primary">ใบสมัครล่าสุด</h3>
          </CardHeader>
          <CardContent>
            {recentLoading && <p className="text-sm text-muted-foreground">กำลังโหลดรายละเอียด...</p>}
            <div className="space-y-4">
              {recentDetails.map((app) => (
                <div key={app.id} className="flex items-start justify-between gap-4 pb-4 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{app.candidateName}</p>
                    <p className="text-muted-foreground text-sm">{app.jobTitle}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{statusLabels[app.status] || app.status}</Badge>
                    <p className="text-muted-foreground mt-1 text-sm">{formatDate(app.submittedDate)}</p>
                  </div>
                </div>
              ))}
              {!recentDetails.length && !recentLoading && (
                <p className="text-sm text-muted-foreground text-center">ยังไม่มีข้อมูลใบสมัครล่าสุด</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader>
            <h3 className="text-primary">ตำแหน่งที่มีผู้สมัครมากที่สุด</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobApplicantCounts.map((job) => (
                <div key={job.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{job.title}</p>
                    <p className="text-muted-foreground text-sm">{job.department}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <span>{job.applicantCount}</span>
                  </div>
                </div>
              ))}
              {!jobApplicantCounts.length && (
                <p className="text-sm text-muted-foreground text-center">ยังไม่มีข้อมูลตำแหน่งงาน</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="premium-card">
        <CardHeader>
          <h3 className="text-primary">สถานะการสรรหา</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(statusLabels).map(([status, label]) => {
              const count = statusCounts[status] || 0;
              const percentage = totalApplications ? Math.round((count / totalApplications) * 100) : 0;
              return (
                <div key={status} className="premium-card text-center p-4">
                  <div className="bg-primary text-primary-foreground size-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    {count}
                  </div>
                  <p className="text-muted-foreground text-sm">{label}</p>
                  <p className="text-muted-foreground text-xs">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
