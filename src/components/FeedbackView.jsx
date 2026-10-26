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
    <main id="main-content" tabIndex={-1} className="screen feedback-screen" aria-labelledby="screen-title">
      <h1 id="screen-title" className="sr-only">Feedback for message {messageIndex + 1}</h1>
      <div className="feedback-header">
        <div>
          <p className="eyebrow">Message {messageIndex + 1} of {totalMessages} feedback</p>
          <p className="feedback-header__sub">
            Green caught, red missed, grey outline false flag.
          </p>
        </div>
        <div className="score-stamp" role="group" aria-label={`Message score ${result.messageScore} out of 6`}>
          <span className="score-stamp__value" aria-hidden="true">{result.messageScore}</span>
          <span className="score-stamp__max" aria-hidden="true">/ 6</span>
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
                    {scenario.type === 'clean'
                      ? 'This clause carried no tactic. Flagging it costs 2 points; leaving it alone protects your score.'
                      : 'This clause carried no tactic. Flagging it costs 1 point; leaving it alone protects your score.'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="feedback-tally" role="status" aria-live="polite">
        <span>Caught {result.correctCaught}</span>
        <span>Missed {result.missed}</span>
        <span>False flags {result.falseFlags}</span>
      </div>
      <p className="feedback-legend">+2 per catch. -1 per false flag. Misses cost 0.</p>

      <div className="practice-actions">
        <button type="button" className="btn btn--primary btn--wide" onClick={onNext}>
          {isLast ? 'See results' : 'Next'}
        </button>
      </div>
    </main>
  );
}
