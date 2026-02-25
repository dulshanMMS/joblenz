import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, SparklesIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import type { Job } from '../types';
import { JobStatus } from '../types';

type FilterTab = 'all' | JobStatus;

const STATUS_LABELS: Record<JobStatus, string> = {
  [JobStatus.Pending]: 'Pending',
  [JobStatus.InProgress]: 'In Progress',
  [JobStatus.Completed]: 'Completed',
};

const STATUS_BADGE: Record<JobStatus, string> = {
  [JobStatus.Pending]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  [JobStatus.InProgress]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  [JobStatus.Completed]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: JobStatus.Pending },
  { label: 'In Progress', value: JobStatus.InProgress },
  { label: 'Completed', value: JobStatus.Completed },
];

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (filter: FilterTab) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await api.get<{ success: boolean; data: Job[] }>('/jobs', { params });
      setJobs(res.data.data);
    } catch {
      setError('Failed to load jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(activeFilter);
  }, [activeFilter, fetchJobs]);

  async function handleStatusChange(jobId: string, newStatus: JobStatus) {
    setUpdatingId(jobId);
    setUpdateError(null);
    try {
      await api.patch(`/jobs/${jobId}`, { status: newStatus });
      await fetchJobs(activeFilter);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err instanceof Error ? err.message : 'Failed to update status');
      setUpdateError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Jobs</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}{' '}
            {activeFilter !== 'all' && `· ${STATUS_LABELS[activeFilter as JobStatus]}`}
          </p>
        </div>
        <Link
          to="/jobs/new"
          className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          New job
        </Link>
      </div>

      {/* Inline status-update error */}
      {updateError && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center justify-between">
          <span>{updateError}</span>
          <button onClick={() => setUpdateError(null)} className="ml-4 text-red-400 hover:text-red-300 text-xs underline">
            dismiss
          </button>
        </div>
      )}

      {/* Filter tabs — scrollable on mobile */}
      <div className="overflow-x-auto mb-6 -mx-1 px-1">
        <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeFilter === tab.value
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-32 bg-slate-900 border border-slate-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => fetchJobs(activeFilter)}
            className="mt-3 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Try again
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState filter={activeFilter} />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              isUpdating={updatingId === job._id}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: FilterTab }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
        <BriefcaseIcon className="w-6 h-6 text-slate-500" />
      </div>
      <p className="text-sm font-medium text-slate-300">
        {filter === 'all' ? 'No jobs yet' : `No ${STATUS_LABELS[filter as JobStatus].toLowerCase()} jobs`}
      </p>
      <p className="text-sm text-slate-500 mt-1">
        {filter === 'all'
          ? 'Create your first job to get started.'
          : 'Jobs will appear here once their status is updated.'}
      </p>
      {filter === 'all' && (
        <Link
          to="/jobs/new"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Create a job
        </Link>
      )}
    </div>
  );
}

// ─── Job card ──────────────────────────────────────────────────────────────────

interface JobCardProps {
  job: Job;
  isUpdating: boolean;
  onStatusChange: (id: string, status: JobStatus) => void;
}

function JobCard({ job, isUpdating, onStatusChange }: JobCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_BADGE[job.status]}`}
            >
              {STATUS_LABELS[job.status]}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white truncate">{job.title}</h3>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {job.description}
          </p>

          {/* AI Summary */}
          {job.aiSummary && (
            <div className="mt-3 flex gap-2 bg-violet-500/5 border border-violet-500/15 rounded-lg p-3">
              <SparklesIcon className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">{job.aiSummary}</p>
            </div>
          )}

          {/* Metadata */}
          <p className="text-xs text-slate-600 mt-3 font-mono">
            {new Date(job.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Status selector */}
        <div className="shrink-0">
          <select
            value={job.status}
            disabled={isUpdating}
            onChange={(e) => onStatusChange(job._id, e.target.value as JobStatus)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {Object.values(JobStatus).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
