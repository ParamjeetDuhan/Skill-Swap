import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchSessions, updateSessionStatus } from '../features/sessions/sessionsSlice';
import Spinner from '../components/Spinner';
import ReviewModal from '../components/ReviewModal';

export default function SessionsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: sessions, status } = useSelector((state) => state.sessions);
  const [reviewingSession, setReviewingSession] = useState(null);
  const [filter, setFilter] = useState('all'); // all | upcoming | past | pending

  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  const handleAction = async (id, action) => {
    const result = await dispatch(updateSessionStatus({ id, action }));
    if (updateSessionStatus.fulfilled.match(result)) {
      toast.success(`Session ${action}d`);
    } else {
      toast.error(result.payload || 'Action failed');
    }
  };

  const now = new Date();
  const filtered = sessions.filter((s) => {
    if (filter === 'upcoming') return new Date(s.dateTime) >= now && s.status !== 'cancelled' && s.status !== 'completed';
    if (filter === 'past') return s.status === 'completed' || (new Date(s.dateTime) < now && s.status !== 'cancelled');
    if (filter === 'pending') return s.status === 'pending';
    return true;
  });

  if (status === 'loading' && sessions.length === 0) return <Spinner label="Loading sessions..." />;

  return (
    <div className="page">
      <h1>My Sessions</h1>

      <div className="filter-tabs">
        {['all', 'upcoming', 'pending', 'past'].map((f) => (
          <button
            key={f}
            className={filter === f ? 'tab active' : 'tab'}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className="empty-state">No sessions in this view.</p>}

      <div className="session-list">
        {filtered.map((s) => {
          const isTeacher = s.teacher._id === user._id || s.teacher === user._id;
          const otherUser = isTeacher ? s.learner : s.teacher;
          const iProposed = s.proposedBy === user._id || s.proposedBy?._id === user._id;

          return (
            <div key={s._id} className="session-card">
              <div>
                <h3>{s.skill}</h3>
                <p>
                  {isTeacher ? 'You teach' : 'You learn from'} <strong>{otherUser?.name}</strong>
                </p>
                <p>{new Date(s.dateTime).toLocaleString()} · {s.duration} min</p>
                <span className={`status-badge status-${s.status}`}>{s.status}</span>
              </div>

              <div className="session-actions">
                {s.status === 'pending' && !iProposed && (
                  <button className="btn-primary" onClick={() => handleAction(s._id, 'accept')}>Accept</button>
                )}
                {(s.status === 'pending' || s.status === 'accepted') && (
                  <button className="btn-secondary" onClick={() => handleAction(s._id, 'cancel')}>Cancel</button>
                )}
                {s.status === 'accepted' && new Date(s.dateTime) <= now && (
                  <button className="btn-primary" onClick={() => handleAction(s._id, 'complete')}>Mark complete</button>
                )}
                {s.status === 'completed' && (
                  <button className="btn-secondary" onClick={() => setReviewingSession(s)}>Leave a review</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {reviewingSession && (
        <ReviewModal session={reviewingSession} onClose={() => setReviewingSession(null)} />
      )}
    </div>
  );
}
