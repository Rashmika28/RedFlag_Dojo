// This file renders the signal results for an analyzed message.
const SUMMARY_COPY = {
  none: {
    label: 'No signals found',
    detail:
      "That doesn't mean the message is trustworthy. Verify the sender anyway."
  },
  few: {
    label: 'Few risk signals',
    detail: 'One or two distinct patterns matched. Read each one before you reply.'
  },
  some: {
    label: 'Some risk signals',
    detail: 'Three or four distinct patterns matched. Slow down and verify the details.'
  },
  many: {
    label: 'Many risk signals',
    detail: 'Five or more distinct patterns matched. Verify every part of this message.'
  }
};

function AnnotatedMessage({ text, matches }) {
  if (!text) return null;
  if (!matches.length) return <p className="annotated-text">{text}</p>;

  const sorted = [...matches].sort((a, b) => a.start - b.start);
  const pieces = [];
  let cursor = 0;

  sorted.forEach((match) => {
    if (match.start < cursor) return;
    if (match.start > cursor) {
      pieces.push(text.slice(cursor, match.start));
    }
    pieces.push(
      <mark className="evidence-mark" key={`${match.ruleId}-${match.start}`}>
        <span className="evidence-mark__number">{match.number}</span>
        {text.slice(match.start, match.end)}
      </mark>
    );
    cursor = match.end;
  });

  if (cursor < text.length) pieces.push(text.slice(cursor));
  return <p className="annotated-text">{pieces}</p>;
}

export default function ResultsView({ analysis, text, sender, onBack, onPractice }) {
  const copy = SUMMARY_COPY[analysis.summaryLevel] || SUMMARY_COPY.none;
  const numbered = analysis.matches.map((match, index) => ({ ...match, number: index + 1 }));
  const textMatches = numbered.filter((match) => match.source === 'text');
  const senderMatches = numbered.filter((match) => match.source === 'sender');
  const categoryCount = new Set(numbered.map((match) => match.category)).size;

  return (
    <main className="screen results-screen">
      <div className="results-topbar">
        <button type="button" className="btn btn--ghost btn--small" onClick={onBack}>
          Edit message
        </button>
        <p className="eyebrow">Signal readout</p>
      </div>

      <section className={`summary-banner summary-banner--${analysis.summaryLevel}`}>
        <div>
          <p className="summary-banner__label">{copy.label}</p>
          <p className="summary-banner__detail">{copy.detail}</p>
        </div>
        <div className="summary-banner__count">
          <span className="summary-banner__number">{analysis.distinctRuleCount}</span>
          <span className="summary-banner__caption">
            {analysis.distinctRuleCount === 1 ? 'distinct rule' : 'distinct rules'}
            {categoryCount > 0 ? ` across ${categoryCount} ${categoryCount === 1 ? 'category' : 'categories'}` : ''}
          </span>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Annotated message</h2>
          <p>Numbered marks match the evidence ledger.</p>
        </div>
        <div className="document-sheet">
          <AnnotatedMessage text={text} matches={textMatches} />
          {sender && (
            <div className="document-sheet__sender">
              <span className="document-sheet__sender-label">Sender</span>
              <AnnotatedMessage text={sender} matches={senderMatches} />
            </div>
          )}
        </div>
      </section>

      {numbered.length > 0 && (
        <section className="section-block">
          <div className="section-heading">
            <h2>Evidence ledger</h2>
            <p>Phrase, tactic, why it matters, and what to verify.</p>
          </div>
          <ol className="ledger">
            {numbered.map((match) => (
              <li className="ledger__item" key={`${match.ruleId}-${match.start}-${match.source}`}>
                <span className="ledger__number">{match.number}</span>
                <div className="ledger__body">
                  <p className="ledger__phrase">&ldquo;{match.phrase}&rdquo;</p>
                  <p className="ledger__tactic">
                    {match.tacticName}
                    <span className="ledger__source">{match.source === 'sender' ? 'sender line' : 'message'}</span>
                  </p>
                  <p className="ledger__why">{match.whyItMatters}</p>
                  <p className="ledger__verify">
                    <span>Verify:</span> {match.whatToVerify}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {analysis.checklist.length > 0 && (
        <section className="section-block">
          <div className="section-heading">
            <h2>Your checklist</h2>
            <p>Built only from the signals above. Nothing generic.</p>
          </div>
          <ul className="checklist">
            {analysis.checklist.map((item) => (
              <li key={item} className="checklist__item">
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="practice-bridge">
        <div>
          <p className="eyebrow">Turn signals into instinct</p>
          <h2>Drill the same tactics in Practice.</h2>
          <p>Three short fictional messages. Tap the suspicious clauses. Earn a belt.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={onPractice}>
          Go to Practice
        </button>
      </section>

      <p className="disclaimer">
        Signals only. This readout is not a verdict. Verify the sender and the
        opportunity through official channels before sharing anything.
      </p>
    </main>
  );
}
