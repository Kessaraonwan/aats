import { useMemo, useState } from 'react';
import { mockApplications } from '../../data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  FileText, Download, Calendar, TrendingUp, Users, 
  BarChart3, PieChart, Award, CheckCircle2, XCircle,
  AlertCircle, Target, Clock
} from 'lucide-react';

export function HMReportsPage() {
  const [reportType, setReportType] = useState('summary'); // summary, detailed, performance
  const [timeRange, setTimeRange] = useState('month'); // week, month, quarter, year, all

  // Calculate comprehensive statistics
  const reportData = useMemo(() => {
    const now = new Date();
    
    const filterByTime = (app) => {
      if (timeRange === 'all') return true;
      
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

    // Overall statistics
    const totalApps = filteredApps.length;
    const evaluatedCount = evaluatedApps.length;
    const pendingCount = filteredApps.filter(app => app.status === 'interview' && !app.evaluation).length;
    
    // Score statistics
    const scores = evaluatedApps.map(app => app.evaluation.overallScore);
    const avgScore = scores.length > 0 
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
      : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores).toFixed(2) : 0;
    const minScore = scores.length > 0 ? Math.min(...scores).toFixed(2) : 0;

    // Score distribution
    const scoreDistribution = {
      excellent: evaluatedApps.filter(app => app.evaluation.overallScore >= 4.5).length,
      good: evaluatedApps.filter(app => app.evaluation.overallScore >= 3.5 && app.evaluation.overallScore < 4.5).length,
      average: evaluatedApps.filter(app => app.evaluation.overallScore >= 2.5 && app.evaluation.overallScore < 3.5).length,
      poor: evaluatedApps.filter(app => app.evaluation.overallScore < 2.5).length,
    };

    // Recommendation distribution
    const recommendations = {
      recommend: evaluatedApps.filter(app => app.evaluation.hiringRecommendation === 'recommend').length,
      notRecommend: evaluatedApps.filter(app => app.evaluation.hiringRecommendation === 'not-recommend').length,
      requestInterview: evaluatedApps.filter(app => app.evaluation.hiringRecommendation === 'request-interview').length,
    };

    // Position statistics
    const positionStats = {};
    filteredApps.forEach(app => {
      if (!positionStats[app.jobTitle]) {
        positionStats[app.jobTitle] = {
          total: 0,
          evaluated: 0,
          avgScore: 0,
          scores: []
        };
      }
      positionStats[app.jobTitle].total++;
      if (app.evaluation) {
        positionStats[app.jobTitle].evaluated++;
        positionStats[app.jobTitle].scores.push(app.evaluation.overallScore);
      }
    });

    Object.keys(positionStats).forEach(position => {
      const stats = positionStats[position];
      if (stats.scores.length > 0) {
        stats.avgScore = (stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length).toFixed(2);
      }
    });

    // Top performers
    const topPerformers = evaluatedApps
      .sort((a, b) => b.evaluation.overallScore - a.evaluation.overallScore)
      .slice(0, 10);

    // Criteria analysis
    const criteriaScores = {};
    const criteriaKeys = [
      'technicalKnowledge', 'technicalSkills', 'toolsProficiency',
      'communication', 'teamwork', 'leadership',
      'problemSolving', 'analyticalThinking', 'creativity',
      'workEthic', 'adaptability', 'initiative', 'reliability',
      'cultureFit', 'valuesAlignment', 'teamAlignment', 'growthPotential'
    ];

    criteriaKeys.forEach(key => {
      const criteriaScoresList = evaluatedApps
        .map(app => app.evaluation[key])
        .filter(score => score !== undefined);
      
      if (criteriaScoresList.length > 0) {
        criteriaScores[key] = {
          avg: (criteriaScoresList.reduce((a, b) => a + b, 0) / criteriaScoresList.length).toFixed(2),
          count: criteriaScoresList.length
        };
      }
    });

    // Evaluation rate
    const evaluationRate = totalApps > 0 ? Math.round((evaluatedCount / totalApps) * 100) : 0;

    // Average evaluation time
    const evaluationTimes = evaluatedApps.map(app => {
      const submitted = new Date(app.submittedDate);
      const evaluated = new Date(app.evaluation.evaluatedAt);
      return Math.floor((evaluated - submitted) / (1000 * 60 * 60 * 24));
    });
    const avgEvaluationTime = evaluationTimes.length > 0
      ? Math.round(evaluationTimes.reduce((a, b) => a + b, 0) / evaluationTimes.length)
      : 0;

    return {
      totalApps,
      evaluatedCount,
      pendingCount,
      avgScore,
      maxScore,
      minScore,
      scoreDistribution,
      recommendations,
      positionStats,
      topPerformers,
      criteriaScores,
      evaluationRate,
      avgEvaluationTime
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
      case 'all': return 'ทั้งหมด';
      default: return 'ทั้งหมด';
    }
  };

  const handleExport = () => {
    const data = {
      reportType,
      timeRange: getTimeRangeLabel(),
      generatedAt: new Date().toISOString(),
      ...reportData
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-report-${timeRange}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const criteriaLabels = {
    technicalKnowledge: 'ความรู้ทางเทคนิค',
    technicalSkills: 'ทักษะการปฏิบัติงาน',
    toolsProficiency: 'ความชำนาญเครื่องมือ',
    communication: 'การสื่อสาร',
    teamwork: 'การทำงานเป็นทีม',
    leadership: 'ภาวะผู้นำ',
    problemSolving: 'การแก้ปัญหา',
    analyticalThinking: 'การคิดวิเคราะห์',
    creativity: 'ความคิดสร้างสรรค์',
    workEthic: 'จรรยาบรรณ',
    adaptability: 'การปรับตัว',
    initiative: 'ความคิดริเริ่ม',
    reliability: 'ความน่าเชื่อถือ',
    cultureFit: 'ความเหมาะสมกับวัฒนธรรม',
    valuesAlignment: 'ความสอดคล้องกับค่านิยม',
    teamAlignment: 'ความเข้ากันกับทีม',
    growthPotential: 'ศักยภาพการเติบโต'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-2 text-primary">
            <BarChart3 className="size-7" />
            รายงานการประเมิน
          </h1>
          <p className="text-muted-foreground">
            สรุปผลและวิเคราะห์การประเมินผู้สมัครงาน
          </p>
        </div>

        <Button onClick={handleExport} className="premium-btn gap-2">
          <Download className="size-4" />
          Export รายงาน
        </Button>
      </div>

      {/* Filters */}
      <Card className="premium-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">ประเภทรายงาน</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">สรุปภาพรวม</SelectItem>
                  <SelectItem value="detailed">รายละเอียดเต็ม</SelectItem>
                  <SelectItem value="performance">ประสิทธิภาพการประเมิน</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">ช่วงเวลา</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">7 วันที่ผ่านมา</SelectItem>
                  <SelectItem value="month">30 วันที่ผ่านมา</SelectItem>
                  <SelectItem value="quarter">90 วันที่ผ่านมา</SelectItem>
                  <SelectItem value="year">1 ปีที่ผ่านมา</SelectItem>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <Calendar className="size-4" />
        ข้อมูล: {getTimeRangeLabel()} | สร้างเมื่อ: {formatDate(new Date().toISOString())}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="premium-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">ผู้สมัครทั้งหมด</p>
              <Users className="size-5 text-primary" />
            </div>
            <h3 className="text-3xl font-bold">{reportData.totalApps}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              อัตราการประเมิน {reportData.evaluationRate}%
            </p>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">ประเมินแล้ว</p>
              <CheckCircle2 className="size-5 text-primary" />
            </div>
            <h3 className="text-3xl font-bold">{reportData.evaluatedCount}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              เฉลี่ย {reportData.avgEvaluationTime} วัน
            </p>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">คะแนนเฉลี่ย</p>
              <TrendingUp className="size-5 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-primary">{reportData.avgScore}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              จาก 5.0 คะแนน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">รอการประเมิน</p>
              <Clock className="size-5 text-yellow-600" />
            </div>
            <h3 className="text-3xl font-bold text-yellow-600">{reportData.pendingCount}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              รออยู่ในคิว
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="size-5" />
              การกระจายคะแนน
            </CardTitle>
            <CardDescription>จำนวนผู้สมัครแต่ละระดับคะแนน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="size-5 text-green-600" />
                  <div>
                    <p className="font-medium">ดีเยี่ยม (4.5-5.0)</p>
                    <p className="text-sm text-muted-foreground">คะแนนสูงมาก</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {reportData.scoreDistribution.excellent}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {reportData.evaluatedCount > 0 
                      ? Math.round((reportData.scoreDistribution.excellent / reportData.evaluatedCount) * 100)
                      : 0}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-blue-600" />
                  <div>
                    <p className="font-medium">ดี (3.5-4.4)</p>
                    <p className="text-sm text-muted-foreground">คะแนนดี</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {reportData.scoreDistribution.good}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {reportData.evaluatedCount > 0 
                      ? Math.round((reportData.scoreDistribution.good / reportData.evaluatedCount) * 100)
                      : 0}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="size-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">ปานกลาง (2.5-3.4)</p>
                    <p className="text-sm text-muted-foreground">คะแนนพอใช้</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600">
                    {reportData.scoreDistribution.average}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {reportData.evaluatedCount > 0 
                      ? Math.round((reportData.scoreDistribution.average / reportData.evaluatedCount) * 100)
                      : 0}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="size-5 text-red-600" />
                  <div>
                    <p className="font-medium">ต้องพัฒนา (&lt;2.5)</p>
                    <p className="text-sm text-muted-foreground">คะแนนต่ำ</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {reportData.scoreDistribution.poor}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {reportData.evaluatedCount > 0 
                      ? Math.round((reportData.scoreDistribution.poor / reportData.evaluatedCount) * 100)
                      : 0}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hiring Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
                  <div>
                    <p className="font-medium">แนะนำให้จ้าง</p>
                    <p className="text-sm text-muted-foreground">ผ่านการประเมิน</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {reportData.recommendations.recommend}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {reportData.evaluatedCount > 0 
                      ? Math.round((reportData.recommendations.recommend / reportData.evaluatedCount) * 100)
                      : 0}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="size-5 text-orange-600" />
                  <div>
                    <p className="font-medium">ต้องการสัมภาษณ์เพิ่มเติม</p>
                    <p className="text-sm text-muted-foreground">รอการตัดสินใจ</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    {reportData.recommendations.requestInterview}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {reportData.evaluatedCount > 0 
                      ? Math.round((reportData.recommendations.requestInterview / reportData.evaluatedCount) * 100)
                      : 0}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="size-5 text-red-600" />
                  <div>
                    <p className="font-medium">ไม่แนะนำให้จ้าง</p>
                    <p className="text-sm text-muted-foreground">ไม่ผ่านการประเมิน</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {reportData.recommendations.notRecommend}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {reportData.evaluatedCount > 0 
                      ? Math.round((reportData.recommendations.notRecommend / reportData.evaluatedCount) * 100)
                      : 0}%
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">คะแนนสูงสุด:</span>
                  <span className="font-semibold">{reportData.maxScore}/5.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">คะแนนต่ำสุด:</span>
                  <span className="font-semibold">{reportData.minScore}/5.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ระยะเวลาประเมินเฉลี่ย:</span>
                  <span className="font-semibold">{reportData.avgEvaluationTime} วัน</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5" />
            สถิติตามตำแหน่งงาน
          </CardTitle>
          <CardDescription>จำนวนผู้สมัครและคะแนนเฉลี่ยแต่ละตำแหน่ง</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(reportData.positionStats).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(reportData.positionStats)
                .sort(([,a], [,b]) => b.total - a.total)
                .map(([position, stats]) => (
                  <div key={position} className="flex items-center justify-between p-4 border rounded-lg bg-muted transition-colors">
                    <div className="flex-1">
                      <p className="font-medium mb-1">{position}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>ทั้งหมด: {stats.total} คน</span>
                        <span>ประเมินแล้ว: {stats.evaluated} คน</span>
                        {stats.evaluated > 0 && (
                          <span>คะแนนเฉลี่ย: {stats.avgScore}/5.0</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={stats.evaluated === stats.total ? 'default' : 'secondary'}>
                        {stats.evaluated === stats.total ? 'เสร็จสิ้น' : `${Math.round((stats.evaluated / stats.total) * 100)}%`}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="size-12 mx-auto mb-4 opacity-50" />
              <p>ยังไม่มีข้อมูลตำแหน่งงาน</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      {reportData.topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-5" />
              ผู้สมัครคะแนนสูงสุด (Top 10)
            </CardTitle>
            <CardDescription>รายชื่อผู้สมัครที่ได้คะแนนประเมินสูงที่สุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reportData.topPerformers.map((app, index) => (
                <div key={app.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{app.candidateName}</span>
                      <Badge variant="outline" className="text-xs">{app.jobTitle}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ประเมินโดย {app.evaluation.evaluatorName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {app.evaluation.overallScore}/5.0
                    </div>
                    {app.evaluation.hiringRecommendation === 'recommend' && (
                      <Badge className="bg-green-600 text-xs mt-1">แนะนำจ้าง</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Criteria Analysis */}
      {reportType === 'detailed' && Object.keys(reportData.criteriaScores).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              วิเคราะห์คะแนนตามเกณฑ์
            </CardTitle>
            <CardDescription>คะแนนเฉลี่ยของแต่ละเกณฑ์การประเมิน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(reportData.criteriaScores)
                .sort(([,a], [,b]) => parseFloat(b.avg) - parseFloat(a.avg))
                .map(([key, data]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">{criteriaLabels[key] || key}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        ({data.count} ราย)
                      </span>
                      <Badge className={
                        parseFloat(data.avg) >= 4 ? 'bg-green-600' :
                        parseFloat(data.avg) >= 3 ? 'bg-blue-600' :
                        'bg-yellow-600'
                      }>
                        {data.avg}/5.0
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
