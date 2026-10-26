// This file renders feedback for one submitted practice message.
import { rulesByTacticId } from '../utils/rules.js';

function getChunkState(chunk, selectedIds) {
  const selected = selectedIds.includes(chunk.id);
  if (chunk.suspicious) return selected ? 'caught' : 'missed';
  return selected ? 'false-flag' : 'neutral';
}

const STATE_LABELS = {
  caught: 'Caught',
  missed: 'Missed',
  'false-flag': 'False flag',
  neutral: 'Left alone'
};

export default function FeedbackView({ feedback, messageIndex, totalMessages, onNext }) {
  const { scenario, result, isLast } = feedback;
  const selectedIds = [
    ...result.details.caught,
    ...result.details.falseFlag
  ];

  return (
    <main className="screen feedback-screen">
      <div className="feedback-header">
        <div>
          <p className="eyebrow">Message {messageIndex + 1} of {totalMessages} feedback</p>
          <p className="feedback-header__sub">
            Green caught, red missed, grey outline false flag.
          </p>
        </div>
        <div className="score-stamp">
          <span className="score-stamp__value">{result.messageScore}</span>
          <span className="score-stamp__max">/ 6</span>
        </div>
      </div>

      <section className="message-stage message-stage--feedback">
        <div className="chunk-list">
          {scenario.chunks.map((chunk) => {
            const state = getChunkState(chunk, selectedIds);
            const tactic = chunk.tacticId ? rulesByTacticId[chunk.tacticId] : null;
            return (
              <div key={chunk.id} className={`feedback-chunk feedback-chunk--${state}`}>
                <div className="feedback-chunk__row">
                  <span className="feedback-chunk__text">{chunk.text}</span>
                  {STATE_LABELS[state] && (
                    <span className="feedback-chunk__label">{STATE_LABELS[state]}</span>
                  )}
                </div>
                {chunk.suspicious && tactic && (
                  <div className="feedback-chunk__explain">
                    <p className="feedback-chunk__tactic">Tactic: {tactic.tacticName}</p>
                    <p>{tactic.whyItMatters}</p>
                  </div>
                )}
                {state === 'false-flag' && (
                  <p className="feedback-chunk__note">
                    This clause carried no tactic. Leaving it alone protects your score.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="feedback-tally">
        <span>Caught {result.correctCaught}</span>
        <span>Missed {result.missed}</span>
        <span>False flags {result.falseFlags}</span>
      </div>

      <div className="practice-actions">
        <button type="button" className="btn btn--primary btn--wide" onClick={onNext}>
          {isLast ? 'See results' : 'Next'}
        </button>
      </div>
    </main>
  );
}
