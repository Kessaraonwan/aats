import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Target,
  Award,
} from 'lucide-react';
import { useRecruitmentData } from '../../hooks/useRecruitmentData';

const timeRangeOptions = [
  { value: 'week', label: '7 วัน' },
  { value: 'month', label: '30 วัน' },
  { value: 'quarter', label: '90 วัน' },
  { value: 'year', label: '1 ปี' },
  { value: 'all', label: 'ทั้งหมด' },
];

const formatDate = (value) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

export function HMDashboardPage({ onNavigate, onReview }) {
  const {
    applications,
    details,
    loading,
    error,
    refresh,
  } = useRecruitmentData({ includeDetails: true });
  const [timeRange, setTimeRange] = useState('month');

  const filteredApps = useMemo(() => {
    if (timeRange === 'all') return applications;
    const now = Date.now();
    const diffLimit = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
    }[timeRange] || 0;
    return applications.filter((app) => {
      if (!app.submittedDate) return false;
      const diffDays = Math.floor((now - app.submittedDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= diffLimit;
    });
  }, [applications, timeRange]);

  const enriched = useMemo(() => {
    return filteredApps.map((app) => ({
      ...app,
      detail: details[app.id],
    }));
  }, [filteredApps, details]);

  const evaluated = enriched.filter((app) => app.detail?.evaluation);
  const pending = enriched.filter((app) => app.status === 'interview' && !app.detail?.evaluation);

  const averageScore = evaluated.length
    ? (
        evaluated.reduce(
          (total, app) => total + (Number(app.detail?.evaluation?.overallScore) || 0),
          0
        ) / evaluated.length
      ).toFixed(2)
    : '0.00';

  const topPositions = useMemo(() => {
    const counts = {};
    enriched.forEach((app) => {
      const title = app.detail?.job?.title || app.detail?.job?.Title || '-';
      counts[title] = (counts[title] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [enriched]);

  const recentEvaluations = useMemo(() => {
    return evaluated
      .sort((a, b) => {
        const da = new Date(a.detail?.evaluation?.evaluatedAt || 0).getTime();
        const db = new Date(b.detail?.evaluation?.evaluatedAt || 0).getTime();
        return db - da;
      })
      .slice(0, 5);
  }, [evaluated]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3 text-muted-foreground">
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">แดชบอร์ด Hiring Manager</h1>
          <p className="text-muted-foreground">ภาพรวมการประเมินและสถานะผู้สมัคร</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {timeRangeOptions.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={timeRange === option.value ? 'default' : 'outline'}
              onClick={() => setTimeRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Colorful summary tiles */}
        <SummaryCard color="bg-indigo-100 text-indigo-600" icon={Users} title="ใบสมัครทั้งหมด" value={enriched.length} suffix={` จาก ${applications.length}`} />
        <SummaryCard color="bg-emerald-100 text-emerald-600" icon={CheckCircle2} title="ประเมินแล้ว" value={evaluated.length} />
        <SummaryCard color="bg-amber-100 text-amber-600" icon={Clock} title="รอประเมิน" value={pending.length} />
        <SummaryCard color="bg-sky-100 text-sky-600" icon={TrendingUp} title="คะแนนเฉลี่ย" value={averageScore} suffix="/5" />
      </div>

      {/* status breakdown removed per request */}

      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Target className="size-5" /> ตำแหน่งที่มีผู้สมัครมากที่สุด
          </CardTitle>
          <CardDescription>5 ตำแหน่งที่มีผู้สมัครเข้ามามากที่สุดในช่วงเวลาที่เลือก</CardDescription>
        </CardHeader>
        <CardContent>
          {topPositions.length ? (
            <div className="space-y-3">
              {topPositions.map(([title, count], index) => (
                <div key={title} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{title}</span>
                  </div>
                  <Badge className="bg-sky-50 text-sky-600">{count} คน</Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="ยังไม่มีข้อมูลตำแหน่งในช่วงเวลานี้" />
          )}
        </CardContent>
      </Card>

      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Calendar className="size-5" /> การประเมินล่าสุด
          </CardTitle>
          <CardDescription>รายชื่อการประเมิน 5 รายการล่าสุด</CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvaluations.length ? (
            <div className="space-y-3">
              {recentEvaluations.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{app.detail?.applicant?.name || 'ไม่ระบุ'}</p>
                    <p className="text-sm text-muted-foreground">
                      {app.detail?.job?.title || app.detail?.job?.Title || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ประเมินโดย {app.detail?.evaluation?.evaluatorName || '-'} • {formatDate(app.detail?.evaluation?.evaluatedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-primary">
                      <span className={Number(app.detail?.evaluation?.overallScore) >= 4 ? 'text-emerald-600' : Number(app.detail?.evaluation?.overallScore) >= 3 ? 'text-amber-600' : 'text-red-600'}>{app.detail?.evaluation?.overallScore ?? '-'}</span> / 5
                    </div>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => onReview?.(app.id)}>
                      เปิดรายละเอียด
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="ยังไม่มีการประเมินในช่วงเวลานี้" />
          )}
        </CardContent>
      </Card>

      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Award className="size-5" /> อัตราประเมินสำเร็จ
          </CardTitle>
          <CardDescription>เปอร์เซ็นต์การประเมินที่เสร็จสิ้นจากใบสมัครทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-semibold text-primary">
              {enriched.length ? Math.round((evaluated.length / enriched.length) * 100) : 0}%
            </p>
            <p className="text-sm text-muted-foreground">ประเมินแล้ว {evaluated.length} จาก {enriched.length} ใบสมัคร</p>
          </div>
          {/* refresh removed per request */}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ icon: Icon, title, value, suffix }) {
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

function EmptyState({ message }) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Users className="size-12 mx-auto mb-4 opacity-50" />
      <p>{message}</p>
    </div>
  );
}
