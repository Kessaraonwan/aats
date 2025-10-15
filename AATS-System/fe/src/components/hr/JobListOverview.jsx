import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Briefcase, MapPin, Users, Calendar, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';

export function JobListOverview({ jobs = [], onEdit, onDelete, onToggleStatus }) {
  if (!jobs || !jobs.length) {
    return (
      <Card className="premium-card">
        <CardContent>
          <p className="text-muted-foreground">ยังไม่มีตำแหน่งงาน</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job) => (
        <Card key={job.id} className="premium-card">
          <CardContent className="py-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-primary">{job.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><Briefcase className="size-4" /> {job.department || '-'}</span>
                  <span className="flex items-center gap-1"><MapPin className="size-4" /> {job.location || '-'}</span>
                  <span className="flex items-center gap-1"><Users className="size-4" /> {job.experienceLevel || 'ไม่ระบุ'}</span>
                  <span className="flex items-center gap-1"><Calendar className="size-4" /> ปิดรับ {job.closingDate ? new Date(job.closingDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={job.status === 'active' ? 'default' : job.status === 'closed' ? 'destructive' : 'secondary'}>
                  {job.status === 'active' && 'เปิดรับ'}
                  {job.status === 'closed' && 'ปิดรับ'}
                  {job.status === 'draft' && 'ฉบับร่าง'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => onToggleStatus && onToggleStatus(job)}>
                  {job.status === 'active' ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit && onEdit(job)}>
                  <Edit className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete && onDelete(job)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>

            {job.description && <p className="text-muted-foreground text-sm whitespace-pre-wrap">{job.description}</p>}

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-2">คุณสมบัติที่ต้องการ</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {(Array.isArray(job.requirements) ? job.requirements : []).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">หน้าที่รับผิดชอบ</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {(Array.isArray(job.responsibilities) ? job.responsibilities : []).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default JobListOverview;