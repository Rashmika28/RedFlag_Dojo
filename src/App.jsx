// This file is the root component and holds all session state for RedFlag Dojo.
import { useState } from 'react';
import AnalyzeView from './components/AnalyzeView.jsx';
import ResultsView from './components/ResultsView.jsx';
import PracticeView from './components/PracticeView.jsx';
import FeedbackView from './components/FeedbackView.jsx';
import RoundSummary from './components/RoundSummary.jsx';
import BeltBadge from './components/BeltBadge.jsx';
import { analyzeMessage } from './engine/analyze.js';
import { scoreMessage, scoreRound, getBelt, getBeltProgress } from './engine/scoring.js';
import { drawRound } from './utils/draw.js';
import { rulesByTacticId } from './utils/rules.js';
import { EXAMPLE_MESSAGE, EXAMPLE_SENDER } from './data/example.js';

const MAX_LENGTH = 3000;

function buildRecap(index, scenario, result) {
  const notes = [];
  const missedId = result.details.missed[0];

  if (missedId) {
    const chunk = scenario.chunks.find((item) => item.id === missedId);
    const tactic = chunk ? rulesByTacticId[chunk.tacticId] : null;
    const tacticName = tactic ? tactic.tacticName.toLowerCase() : 'a tactic';
    notes.push(`missed ${tacticName}`);
  }

  if (result.falseFlags > 0) {
    notes.push(`${result.falseFlags} false ${result.falseFlags === 1 ? 'flag' : 'flags'}`);
  }

  const detail = notes.length > 0 ? notes.join(', ') : 'no misses';
  return `Message ${index + 1}: ${result.messageScore}/6, ${detail}`;
}

export default function App() {
  const [mode, setMode] = useState('analyze');
  const [text, setText] = useState('');
  const [sender, setSender] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [analyzeError, setAnalyzeError] = useState('');
  const [round, setRound] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [summary, setSummary] = useState(null);
  const [cumulativeScore, setCumulativeScore] = useState(0);

  const currentBelt = getBelt(cumulativeScore).belt;

  function handleAnalyze() {
    if (text.trim().length === 0) return;
    if (text.length > MAX_LENGTH) {
      setAnalyzeError(`Message too long. Shorten it to ${MAX_LENGTH} characters or fewer to check it.`);
      return;
    }
    try {
      const result = analyzeMessage({ text, sender });
      setAnalysis(result);
      setAnalyzeError('');
    } catch (error) {
      setAnalyzeError('Something went wrong while reading the message. Shorten it and try again.');
      setAnalysis(null);
    }
  }

  function handleExample() {
    try {
      const result = analyzeMessage({ text: EXAMPLE_MESSAGE, sender: EXAMPLE_SENDER });
      setText(EXAMPLE_MESSAGE);
      setSender(EXAMPLE_SENDER);
      setAnalysis(result);
      setAnalyzeError('');
    } catch (error) {
      setAnalyzeError('Could not load the example. Paste a message and try again.');
    }
  }

  function startRound() {
    const previousIds = round ? round.scenarios.map((scenario) => scenario.id) : [];
    const scenarios = drawRound(previousIds);
    setRound({
      scenarios,
      index: 0,
      selectedIds: [],
      messageScores: [],
      caughtTotal: 0,
      missedTotal: 0,
      falseTotal: 0,
      recaps: []
    });
    setFeedback(null);
    setSummary(null);
    setMode('practice');
  }

  function toggleChunk(chunkId) {
    setRound((previous) => {
      if (!previous) return previous;
      const selectedIds = previous.selectedIds.includes(chunkId)
        ? previous.selectedIds.filter((id) => id !== chunkId)
        : [...previous.selectedIds, chunkId];
      return { ...previous, selectedIds };
    });
  }

  function submitMessage() {
    if (!round || feedback) return;
    const scenario = round.scenarios[round.index];
    const result = scoreMessage({
      chunks: scenario.chunks,
      selectedChunkIds: round.selectedIds,
      scenarioType: scenario.type
    });
    const isLast = round.index === round.scenarios.length - 1;

    setRound((previous) => ({
      ...previous,
      messageScores: [...previous.messageScores, result.messageScore],
      caughtTotal: previous.caughtTotal + result.correctCaught,
      missedTotal: previous.missedTotal + result.missed,
      falseTotal: previous.falseTotal + result.falseFlags,
      recaps: [...previous.recaps, buildRecap(previous.index, scenario, result)]
    }));
    setFeedback({ scenario, result, isLast });
  }

  function handleNext() {
    if (!round || !feedback) return;

    if (!feedback.isLast) {
      setRound((previous) => ({
        ...previous,
        index: previous.index + 1,
        selectedIds: []
      }));
      setFeedback(null);
      return;
    }

    const { roundScore } = scoreRound(round.messageScores);
    const prevCumulative = cumulativeScore;
    const newCumulative = cumulativeScore + roundScore;
    const progress = getBeltProgress({ prevCumulative, newCumulative });

    setCumulativeScore(newCumulative);
    setSummary({ roundScore, newCumulative, prevCumulative, ...progress });
    setFeedback(null);
  }

  function backToAnalyze() {
    setMode('analyze');
    setAnalysis(null);
    setRound(null);
    setFeedback(null);
    setSummary(null);
  }

  function switchMode(nextMode) {
    setMode(nextMode);
  }

  let content = null;
  if (mode === 'analyze') {
    content = analysis ? (
      <ResultsView
        analysis={analysis}
        text={text}
        sender={sender}
        onBack={() => setAnalysis(null)}
        onPractice={() => switchMode('practice')}
      />
    ) : (
      <AnalyzeView
        text={text}
        sender={sender}
        onTextChange={setText}
        onSenderChange={setSender}
        onAnalyze={handleAnalyze}
        onExample={handleExample}
        error={analyzeError}
      />
    );
  } else if (summary) {
    content = (
      <RoundSummary
        summary={summary}
        round={round}
        onPlayAgain={startRound}
        onBackToAnalyze={backToAnalyze}
      />
    );
  } else if (feedback) {
    content = (
      <FeedbackView
        feedback={feedback}
        messageIndex={round.index}
        totalMessages={round.scenarios.length}
        onNext={handleNext}
      />
    );
  } else {
    content = (
      <PracticeView
        round={round}
        cumulativeScore={cumulativeScore}
        currentBelt={currentBelt}
        onStartRound={startRound}
        onToggleChunk={toggleChunk}
        onSubmit={submitMessage}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">//</span>
          <span className="brand__name">RedFlag Dojo</span>
        </div>
        <div className="app-header__right">
          <nav className="nav-switch" aria-label="Mode">
            <button
              type="button"
              className={mode === 'analyze' ? 'nav-switch__btn is-active' : 'nav-switch__btn'}
              aria-pressed={mode === 'analyze'}
              onClick={() => switchMode('analyze')}
            >
              Analyze
            </button>
            <button
              type="button"
              className={mode === 'practice' ? 'nav-switch__btn is-active' : 'nav-switch__btn'}
              aria-pressed={mode === 'practice'}
              onClick={() => switchMode('practice')}
            >
              Practice
            </button>
          </nav>
          <BeltBadge belt={currentBelt} compact />
        </div>
      </header>
      {content}
    </div>
  );
}
