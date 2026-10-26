// This file shows the current belt rank as a compact badge.
const BELT_LABELS = {
  WHITE: 'White',
  YELLOW: 'Yellow',
  BROWN: 'Brown',
  BLACK: 'Black'
};

export default function BeltBadge({ belt = 'WHITE', compact = false }) {
  return (
    <span className={`belt-badge belt-badge--${belt.toLowerCase()} ${compact ? 'belt-badge--compact' : ''}`}>
      <span className="belt-badge__knot" aria-hidden="true" />
      {!compact && <span className="belt-badge__label">Belt</span>}
      <span className="belt-badge__rank">{BELT_LABELS[belt] || BELT_LABELS.WHITE}</span>
    </span>
  );
}
