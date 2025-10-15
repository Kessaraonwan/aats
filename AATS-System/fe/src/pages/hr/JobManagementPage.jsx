import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import JobListOverview from '../../components/hr/JobListOverview';
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
} from 'lucide-react';

const defaultForm = {
  title: '',
  department: '',
  location: '',
  experienceLevel: 'mid',
  description: '',
  requirements: '',
  responsibilities: '',
  closingDate: '',
  status: 'active',
};

const formatDateDisplay = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

const parseListInput = (value) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

export function JobManagementPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState(defaultForm);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await jobService.getJobs();
      setJobs(res?.data || []);
    } catch (err) {
      setError(err?.message || 'โหลดรายการตำแหน่งงานไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch =
        !term ||
        job.title?.toLowerCase().includes(term) ||
        job.department?.toLowerCase().includes(term) ||
        job.location?.toLowerCase().includes(term);
      const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, filterStatus]);

  const activeJobs = jobs.filter((job) => job.status === 'active').length;
  const closedJobs = jobs.filter((job) => job.status === 'closed').length;
  const draftJobs = jobs.filter((job) => job.status === 'draft').length;

  const resetForm = () => {
    setFormData(defaultForm);
    setSelectedJob(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleOpenEdit = (job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title || '',
      department: job.department || '',
      location: job.location || '',
      experienceLevel: job.experienceLevel || job.experience_level || 'mid',
      description: job.description || '',
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : '',
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : '',
      closingDate: toDateInput(job.closingDate || job.ClosingDate),
      status: job.status || 'active',
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenDelete = (job) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const buildPayload = (data) => {
    const requirementsList = parseListInput(data.requirements);
    const responsibilitiesList = parseListInput(data.responsibilities);

    return {
      title: data.title,
      department: data.department,
      location: data.location,
      experience_level: data.experienceLevel || 'mid',
      description: data.description,
      requirements: JSON.stringify(requirementsList),
      responsibilities: JSON.stringify(responsibilitiesList),
      status: data.status,
      closing_date: data.closingDate ? new Date(data.closingDate).toISOString() : undefined,
    };
  };

  const validateForm = () => {
    if (!formData.title || !formData.department || !formData.location) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return false;
    }
    return true;
  };

  const handleCreateJob = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await jobService.createJob(buildPayload(formData));
      toast.success('สร้างตำแหน่งงานสำเร็จ');
      setIsCreateDialogOpen(false);
      resetForm();
      await loadJobs();
    } catch (err) {
      toast.error(err?.message || 'สร้างตำแหน่งงานไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditJob = async () => {
    if (!selectedJob || !validateForm()) return;
    setSubmitting(true);
    try {
      await jobService.updateJob(selectedJob.id, buildPayload(formData));
      toast.success('แก้ไขตำแหน่งงานสำเร็จ');
      setIsEditDialogOpen(false);
      resetForm();
      await loadJobs();
    } catch (err) {
      toast.error(err?.message || 'แก้ไขตำแหน่งงานไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;
    setSubmitting(true);
    try {
      await jobService.deleteJob(selectedJob.id);
      toast.success('ลบตำแหน่งงานสำเร็จ');
      setIsDeleteDialogOpen(false);
      resetForm();
      await loadJobs();
    } catch (err) {
      toast.error(err?.message || 'ลบตำแหน่งงานไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    setSubmitting(true);
    try {
      await jobService.updateJob(job.id, { status: nextStatus });
      toast.success('อัปเดตสถานะตำแหน่งงานแล้ว');
      await loadJobs();
    } catch (err) {
      toast.error(err?.message || 'อัปเดตสถานะไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3 text-muted-foreground">
        <p>กำลังโหลดข้อมูลตำแหน่งงาน...</p>
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
        <Button onClick={loadJobs}>ลองอีกครั้ง</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">จัดการตำแหน่งงาน</h1>
          <p className="text-muted-foreground">ดูแล สร้าง และแก้ไขตำแหน่งงานที่เปิดรับทั้งหมด</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="size-4" /> เพิ่มตำแหน่งงาน
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="premium-card">
            <CardContent className="py-6 flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">ตำแหน่งที่เปิดรับ</p>
                <h2 className="text-2xl font-semibold">{activeJobs}</h2>
              </div>
              <Briefcase className="size-8 text-primary" />
            </CardContent>
          </Card>
          <Card className="premium-card">
            <CardContent className="py-6 flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">ฉบับร่าง</p>
                <h2 className="text-2xl font-semibold">{draftJobs}</h2>
              </div>
              <Users className="size-8 text-primary" />
            </CardContent>
          </Card>
          <Card className="premium-card">
            <CardContent className="py-6 flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">ปิดรับแล้ว</p>
                <h2 className="text-2xl font-semibold">{closedJobs}</h2>
              </div>
              <CheckCircle2 className="size-8 text-primary" />
            </CardContent>
          </Card>
        </div>

        <Alert>
          <AlertDescription>
            จัดการสถานะตำแหน่งงานจากรายการด้านล่างได้ทันที เพื่อควบคุมการเปิดรับสมัคร
          </AlertDescription>
        </Alert>

        <div>
          <h2 className="text-xl font-semibold text-primary">รายการตำแหน่งงาน</h2>
          <p className="text-muted-foreground mb-4">แสดงรายการตำแหน่งงานทั้งหมดด้านล่าง</p>
          <JobListOverview jobs={jobs} onEdit={handleOpenEdit} onDelete={handleOpenDelete} onToggleStatus={handleToggleStatus} />
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>สร้างตำแหน่งงานใหม่</DialogTitle>
            <DialogDescription>กรอกข้อมูลตำแหน่งงานที่จะเปิดรับ</DialogDescription>
          </DialogHeader>
          <DialogContentBody formData={formData} setFormData={setFormData} submitting={submitting} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
              ยกเลิก
            </Button>
            <Button onClick={handleCreateJob} disabled={submitting}>
              บันทึกตำแหน่งงาน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขตำแหน่งงาน</DialogTitle>
            <DialogDescription>ปรับปรุงข้อมูลตำแหน่งงานให้เป็นปัจจุบัน</DialogDescription>
          </DialogHeader>
          <DialogContentBody formData={formData} setFormData={setFormData} submitting={submitting} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>
              ยกเลิก
            </Button>
            <Button onClick={handleEditJob} disabled={submitting}>
              บันทึกการแก้ไข
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
            <DialogDescription>
              การลบตำแหน่งงาน "{selectedJob?.title}" จะไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDeleteDialogOpen(false); resetForm(); }}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDeleteJob} disabled={submitting}>
              ลบตำแหน่งงาน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DialogContentBody({ formData, setFormData, submitting }) {
  return (
    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">ชื่อตำแหน่ง *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">แผนก *</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">ที่ตั้ง *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label>ระดับประสบการณ์</Label>
          <Select
            value={formData.experienceLevel}
            onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
            disabled={submitting}
          >
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
        <Label htmlFor="closing-date">วันปิดรับสมัคร</Label>
        <Input
          id="closing-date"
          type="date"
          value={formData.closingDate}
          onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
          disabled={submitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">รายละเอียดงาน</Label>
        <Textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={submitting}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="requirements">คุณสมบัติที่ต้องการ (บรรทัดละ 1 ข้อ)</Label>
          <Textarea
            id="requirements"
            rows={5}
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="responsibilities">หน้าที่ความรับผิดชอบ (บรรทัดละ 1 ข้อ)</Label>
          <Textarea
            id="responsibilities"
            rows={5}
            value={formData.responsibilities}
            onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
            disabled={submitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>สถานะ</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
          disabled={submitting}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
              <SelectItem value="active">เปิดรับ</SelectItem>
              <SelectItem value="draft">ฉบับร่าง</SelectItem>
              <SelectItem value="closed">ปิดรับ</SelectItem>
            </SelectContent>
        </Select>
      </div>
    </div>
  );
}
