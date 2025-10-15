import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText,
  Calendar,
  MapPin,
  Briefcase,
  TrendingUp,
  Ban,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Separator } from '../../components/ui/separator';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { NoApplicationsYet, LoadingError, LoadingState } from '../../components/shared/EnhancedEmptyState';
import { JobCardSkeleton } from '../../components/shared/LoadingSkeletons';
import { showToast, toastMessages, simulateAsync } from '../../utils/toastHelpers';

// Re-application Policy Configuration
const RE_APPLICATION_POLICY = {
  afterInterview: {
    waitingPeriod: 6, // months
    description: 'ถูกปฏิเสธหลังสัมภาษณ์'
  },
  afterScreening: {
    waitingPeriod: 3, // months
    description: 'ถูกปฏิเสธการคัดกรองเรซูเม่'
  },
  default: {
    waitingPeriod: 3,
    description: 'สถานะอื่นๆ'
  }
};

const MAX_ACTIVE_APPLICATIONS = 5; // จำนวนตำแหน่งที่สมัครพร้อมกันได้สูงสุด

const ApplicationHistoryPage = ({ user, onNavigateToJobs }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isWithdrawing, setIsWithdrawing] = useState(null);
  
  // Mock application history data
  const [applicationHistory, setApplicationHistory] = useState([
    {
      id: 'app-h-1',
      jobId: 'job-1',
      jobTitle: 'พนักงานขาย',
      department: 'ฝ่ายขาย',
      location: 'สาขาเซ็นทรัล ลาดพร้าว',
      status: 'interview', // active
      submittedDate: '2025-09-15',
      lastUpdate: '2025-10-05',
      currentStage: 'กำลังรอการสัมภาษณ์',
      interviewDate: '2025-10-15',
      canReapply: false
    },
    {
      id: 'app-h-2',
      jobId: 'job-2',
      jobTitle: 'ช่างเทคนิคคอมพิวเตอร์',
      department: 'ฝ่ายเทคนิค',
      location: 'ศูนย์บริการ สำนักงานใหญ่',
      status: 'screening', // active
      submittedDate: '2025-10-01',
      lastUpdate: '2025-10-08',
      currentStage: 'กำลังคัดกรองเรซูเม่',
      canReapply: false
    },
    {
      id: 'app-h-3',
      jobId: 'job-3',
      jobTitle: 'พนักงานบริการลูกค้า (Call Center)',
      department: 'ฝ่ายบริการลูกค้า',
      location: 'สำนักงานใหญ่ กรุงเทพฯ',
      status: 'rejected_after_interview',
      submittedDate: '2025-04-15',
      lastUpdate: '2025-05-01',
      rejectedDate: '2025-05-01',
      rejectionStage: 'สัมภาษณ์รอบ 2',
      rejectionReason: 'คุณสมบัติไม่ตรงกับตำแหน่งงาน',
      canReapply: true,
      canReapplyDate: '2025-11-01', // 6 months after rejection
      waitingMonths: 6
    },
    {
      id: 'app-h-4',
      jobId: 'job-4',
      jobTitle: 'หัวหน้าสาขา',
      department: 'ฝ่ายบริหาร',
      location: 'สาขาเซ็นทรัล พระราม 9',
      status: 'rejected_screening',
      submittedDate: '2025-08-10',
      lastUpdate: '2025-08-12',
      rejectedDate: '2025-08-12',
      rejectionStage: 'การคัดกรองเรซูเม่',
      rejectionReason: 'ประสบการณ์ไม่เพียงพอสำหรับตำแหน่งนี้',
      canReapply: true,
      canReapplyDate: '2025-11-12', // 3 months after rejection
      waitingMonths: 3
    },
    {
      id: 'app-h-5',
      jobId: 'job-5',
      jobTitle: 'พนักงานคลังสินค้า',
      department: 'ฝ่ายโลจิสติกส์',
      location: 'คลังสินค้าลาดกระบัง',
      status: 'withdrawn',
      submittedDate: '2025-09-01',
      lastUpdate: '2025-09-10',
      withdrawnDate: '2025-09-10',
      withdrawnReason: 'ผู้สมัครถอนใบสมัครเอง',
      canReapply: true,
      canReapplyDate: '2025-09-10' // Can reapply immediately
    }
  ]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      interview: { label: 'กำลังสัมภาษณ์', variant: 'default', icon: <Calendar className="h-3 w-3" />, color: 'bg-blue-500' },
      screening: { label: 'กำลังคัดกรอง', variant: 'secondary', icon: <Clock className="h-3 w-3" />, color: 'bg-yellow-500' },
      offer: { label: 'ได้รับ Offer', variant: 'default', icon: <CheckCircle2 className="h-3 w-3" />, color: 'bg-green-500' },
      rejected_after_interview: { label: 'ไม่ผ่านการสัมภาษณ์', variant: 'destructive', icon: <XCircle className="h-3 w-3" />, color: 'bg-red-500' },
      rejected_screening: { label: 'ไม่ผ่านการคัดกรอง', variant: 'destructive', icon: <XCircle className="h-3 w-3" />, color: 'bg-red-400' },
      withdrawn: { label: 'ถอนใบสมัคร', variant: 'outline', icon: <Ban className="h-3 w-3" />, color: 'bg-gray-400' }
    };
    return statusConfig[status] || statusConfig.screening;
  };

  const isActive = (status) => {
    return ['screening', 'interview', 'offer'].includes(status);
  };

  // Simulate data loading
  // Removed loading delay - data loads instantly
  useEffect(() => {
    // Data is already available from useState, no need to simulate loading
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  };

  const handleWithdrawApplication = async (appId) => {
    setIsWithdrawing(appId);
    
    try {
      // Instant withdrawal - no loading delay
      setApplicationHistory(prev => 
        prev.map(app => 
          app.id === appId 
            ? { ...app, status: 'withdrawn', withdrawnDate: new Date().toISOString() }
            : app
        )
      );
      
      toastMessages.applicationWithdrawn();
      setIsWithdrawing(null);
    } catch (err) {
      toastMessages.actionFailed('ถอนใบสมัคร');
      setIsWithdrawing(null);
    }
  };

  const handleReapply = (jobId) => {
    showToast.info('กำลังเปลี่ยนเส้นทาง...', 'พาคุณไปยังหน้าสมัครงาน');
    setTimeout(() => {
      if (onNavigateToJobs) {
        onNavigateToJobs();
      }
    }, 500);
  };

  const activeApplications = applicationHistory.filter(app => isActive(app.status));
  const inactiveApplications = applicationHistory.filter(app => !isActive(app.status));

  const canApplyNewPosition = activeApplications.length < MAX_ACTIVE_APPLICATIONS;

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">ประวัติการสมัครงาน</h1>
          <p className="text-muted-foreground mt-2">
            ติดตามสถานะการสมัครงานทั้งหมดของคุณ
          </p>
        </div>
        
        <Card>
          <CardContent className="py-12">
            <LoadingState message="กำลังโหลดประวัติการสมัครงาน..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">ประวัติการสมัครงาน</h1>
          <p className="text-muted-foreground mt-2">
            ติดตามสถานะการสมัครงานทั้งหมดของคุณ
          </p>
        </div>
        
        <LoadingError onRetry={handleRetry} />
      </div>
    );
  }

  // Empty State
  if (applicationHistory.length === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">ประวัติการสมัครงาน</h1>
          <p className="text-muted-foreground mt-2">
            ติดตามสถานะการสมัครงานทั้งหมดของคุณ
          </p>
        </div>
        
        <NoApplicationsYet onApply={onNavigateToJobs} />
      </div>
    );
  }

  const calculateDaysUntilReapply = (canReapplyDate) => {
    const today = new Date('2025-10-10');
    const reapplyDate = new Date(canReapplyDate);
    const diffTime = reapplyDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">ประวัติการสมัครงาน</h1>
        <p className="text-muted-foreground mt-2">
          ติดตามสถานะการสมัครงานทั้งหมดของคุณ
        </p>
      </div>

      {/* Multi-Application Warning */}
      <Alert className={`border-2 ${
        canApplyNewPosition 
          ? 'bg-blue-50 border-blue-300' 
          : 'bg-red-50 border-red-300'
      }`}>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <div className="flex items-center justify-between">
            <div>
              <strong>การสมัครหลายตำแหน่ง:</strong> คุณกำลังสมัคร <strong>{activeApplications.length}/{MAX_ACTIVE_APPLICATIONS}</strong> ตำแหน่ง
              {canApplyNewPosition ? (
                <span className="text-muted-foreground ml-2">
                  (คุณสามารถสมัครเพิ่มได้อีก {MAX_ACTIVE_APPLICATIONS - activeApplications.length} ตำแหน่ง)
                </span>
              ) : (
                <span className="text-red-600 ml-2">
                  (คุณสมัครครบจำนวนสูงสุดแล้ว กรุณารอผลการสมัครก่อนสมัครตำแหน่งใหม่)
                </span>
              )}
            </div>
            {canApplyNewPosition && (
              <Button size="sm" className="ml-4" onClick={() => onNavigateToJobs && onNavigateToJobs()}>
                สมัครตำแหน่งใหม่
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {/* Active Applications */}
      {activeApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              ใบสมัครที่กำลังดำเนินการ ({activeApplications.length})
            </CardTitle>
            <CardDescription>
              ตำแหน่งงานที่คุณสมัครและกำลังรอผลการพิจารณา
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeApplications.map((app, index) => {
              const statusInfo = getStatusBadge(app.status);
              return (
                <div key={app.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{app.jobTitle}</h3>
                            <Badge className={`${statusInfo.color} text-white`}>
                              {statusInfo.icon}
                              <span className="ml-1">{statusInfo.label}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {app.department}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {app.location}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">สถานะปัจจุบัน:</span>
                          <span className="font-medium">{app.currentStage}</span>
                        </div>
                        {app.interviewDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">วันสัมภาษณ์:</span>
                            <span className="font-medium text-blue-600">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {new Date(app.interviewDate).toLocaleDateString('th-TH', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">ส่งใบสมัครเมื่อ:</span>
                          <span>{new Date(app.submittedDate).toLocaleDateString('th-TH')}</span>
                        </div>
                      </div>
                    </div>

                      <div className="flex flex-col gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              ดูรายละเอียด
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>รายละเอียดการสมัคร</DialogTitle>
                              <DialogDescription className="truncate">{app.jobTitle} • {app.department}</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">สถานะ</span>
                                <span className="font-medium">
                                  <Badge className={`${getStatusBadge(app.status).color} text-white`}>
                                    {getStatusBadge(app.status).icon}
                                    <span className="ml-1">{getStatusBadge(app.status).label}</span>
                                  </Badge>
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">ส่งใบสมัครเมื่อ</span>
                                <span>{new Date(app.submittedDate).toLocaleDateString('th-TH')}</span>
                              </div>

                              {app.interviewDate && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">วันสัมภาษณ์</span>
                                  <span className="font-medium text-blue-600">
                                    <Calendar className="h-3 w-3 inline mr-1" />
                                    {new Date(app.interviewDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                  </span>
                                </div>
                              )}

                              {app.rejectedDate && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">ถูกปฏิเสธเมื่อ</span>
                                  <span>{new Date(app.rejectedDate).toLocaleDateString('th-TH')}</span>
                                </div>
                              )}

                              {app.withdrawnDate && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">ถอนใบสมัครเมื่อ</span>
                                  <span>{new Date(app.withdrawnDate).toLocaleDateString('th-TH')}</span>
                                </div>
                              )}

                              {app.rejectionReason && (
                                <div className="text-sm mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                  <span className="text-red-700">
                                    <AlertCircle className="h-3 w-3 inline mr-1" />
                                    {app.rejectionReason}
                                  </span>
                                </div>
                              )}
                            </div>

                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">ปิด</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleWithdrawApplication(app.id)}
                          disabled={isWithdrawing === app.id}
                        >
                          {isWithdrawing === app.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              กำลังดำเนินการ...
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4 mr-2" />
                              ถอนใบสมัคร
                            </>
                          )}
                        </Button>
                      </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Inactive Applications (Rejected/Withdrawn) */}
      {inactiveApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              ประวัติการสมัครงานที่ผ่านมา ({inactiveApplications.length})
            </CardTitle>
            <CardDescription>
              ตำแหน่งงานที่เคยสมัครและสถานะการสมัครซ้ำ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {inactiveApplications.map((app, index) => {
              const statusInfo = getStatusBadge(app.status);
              const daysUntilReapply = app.canReapplyDate ? calculateDaysUntilReapply(app.canReapplyDate) : null;
              const canReapplyNow = daysUntilReapply !== null && daysUntilReapply <= 0;

              return (
                <div key={app.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-muted-foreground">{app.jobTitle}</h3>
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.icon}
                              <span className="ml-1">{statusInfo.label}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {app.department}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {app.location}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">ส่งใบสมัครเมื่อ:</span>
                          <span>{new Date(app.submittedDate).toLocaleDateString('th-TH')}</span>
                        </div>
                        {app.rejectedDate && (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">ถูกปฏิเสธเมื่อ:</span>
                              <span>{new Date(app.rejectedDate).toLocaleDateString('th-TH')}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">ขั้นตอนที่ปฏิเสธ:</span>
                              <span className="font-medium">{app.rejectionStage}</span>
                            </div>
                            {app.rejectionReason && (
                              <div className="text-sm mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                <span className="text-red-700">
                                  <AlertCircle className="h-3 w-3 inline mr-1" />
                                  {app.rejectionReason}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        {app.withdrawnDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">ถอนใบสมัครเมื่อ:</span>
                            <span>{new Date(app.withdrawnDate).toLocaleDateString('th-TH')}</span>
                          </div>
                        )}
                      </div>

                      {/* Re-application Policy Alert */}
                      {app.canReapply && app.canReapplyDate && (
                        <Alert className={`${canReapplyNow ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`}>
                          <RefreshCw className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {canReapplyNow ? (
                              <div>
                                <strong className="text-green-700">คุณสามารถสมัครตำแหน่งนี้ได้แล้ว!</strong>
                                <p className="text-xs text-muted-foreground mt-1">
                                  ตามนโยบายบริษัท คุณต้องรอ <strong>{app.waitingMonths} เดือน</strong> หลังถูกปฏิเสธ
                                </p>
                              </div>
                            ) : (
                              <div>
                                <strong className="text-yellow-700">สมัครได้อีกครั้งใน {daysUntilReapply} วัน</strong>
                                <p className="text-xs text-muted-foreground mt-1">
                                  คุณสามารถสมัครตำแหน่งนี้ได้อีกครั้งในวันที่ {' '}
                                  <strong>
                                    {new Date(app.canReapplyDate).toLocaleDateString('th-TH', { 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}
                                  </strong>
                                  {' '}(ต้องรอ {app.waitingMonths} เดือน)
                                </p>
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {canReapplyNow ? (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleReapply(app.jobId)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          สมัครอีกครั้ง
                        </Button>
                      ) : app.canReapply ? (
                        <Button size="sm" variant="outline" disabled>
                          <Clock className="h-4 w-4 mr-2" />
                          รออีก {daysUntilReapply} วัน
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          ดูรายละเอียด
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Policy Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            นโยบายการสมัครงาน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold">จำนวนตำแหน่งที่สมัครได้:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>คุณสามารถสมัครได้สูงสุด <strong className="text-foreground">{MAX_ACTIVE_APPLICATIONS} ตำแหน่ง</strong> พร้อมกัน</li>
              <li>ควรสมัครเฉพาะตำแหน่งที่คุณมีคุณสมบัติเหมาะสมและสนใจจริงๆ เท่านั้น</li>
              <li>การสมัครหลายตำแหน่งมากเกินไปอาจทำให้ HR สับสนและมองว่าคุณไม่มีเป้าหมายที่ชัดเจน</li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-semibold">นโยบายการสมัครซ้ำ:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                <strong className="text-foreground">ถูกปฏิเสธหลังสัมภาษณ์:</strong> ต้องรอ <strong className="text-red-600">6 เดือน</strong> ก่อนสมัครอีกครั้ง
              </li>
              <li>
                <strong className="text-foreground">ถูกปฏิเสธการคัดกรองเรซูเม่:</strong> ต้องรอ <strong className="text-yellow-600">3 เดือน</strong> ก่อนสมัครอีกครั้ง
              </li>
              <li>
                <strong className="text-foreground">ถอนใบสมัครเอง:</strong> สามารถสมัครใหม่ได้ทันที
              </li>
            </ul>
          </div>

          <Separator />

          <div className="bg-white rounded p-3 border border-blue-200">
            <p className="text-xs text-muted-foreground">
              <strong>คำแนะนำ:</strong> ช่วงเวลาที่ต้องรอนี้เป็นโอกาสให้คุณพัฒนาทักษะ หาประสบการณ์เพิ่มเติม 
              หรือเรียนรู้สิ่งใหม่ๆ เพื่อเพิ่มโอกาสในการสมัครครั้งต่อไป
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationHistoryPage;
