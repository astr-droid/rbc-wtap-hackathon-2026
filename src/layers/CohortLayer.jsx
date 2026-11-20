// Zoom: The cohort. Owner: Person C.
// Pooled, anonymous goals; Chronicle story with evidence drawer; named outreach based on participation only.

import { useState } from 'react';
import ChartMap from '../components/ChartMap.jsx';
import { COHORT_WEEK, chronicleStories, mentorRequests, regions } from '../data/cohort.js';
import {
  GROUPINGS,
  MIN_GROUP_SIZE,
  demandAndSupply,
  demandByGroup,
  followUpQueue,
  quietQueue,
  unansweredMentorRequests,
} from '../lib/privacy.js';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const showCount = (count) => count ?? `under ${MIN_GROUP_SIZE}`;
// Glow starts when demand is well above mentor and workshop supply (AI: 9 vs 3 is full glow).
const glowLevel = (gap) => Math.max(0, Math.min(1, (gap - 2.25) / 0.75));

export default function CohortLayer({ students, notify }) {
  const [panel, setPanel] = useState('story');
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [done, setDone] = useState({});

  const supply = demandAndSupply(students);
  const story = chronicleStories[0];
  const storyRow = supply.find((row) => row.destination.id === story.destinationId);
  const quiet = quietQueue(students);
  const followUps = followUpQueue(students);
  const ghosted = unansweredMentorRequests(mentorRequests);

  const glow = Object.fromEntries(
    supply.filter((row) => row.destination.regionId).map((row) => [row.destination.regionId, glowLevel(row.gap)]),
  );

  const pins = supply.map((row) => ({
    id: row.destination.id,
    x: row.destination.x,
    y: row.destination.y,
    icon: 'star',
    tone: glowLevel(row.gap) > 0.5 ? 'gold' : 'mint',
    label: `${showCount(row.demand)} want ${row.destination.short}`,
    sublabel: `${plural(row.mentors, 'mentor')} · ${plural(row.workshops, 'workshop')}`,
    labelPosition: 'above',
    onClick: row.destination.id === story.destinationId ? () => { setPanel('story'); setEvidenceOpen(true); } : undefined,
    ariaLabel: `${row.destination.label}: open the Chronicle story`,
  }));

  const act = (key, message) => {
    setDone((prev) => ({ ...prev, [key]: true }));
    notify(message);
  };

  return (
    <section className="layer" aria-labelledby="cohort-heading">
      <div className="intro">
        <div className="eyebrow">The cohort · Week {COHORT_WEEK} · {students.length} early talent</div>
        <h1 id="cohort-heading">Where the program needs to grow.</h1>
        <p>Everyone's goals, pooled and anonymous. Regions glow where many want to go and few ways in exist.</p>
      </div>

      <div className="layer-grid manager">
        <section className="card map-card" aria-label="Cohort map">
          <div className="map-heading">
            <div><h2>Demand and supply</h2><p>Goals are anonymous. Groups under {MIN_GROUP_SIZE} are hidden.</p></div>
            <span className="map-stamp">Simulated cohort</span>
          </div>
          <div className="map-wrap">
            <ChartMap
              title="Cohort demand and supply map"
              description="Each destination shows how many students want it and how many mentors and workshops cover it."
              regions={regions}
              pins={pins}
              glow={glow}
            />
          </div>
          <div className="map-footer">
            <div className="legend">
              <span className="legend-item"><span className="legend-dot gold" />Gap between demand and supply</span>
              <span className="legend-item"><span className="legend-dot" />Covered</span>
            </div>
            <span className="map-hint">Select a glowing destination to open its story</span>
          </div>
        </section>

        <section className="card brief-card" aria-label="Chronicle and outreach">
          <div className="segmented wide" role="tablist" aria-label="Program panel">
            <button type="button" role="tab" aria-selected={panel === 'story'} onClick={() => setPanel('story')}>Chronicle</button>
            <button type="button" role="tab" aria-selected={panel === 'outreach'} onClick={() => setPanel('outreach')}>
              Outreach <span className="count">{quiet.length + followUps.filter((f) => f.status === 'open').length}</span>
            </button>
          </div>

          {panel === 'story' ? (
            <div className="story">
              <div className="eyebrow">Chronicle · pinned to AI &amp; Data Lab</div>
              <h2 className="story-title">{story.title}</h2>
              <div className="stat-row">
                <div><strong>{showCount(storyRow.demand)}</strong>want AI</div>
                <div><strong>{storyRow.teams}</strong>teams offer it</div>
                <div><strong>{storyRow.mentors}</strong>mentors</div>
                <div><strong>{storyRow.workshops}</strong>workshop</div>
              </div>
              <p>{story.summary}</p>

              <button className="drawer-toggle" type="button" aria-expanded={evidenceOpen} onClick={() => setEvidenceOpen((open) => !open)}>
                {evidenceOpen ? 'Hide evidence' : 'Show evidence'} <span aria-hidden="true">{evidenceOpen ? '▴' : '▾'}</span>
              </button>
              {evidenceOpen && (
                <div className="evidence">
                  {GROUPINGS.map(({ field, label, groups }) => (
                    <div key={field}>
                      <h3>{label}</h3>
                      <ul className="evidence-list">
                        {demandByGroup(students, story.destinationId, field, groups).map(({ group, count }) => (
                          <li key={group}><span>{group}</span><span className={count === null ? 'hidden-count' : ''}>{count ?? 'hidden, under 5'}</span></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <h3>Mentor requests with no reply</h3>
                  <ul className="evidence-list">
                    {ghosted.map(({ mentor, count }) => <li key={mentor.id}><span>{mentor.name}</span><span>{count}</span></li>)}
                  </ul>
                  <h3>Counter-story</h3>
                  <p>{story.counterStory}</p>
                </div>
              )}

              <div className="suggested-change">
                <div className="eyebrow">Suggested change</div>
                <p>{story.action}</p>
                <div className="brief-actions">
                  {story.actions.map((a) => (
                    <button key={a.id} className="primary-button" type="button" disabled={done[a.id]} onClick={() => act(a.id, `${a.label}: drafted and queued (simulated).`)}>
                      {done[a.id] ? 'Queued ✓' : a.label}
                    </button>
                  ))}
                </div>
                <small>{story.followThrough}</small>
              </div>

              <h3>More stories</h3>
              <ul className="plain-list">
                {chronicleStories.slice(1).map((s) => <li key={s.id}><strong>{s.title}.</strong> {s.summary}</li>)}
              </ul>
            </div>
          ) : (
            <div className="outreach">
              <h3>Quiet for {plural(4, 'week')} or more</h3>
              <ul className="queue">
                {quiet.map((q) => (
                  <li key={q.id}>
                    <span><strong>{q.name}</strong><small>{q.type} · {q.city} · quiet {plural(q.weeksQuiet, 'week')}</small></span>
                    <button className="text-button" type="button" disabled={done[q.id]} onClick={() => act(q.id, `Supportive note sent to ${q.name.split(' ')[0]} (simulated).`)}>
                      {done[q.id] ? 'Sent ✓' : 'Send a note'}
                    </button>
                  </li>
                ))}
              </ul>

              <h3>Asked for follow-up</h3>
              <ul className="queue">
                {followUps.map((f) => (
                  <li key={f.id}>
                    <span><strong>{f.label}</strong><small>Week {f.week}</small></span>
                    <span className={`chip state-${f.status === 'open' ? 'waiting-on-you' : 'done'}`}>{f.status === 'open' ? 'Open' : 'Resolved'}</span>
                  </li>
                ))}
              </ul>

              <div className="boundary">
                <strong>Participation, not voice</strong>
                Names appear only for what people did (check-ins answered, stops booked) or when they asked for help. Nothing anyone wrote privately is shown.
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
