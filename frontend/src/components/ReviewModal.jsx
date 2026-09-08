import { useState } from 'react';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';

export default function ReviewModal({ session, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosClient.post('/reviews', { sessionId: session._id, rating, comment });
      toast.success('Review submitted!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Rate your session: {session.skill}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Rating
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} star{r !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </label>
          <label>
            Comment
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the session?"
            />
          </label>
          <div className="booking-form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
