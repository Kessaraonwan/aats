import { useCallback, useEffect, useState } from 'react';
import { applicationService } from '../services/applicationService';
import { jobService } from '../services/jobService';

const toLower = (value) => (value || '').toString().toLowerCase();

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const adaptApplication = (app) => {
  const submittedRaw = app.submitted_date || app.SubmittedDate || app.submittedDate;
  const updatedRaw = app.updated_at || app.UpdatedAt || app.updatedAt;

  return {
    id: app.id || app.ID,
    jobId: app.job_id || app.JobID || '',
    applicantId: app.applicant_id || app.ApplicantID || '',
    status: toLower(app.status || app.Status),
    resume: app.resume || app.Resume || '',
    coverLetter: app.cover_letter || app.CoverLetter || '',
    submittedDate: parseDate(submittedRaw),
    submittedDateRaw: submittedRaw,
    updatedAt: parseDate(updatedRaw),
    updatedAtRaw: updatedRaw,
    raw: app,
  };
};

const adaptEvaluation = (evaluation) => {
  if (!evaluation) return null;
  return {
    id: evaluation.id || evaluation.ID || '',
    applicationId: evaluation.application_id || evaluation.ApplicationID || '',
    evaluatorId: evaluation.evaluator_id || evaluation.EvaluatorID || '',
    evaluatorName: evaluation.evaluator_name || evaluation.EvaluatorName || '',
    technicalSkills: toNumber(evaluation.technical_skills ?? evaluation.TechnicalSkills),
    communication: toNumber(evaluation.communication ?? evaluation.Communication),
    problemSolving: toNumber(evaluation.problem_solving ?? evaluation.ProblemSolving),
    culturalFit: toNumber(evaluation.cultural_fit ?? evaluation.CulturalFit),
    overallScore: toNumber(evaluation.overall_score ?? evaluation.OverallScore),
    strengths: evaluation.strengths || evaluation.Strengths || '',
    weaknesses: evaluation.weaknesses || evaluation.Weaknesses || '',
    comments: evaluation.comments || evaluation.Comments || '',
    evaluatedAt: parseDate(evaluation.evaluated_at || evaluation.EvaluatedAt),
    raw: evaluation,
  };
};

const fetchAllApplications = async (limit = 100, includeDetails = false) => {
  let page = 1;
  const collected = [];

  while (true) {
    // Ask the server to skip the expensive COUNT(*) during paged bulk fetches.
    const res = await applicationService.getApplications({ page, limit, include_details: includeDetails, skip_count: true });
    const apps = res?.apps || res?.data || [];
    collected.push(...apps);
    // Terminate when the server returned fewer items than requested or no items.
    if (!apps.length || apps.length < limit) {
      break;
    }
    page += 1;
  }

  return collected;
};

export function useRecruitmentData(options = {}) {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [details, setDetails] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [appsRaw, jobsRes] = await Promise.all([
        fetchAllApplications(options.limit || 100, !!options.includeDetails),
        jobService.getJobs(),
      ]);

      // Backend may return either an array of application objects (legacy)
      // or an array of AppListItem wrappers { application, meta, raw } when
      // include_details was requested. Normalize to a plain application array
      // for adaptApplication, while keeping the original wrappers for details.
      const normalizedApps = appsRaw.map((it) => (it && it.application ? it.application : it));

      // Debug: log counts received from server
      try {
        if (typeof console !== 'undefined') {
          console.debug('useRecruitmentData: appsRaw.length=', appsRaw.length, 'normalizedApps.length=', normalizedApps.length);
        }
      } catch (e) {}

      // Dedupe by application id (preserve first-seen order). This prevents
      // client-side duplication if the fetcher is called multiple times or the
      // backend returned duplicates.
      const seen = new Set();
      const uniqueNormalized = [];
      const duplicateIds = [];
      normalizedApps.forEach((a) => {
        const id = a && (a.id || a.ID);
        if (!id) return;
        if (seen.has(id)) duplicateIds.push(id);
        else {
          seen.add(id);
          uniqueNormalized.push(a);
        }
      });
      try {
        if (duplicateIds.length && typeof console !== 'undefined') {
          console.debug('useRecruitmentData: duplicate application ids (removed)', duplicateIds);
        }
      } catch (e) {}

      const adaptedApps = uniqueNormalized.map(adaptApplication);
      setApplications(adaptedApps);
      setJobs(jobsRes?.jobs || jobsRes?.data || []);

      if (options.includeDetails) {
        // backend already returned aggregated/enriched data when includeDetails
        // was requested; map that into details map so components can use it.
        setDetailsLoading(true);
        const map = {};
        // use the original appsRaw wrappers to find attached raw details/meta
        // Build a lookup from application id -> original wrapper to avoid
        // relying on array index which may diverge after deduping.
        const wrapperById = {};
        appsRaw.forEach((w) => {
          const app = w && (w.application || w.Application || w.application);
          const id = app && (app.id || app.ID) || (w && (w.id || w.ID));
          if (id) wrapperById[id] = w;
        });

        adaptedApps.forEach((a) => {
          if (!a || !a.id) return;
          const original = wrapperById[a.id] || null;
          const det = original && original.raw && original.raw.application ? original.raw : original && original.raw ? original.raw : null;
          const detailSource = det || (original && original.application ? original.application : null) || a.raw || null;
          const adapted = adaptApplicationDetail(detailSource);
          if (adapted && a.id) map[a.id] = adapted;
        });
        setDetails(map);
        setDetailsLoading(false);
      } else {
        setDetails({});
        setDetailsLoading(false);
      }
    } catch (err) {
      setError(err?.message || 'โหลดข้อมูลไม่สำเร็จ');
      setDetailsLoading(false);
    } finally {
      setLoading(false);
    }
  }, [options.includeDetails, options.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    applications,
    jobs,
    details,
    detailsLoading,
    loading,
    error,
    refresh: fetchData,
  };
}

export const adaptApplicationDetail = (detail) => {
  if (!detail) return null;
  const app = detail.application || detail.Application || detail;
  const applicant = detail.applicant || detail.Applicant || null;
  const job = detail.job || detail.Job || null;
  const evaluationRaw = detail.evaluation || detail.Evaluation || null;
  const timeline = detail.timeline || detail.Timeline || [];
  const notes = detail.notes || detail.Notes || [];

  return {
    application: adaptApplication(app),
    applicant: applicant
      ? {
          id: applicant.id || applicant.ID,
          name: applicant.name || applicant.Name || '',
          email: applicant.email || applicant.Email || '',
          phone: applicant.phone || applicant.Phone || '',
        }
      : null,
    job,
    evaluation: adaptEvaluation(evaluationRaw),
    timeline: timeline.map((item) => ({
      id: item.id || item.ID,
      status: toLower(item.status || item.Status),
      description: item.description || item.Description || '',
      date: parseDate(item.date || item.Date || item.created_at || item.CreatedAt),
    })),
    notes: notes.map((item) => ({
      id: item.id || item.ID,
      author: item.author || item.Author || 'ทีมงาน',
      content: item.content || item.Content || '',
      createdAt: parseDate(item.created_at || item.CreatedAt || item.createdAt),
    })),
    raw: detail,
  };
};
