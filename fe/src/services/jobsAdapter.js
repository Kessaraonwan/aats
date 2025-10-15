// Adapter to map BE job shape to FE mock shape
export function adaptJobFromBE(beJob) {
  return {
    id: beJob.id,
    title: beJob.title || beJob.name || '',
    department: beJob.department || '',
    location: beJob.location || '',
    experienceLevel: beJob.experienceLevel || '',
    description: beJob.description || beJob.summary || '',
    requirements: beJob.requirements || [],
    responsibilities: beJob.responsibilities || [],
    status: beJob.status || (beJob.active ? 'active' : 'inactive'),
    postedDate: beJob.created_at || beJob.postedDate || null,
    closingDate: beJob.closing_date || beJob.closingDate || null,
  };
}
