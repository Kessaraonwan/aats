import { useState, useMemo, useEffect } from 'react';
import { applicationService } from '../../services/applicationService';
import { mockApplications } from '../../data/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.MODE === 'development';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Users, Clock, Search, Filter, ArrowUpDown, GraduationCap, Briefcase, Mail, Phone, Calendar, FileText } from 'lucide-react';

export function HMReviewPage({ onReview }) {
  const instanceId = Math.random().toString(36).slice(2,8);
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedScoreRange, setSelectedScoreRange] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, score-desc, score-asc, name-asc

  const [applications, setApplications] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.__mockApplications) return window.__mockApplications;
    } catch (e) {}
    return [];
  });
  const [isLoading, setIsLoading] = useState(!((typeof window !== 'undefined' && window.__mockApplications)));

  useEffect(() => {
    let mounted = true;
    try { console.debug(`[HMReviewPage:${instanceId}] useEffect mount`); } catch(e){}
    (async () => {
      try {
        setIsLoading(true);
        if (USE_MOCK) {
          if (!mounted) return;
          const src = (typeof window !== 'undefined' && window.__mockApplications) ? window.__mockApplications : mockApplications;
          if (typeof window !== 'undefined') window.__mockApplications = src;
          try {
            const windowSrc = (typeof window !== 'undefined' && window.__mockApplications) ? window.__mockApplications : [];
            const currentIds = Array.isArray(windowSrc) ? windowSrc.map(a => a.id).join(',') : '';
            const srcIds = Array.isArray(src) ? src.map(a => a.id).join(',') : '';
            if (currentIds !== srcIds) {
              if (typeof window !== 'undefined') window.__mockApplications = src;
              setApplications(src);
              try { console.debug('[HMReviewPage] setApplications(mock) count=', src.length); } catch(e){}
            } else {
              try { console.debug('[HMReviewPage] skip setApplications(mock) - no change'); } catch(e){}
            }
          } catch (e) {
            if (typeof window !== 'undefined') window.__mockApplications = src;
            setApplications(src);
          }
          setIsLoading(false);
          return;
        }
        const resp = await applicationService.getApplications();
        const apps = Array.isArray(resp?.data) ? resp.data : resp || [];
        if (!mounted) return;
        setApplications(apps);
      } catch (err) {
        console.error('failed to load applications for HMReviewPage', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; try{ console.debug(`[HMReviewPage:${instanceId}] unmount`);}catch(e){} };
  }, []);

  // Get unique positions and departments from fetched applications
  const uniquePositions = useMemo(() => {
    const positions = [...new Set(applications.map(app => app.jobTitle))];
    try { console.debug('[HMReviewPage] uniquePositions count=', positions.length); } catch(e){}
    return positions.sort();
  }, [applications]);

  const uniqueDepartments = useMemo(() => {
    const departments = [...new Set(applications.map(app => app.department).filter(Boolean))];
    return departments.sort();
  }, [applications]);

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
  let filtered = applications.filter(app => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase());

      // Position filter
      const matchesPosition = selectedPosition === 'all' || app.jobTitle === selectedPosition;

      // Department filter
      const matchesDepartment = selectedDepartment === 'all' || app.department === selectedDepartment;

      // Score range filter
      let matchesScore = true;
      if (selectedScoreRange !== 'all' && app.preScreeningScore) {
        const score = app.preScreeningScore;
        switch (selectedScoreRange) {
          case 'high':
            matchesScore = score >= 80;
            break;
          case 'medium':
            matchesScore = score >= 60 && score < 80;
            break;
          case 'low':
            matchesScore = score < 60;
            break;
        }
      }

      return matchesSearch && matchesPosition && matchesDepartment && matchesScore;
    });

    // Sort applications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.submittedDate) - new Date(a.submittedDate);
        case 'date-asc':
          return new Date(a.submittedDate) - new Date(b.submittedDate);
        case 'score-desc':
          return (b.preScreeningScore || 0) - (a.preScreeningScore || 0);
        case 'score-asc':
          return (a.preScreeningScore || 0) - (b.preScreeningScore || 0);
        case 'name-asc':
          return a.candidateName.localeCompare(b.candidateName, 'th');
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedPosition, selectedDepartment, selectedScoreRange, sortBy, applications]);

  try { console.debug('[HMReviewPage] applications=', applications.length, 'filteredAndSorted=', filteredAndSortedApplications.length); } catch(e){}

  const pendingReview = filteredAndSortedApplications.filter(
    (app) => app.status === 'interview' && !app.evaluation
  );

  const completedReview = filteredAndSortedApplications.filter((app) => app.evaluation);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPosition('all');
    setSelectedDepartment('all');
    setSelectedScoreRange('all');
    setSortBy('date-desc');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-primary">ประเมินผู้สมัคร</h1>
        <p className="text-muted-foreground">
          รายชื่อผู้สมัครที่รอการประเมินจาก Hiring Manager
        </p>
      </div>

      {/* Search and Filters Section */}
      <Card className="premium-card">
        <CardContent className="pt-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="ค้นหาชื่อผู้สมัครหรืออีเมล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">ตำแหน่งงาน</label>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {uniquePositions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">แผนก</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">ช่วงคะแนน</label>
              <Select value={selectedScoreRange} onValueChange={setSelectedScoreRange}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="high">สูง (80-100)</SelectItem>
                  <SelectItem value="medium">ปานกลาง (60-79)</SelectItem>
                  <SelectItem value="low">ต่ำ (&lt;60)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">เรียงตาม</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">วันที่สมัคร (ใหม่→เก่า)</SelectItem>
                  <SelectItem value="date-asc">วันที่สมัคร (เก่า→ใหม่)</SelectItem>
                  <SelectItem value="score-desc">คะแนน (สูง→ต่ำ)</SelectItem>
                  <SelectItem value="score-asc">คะแนน (ต่ำ→สูง)</SelectItem>
                  <SelectItem value="name-asc">ชื่อ (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display & Clear Button */}
          {(searchTerm || selectedPosition !== 'all' || selectedDepartment !== 'all' || selectedScoreRange !== 'all' || sortBy !== 'date-desc') && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary">
                    <Search className="size-3 mr-1" />
                    "{searchTerm}"
                  </Badge>
                )}
                {selectedPosition !== 'all' && (
                  <Badge variant="secondary">ตำแหน่ง: {selectedPosition}</Badge>
                )}
                {selectedDepartment !== 'all' && (
                  <Badge variant="secondary">แผนก: {selectedDepartment}</Badge>
                )}
                {selectedScoreRange !== 'all' && (
                  <Badge variant="secondary">
                    คะแนน: {selectedScoreRange === 'high' ? 'สูง' : selectedScoreRange === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                ล้างตัวกรอง
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="premium-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1">รอการประเมิน</p>
                <h3 className="text-2xl font-semibold">{pendingReview.length}</h3>
              </div>
              <div className="bg-primary/10 text-primary p-3 rounded-lg">
                <Clock className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1">ประเมินแล้ว</p>
                <h3 className="text-2xl font-semibold">{completedReview.length}</h3>
              </div>
              <div className="bg-primary/10 text-primary p-3 rounded-lg">
                <Users className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1">รวมทั้งหมด</p>
                <h3 className="text-2xl font-semibold">{applications.length}</h3>
              </div>
              <div className="bg-primary/10 text-primary p-3 rounded-lg">
                <Users className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* pending list */}
      {pendingReview.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2>รอการประเมิน ({pendingReview.length})</h2>
          </div>
          <div className="space-y-4">
            {pendingReview.map((app) => (
              <Card key={app.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium">{app.candidateName}</h3>
                        <Badge variant="secondary">รอประเมิน</Badge>
                        {app.preScreeningScore >= 80 && (
                          <Badge className="bg-green-600">คะแนนสูง</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-2">{app.jobTitle}</p>
                      {app.department && (
                        <p className="text-sm text-muted-foreground mb-2">แผนก: {app.department}</p>
                      )}
                      
                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {app.candidateEmail}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {app.candidatePhone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          สมัครเมื่อ {formatDate(app.submittedDate)}
                        </span>
                      </div>

                      {/* Education & Experience */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {app.education && (
                          <div className="flex items-start gap-2 text-sm">
                            <GraduationCap className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">{app.education.degree}</p>
                              <p className="text-muted-foreground">{app.education.institution}</p>
                              {app.education.gpa && (
                                <p className="text-muted-foreground">GPA: {app.education.gpa}</p>
                              )}
                            </div>
                          </div>
                        )}
                        {app.experience && (
                          <div className="flex items-start gap-2 text-sm">
                            <Briefcase className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">{app.experience.position}</p>
                              <p className="text-muted-foreground">{app.experience.company}</p>
                              <p className="text-muted-foreground">{app.experience.duration}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      {app.skills && app.skills.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-2">ทักษะ:</p>
                          <div className="flex flex-wrap gap-2">
                            {app.skills.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Score */}
                      {app.preScreeningScore && (
                        <div className="mb-3">
                          <span className="text-sm text-muted-foreground">คะแนนคัดกรองเบื้องต้น: </span>
                          <Badge className="bg-blue-600">{app.preScreeningScore}</Badge>
                        </div>
                      )}

                      {/* Resume */}
                      {app.resume && (
                        <div className="mb-3 text-sm text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>Resume: </span>
                          <a href="#" className="text-primary hover:underline">{app.resume}</a>
                        </div>
                      )}

                      {/* Cover Letter */}
                      {app.coverLetter && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            จดหมายสมัครงาน
                          </p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{app.coverLetter}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => onReview(app.id)}>เริ่มประเมิน</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* completed list */}
      {completedReview.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2>ประเมินแล้ว ({completedReview.length})</h2>
          </div>
          <div className="space-y-4">
            {completedReview.map((app) => (
              <Card key={app.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium">{app.candidateName}</h3>
                        <Badge className="bg-green-600">ประเมินแล้ว</Badge>
                        {app.evaluation?.overallScore >= 4 && (
                          <Badge className="bg-yellow-600">แนะนำ</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-2">{app.jobTitle}</p>
                      {app.department && (
                        <p className="text-sm text-muted-foreground mb-2">แผนก: {app.department}</p>
                      )}
                      
                      {/* Education & Experience Summary */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        {app.education && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {app.education.degree}
                          </span>
                        )}
                        {app.experience && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {app.experience.duration}
                          </span>
                        )}
                      </div>

                      {app.evaluation && (
                        <>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-muted-foreground">คะแนนประเมิน: </span>
                            <span className="text-lg font-semibold text-primary">{app.evaluation.overallScore}/5.0</span>
                          </div>
                          <div className="text-sm text-muted-foreground">ประเมินโดย {app.evaluation.evaluatorName}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(app.evaluation.evaluatedAt)}</div>
                          {app.evaluation.comments && (
                            <div className="mt-2 p-3 bg-muted rounded-md">
                              <p className="text-sm text-muted-foreground line-clamp-2">{app.evaluation.comments}</p>
                            </div>
                          )}
                        </>
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

      {/* empty state - no results from filter */}
  {pendingReview.length === 0 && completedReview.length === 0 && filteredAndSortedApplications.length === 0 && applications.length > 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Filter className="size-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg">ไม่พบผู้สมัครที่ตรงกับเงื่อนไขการค้นหา</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              ลองปรับเปลี่ยนตัวกรองหรือล้างการค้นหา
            </p>
            <Button variant="outline" onClick={clearFilters}>
              ล้างตัวกรอง
            </Button>
          </CardContent>
        </Card>
      )}

      {/* empty state - no applications at all */}
  {applications.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="size-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg">ไม่มีผู้สมัครที่ต้องประเมิน</h3>
            <p className="text-muted-foreground mt-2">
              ระบบจะแจ้งเตือนเมื่อมีผู้สมัครที่ต้องการการประเมินจากคุณ
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}