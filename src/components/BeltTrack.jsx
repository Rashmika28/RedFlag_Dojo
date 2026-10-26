// This file shows the four-rank belt progression with the current rank marked.
import { BELT_ORDER, BELT_THRESHOLDS } from '../engine/scoring.js';

const BELT_LABELS = {
  WHITE: 'White',
  YELLOW: 'Yellow',
  BROWN: 'Brown',
  BLACK: 'Black'
};

export default function BeltTrack({ belt = 'WHITE' }) {
  const currentIndex = BELT_ORDER.indexOf(belt);

  return (
    <ol className="belt-track" aria-label="Belt progression">
      {BELT_ORDER.map((rank, index) => {
        const state = index < currentIndex ? 'is-passed' : index === currentIndex ? 'is-current' : '';
        return (
          <li
            className={`belt-track__item ${state}`.trim()}
            key={rank}
            aria-current={index === currentIndex ? 'step' : undefined}
          >
            <span className={`belt-track__knot belt-track__knot--${rank.toLowerCase()}`} aria-hidden="true" />
            <span className="belt-track__label">{BELT_LABELS[rank]}</span>
            <span className="belt-track__points">{BELT_THRESHOLDS[rank]} pts</span>
          </li>
        );
      })}
    </ol>
  );
}
