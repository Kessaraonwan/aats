import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { mockApplications, mockJobs } from '../../data/mockData';
import { Users, Briefcase, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

export function HRDashboardPage() {
  const totalApplications = mockApplications.length;
  const activeJobs = mockJobs.filter(job => job.status === 'active').length;
  const pendingReview = mockApplications.filter(app => app.status === 'submitted' || app.status === 'screening').length;
  const offers = mockApplications.filter(app => app.status === 'offer').length;

  const recentApplications = mockApplications
    .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
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
                    <p>{app.candidateName}</p>
                    <p className="text-muted-foreground">{app.jobTitle}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{statusLabels[app.status]}</Badge>
                    <p className="text-muted-foreground mt-1">{formatDate(app.submittedDate)}</p>
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
              {mockJobs.slice(0, 5).map((job) => {
                const applicantCount = mockApplications.filter(app => app.jobId === job.id).length;
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
              const count = mockApplications.filter(app => app.status === status).length;
              const percentage = ((count / totalApplications) * 100).toFixed(0);
              
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