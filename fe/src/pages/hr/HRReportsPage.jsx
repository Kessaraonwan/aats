import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { mockApplications, mockJobs } from '../../data/mockData';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Calendar,
  Target,
  Award,
  AlertCircle,
  FileText,
  PieChart
} from 'lucide-react';

export function HRReportsPage() {
  const [dateRange, setDateRange] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Calculate statistics
  const totalApplications = mockApplications.length;
  const activeJobs = mockJobs.filter(job => job.status === 'active').length;
  const closedJobs = mockJobs.filter(job => job.status === 'closed').length;

  // Status breakdown
  const statusStats = {
    submitted: mockApplications.filter(app => app.status === 'submitted').length,
    screening: mockApplications.filter(app => app.status === 'screening').length,
    interview: mockApplications.filter(app => app.status === 'interview').length,
    offer: mockApplications.filter(app => app.status === 'offer').length,
    hired: mockApplications.filter(app => app.status === 'hired').length,
    rejected: mockApplications.filter(app => app.status === 'rejected').length,
    withdrawn: mockApplications.filter(app => app.status === 'withdrawn').length
  };

  // Department breakdown
  const departments = [...new Set(mockJobs.map(job => job.department))];
  const departmentStats = departments.map(dept => {
    const deptJobs = mockJobs.filter(job => job.department === dept);
    const deptJobIds = deptJobs.map(job => job.id);
    const deptApplications = mockApplications.filter(app => deptJobIds.includes(app.jobId));
    
    return {
      name: dept,
      jobs: deptJobs.length,
      applications: deptApplications.length,
      hired: deptApplications.filter(app => app.status === 'hired').length,
      avgApplicationsPerJob: deptApplications.length / deptJobs.length || 0
    };
  });

  // Time-to-hire calculation (mock)
  const avgTimeToHire = 21; // days
  const prevAvgTimeToHire = 25;
  const timeToHireChange = ((avgTimeToHire - prevAvgTimeToHire) / prevAvgTimeToHire * 100).toFixed(1);

  // Conversion rates
  const submittedToInterview = ((statusStats.interview / statusStats.submitted) * 100 || 0).toFixed(1);
  const interviewToOffer = ((statusStats.offer / statusStats.interview) * 100 || 0).toFixed(1);
  const offerToHired = ((statusStats.hired / statusStats.offer) * 100 || 0).toFixed(1);
  const overallConversion = ((statusStats.hired / totalApplications) * 100 || 0).toFixed(1);

  // Top performing jobs
  const jobPerformance = mockJobs.map(job => {
    const applications = mockApplications.filter(app => app.jobId === job.id);
    const hired = applications.filter(app => app.status === 'hired').length;
    return {
      ...job,
      applications: applications.length,
      hired,
      conversionRate: (hired / applications.length * 100 || 0).toFixed(1)
    };
  }).sort((a, b) => b.applications - a.applications).slice(0, 5);

  // Source tracking (mock data)
  const sources = [
    { name: 'เว็บไซต์บริษัท', applications: 25, percentage: 50, hired: 8 },
    { name: 'LinkedIn', applications: 15, percentage: 30, hired: 5 },
    { name: 'JobThai', applications: 7, percentage: 14, hired: 2 },
    { name: 'Referral', applications: 3, percentage: 6, hired: 2 }
  ];

  const handleExport = (type) => {
    // Mock export functionality
    console.log(`Exporting ${type} report...`);
    alert(`กำลังส่งออกรายงาน ${type === 'pdf' ? 'PDF' : 'Excel'}...`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-primary">
            <BarChart3 className="h-8 w-8" />
            รายงานและสถิติ
          </h1>
          <p className="text-muted-foreground">วิเคราะห์ข้อมูลการสรรหาบุคลากร</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">สัปดาห์นี้</SelectItem>
              <SelectItem value="month">เดือนนี้</SelectItem>
              <SelectItem value="quarter">ไตรมาสนี้</SelectItem>
              <SelectItem value="year">ปีนี้</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="premium-btn premium-btn--outline gap-2" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" className="premium-btn premium-btn--outline gap-2" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="premium-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ใบสมัครทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% จากเดือนที่แล้ว
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ตำแหน่งเปิดรับ</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {closedJobs} ตำแหน่งปิดรับแล้ว
            </p>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">เวลาเฉลี่ยในการจ้าง</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTimeToHire} วัน</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                {Math.abs(timeToHireChange)}% เร็วขึ้น
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">อัตราการจ้าง</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallConversion}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              จากใบสมัครทั้งหมด
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Recruitment Funnel
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2">
            <PieChart className="h-4 w-4" />
            แยกตามแผนก
          </TabsTrigger>
          <TabsTrigger value="sources" className="gap-2">
            <Target className="h-4 w-4" />
            แหล่งที่มา
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-2">
            <Award className="h-4 w-4" />
            ตำแหน่งยอดนิยม
          </TabsTrigger>
        </TabsList>

        {/* Recruitment Funnel */}
        <TabsContent value="funnel" className="space-y-4">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="text-primary">Recruitment Funnel</CardTitle>
              <CardDescription>อัตราการแปลงในแต่ละขั้นตอน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Funnel Visualization */}
              <div className="space-y-4">
                {/* Submitted */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">ส่งใบสมัคร</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{statusStats.submitted}</span>
                      <Badge variant="secondary">100%</Badge>
                    </div>
                  </div>
                  <Progress value={100} className="h-3" />
                </div>

                {/* Screening */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">ตรวจสอบเบื้องต้น</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{statusStats.screening}</span>
                      <Badge variant="secondary">
                        {((statusStats.screening / statusStats.submitted) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={(statusStats.screening / statusStats.submitted) * 100} 
                    className="h-3"
                  />
                </div>

                {/* Interview */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">สัมภาษณ์</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{statusStats.interview}</span>
                      <Badge variant="secondary">{submittedToInterview}%</Badge>
                    </div>
                  </div>
                  <Progress 
                    value={submittedToInterview} 
                    className="h-3"
                  />
                </div>

                {/* Offer */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">เสนอตำแหน่ง</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{statusStats.offer}</span>
                      <Badge variant="secondary">{interviewToOffer}%</Badge>
                    </div>
                  </div>
                  <Progress 
                    value={(statusStats.offer / statusStats.submitted) * 100} 
                    className="h-3"
                  />
                </div>

                {/* Hired */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">จ้างงานแล้ว</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{statusStats.hired}</span>
                      <Badge variant="default">{overallConversion}%</Badge>
                    </div>
                  </div>
                  <Progress 
                    value={overallConversion} 
                    className="h-3"
                  />
                </div>
              </div>

              {/* Conversion Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">สมัคร → สัมภาษณ์</div>
                  <div className="text-2xl font-bold text-purple-600">{submittedToInterview}%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">สัมภาษณ์ → เสนองาน</div>
                  <div className="text-2xl font-bold text-green-600">{interviewToOffer}%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">เสนองาน → จ้าง</div>
                  <div className="text-2xl font-bold text-orange-600">{offerToHired}%</div>
                </div>
              </div>

              {/* Rejected/Withdrawn */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium">ปฏิเสธ</span>
                  </div>
                  <span className="text-xl font-bold">{statusStats.rejected}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">ถอนใบสมัคร</span>
                  </div>
                  <span className="text-xl font-bold">{statusStats.withdrawn}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Department Stats */}
        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>สถิติแยกตามแผนก</CardTitle>
              <CardDescription>ประสิทธิภาพการสรรหาของแต่ละแผนก</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentStats
                  .sort((a, b) => b.applications - a.applications)
                  .map((dept) => (
                    <div key={dept.name} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{dept.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {dept.jobs} ตำแหน่ง • {dept.applications} ใบสมัคร
                          </p>
                        </div>
                        <Badge variant={dept.hired > 0 ? 'default' : 'secondary'}>
                          {dept.hired} คนที่จ้าง
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>ใบสมัครต่อตำแหน่ง</span>
                          <span className="font-medium">{dept.avgApplicationsPerJob.toFixed(1)}</span>
                        </div>
                        <Progress 
                          value={(dept.avgApplicationsPerJob / 10) * 100} 
                          className="h-2"
                        />
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4 text-blue-600" />
                          <span>{dept.jobs} ตำแหน่ง</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span>{dept.applications} ใบสมัคร</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-green-600" />
                          <span>{dept.hired} จ้างแล้ว</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sources */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>แหล่งที่มาของผู้สมัคร</CardTitle>
              <CardDescription>ช่องทางที่ผู้สมัครมาจาก</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sources.map((source) => (
                  <div key={source.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{source.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {source.hired} คนที่จ้าง
                        </span>
                        <Badge variant="secondary">
                          {source.applications} ใบสมัคร
                        </Badge>
                      </div>
                    </div>
                    <Progress value={source.percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{source.percentage}% ของทั้งหมด</span>
                      <span>อัตราจ้าง: {((source.hired / source.applications) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Insights */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Insight</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      เว็บไซต์บริษัทเป็นแหล่งที่มีใบสมัครมากที่สุด (50%) และมีอัตราการจ้างสูง (32%)
                      แนะนำให้เพิ่มการลงทุนในการโปรโมทผ่านเว็บไซต์บริษัทและ SEO
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Jobs */}
        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ตำแหน่งงานยอดนิยม</CardTitle>
              <CardDescription>5 ตำแหน่งที่มีผู้สมัครมากที่สุด</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobPerformance.map((job, index) => (
                  <div key={job.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.department}</p>
                        </div>
                      </div>
                      <Badge variant={job.hired > 0 ? 'default' : 'secondary'}>
                        {job.hired > 0 ? `${job.hired} คนที่จ้าง` : 'ยังไม่มีการจ้าง'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">ใบสมัคร</div>
                        <div className="text-xl font-bold">{job.applications}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">จ้างแล้ว</div>
                        <div className="text-xl font-bold">{job.hired}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">อัตราจ้าง</div>
                        <div className="text-xl font-bold">{job.conversionRate}%</div>
                      </div>
                    </div>
                    <Progress value={job.conversionRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
