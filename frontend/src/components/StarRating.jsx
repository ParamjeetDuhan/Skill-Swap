export default function StarRating({ rating = 0, count }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className="star-rating">
      {stars.map((s) => (
        <span key={s} className={s <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
      ))}
      {typeof count === 'number' && <span className="rating-count"> ({count})</span>}
    </span>
  );
}
