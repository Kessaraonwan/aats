import { useState, useMemo, useEffect } from 'react';
import { JobCard, JobFilters } from '../../components/candidate';
import { jobService } from '../../services/jobService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { JobCardSkeleton } from '../../components/shared';

export function JobsListPage({ onApply }) {
  const [filters, setFilters] = useState({
    search: '',
    location: 'all',
    department: 'all',
    experienceLevel: 'all'
  });
  const [sortBy, setSortBy] = useState('date-desc');
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await jobService.getJobs(); // { data, meta }
        if (mounted) setJobs(resp.data || []);
      } catch (err) {
        console.error('failed to load jobs', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredJobs = useMemo(() => {
    // apply filters on jobs state
    const list = (jobs || []).filter((job) => {
      const title = (job.title || '').toString();
      const desc = (job.description || '').toString();
      const matchesSearch = title.toLowerCase().includes((filters.search || '').toLowerCase()) || desc.toLowerCase().includes((filters.search || '').toLowerCase());
      const matchesLocation = filters.location === 'all' || (job.location || 'all') === filters.location;
      const matchesDepartment = filters.department === 'all' || (job.department || 'all') === filters.department;
      const matchesExperience = filters.experienceLevel === 'all' || (job.experienceLevel || 'all') === filters.experienceLevel;
      return matchesSearch && matchesLocation && matchesDepartment && matchesExperience && (job.status || 'active') === 'active';
    });

    // sorting
    list.sort((a, b) => {
      try {
        switch (sortBy) {
          case 'date-desc':
            return new Date(b.postedDate || b.created_at) - new Date(a.postedDate || a.created_at);
          case 'date-asc':
            return new Date(a.postedDate || a.created_at) - new Date(b.postedDate || b.created_at);
          case 'title-asc':
            return (a.title || '').localeCompare(b.title || '', 'th');
          case 'title-desc':
            return (b.title || '').localeCompare(a.title || '', 'th');
          case 'closing-soon':
            return new Date(a.closingDate || a.closing_date || 0) - new Date(b.closingDate || b.closing_date || 0);
          default:
            return 0;
        }
      } catch (e) {
        return 0;
      }
    });

    return list;
  }, [jobs, filters, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-16" style={{ backgroundColor: '#1B3C53', color: '#ffffff' }}>
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-semibold mb-3" style={{ color: '#ffffff' }}>ค้นหาตำแหน่งงาน</h1>
          <p className="text-lg font-medium" style={{ color: '#ffffff' }}>ค้นพบโอกาสในการทำงานที่ดีที่สุดสำหรับคุณ</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <JobFilters onFilterChange={setFilters} />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-base font-medium text-gray-700">พบ <span className="font-semibold text-[#1B3C53]">{filteredJobs.length}</span> ตำแหน่งงาน</h2>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="เรียงตาม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">วันที่โพสต์ (ใหม่ล่าสุด)</SelectItem>
                  <SelectItem value="date-asc">วันที่โพสต์ (เก่าสุด)</SelectItem>
                  <SelectItem value="title-asc">ชื่อตำแหน่ง (A-Z)</SelectItem>
                  <SelectItem value="title-desc">ชื่อตำแหน่ง (Z-A)</SelectItem>
                  <SelectItem value="closing-soon">ปิดรับเร็วสุด</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">ไม่พบตำแหน่งงานที่ตรงกับเงื่อนไขการค้นหา</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={() => onApply(job.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}