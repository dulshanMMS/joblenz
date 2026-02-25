import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import type { Job } from '../types';

interface CreateJobResponse {
  success: boolean;
  data: Job;
}

export default function CreateJobPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await api.post<CreateJobResponse>('/jobs', { title, description });
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create job. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDescriptionChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setDescription(e.target.value);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-300 transition-colors mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to jobs
      </Link>

      {/* Heading */}
      <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">New service job</h1>
          <p className="text-sm text-slate-400 mt-1">
            Log a new service request and we'll generate an AI summary automatically.
          </p>
      </div>

      {/* Form card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {error && (
          <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Job title
            </label>
            <input
              id="title"
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fix HVAC unit in Building A"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="description"
              required
              rows={6}
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Describe the service request — location, issue details, and any special requirements…"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* AI notice */}
          <div className="flex gap-2.5 bg-violet-500/5 border border-violet-500/15 rounded-lg px-4 py-3">
            <SparklesIcon className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              An AI-generated summary will be attached to this job automatically
              to help your team quickly understand the task at a glance.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 disabled:cursor-not-allowed text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Creating…' : 'Create job'}
            </button>
            <Link
              to="/dashboard"
              className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
