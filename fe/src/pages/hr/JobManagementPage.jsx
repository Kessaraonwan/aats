import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { jobService } from '../../services/jobService';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Briefcase, 
  MapPin, 
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

export function JobManagementPage() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    experienceLevel: '',
    description: '',
    requirements: '',
    responsibilities: '',
    closingDate: ''
  });

  // load jobs from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await jobService.getJobs();
        if (mounted) setJobs(resp.data || []);
      } catch (err) {
        console.error('failed to load jobs', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeJobs = jobs.filter(j => j.status === 'active').length;
  const closedJobs = jobs.filter(j => j.status === 'closed').length;
  const draftJobs = jobs.filter(j => j.status === 'draft').length;

  // Handle create job
  const handleCreateJob = () => {
    if (!formData.title || !formData.department || !formData.location) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    const newJob = {
      id: `job-${Date.now()}`,
      title: formData.title,
      department: formData.department,
      location: formData.location,
      experienceLevel: formData.experienceLevel || 'mid',
      description: formData.description,
      requirements: formData.requirements.split('\n').filter(r => r.trim()),
      responsibilities: formData.responsibilities.split('\n').filter(r => r.trim()),
      status: 'active',
      postedDate: new Date().toISOString().split('T')[0],
      closingDate: formData.closingDate
    };

    setJobs([newJob, ...jobs]);
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success('สร้างตำแหน่งงานสำเร็จ');
  };

  // Handle edit job
  const handleEditJob = () => {
    if (!formData.title || !formData.department || !formData.location) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    setJobs(jobs.map(job => 
      job.id === selectedJob.id 
        ? {
            ...job,
            title: formData.title,
            department: formData.department,
            location: formData.location,
            experienceLevel: formData.experienceLevel,
            description: formData.description,
            requirements: formData.requirements.split('\n').filter(r => r.trim()),
            responsibilities: formData.responsibilities.split('\n').filter(r => r.trim()),
            closingDate: formData.closingDate
          }
        : job
    ));

    setIsEditDialogOpen(false);
    setSelectedJob(null);
    resetForm();
    toast.success('แก้ไขตำแหน่งงานสำเร็จ');
  };

  // Handle delete job
  const handleDeleteJob = () => {
    setJobs(jobs.filter(job => job.id !== selectedJob.id));
    setIsDeleteDialogOpen(false);
    setSelectedJob(null);
    toast.success('ลบตำแหน่งงานสำเร็จ');
  };

  // Handle toggle status
  const handleToggleStatus = (jobId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status: newStatus } : job
    ));
    toast.success(`${newStatus === 'active' ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร'}สำเร็จ`);
  };

  // Open edit dialog
  const openEditDialog = (job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      experienceLevel: job.experienceLevel,
      description: job.description,
      requirements: job.requirements.join('\n'),
      responsibilities: job.responsibilities.join('\n'),
      closingDate: job.closingDate
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (job) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      department: '',
      location: '',
      experienceLevel: '',
      description: '',
      requirements: '',
      responsibilities: '',
      closingDate: ''
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = {
      active: { label: 'เปิดรับสมัคร', variant: 'default', icon: CheckCircle2 },
      closed: { label: 'ปิดรับสมัคร', variant: 'secondary', icon: XCircle },
      draft: { label: 'แบบร่าง', variant: 'outline', icon: Clock }
    };
    const { label, variant, icon: Icon } = config[status] || config.active;
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">จัดการตำแหน่งงาน</h1>
          <p className="text-muted-foreground">สร้าง แก้ไข และจัดการตำแหน่งงานทั้งหมด</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="premium-btn gap-2">
              <Plus className="h-4 w-4" />
              สร้างตำแหน่งงานใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>สร้างตำแหน่งงานใหม่</DialogTitle>
              <DialogDescription>กรอกข้อมูลตำแหน่งงานที่ต้องการเปิดรับสมัคร</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">ชื่อตำแหน่ง *</Label>
                  <Input
                    id="title"
                    placeholder="เช่น Senior Frontend Developer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">แผนก *</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกแผนก" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">วิศวกรรม</SelectItem>
                      <SelectItem value="Design">ออกแบบ</SelectItem>
                      <SelectItem value="Marketing">การตลาด</SelectItem>
                      <SelectItem value="Sales">ฝ่ายขาย</SelectItem>
                      <SelectItem value="HR">ทรัพยากรบุคคล</SelectItem>
                      <SelectItem value="Finance">การเงิน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">สถานที่ *</Label>
                  <Input
                    id="location"
                    placeholder="เช่น Bangkok"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">ระดับประสบการณ์</Label>
                  <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกระดับ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internship">ฝึกงาน</SelectItem>
                      <SelectItem value="entry">เริ่มต้น</SelectItem>
                      <SelectItem value="mid">กลาง</SelectItem>
                      <SelectItem value="senior">อาวุโส</SelectItem>
                      <SelectItem value="lead">หัวหน้าทีม</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="closingDate">วันปิดรับสมัคร</Label>
                <Input
                  id="closingDate"
                  type="date"
                  value={formData.closingDate}
                  onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียดงาน</Label>
                <Textarea
                  id="description"
                  placeholder="อธิบายเกี่ยวกับตำแหน่งงานนี้..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">คุณสมบัติที่ต้องการ</Label>
                <Textarea
                  id="requirements"
                  placeholder="ใส่คุณสมบัติทีละบรรทัด&#10;เช่น&#10;- ประสบการณ์ 3+ ปี&#10;- เชี่ยวชาญ React"
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">หน้าที่รับผิดชอบ</Label>
                <Textarea
                  id="responsibilities"
                  placeholder="ใส่หน้าที่รับผิดชอบทีละบรรทัด&#10;เช่น&#10;- พัฒนาระบบ Frontend&#10;- ทำงานร่วมกับทีม"
                  rows={4}
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
                ยกเลิก
              </Button>
              <Button onClick={handleCreateJob}>สร้างตำแหน่งงาน</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">เปิดรับสมัคร</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs}</div>
            <p className="text-xs text-muted-foreground">ตำแหน่งที่เปิดรับสมัคร</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ปิดรับสมัคร</CardTitle>
            <XCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedJobs}</div>
            <p className="text-xs text-muted-foreground">ตำแหน่งที่ปิดรับสมัคร</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ทั้งหมด</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">ตำแหน่งงานทั้งหมด</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาตำแหน่งงานหรือแผนก..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="active">เปิดรับสมัคร</SelectItem>
                <SelectItem value="closed">ปิดรับสมัคร</SelectItem>
                <SelectItem value="draft">แบบร่าง</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">ไม่พบตำแหน่งงาน</p>
              <p className="text-sm text-muted-foreground">ลองค้นหาด้วยคำอื่นหรือสร้างตำแหน่งงานใหม่</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            ปิดรับ: {new Date(job.closingDate).toLocaleDateString('th-TH')}
                          </span>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => openEditDialog(job)}
                    >
                      <Edit className="h-4 w-4" />
                      แก้ไข
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleToggleStatus(job.id, job.status)}
                    >
                      {job.status === 'active' ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          ปิดรับสมัคร
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          เปิดรับสมัคร
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(job)}
                    >
                      <Trash2 className="h-4 w-4" />
                      ลบ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขตำแหน่งงาน</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลตำแหน่งงาน</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">ชื่อตำแหน่ง *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">แผนก *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">วิศวกรรม</SelectItem>
                    <SelectItem value="Design">ออกแบบ</SelectItem>
                    <SelectItem value="Marketing">การตลาด</SelectItem>
                    <SelectItem value="Sales">ฝ่ายขาย</SelectItem>
                    <SelectItem value="HR">ทรัพยากรบุคคล</SelectItem>
                    <SelectItem value="Finance">การเงิน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-location">สถานที่ *</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-experienceLevel">ระดับประสบการณ์</Label>
                <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internship">ฝึกงาน</SelectItem>
                    <SelectItem value="entry">เริ่มต้น</SelectItem>
                    <SelectItem value="mid">กลาง</SelectItem>
                    <SelectItem value="senior">อาวุโส</SelectItem>
                    <SelectItem value="lead">หัวหน้าทีม</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-closingDate">วันปิดรับสมัคร</Label>
              <Input
                id="edit-closingDate"
                type="date"
                value={formData.closingDate}
                onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">รายละเอียดงาน</Label>
              <Textarea
                id="edit-description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-requirements">คุณสมบัติที่ต้องการ</Label>
              <Textarea
                id="edit-requirements"
                rows={4}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-responsibilities">หน้าที่รับผิดชอบ</Label>
              <Textarea
                id="edit-responsibilities"
                rows={4}
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedJob(null); resetForm(); }}>
              ยกเลิก
            </Button>
            <Button onClick={handleEditJob}>บันทึกการแก้ไข</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบตำแหน่ง "{selectedJob?.title}"?
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setSelectedJob(null); }}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDeleteJob}>
              ลบตำแหน่งงาน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
