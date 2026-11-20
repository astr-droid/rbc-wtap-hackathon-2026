// Zoom: My team. Owner: Person B.
// The manager sees only what managerView() returns: approved goals, shared stops and shared wins.

import { useState } from 'react';
import ChartMap from '../components/ChartMap.jsx';
import { destinations, people, projectSuggestions, regions } from '../data/cohort.js';
import { managerView } from '../lib/privacy.js';
import { STOP_STATE_LABEL, byId, curve, stopPositions, teamRegion } from '../lib/routes.js';
import './student-manager.css';

const fill = (text, name) => text.replaceAll('{name}', name);

export default function TeamLayer({ student, notify }) {
  const [brief, setBrief] = useState('onboarding');
  const view = managerView(student);
  const manager = byId(people, student.managerId);
  const home = teamRegion(student.teamId);

  if (!view) {
    return (
      <section className="layer" aria-labelledby="team-heading">
        <div className="intro">
          <div className="eyebrow">My team · {manager.name}</div>
          <h1 id="team-heading">Nothing to brief yet.</h1>
          <p>{student.firstName} has not finished the Ambition Card chat. The brief appears once they choose what to share.</p>
        </div>
      </section>
    );
  }

  const routeGoals = view.goals.filter((g) => g.destinationId);
  const suggestions = view.goals.flatMap((goal) => (projectSuggestions[goal.destinationId ?? 'skill'] ?? []).map((s) => ({
    title: fill(s.title, view.firstName),
    detail: fill(s.detail, view.firstName),
  })));

  const routes = [];
  const pins = [{ id: 'student', x: home.x, y: home.y, size: 'lg', label: `${view.firstName} · ${view.type.toLowerCase()}` }];
  routeGoals.forEach((goal) => {
    const destination = byId(destinations, goal.destinationId);
    const route = curve(home, destination);
    routes.push({ id: goal.id, d: route.d });
    pins.push({ id: `dest-${goal.id}`, x: destination.x, y: destination.y, icon: 'star', label: destination.short, sublabel: `${view.firstName}'s goal`, labelPosition: 'above' });
    const ideas = projectSuggestions[goal.destinationId] ?? [];
    stopPositions(route, ideas.length).forEach((pos, i) => {
      pins.push({ id: `idea-${goal.id}-${i}`, ...pos, tone: 'gold', label: `Project idea ${i + 1}`, sublabel: 'suggested' });
    });
  });

  const firstGoal = routeGoals[0];
  const talkingPoints = [
    firstGoal && `What would help you ${firstGoal.title.charAt(0).toLowerCase()}${firstGoal.title.slice(1)} next term?`,
    'What is one thing I could do differently to support you?',
    view.feedbackStyle && `${view.firstName} prefers feedback: ${view.feedbackStyle.toLowerCase()}. Plan the midterm conversation that way.`,
  ].filter(Boolean);

  return (
    <section className="layer" aria-labelledby="team-heading">
      <div className="intro">
        <div className="eyebrow">My team · {brief === 'onboarding' ? 'Onboarding brief' : 'Pre-midterm brief'}</div>
        <h1 id="team-heading">{brief === 'onboarding' ? 'Make room for the next step.' : 'Walk into the midterm informed.'}</h1>
        <p>Practical ways to connect {view.firstName}'s goals with the work already on your team.</p>
      </div>

      <div className="layer-grid manager">
        <section className="card map-card" aria-label={`Team view of ${view.firstName}'s approved routes`}>
          <div className="map-heading">
            <div><h2>{view.firstName}'s approved routes</h2><p>Only the goals {view.firstName} chose to share with you.</p></div>
            <span className="map-stamp">{view.team}</span>
          </div>
          <div className="map-wrap">
            <ChartMap
              title={`Team map for ${view.name}`}
              description="Approved goals as routes, with suggested project stops along each one."
              regions={regions}
              routes={routes}
              pins={pins}
            />
          </div>
          <div className="map-footer">
            <span className="map-hint">Project ideas are prompts to consider, not assignments.</span>
          </div>
        </section>

        <aside className="b-panel" aria-label="Manager brief">
          <section>
            <div className="b-section-head">
              <h3>Brief for {manager.name}</h3>
              <div className="segmented" role="tablist" aria-label="Brief type">
                <button type="button" role="tab" aria-selected={brief === 'onboarding'} onClick={() => setBrief('onboarding')}>Week 1</button>
                <button type="button" role="tab" aria-selected={brief === 'midterm'} onClick={() => setBrief('midterm')}>Midterm</button>
              </div>
            </div>
            <p className="b-meta">Supporting {view.name} · {view.team}</p>
          </section>

          <section>
            <h3>{view.firstName} chose to share</h3>
            {view.goals.length === 0 ? (
              <p className="b-meta">No goals shared yet. Nothing private is shown here.</p>
            ) : (
              <ul className="b-list">{view.goals.map((g) => <li key={g.id}>{g.title}</li>)}</ul>
            )}
          </section>

          {brief === 'onboarding' ? (
            <section>
              <h3>Ideas that fit current work</h3>
              <ol className="b-ol">
                {suggestions.map((s) => (
                  <li key={s.title}><strong>{s.title}</strong><span>{s.detail}</span></li>
                ))}
              </ol>
            </section>
          ) : (
            <>
              <section>
                <h3>Progress {view.firstName} shared</h3>
                {view.stops.length ? (
                  <ul className="b-list">
                    {view.stops.map((s) => (
                      <li key={s.id} className="b-row static"><span>{s.title}</span><span className={`b-state ${s.state}`}>{STOP_STATE_LABEL[s.state]}</span></li>
                    ))}
                  </ul>
                ) : <p className="b-meta">{view.firstName} keeps route progress private.</p>}
              </section>
              <section>
                <h3>Wins</h3>
                {view.wins.length ? (
                  <ul className="b-list">{view.wins.map((w) => <li key={w.text}>Week {w.week}: {w.text}</li>)}</ul>
                ) : <p className="b-meta">No shared wins yet.</p>}
              </section>
              <section>
                <h3>Talking points</h3>
                <ul className="b-list">{talkingPoints.map((t) => <li key={t}>{t}</li>)}</ul>
              </section>
            </>
          )}

          <section>
            <div className="b-actions">
              <button className="primary-button" type="button" onClick={() => notify('Noted. Bring these ideas to your next 1:1.')}>Use these ideas</button>
              <button className="text-button" type="button" onClick={() => notify(`Ask ${view.firstName} which ideas feel useful, and adjust together.`)}>Adjust together</button>
            </div>
            <p className="b-meta">Not shown to you: check-ins, reflections, concerns and any goal {view.firstName} did not share. This supports the existing review form; it does not replace it.</p>
          </section>
        </aside>
      </div>
    </section>
  );
}
