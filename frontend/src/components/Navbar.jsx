import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { disconnectSocket } from '../api/socket';

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    disconnectSocket();
    dispatch(logout());
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">SkillSwap</Link>
      </div>
      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/skills">My Skills</Link>
        <Link to="/matches">Matches</Link>
        <Link to="/sessions">Sessions</Link>
        <Link to="/chats">Chats</Link>
        <Link to="/profile">Profile</Link>
      </div>
      <div className="navbar-user">
        <span>{user.name}</span>
        <button onClick={handleLogout} className="btn-secondary">Logout</button>
      </div>
    </nav>
  );
}
