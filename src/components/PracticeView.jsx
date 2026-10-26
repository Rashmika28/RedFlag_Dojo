// This file renders the practice start screen and the tappable message screen.
import BeltBadge from './BeltBadge.jsx';

export default function PracticeView({
  round,
  cumulativeScore,
  currentBelt,
  onStartRound,
  onToggleChunk,
  onSubmit
}) {
  if (!round) {
    return (
      <main className="screen practice-screen">
        <section className="hero hero--compact">
          <p className="eyebrow">Practice hall</p>
          <h1>Read the message. Tap the tactics.</h1>
          <p className="hero__lead">
            Three fictional messages. Tap a clause to flag it; tap again to clear it.
          </p>
        </section>

        <section className="practice-start">
          <div className="practice-start__stat">
            <span className="practice-start__label">Current belt</span>
            <BeltBadge belt={currentBelt} />
          </div>
          <div className="practice-start__stat">
            <span className="practice-start__label">Cumulative score</span>
            <span className="practice-start__value">{cumulativeScore}</span>
          </div>
          <button type="button" className="btn btn--primary btn--wide practice-start__cta" onClick={onStartRound}>
            Start round
          </button>
        </section>
      </main>
    );
  }

  const scenario = round.scenarios[round.index];

  return (
    <main className="screen practice-screen practice-screen--message">
      <div className="practice-progress">
        <span className="practice-progress__count">Message {round.index + 1} of 3</span>
        <BeltBadge belt={currentBelt} compact />
      </div>

      <section className="message-stage">
        <p className="message-stage__instruction">Tap every clause that carries a tactic.</p>
        <div className="chunk-list">
          {scenario.chunks.map((chunk) => {
            const isSelected = round.selectedIds.includes(chunk.id);
            return (
              <button
                type="button"
                key={chunk.id}
                className={isSelected ? 'chunk chunk--selected' : 'chunk'}
                aria-pressed={isSelected}
                onClick={() => onToggleChunk(chunk.id)}
              >
                {chunk.text}
              </button>
            );
          })}
        </div>
      </section>

      <div className="practice-actions">
        <button type="button" className="btn btn--primary btn--wide" onClick={onSubmit}>
          Submit
        </button>
      </div>
    </main>
  );
}
