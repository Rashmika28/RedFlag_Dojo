// This file renders the Analyze screen where a recruiter message is pasted.
const MAX_LENGTH = 3000;

export default function AnalyzeView({
  text,
  sender,
  onTextChange,
  onSenderChange,
  onAnalyze,
  onExample,
  error
}) {
  const tooLong = text.length > MAX_LENGTH;
  const canCheck = text.trim().length > 0 && !tooLong;

  return (
    <main className="screen analyze-screen">
      <section className="hero">
        <p className="eyebrow">Signal practice for job chats</p>
        <h1>Spot the pressure before you reply.</h1>
        <p className="hero__lead">
          Paste a first-contact recruiter message. We show the exact phrases that
          tripped a rule, the tactic behind each one, and what to verify.
        </p>
      </section>

      <section className="panel paste-panel">
        <div className="field">
          <label htmlFor="message-text" className="field__label">
            Recruiter message
          </label>
          <textarea
            id="message-text"
            className="field__textarea"
            rows={9}
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder="Paste the message here. Keep it to a first-contact message or short chat."
          />
          <div className="field__meta">
            <span className={tooLong ? 'char-count char-count--over' : 'char-count'}>
              {text.length} / {MAX_LENGTH} characters
            </span>
            {tooLong && (
              <span className="field__warning" role="alert">
                Message too long. Shorten it to {MAX_LENGTH} characters or fewer to check it.
              </span>
            )}
          </div>
        </div>

        <div className="field">
          <label htmlFor="sender-line" className="field__label">
            Sender line <span className="field__optional">optional</span>
          </label>
          <input
            id="sender-line"
            className="field__input"
            type="text"
            value={sender}
            onChange={(event) => onSenderChange(event.target.value)}
            placeholder="e.g. Talent Desk <careers@example.com>"
          />
          <p className="field__hint">
            A sender address or display name. Email-domain signals look here.
          </p>
        </div>

        {error && (
          <p className="error-banner" role="alert">
            {error}
          </p>
        )}

        <div className="analyze-actions">
          <button type="button" className="btn btn--primary" disabled={!canCheck} onClick={onAnalyze}>
            Check signals
          </button>
          <button type="button" className="btn btn--ghost" onClick={onExample}>
            Try an example
          </button>
        </div>

        {text.trim() === '' && (
          <p className="field__hint">
            The Check button wakes up once there is a message to read.
          </p>
        )}
      </section>

      <p className="disclaimer">
        Signals only. RedFlag Dojo points at patterns; it never issues a verdict.
        Verify every opportunity through official channels.
      </p>
    </main>
  );
}
