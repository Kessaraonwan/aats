import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  BarChart3,
  CheckCircle2,
  Award,
  Clock,
} from 'lucide-react';
import { useRecruitmentData } from '../../hooks/useRecruitmentData';

const timeRanges = [
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

export function HMReportsPage() {
  // Keep hooks in the same order across renders.
  const {
    applications,
    jobs,
    details,
    loading,
    error,
    refresh,
  } = useRecruitmentData({ includeDetails: true });
  const [timeRange, setTimeRange] = useState('month');

  // Compute derived values via hooks unconditionally so hook order is stable.
  const filteredApps = useMemo(() => {
    if (!applications) return [];
    if (timeRange === 'all') return applications;
    const now = Date.now();
    const days = { week: 7, month: 30, quarter: 90, year: 365 }[timeRange] || 0;
    return applications.filter((app) => {
      if (!app || !app.submittedDate) return false;
      const submittedAt = app.submittedDate instanceof Date ? app.submittedDate : new Date(app.submittedDate);
      if (Number.isNaN(submittedAt.getTime())) return false;
      const diff = Math.floor((now - submittedAt.getTime()) / (1000 * 60 * 60 * 24));
      return diff <= days;
    });
  }, [applications, timeRange]);

  const enriched = useMemo(() => (filteredApps || []).map((app) => ({ ...app, detail: (details || {})[app.id] })), [filteredApps, details]);
  const evaluated = enriched.filter((app) => app.detail?.evaluation);
  const pending = enriched.filter((app) => app.status === 'interview' && !app.detail?.evaluation);

  const scoreStats = useMemo(() => {
    if (!evaluated.length) {
      return {
        average: '0.00',
        max: '0.00',
        min: '0.00',
        distribution: { high: 0, mid: 0, low: 0 },
      };
    }
    const scores = evaluated.map((app) => Number(app.detail?.evaluation?.overallScore) || 0);
    const total = scores.reduce((sum, score) => sum + score, 0);
    return {
      average: (total / scores.length).toFixed(2),
      max: Math.max(...scores).toFixed(2),
      min: Math.min(...scores).toFixed(2),
      distribution: {
        high: scores.filter((score) => score >= 4).length,
        mid: scores.filter((score) => score >= 3 && score < 4).length,
        low: scores.filter((score) => score < 3).length,
      },
    };
  }, [evaluated]);

  const positionStats = useMemo(() => {
    const map = {};
    enriched.forEach((app) => {
      const job = app.detail?.job || jobs.find((j) => j.id === app.jobId) || {};
      const title = job.title || job.Title || '-';
      if (!map[title]) {
        map[title] = { total: 0, evaluated: 0, scores: [] };
      }
      map[title].total += 1;
      if (app.detail?.evaluation?.overallScore != null) {
        map[title].evaluated += 1;
        map[title].scores.push(Number(app.detail?.evaluation?.overallScore));
      }
    });
    return Object.entries(map)
      .map(([title, stats]) => ({
        title,
        total: stats.total,
        evaluated: stats.evaluated,
        average: stats.scores.length
          ? (stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length).toFixed(2)
          : '0.00',
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [enriched, jobs]);

  const topPerformers = useMemo(() => {
    return evaluated
      .filter((app) => app.detail?.evaluation?.overallScore != null)
      .sort((a, b) => (b.detail?.evaluation?.overallScore || 0) - (a.detail?.evaluation?.overallScore || 0))
      .slice(0, 10);
  }, [evaluated]);

  const exportReport = (format) => {
    const data = {
      timeRange,
      totalApplications: enriched.length,
      evaluated: evaluated.length,
      pending: pending.length,
      averageScore: scoreStats.average,
    };
    console.log(`Export ${format}`, data);
    alert(`กำลังเตรียมไฟล์รายงาน (${format.toUpperCase()})...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">รายงานการประเมิน</h1>
          <p className="text-muted-foreground">สรุปผลการประเมินผู้สมัครและสถิติสำคัญ</p>
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
          <Button variant="outline" onClick={() => exportReport('pdf')} className="gap-2">
            <Download className="size-4" /> PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport('xlsx')} className="gap-2">
            <Download className="size-4" /> Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryTile icon={Users} title="ใบสมัครในช่วงเวลานี้" value={enriched.length} />
        <SummaryTile icon={CheckCircle2} title="ประเมินแล้ว" value={evaluated.length} />
        <SummaryTile icon={Clock} title="รอประเมิน" value={pending.length} />
        <SummaryTile icon={TrendingUp} title="คะแนนเฉลี่ย" value={scoreStats.average} suffix="/5" />
      </div>

      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <BarChart3 className="size-5" /> ภาพรวมคะแนนการประเมิน
          </CardTitle>
          <CardDescription>สถิติคะแนนจากการประเมินทั้งหมดในช่วงเวลาที่เลือก</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">ค่าเฉลี่ย</p>
            <p className="text-3xl font-semibold text-primary">{scoreStats.average}</p>
            <p className="text-xs text-muted-foreground">สูงสุด {scoreStats.max} • ต่ำสุด {scoreStats.min}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">การกระจายคะแนน</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <DistributionBadge label="สูง" value={scoreStats.distribution.high} variant="success" />
              <DistributionBadge label="กลาง" value={scoreStats.distribution.mid} variant="info" />
              <DistributionBadge label="ต่ำ" value={scoreStats.distribution.low} variant="warning" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Users className="size-5" /> ตำแหน่งยอดนิยม
          </CardTitle>
          <CardDescription>6 ตำแหน่งที่มีผู้สมัครมากที่สุด พร้อมค่าเฉลี่ยคะแนน</CardDescription>
        </CardHeader>
        <CardContent>
          {positionStats.length ? (
            <div className="space-y-3">
              {positionStats.map((stat) => (
                <div key={stat.title} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{stat.title}</p>
                    <p className="text-xs text-muted-foreground">รวม {stat.total} • ประเมินแล้ว {stat.evaluated}</p>
                  </div>
                  <Badge variant="secondary">เฉลี่ย {stat.average}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="ยังไม่มีข้อมูลผู้สมัครในช่วงเวลานี้" />
          )}
        </CardContent>
      </Card>

      {topPerformers.length > 0 && (
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Award className="size-5" /> ผู้สมัครคะแนนสูงสุด (Top 10)
            </CardTitle>
            <CardDescription>คัดจากคะแนนการประเมินรวม</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {topPerformers.map((app, index) => (
              <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{app.detail?.applicant?.name || 'ไม่ระบุ'}</p>
                  <p className="text-xs text-muted-foreground">
                    {app.detail?.job?.title || app.detail?.job?.Title || '-'} • {formatDate(app.detail?.evaluation?.evaluatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">อันดับ {index + 1}</Badge>
                  <Badge className="bg-green-600">{app.detail?.evaluation?.overallScore}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <FileText className="size-5" /> สรุปสั้น ๆ</CardTitle>
          <CardDescription>ตัวเลขสำคัญสำหรับการติดตามผล</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <SummaryPill label="อัตราการประเมิน" value={enriched.length ? Math.round((evaluated.length / enriched.length) * 100) : 0} suffix="%" />
          <SummaryPill label="ตำแหน่งที่มีใบสมัคร" value={positionStats.length} />
          <SummaryPill label="ผู้สมัครรอดำเนินการ" value={pending.length} />
        </CardContent>
      </Card>
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

function DistributionBadge({ label, value, variant }) {
  const classes = {
    success: 'bg-green-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600',
  }[variant];

  return (
    <div className={`rounded-lg text-white py-2 ${classes}`}>
      <p className="text-xs uppercase">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function SummaryPill({ label, value, suffix }) {
  return (
    <div className="p-4 border rounded-lg">
      <p className="text-xs text-muted-foreground uppercase">{label}</p>
      <p className="text-2xl font-semibold text-primary">{value}<span className="text-base">{suffix}</span></p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <Users className="size-12 mx-auto mb-4 opacity-50" />
      <p>{message}</p>
    </div>
  );
}
