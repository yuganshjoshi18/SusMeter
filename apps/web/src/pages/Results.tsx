import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FileQuestion, Trash2 } from 'lucide-react';
import type { AssessmentResult } from '@susmeter/shared';
import { EmptyState } from '@/components/EmptyState';
import { ResultView } from '@/components/ResultView';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api, type AssessmentDetail } from '@/lib/api';
import { errorMessage } from '@/lib/format';

interface ResultLocationState {
  result?: AssessmentResult;
  saved?: boolean;
  id?: string | null;
}

export function Results() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { notify } = useToast();
  const state = (location.state || {}) as ResultLocationState;

  const [detail, setDetail] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    let active = true;
    setLoading(true);
    api.assessments
      .get(id)
      .then((response) => {
        if (active) setDetail(response);
      })
      .catch((caught) => {
        if (active) setError(errorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, user]);

  if (id && !authLoading && !user) {
    return <Navigate to="/login" replace state={{ from: `/results/${id}` }} />;
  }

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<FileQuestion size={20} />}
        title="We couldn’t open that result"
        description={error}
        action={
          <Link to="/history" className="btn-secondary">
            Back to history
          </Link>
        }
      />
    );
  }

  const result = detail?.result || state.result;
  const createdAt = detail?.createdAt;

  if (!result) {
    return (
      <div>
        <p className="kicker">Results dashboard</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-primary">No result open yet.</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          Run a behaviour check or pick an earlier assessment from your history. Your results are
          ready when you are.
        </p>
        <div className="mt-8">
          <EmptyState
            icon={<FileQuestion size={20} />}
            title="Nothing to show here"
            description="Results from a check will appear here, with evidence and limitations attached."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/quiz" className="btn-primary">
                  Start behaviour quiz
                </Link>
                <Link to="/analyze" className="btn-secondary">
                  Analyze conversation
                </Link>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!detail) return;
    setDeleting(true);
    try {
      await api.assessments.remove(detail.id);
      notify('Assessment removed.', 'success');
      navigate('/history');
    } catch (caught) {
      notify(errorMessage(caught), 'error');
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="kicker">Results dashboard</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-primary">
            {detail?.title || result.title}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {!detail && state.saved && state.id && (
            <Link to={`/results/${state.id}`} className="btn-secondary !py-2.5 text-xs">
              Open saved report
            </Link>
          )}
          {detail && (
            <Button
              variant="danger"
              size="sm"
              loading={deleting}
              onClick={handleDelete}
              icon={<Trash2 size={14} />}
            >
              Delete report
            </Button>
          )}
        </div>
      </div>

      <ResultView
        result={result}
        createdAt={createdAt}
        onNewCheck={() => navigate('/quiz')}
      />

      {!user && !state.saved && (
        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0C0C0E] p-5 text-sm leading-6 text-muted">
          This result is only in your current session.{' '}
          <Link className="font-semibold text-accent hover:text-red-400" to="/register">
            Create an account
          </Link>{' '}
          to save future checks.
        </div>
      )}
    </div>
  );
}
