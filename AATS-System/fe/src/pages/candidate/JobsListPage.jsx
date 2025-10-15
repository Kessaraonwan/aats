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
  const [jobsData, setJobsData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await jobService.getJobs();
        // Defensive dedupe: backend sometimes seeds duplicate job rows with different IDs.
        // Deduplicate by a content key (title + location + department + postedDate) so
        // identical job postings collapse even when DB rows have different IDs.
        const raw = res?.data || [];
        const seen = new Set();
        const uniqueJobs = [];
        raw.forEach(j => {
          const title = (j.title || '').trim().toLowerCase();
          const location = (j.location || '').trim().toLowerCase();
          const department = (j.department || '').trim().toLowerCase();
          const posted = (j.postedDate || j.posteddate || '').toString().slice(0,10);
          const contentKey = `${title}::${location}::${department}::${posted}`;
          if (!seen.has(contentKey)) {
            seen.add(contentKey);
            uniqueJobs.push(j);
          }
        });
        if (!cancel) setJobsData(uniqueJobs);
      } catch (e) {
        if (!cancel) setError(e.message || 'โหลดรายการงานไม่สำเร็จ');
      } finally {
        if (!cancel) setIsLoading(false);
      }
    };
    load();
    return () => { cancel = true; };
  }, []);

  const filteredJobs = useMemo(() => {
    const now = new Date();
    let jobs = jobsData.filter((job) => {
      const title = (job.title || '').toString();
      const desc = (job.description || '').toString();
      const loc = (job.location || '').toString();
      const dept = (job.department || '').toString();
      const exp = (job.experienceLevel || '').toString();

      const q = (filters.search || '').toString().toLowerCase();
      const matchesSearch = q === '' || title.toLowerCase().includes(q) || desc.toLowerCase().includes(q);

      const matchesLocation = filters.location === 'all' || loc.toLowerCase() === (filters.location || '').toString().toLowerCase();
      const matchesDepartment = filters.department === 'all' || dept.toLowerCase() === (filters.department || '').toString().toLowerCase();
      const matchesExperience = filters.experienceLevel === 'all' || exp.toLowerCase() === (filters.experienceLevel || '').toString().toLowerCase();

      // Consider job open if status === 'active' OR closingDate is in the future (and not explicitly closed)
      const status = (job.status || '').toString().toLowerCase();
      const closing = job.closingDate || job.ClosingDate || job.closing_date || job.closingDate;
      let isOpen = status === 'active';
      if (!isOpen && closing) {
        try {
          const cd = new Date(closing);
          if (!Number.isNaN(cd.getTime())) {
            isOpen = cd.getTime() > now.getTime();
          }
        } catch (e) { /* ignore */ }
      }

      return matchesSearch && matchesLocation && matchesDepartment && matchesExperience && isOpen;
    });

    // Apply sorting
    jobs.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.postedDate) - new Date(a.postedDate);
        case 'date-asc':
          return new Date(a.postedDate) - new Date(b.postedDate);
        case 'title-asc':
          return a.title.localeCompare(b.title, 'th');
        case 'title-desc':
          return b.title.localeCompare(a.title, 'th');
        case 'closing-soon':
          return new Date(a.closingDate) - new Date(b.closingDate);
        default:
          return 0;
      }
    });

    return jobs;
  }, [filters, sortBy, jobsData]);

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
            <h2 className="text-base font-medium text-gray-700">พบ <span className="font-semibold text-[#1B3C53]">{filteredJobs.length}</span> ตำแหน่งที่เปิดรับ</h2>
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

          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : isLoading ? (
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
