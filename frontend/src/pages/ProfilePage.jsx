import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchMe, updateProfile } from '../features/auth/authSlice';
import StarRating from '../components/StarRating';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', bio: '', profilePic: '' });

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', bio: user.bio || '', profilePic: user.profilePic || '' });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated');
    } else {
      toast.error(result.payload || 'Failed to update profile');
    }
  };

  if (!user) return null;

  return (
    <div className="page">
      <h1>My Profile</h1>

      <div className="profile-summary">
        <div className="avatar-placeholder">{user.name?.[0]}</div>
        <div>
          <h2>{user.name}</h2>
          <StarRating rating={user.avgRating} count={user.ratingCount} />
          <p>{user.email}</p>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Bio
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell others about yourself..."
          />
        </label>
        <label>
          Profile picture URL
          <input
            value={form.profilePic}
            onChange={(e) => setForm({ ...form, profilePic: e.target.value })}
            placeholder="https://..."
          />
        </label>
        <button type="submit" className="btn-primary">Save changes</button>
      </form>
    </div>
  );
}
