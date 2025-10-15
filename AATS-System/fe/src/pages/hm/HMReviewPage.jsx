import { useMemo, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Users,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  GraduationCap,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  FileText,
} from 'lucide-react';
import { useRecruitmentData } from '../../hooks/useRecruitmentData';

const statusLabels = {
  submitted: 'ส่งใบสมัคร',
  screening: 'ตรวจสอบ',
  interview: 'สัมภาษณ์',
  offer: 'เสนอตำแหน่ง',
  hired: 'รับเข้าทำงาน',
  rejected: 'ไม่ผ่าน',
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const parseJsonField = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (err) {
    return null;
  }
};

export function HMReviewPage({ onReview }) {
  const {
    applications,
    jobs,
    details,
    detailsLoading,
    loading,
    error,
    refresh,
  } = useRecruitmentData({ includeDetails: true });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedScoreRange, setSelectedScoreRange] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Derived memoized values — keep these hooks always running (unconditional)
  const jobDictionary = useMemo(() => {
    const dict = {};
    jobs.forEach((job) => {
      dict[job.id] = job;
    });
    return dict;
  }, [jobs]);

  const enrichedApplications = useMemo(() => {
    return applications.map((app) => {
      const detail = details[app.id];
      const applicant = detail?.applicant;
      const job = detail?.job || jobDictionary[app.jobId] || {};
      const evaluation = detail?.evaluation || null;
      const educationRaw = detail?.application?.raw?.education || detail?.application?.raw?.Education;
      const experienceRaw = detail?.application?.raw?.experience || detail?.application?.raw?.Experience;

      return {
        ...app,
        candidateName: applicant?.name || 'ไม่ระบุ',
        candidateEmail: applicant?.email || '-',
        candidatePhone: applicant?.phone || '-',
        jobTitle: job?.title || job?.Title || '-',
        department: job?.department || job?.Department || '-',
        evaluation,
        education: parseJsonField(educationRaw),
        experience: parseJsonField(experienceRaw),
      };
    });
  }, [applications, details, jobDictionary]);

  const uniquePositions = useMemo(() => {
    return Array.from(new Set(enrichedApplications.map((app) => app.jobTitle).filter(Boolean))).sort();
  }, [enrichedApplications]);

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(enrichedApplications.map((app) => app.department).filter(Boolean))).sort();
  }, [enrichedApplications]);

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = enrichedApplications.filter((app) => {
      const matchesSearch =
        !searchTerm ||
        app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPosition = selectedPosition === 'all' || app.jobTitle === selectedPosition;
      const matchesDepartment = selectedDepartment === 'all' || app.department === selectedDepartment;

      let matchesScore = true;
      if (selectedScoreRange !== 'all' && app.evaluation?.overallScore != null) {
        const score = Number(app.evaluation.overallScore) || 0;
        if (selectedScoreRange === 'high') matchesScore = score >= 4;
        if (selectedScoreRange === 'medium') matchesScore = score >= 3 && score < 4;
        if (selectedScoreRange === 'low') matchesScore = score < 3;
      }

      return matchesSearch && matchesPosition && matchesDepartment && matchesScore;
    });

    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return (a.submittedDate?.getTime?.() || 0) - (b.submittedDate?.getTime?.() || 0);
        case 'date-desc':
          return (b.submittedDate?.getTime?.() || 0) - (a.submittedDate?.getTime?.() || 0);
        case 'score-desc':
          return (b.evaluation?.overallScore || 0) - (a.evaluation?.overallScore || 0);
        case 'score-asc':
          return (a.evaluation?.overallScore || 0) - (b.evaluation?.overallScore || 0);
        case 'name-asc':
          return a.candidateName.localeCompare(b.candidateName, 'th');
        default:
          return 0;
      }
    });

    return filtered;
  }, [enrichedApplications, searchTerm, selectedPosition, selectedDepartment, selectedScoreRange, sortBy]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3 text-muted-foreground">
        <p>กำลังโหลดข้อมูลผู้สมัคร...</p>
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

  const pendingReview = filteredAndSortedApplications.filter(
    (app) => app.status === 'interview' && !app.evaluation
  );
  const completedReview = filteredAndSortedApplications.filter((app) => Boolean(app.evaluation));

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPosition('all');
    setSelectedDepartment('all');
    setSelectedScoreRange('all');
    setSortBy('date-desc');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="mb-1 text-primary text-2xl font-semibold">ประเมินผู้สมัคร</h1>
          <p className="text-muted-foreground">รายการผู้สมัครที่รอการประเมินและผลการประเมินล่าสุด</p>
        </div>
      </div>

      <Card className="premium-card">
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="ค้นหาชื่อผู้สมัครหรืออีเมล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger>
                <SelectValue placeholder="ตำแหน่ง" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกตำแหน่ง</SelectItem>
                {uniquePositions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="แผนก" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกแผนก</SelectItem>
                {uniqueDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedScoreRange} onValueChange={setSelectedScoreRange}>
              <SelectTrigger>
                <SelectValue placeholder="คะแนน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกระดับคะแนน</SelectItem>
                <SelectItem value="high">{'สูง (>= 4)'}</SelectItem>
                <SelectItem value="medium">{'ปานกลาง (3 - 3.9)'}</SelectItem>
                <SelectItem value="low">{'ต่ำ (< 3)'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="จัดเรียง" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">ล่าสุด</SelectItem>
                <SelectItem value="date-asc">เก่าสุด</SelectItem>
                <SelectItem value="score-desc">คะแนนสูงสุด</SelectItem>
                <SelectItem value="score-asc">คะแนนต่ำสุด</SelectItem>
                <SelectItem value="name-asc">ชื่อ (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
              <Filter className="size-4" /> ล้างตัวกรอง
            </Button>
            {detailsLoading && <span>กำลังโหลดรายละเอียดเพิ่มเติม...</span>}
          </div>
        </CardContent>
      </Card>

      {pendingReview.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">รอการประเมิน ({pendingReview.length})</h2>
            <Badge className="gap-1 bg-green-600 text-white">
              <Clock className="size-3" /> อยู่ระหว่างสัมภาษณ์/ประเมิน
            </Badge>
          </div>

          <div className="grid gap-4">
            {pendingReview.map((app) => (
              <Card key={app.id} className="border-l-4 border-green-600">
                <CardContent className="py-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">{app.candidateName}</h3>
                          <p className="text-sm text-muted-foreground">{app.jobTitle}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="size-3" /> {app.candidateEmail}
                            <span className="mx-2">•</span>
                            <Phone className="size-3" /> {app.candidatePhone}
                          </div>
                        </div>
                        <Badge className="bg-green-600 text-white">{statusLabels[app.status] || app.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {app.department && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="size-3" /> {app.department}
                          </span>
                        )}
                        {app.submittedDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" /> ส่ง {formatDate(app.submittedDate)}
                          </span>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                        {app.education?.degree && (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="size-4" /> {app.education.degree}
                          </div>
                        )}
                        {app.experience?.duration && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="size-4" /> {app.experience.duration}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button className="bg-green-600 text-white" onClick={() => onReview(app.id)}>เริ่มประเมิน</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completedReview.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">ประเมินแล้ว ({completedReview.length})</h2>
            <Badge variant="outline" className="gap-1">
              <ArrowUpDown className="size-3" /> จัดเรียง {sortBy}
            </Badge>
          </div>

          <div className="grid gap-4">
            {completedReview.map((app) => (
              <Card key={app.id}>
                <CardContent className="py-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">{app.candidateName}</h3>
                          <p className="text-sm text-muted-foreground">{app.jobTitle}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="size-3" /> {app.candidateEmail}
                            <span className="mx-2">•</span>
                            <Phone className="size-3" /> {app.candidatePhone}
                          </div>
                        </div>
                        <Badge variant="default">ประเมินแล้ว</Badge>
                      </div>

                      {app.evaluation && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">คะแนนรวม</span>
                            <span className="text-xl font-semibold text-primary">{app.evaluation.overallScore}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                            <div>เทคนิค: {app.evaluation.technicalSkills}</div>
                            <div>การสื่อสาร: {app.evaluation.communication}</div>
                            <div>แก้ปัญหา: {app.evaluation.problemSolving}</div>
                            <div>วัฒนธรรม: {app.evaluation.culturalFit}</div>
                          </div>
                          {app.evaluation.comments && (
                            <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                              <FileText className="size-3 inline mr-2" />
                              {app.evaluation.comments}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            ผู้ประเมิน: {app.evaluation.evaluatorName || '-'} • {formatDate(app.evaluation.evaluatedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" onClick={() => onReview(app.id)}>
                      ดูรายละเอียด
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!filteredAndSortedApplications.length && (
        <Card>
          <CardContent className="py-12 text-center">
            <Filter className="size-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg">ไม่พบผู้สมัครตามเงื่อนไข</h3>
            <p className="text-muted-foreground mt-2 mb-4">ลองปรับตัวกรองหรือคำค้นหาอีกครั้ง</p>
            <Button variant="outline" onClick={clearFilters}>ล้างตัวกรอง</Button>
          </CardContent>
        </Card>
      )}

      {!applications.length && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="size-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg">ยังไม่มีผู้สมัครที่ต้องประเมิน</h3>
            <p className="text-muted-foreground mt-2">ระบบจะอัปเดตเมื่อมีผู้สมัครเข้าสู่ขั้นตอนสัมภาษณ์</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
