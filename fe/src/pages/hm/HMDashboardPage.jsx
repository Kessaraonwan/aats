import { useMemo, useState } from 'react';
import { mockApplications } from '../../data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Users, Clock, CheckCircle2, XCircle, TrendingUp, 
  Calendar, Target, Award, AlertCircle, BarChart3
} from 'lucide-react';

export function HMDashboardPage({ onNavigate }) {
  const [timeRange, setTimeRange] = useState('month'); // week, month, quarter, year

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const filterByTime = (app) => {
      const appDate = new Date(app.submittedDate);
      const daysDiff = Math.floor((now - appDate) / (1000 * 60 * 60 * 24));
      
      switch (timeRange) {
        case 'week': return daysDiff <= 7;
        case 'month': return daysDiff <= 30;
        case 'quarter': return daysDiff <= 90;
        case 'year': return daysDiff <= 365;
        default: return true;
      }
    };

    const filteredApps = mockApplications.filter(filterByTime);
    const evaluatedApps = filteredApps.filter(app => app.evaluation);
    const pendingApps = filteredApps.filter(app => app.status === 'interview' && !app.evaluation);
    
    // Calculate average score
    const avgScore = evaluatedApps.length > 0
      ? (evaluatedApps.reduce((sum, app) => sum + app.evaluation.overallScore, 0) / evaluatedApps.length).toFixed(2)
      : 0;

    // Calculate recommendation distribution
    const recommendations = {
      recommend: evaluatedApps.filter(app => app.evaluation.hiringRecommendation === 'recommend').length,
      notRecommend: evaluatedApps.filter(app => app.evaluation.hiringRecommendation === 'not-recommend').length,
      requestInterview: evaluatedApps.filter(app => app.evaluation.hiringRecommendation === 'request-interview').length,
    };

    // Get top positions
    const positionCounts = {};
    filteredApps.forEach(app => {
      positionCounts[app.jobTitle] = (positionCounts[app.jobTitle] || 0) + 1;
    });
    const topPositions = Object.entries(positionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([title, count]) => ({ title, count }));

    // Recent evaluations
    const recentEvaluations = evaluatedApps
      .sort((a, b) => new Date(b.evaluation.evaluatedAt) - new Date(a.evaluation.evaluatedAt))
      .slice(0, 5);

    // Performance metrics
    const highScoreApps = evaluatedApps.filter(app => app.evaluation.overallScore >= 4.0).length;
    const lowScoreApps = evaluatedApps.filter(app => app.evaluation.overallScore < 3.0).length;

    return {
      total: filteredApps.length,
      evaluated: evaluatedApps.length,
      pending: pendingApps.length,
      avgScore,
      recommendations,
      topPositions,
      recentEvaluations,
      highScoreApps,
      lowScoreApps,
      evaluationRate: filteredApps.length > 0 ? Math.round((evaluatedApps.length / filteredApps.length) * 100) : 0
    };
  }, [timeRange]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week': return '7 วันที่ผ่านมา';
      case 'month': return '30 วันที่ผ่านมา';
      case 'quarter': return '90 วันที่ผ่านมา';
      case 'year': return '1 ปีที่ผ่านมา';
      default: return 'ทั้งหมด';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-primary">แดชบอร์ด Hiring Manager</h1>
          <p className="text-muted-foreground">
            ภาพรวมการประเมินและสถิติผู้สมัครงาน
          </p>
        </div>
        
        {/* Time Range Filter */}
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map((range) => (
            <Button
              key={range}
              className={timeRange === range ? 'premium-btn' : 'premium-btn premium-btn--outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === 'week' && '7 วัน'}
              {range === 'month' && '30 วัน'}
              {range === 'quarter' && '90 วัน'}
              {range === 'year' && '1 ปี'}
            </Button>
          ))}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        แสดงข้อมูล: {getTimeRangeLabel()}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Applications */}
        <Card className="premium-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">ผู้สมัครทั้งหมด</p>
                {/* main number moved to colored square */}
                <p className="text-xs text-muted-foreground mt-1">
                  อัตราการประเมิน {stats.evaluationRate}%
                </p>
              </div>
              <div className="bg-primary text-primary p-3 rounded-lg flex items-center justify-center">
                <div className="text-white font-bold text-xl">{stats.total}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card className="premium-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">รอการประเมิน</p>
                {/* main number moved to colored square */}
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-xs mt-1"
                  onClick={() => onNavigate('hm-review')}
                >
                  ไปประเมิน →
                </Button>
              </div>
              <div className="bg-primary text-primary p-3 rounded-lg flex items-center justify-center">
                <div className="text-white font-bold text-xl">{stats.pending}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluated */}
        <Card className="premium-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">ประเมินแล้ว</p>
                {/* main number moved to colored square */}
                <p className="text-xs text-muted-foreground mt-1">
                  คะแนนเฉลี่ย {stats.avgScore}/5.0
                </p>
              </div>
              <div className="bg-primary text-primary p-3 rounded-lg flex items-center justify-center">
                <div className="text-white font-bold text-xl">{stats.evaluated}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High Score Applicants */}
        <Card className="premium-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">คะแนนสูง (≥4.0)</p>
                {/* main number moved to colored square */}
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.evaluated > 0 ? Math.round((stats.highScoreApps / stats.evaluated) * 100) : 0}% ของทั้งหมด
                </p>
              </div>
              <div className="bg-primary text-primary p-3 rounded-lg flex items-center justify-center">
                <div className="text-white font-bold text-xl">{stats.highScoreApps}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations & Top Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Recommendations */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Target className="size-5" />
              ผลการตัดสินใจ
            </CardTitle>
            <CardDescription>การแนะนำการจ้างงาน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-green-600" />
                  <span className="font-medium">แนะนำให้จ้าง</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.recommendations.recommend}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.evaluated > 0 ? Math.round((stats.recommendations.recommend / stats.evaluated) * 100) : 0}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="size-5 text-orange-600" />
                  <span className="font-medium">ต้องการสัมภาษณ์เพิ่ม</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.recommendations.requestInterview}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.evaluated > 0 ? Math.round((stats.recommendations.requestInterview / stats.evaluated) * 100) : 0}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="size-5 text-red-600" />
                  <span className="font-medium">ไม่แนะนำให้จ้าง</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.recommendations.notRecommend}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.evaluated > 0 ? Math.round((stats.recommendations.notRecommend / stats.evaluated) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Positions */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <BarChart3 className="size-5" />
              ตำแหน่งยอดนิยม
            </CardTitle>
            <CardDescription>ตำแหน่งที่มีผู้สมัครมากที่สุด</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topPositions.length > 0 ? (
              <div className="space-y-3">
                {stats.topPositions.map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{position.title}</span>
                    </div>
                    <Badge variant="secondary" className="text-base">
                      {position.count} คน
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="size-12 mx-auto mb-4 opacity-50" />
                <p>ยังไม่มีข้อมูลผู้สมัครในช่วงเวลานี้</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Evaluations */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Calendar className="size-5" />
            การประเมินล่าสุด
          </CardTitle>
          <CardDescription>รายการประเมินที่ทำไปล่าสุด 5 รายการ</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentEvaluations.length > 0 ? (
            <div className="space-y-3">
              {stats.recentEvaluations.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{app.candidateName}</span>
                      <Badge variant="outline" className="text-xs">
                        {app.jobTitle}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(app.evaluation.evaluatedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {app.evaluation.evaluatorName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {app.evaluation.overallScore}/5.0
                      </div>
                      {app.evaluation.hiringRecommendation === 'recommend' && (
                        <Badge className="bg-green-600 text-xs">แนะนำ</Badge>
                      )}
                      {app.evaluation.hiringRecommendation === 'not-recommend' && (
                        <Badge variant="destructive" className="text-xs">ไม่แนะนำ</Badge>
                      )}
                      {app.evaluation.hiringRecommendation === 'request-interview' && (
                        <Badge variant="secondary" className="text-xs">สัมภาษณ์เพิ่ม</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="size-12 mx-auto mb-4 opacity-50" />
              <p>ยังไม่มีการประเมินในช่วงเวลานี้</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
