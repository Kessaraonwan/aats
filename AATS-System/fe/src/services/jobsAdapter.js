// Adapter to map BE job shape to FE mock shape
export function adaptJobFromBE(beJob) {
  return {
    id: beJob.id || beJob.ID,
    title: beJob.title || beJob.Title || beJob.name || '',
    department: beJob.department || beJob.Department || '',
    location: beJob.location || beJob.Location || '',
    experienceLevel: beJob.experienceLevel || beJob.ExperienceLevel || '',
    description: beJob.description || beJob.Description || beJob.summary || '',
    // BE may return JSON-encoded strings for arrays; try to parse
    requirements: firstArray(beJob.requirements, beJob.Requirements),
    responsibilities: firstArray(beJob.responsibilities, beJob.Responsibilities),
    status: beJob.status || beJob.Status || (beJob.active ? 'active' : 'inactive'),
    postedDate: beJob.postedDate || beJob.PostedDate || beJob.created_at || null,
    closingDate: beJob.closingDate || beJob.ClosingDate || beJob.closing_date || null,
  };
}

function safeParseArray(v) {
  if (v == null || v === '') return null;
  try {
    const parsed = typeof v === 'string' ? JSON.parse(v) : v;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function firstArray(...values) {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value;
    }
    const parsed = safeParseArray(value);
    if (parsed) {
      return parsed;
    }
  }
  return [];
}
