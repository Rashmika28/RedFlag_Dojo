// This file renders the end-of-round summary with score, belt, and recap.
import BeltBadge from './BeltBadge.jsx';

const BELT_LABELS = {
  WHITE: 'White',
  YELLOW: 'Yellow',
  BROWN: 'Brown',
  BLACK: 'Black'
};

export default function RoundSummary({ summary, round, onPlayAgain, onBackToAnalyze }) {
  const nextBeltLabel = summary.nextBelt ? BELT_LABELS[summary.nextBelt] : null;

  return (
    <main className="screen summary-screen">
      <p className="eyebrow">Round complete</p>

      <section className="summary-hero">
        <div className="summary-hero__score">
          <span className="summary-hero__value">{summary.roundScore}</span>
          <span className="summary-hero__max">/ 18</span>
          <span className="summary-hero__caption">round score</span>
        </div>
        <div className="summary-hero__belt">
          <BeltBadge belt={summary.currentBelt} />
          <p className="summary-hero__cumulative">
            Session total <strong>{summary.newCumulative}</strong>
          </p>
          <p className="summary-hero__next">
            {summary.nextBelt
              ? `${summary.pointsToNext} points to ${nextBeltLabel}`
              : 'Black belt. The top of the hall.'}
          </p>
        </div>
      </section>

      {summary.beltUp && (
        <section className="belt-up" aria-live="polite">
          <span className="belt-up__tag">Belt up</span>
          <p>
            {BELT_LABELS[summary.prevBelt]} to {BELT_LABELS[summary.currentBelt]}. The next drill
            just got sharper.
          </p>
        </section>
      )}

      <section className="section-block">
        <div className="section-heading">
          <h2>Round breakdown</h2>
          <p>Misses cost no points. False flags do.</p>
        </div>
        <div className="breakdown-grid">
          <div className="breakdown-stat">
            <span className="breakdown-stat__value">{round.caughtTotal}</span>
            <span className="breakdown-stat__label">caught</span>
          </div>
          <div className="breakdown-stat">
            <span className="breakdown-stat__value">{round.missedTotal}</span>
            <span className="breakdown-stat__label">missed</span>
          </div>
          <div className="breakdown-stat">
            <span className="breakdown-stat__value">{round.falseTotal}</span>
            <span className="breakdown-stat__label">false flags</span>
          </div>
        </div>

        <ul className="recap-list">
          {round.recaps.map((recap, index) => (
            <li className="recap-list__item" key={`${index}-${recap}`}>
              {recap}
            </li>
          ))}
        </ul>
      </section>

      <div className="summary-actions">
        <button type="button" className="btn btn--primary btn--wide" onClick={onPlayAgain}>
          Play again
        </button>
        <button type="button" className="btn btn--ghost btn--wide" onClick={onBackToAnalyze}>
          Back to Analyze
        </button>
      </div>

      <p className="disclaimer">
        Belt progress lives in this session only. Refresh the page and you start
        again at White.
      </p>
    </main>
  );
}
