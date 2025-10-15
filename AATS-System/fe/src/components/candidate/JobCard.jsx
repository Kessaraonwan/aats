import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { MapPin, Briefcase, Calendar } from 'lucide-react';

export function JobCard({ job, onApply }) {
  const experienceLevelLabel = {
    entry: 'Entry Level',
    mid: 'Mid Level',
    senior: 'Senior Level'
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDepartmentBadgeVariant = (dept) => {
    const variants = {
      'Engineering': 'engineering',
      'Design': 'design',
      'Product': 'product',
      'Data': 'data'
    };
    return variants[dept] || 'default';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="mb-2">{job.title}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{job.department}</Badge>
              <Badge variant="outline">{experienceLevelLabel[job.experienceLevel]}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-gray-700">
          <div className="flex items-center gap-2">
            <MapPin className="size-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="size-4" />
            <span>{job.department}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            <span>ปิดรับสมัคร: {formatDate(job.closingDate)}</span>
          </div>
        </div>
        <p className="mt-4 line-clamp-2 text-gray-700">
          {job.description}
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={onApply} className="w-full">
          สมัครงาน
        </Button>
      </CardFooter>
    </Card>
  );
}