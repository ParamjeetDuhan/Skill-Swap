import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMySkills } from '../features/skills/skillsSlice';
import { fetchMatches } from '../features/matches/matchesSlice';
import { fetchSessions } from '../features/sessions/sessionsSlice';
import StarRating from '../components/StarRating';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { skillsToTeach, skillsToLearn } = useSelector((state) => state.skills);
  const { list: matches } = useSelector((state) => state.matches);
  const { list: sessions } = useSelector((state) => state.sessions);

  useEffect(() => {
    dispatch(fetchMySkills());
    dispatch(fetchMatches());
    dispatch(fetchSessions());
  }, [dispatch]);

  const upcoming = sessions.filter(
    (s) => new Date(s.dateTime) >= new Date() && s.status !== 'cancelled'
  );

  return (
    <div className="page">
      <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
      <p className="subtitle">
        <StarRating rating={user?.avgRating} count={user?.ratingCount} /> average rating
      </p>

      <div className="dashboard-grid">
        <Link to="/skills" className="dashboard-card">
          <h3>My Skills</h3>
          <p>{skillsToTeach.length} to teach · {skillsToLearn.length} to learn</p>
        </Link>

        <Link to="/matches" className="dashboard-card">
          <h3>My Matches</h3>
          <p>{matches.length} compatible peer{matches.length !== 1 ? 's' : ''} found</p>
        </Link>

        <Link to="/sessions" className="dashboard-card">
          <h3>My Sessions</h3>
          <p>{upcoming.length} upcoming session{upcoming.length !== 1 ? 's' : ''}</p>
        </Link>

        <Link to="/chats" className="dashboard-card">
          <h3>Notifications & Chats</h3>
          <p>Stay in touch with your matches</p>
        </Link>
      </div>

      {matches.length > 0 && (
        <div className="section">
          <h2>Top match</h2>
          <div className="match-card">
            <div>
              <h4>{matches[0].name}</h4>
              <p>{matches[0].compatibility}% compatible {matches[0].isTwoWay && '· Two-way swap!'}</p>
            </div>
            <Link to="/matches" className="btn-secondary">View all matches</Link>
          </div>
        </div>
      )}
    </div>
  );
}
