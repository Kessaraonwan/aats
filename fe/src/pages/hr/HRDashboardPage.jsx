import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Users, Briefcase, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';

export function HRDashboardPage() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const jobsResp = await jobService.getJobs(); // { data, meta }
        const appsResp = await applicationService.getApplications(); // returns { data, meta } per api interceptor
        if (!mounted) return;
        setJobs(jobsResp?.data || []);
        // applicationService returns response.data (axios interceptor returns data) - keep compatible
        const appsData = Array.isArray(appsResp?.data) ? appsResp.data : appsResp || [];
        // sometimes api wrapper returns { data, meta } already — normalize
        setApplications(appsData);
      } catch (err) {
        console.error('failed to load HR dashboard data', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const totalApplications = applications.length;
  const activeJobs = jobs.filter(job => (job.status || 'active') === 'active').length;
  const pendingReview = applications.filter(app => app.status === 'submitted' || app.status === 'screening').length;
  const offers = applications.filter(app => app.status === 'offer').length;

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.created_at || b.submittedDate || b.submitted_at || 0) - new Date(a.created_at || a.submittedDate || a.submitted_at || 0))
    .slice(0, 5);

  const stats = [
    {
      title: 'ใบสมัครทั้งหมด',
      value: totalApplications,
        showValueInIcon: true,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'ตำแหน่งที่เปิดรับ',
      value: activeJobs,
        icon: Briefcase,
        showValueInIcon: true,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'รอการตรวจสอบ',
      value: pendingReview,
      icon: Clock,
      showValueInIcon: true,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'เสนอตำแหน่ง',
      value: offers,
      icon: CheckCircle,
      showValueInIcon: true,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const statusLabels = {
    submitted: 'ส่งใบสมัคร',
    screening: 'ตรวจสอบ',
    interview: 'สัมภาษณ์',
    offer: 'เสนอตำแหน่ง',
    rejected: 'ไม่ผ่าน'
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-primary">แดชบอร์ด HR</h1>
        <p className="text-muted-foreground">ภาพรวมระบบสรรหาและคัดเลือกบุคลากร</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="premium-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">{stat.title}</p>
                  {!stat.showValueInIcon && (
                    <h2>{stat.value}</h2>
                  )}
                </div>
                <div className={`p-3 rounded-lg flex items-center justify-center`}>
                  {stat.showValueInIcon ? (
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                      <span className="font-bold">{stat.value}</span>
                    </div>
                  ) : (
                    <div className={`bg-primary text-primary p-3 rounded-lg`}>
                      <stat.icon className="size-6" />
                    </div>
                  )}
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
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-start justify-between gap-4 pb-4 border-b last:border-0">
                  <div className="flex-1">
                    <p>{app?.data?.candidateName || app.candidateName || app.name || '—'}</p>
                    <p className="text-muted-foreground">{app?.data?.jobTitle || app.jobTitle || (() => {
                      const j = jobs.find(jj => jj.id === app.job_id || jj.id === app.jobId);
                      return j ? j.title : '';
                    })()}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{statusLabels[app.status]}</Badge>
                    <p className="text-muted-foreground mt-1">{formatDate(app.created_at || app.submittedDate || app.submitted_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader>
            <h3 className="text-primary">ตำแหน่งที่มีผู้สมัครมากที่สุด</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.slice(0, 5).map((job) => {
                const applicantCount = applications.filter(app => (app.job_id === job.id || app.jobId === job.id)).length;
                return (
                  <div key={job.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                    <div className="flex-1">
                      <p>{job.title}</p>
                      <p className="text-muted-foreground">{job.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-muted-foreground" />
                      <span>{applicantCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="premium-card">
        <CardHeader>
          <h3 className="text-primary">สถิติการสมัครงาน</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries({
              submitted: { label: 'ส่งใบสมัคร' },
              screening: { label: 'ตรวจสอบ' },
              interview: { label: 'สัมภาษณ์' },
              offer: { label: 'เสนอตำแหน่ง' },
              rejected: { label: 'ไม่ผ่าน' }
            }).map(([status, { label }]) => {
              const count = applications.filter(app => app.status === status).length;
              const percentage = totalApplications > 0 ? ((count / totalApplications) * 100).toFixed(0) : '0';
              
              return (
                <div key={status} className="premium-card text-center p-4">
                  <div className={`bg-primary text-primary-foreground size-12 rounded-full flex items-center justify-center mx-auto mb-2`}>
                    {count}
                  </div>
                  <p className="text-muted-foreground">{label}</p>
                  <p className="text-muted-foreground">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}