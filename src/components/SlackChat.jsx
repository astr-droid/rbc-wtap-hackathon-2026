// A faked Slack-style DM window. It plays a script from data/scripts.js and calls
// onComplete(answers) once every question has an answer.

import { useEffect, useMemo, useRef, useState } from 'react';

function Avatar({ from }) {
  return <span className={`slack-avatar${from.isApp ? ' app' : ''}`} aria-hidden="true">{from.initials}</span>;
}

function Message({ from, text, time }) {
  return (
    <div className="slack-message">
      <Avatar from={from} />
      <div>
        <div className="slack-meta">
          <strong>{from.name}</strong>
          {from.isApp && <span className="slack-app-badge">APP</span>}
          <span>{time}</span>
        </div>
        <p>{text}</p>
      </div>
    </div>
  );
}

export default function SlackChat({ titleId, title, subtitle, me, script, onComplete, onClose }) {
  const [answers, setAnswers] = useState({});
  const [draft, setDraft] = useState('');
  const completedRef = useRef(false);
  const endRef = useRef(null);
  const values = useMemo(() => Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v.value])), [answers]);

  const { shown, pending } = useMemo(() => {
    const visible = [];
    for (const step of script) {
      if (step.when && !step.when(values)) continue;
      visible.push(step);
      const waits = step.choices || step.allowText;
      if (waits && !(step.id in answers)) return { shown: visible, pending: step };
    }
    return { shown: visible, pending: null };
  }, [script, answers, values]);

  useEffect(() => {
    if (!pending && !completedRef.current) {
      completedRef.current = true;
      onComplete(values);
    }
  }, [pending, values, onComplete]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [shown.length, answers]);

  const answer = (step, value, label) => setAnswers((prev) => ({ ...prev, [step.id]: { value, label } }));

  const submitDraft = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !pending?.allowText) return;
    answer(pending, text, text);
    setDraft('');
  };

  return (
    <div className="slack-window">
      <div className="slack-header">
        <div>
          <strong id={titleId}>{title}</strong>
          <small>{subtitle}</small>
        </div>
        <button className="slack-close" type="button" aria-label="Close chat" onClick={onClose}>×</button>
      </div>

      <div className="slack-stream" aria-live="polite">
        {shown.map((step, i) => (
          <div key={step.id} className="slack-turn">
            <Message from={step.from} text={step.text} time={`9:${String(2 + i * 2).padStart(2, '0')} AM`} />
            {answers[step.id] && <Message from={me} text={answers[step.id].label} time={`9:${String(3 + i * 2).padStart(2, '0')} AM`} />}
          </div>
        ))}
        {pending?.choices && (
          <div className="slack-choices">
            {pending.choices.map((choice) => (
              <button key={choice.value} className="slack-choice" type="button" onClick={() => answer(pending, choice.value, choice.label)}>
                {choice.label}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form className="slack-compose" onSubmit={submitDraft}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={pending?.allowText ? 'Or type your own answer…' : 'Tap an option above'}
          disabled={!pending?.allowText}
          aria-label="Type your answer"
        />
        <button type="submit" disabled={!pending?.allowText || !draft.trim()}>Send</button>
      </form>
    </div>
  );
}
