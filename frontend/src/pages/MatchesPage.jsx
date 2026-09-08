import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchMatches } from '../features/matches/matchesSlice';
import { createSession } from '../features/sessions/sessionsSlice';
import { openChatWith } from '../features/chat/chatSlice';
import Spinner from '../components/Spinner';
import StarRating from '../components/StarRating';

export default function MatchesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: matches, status } = useSelector((state) => state.matches);
  const [bookingFor, setBookingFor] = useState(null); // userId currently booking

  useEffect(() => {
    dispatch(fetchMatches());
  }, [dispatch]);

  const handleMessage = async (userId) => {
    const result = await dispatch(openChatWith(userId));
    if (openChatWith.fulfilled.match(result)) {
      navigate('/chats');
    } else {
      toast.error('Could not open chat');
    }
  };

  if (status === 'loading') return <Spinner label="Finding your best matches..." />;

  return (
    <div className="page">
      <h1>My Matches</h1>
      <p className="subtitle">Ranked by compatibility — how well your teach/learn lists overlap.</p>

      {matches.length === 0 && (
        <p className="empty-state">
          No matches yet. Add more skills you can teach and want to learn to find compatible peers.
        </p>
      )}

      <div className="match-list">
        {matches.map((m) => (
          <div key={m.userId} className="match-card-full">
            <div className="match-header">
              <div>
                <h3>{m.name} {m.isTwoWay && <span className="badge">Two-way swap</span>}</h3>
                <StarRating rating={m.avgRating} />
              </div>
              <div className="compatibility-badge">{m.compatibility}%</div>
            </div>

            {m.bio && <p className="bio">{m.bio}</p>}

            <div className="match-skills">
              {m.theyCanTeachYou.length > 0 && (
                <div>
                  <strong>They can teach you:</strong>{' '}
                  {m.theyCanTeachYou.map((s) => s.name).join(', ')}
                </div>
              )}
              {m.youCanTeachThem.length > 0 && (
                <div>
                  <strong>You can teach them:</strong>{' '}
                  {m.youCanTeachThem.map((s) => s.name).join(', ')}
                </div>
              )}
            </div>

            <div className="match-actions">
              <button className="btn-secondary" onClick={() => handleMessage(m.userId)}>
                Message
              </button>
              <button
                className="btn-primary"
                onClick={() => setBookingFor(bookingFor === m.userId ? null : m.userId)}
              >
                Book a session
              </button>
            </div>

            {bookingFor === m.userId && (
              <BookingForm
                match={m}
                onClose={() => setBookingFor(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingForm({ match, onClose }) {
  const dispatch = useDispatch();
  const suggestedSkill = match.theyCanTeachYou[0]?.name || match.youCanTeachThem[0]?.name || '';
  const defaultRole = match.theyCanTeachYou[0] ? 'learner' : 'teacher';

  const [skill, setSkill] = useState(suggestedSkill);
  const [role, setRole] = useState(defaultRole);
  const [dateTime, setDateTime] = useState('');
  const [duration, setDuration] = useState(60);

  const allSkillOptions = [
    ...match.theyCanTeachYou.map((s) => ({ name: s.name, role: 'learner' })),
    ...match.youCanTeachThem.map((s) => ({ name: s.name, role: 'teacher' })),
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skill || !dateTime) {
      toast.error('Please choose a skill and date/time');
      return;
    }
    const result = await dispatch(
      createSession({
        otherUserId: match.userId,
        skill,
        dateTime: new Date(dateTime).toISOString(),
        duration: Number(duration),
        role,
      })
    );
    if (createSession.fulfilled.match(result)) {
      toast.success('Session request sent!');
      onClose();
    } else {
      toast.error(result.payload || 'Failed to book session');
    }
  };

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <label>
        Skill
        <select
          value={`${skill}|${role}`}
          onChange={(e) => {
            const [name, r] = e.target.value.split('|');
            setSkill(name);
            setRole(r);
          }}
        >
          {allSkillOptions.map((opt) => (
            <option key={`${opt.name}-${opt.role}`} value={`${opt.name}|${opt.role}`}>
              {opt.name} ({opt.role === 'learner' ? 'they teach you' : 'you teach them'})
            </option>
          ))}
        </select>
      </label>
      <label>
        Date & time
        <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
      </label>
      <label>
        Duration (minutes)
        <input type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(e.target.value)} />
      </label>
      <div className="booking-form-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary">Send request</button>
      </div>
    </form>
  );
}
