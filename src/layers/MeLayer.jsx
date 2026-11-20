// Zoom: Me. Owner: Person B.
// The student's own map: Ambition Card chat, routes and stops, check-ins and follow-up.

import { useCallback, useState } from 'react';
import ChartMap from '../components/ChartMap.jsx';
import Modal, { ModalHeader } from '../components/Modal.jsx';
import SlackChat from '../components/SlackChat.jsx';
import { destinations, people, regions, workshops } from '../data/cohort.js';
import { checkInScript, intakeScript } from '../data/scripts.js';
import { buildAmbitionCard } from '../lib/compassApi.js';
import { STOP_STATE_LABEL, byId, curve, isStalled, stopPositions, suggestStops, teamRegion } from '../lib/routes.js';
import './student-manager.css';

const STOP_TONE = { done: 'mint', booked: 'ring', 'waiting-on-you': 'gold', open: 'dim', 'waiting-on-mentor': 'dim' };
const DEMO_ANSWERS = { explore: 'product', skill: 'sharing-ideas', concern: 'no-network', feedback: 'often', share: 'shared' };
const CLOSE_DELAY_MS = 1100;

const firstName = (name) => name.split(' ')[0];

function stopLabel(stop) {
  if (stop.kind === 'coffee') return `Coffee · ${firstName(byId(people, stop.refId)?.name ?? '')}`;
  return stop.refId === 'w-welcome' ? 'Welcome' : 'Workshop';
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="b-toggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

export default function MeLayer({ student, updateStudent, notify }) {
  const [modal, setModal] = useState(null);
  const [script, setScript] = useState([]);
  const [slot, setSlot] = useState(null);

  const keyPerson = byId(people, student.keyPersonId);
  const manager = byId(people, student.managerId);
  const contact = byId(people, student.programContactId);
  const me = { name: student.name, initials: student.initials };
  const close = useCallback(() => setModal(null), []);

  const { card } = student;
  const primaryGoal = card?.goals.find((g) => g.destinationId);
  const waitingCoffee = student.stops.find((s) => s.kind === 'coffee' && s.state === 'waiting-on-you');
  const stalled = primaryGoal ? isStalled(student, primaryGoal.id) : false;
  const done = student.stops.filter((s) => s.state === 'done').length;
  const waiting = student.stops.filter((s) => s.state === 'waiting-on-you').length;
  const checkedIn = student.checkedInWeek === student.currentWeek;

  const applyCard = useCallback(async (answers) => {
    const { card: newCard, source } = await buildAmbitionCard(answers);
    const goal = newCard.goals.find((g) => g.destinationId);
    updateStudent((s) => ({ ...s, card: newCard, stops: suggestStops(goal.destinationId) }));
    notify(source === 'live' ? 'Ambition Card ready, built live by n8n.' : 'Ambition Card ready.');
  }, [updateStudent, notify]);

  const openIntake = () => {
    setScript(intakeScript({ student, keyPerson, manager }));
    setModal('intake');
  };

  const onIntakeComplete = useCallback((answers) => {
    window.setTimeout(async () => {
      await applyCard(answers);
      setModal(null);
    }, CLOSE_DELAY_MS);
  }, [applyCard]);

  const openCheckIn = () => {
    setScript(checkInScript({ goal: primaryGoal, mentor: waitingCoffee ? byId(people, waitingCoffee.refId) : null }));
    setModal('checkin');
  };

  const onCheckInComplete = useCallback((values) => {
    updateStudent((s) => ({
      ...s,
      checkIns: [...s.checkIns, { week: s.currentWeek, goalId: primaryGoal.id, answer: values.progress }],
      wins: values.win === 'log' ? [...s.wins, { week: s.currentWeek, text: `Progress on: ${primaryGoal.title}`, shared: false }] : s.wins,
      lastActiveWeek: s.currentWeek,
      checkedInWeek: s.currentWeek,
    }));
    window.setTimeout(() => {
      if (values.next === 'book' && waitingCoffee) {
        setSlot(null);
        setModal({ stopId: waitingCoffee.id });
      } else {
        setModal(null);
      }
    }, CLOSE_DELAY_MS);
  }, [updateStudent, primaryGoal, waitingCoffee]);

  const setStop = (stopId, changes) => updateStudent((s) => ({
    ...s,
    lastActiveWeek: s.currentWeek,
    stops: s.stops.map((stop) => (stop.id === stopId ? { ...stop, ...changes } : stop)),
  }));

  const setGoalShared = (goalId, shared) => updateStudent((s) => ({
    ...s,
    card: { ...s.card, goals: s.card.goals.map((g) => (g.id === goalId ? { ...g, shared } : g)) },
  }));

  const requestFollowUp = (identity) => {
    updateStudent((s) => ({ ...s, followUp: { status: 'open', identity, week: s.currentWeek } }));
    setModal(null);
    notify(identity === 'named' ? `${firstName(contact.name)} will reach out to you directly.` : `Sent anonymously to ${firstName(contact.name)}'s queue.`);
  };

  const activeStop = modal?.stopId ? student.stops.find((s) => s.id === modal.stopId) : null;
  const activeMentor = activeStop?.kind === 'coffee' ? byId(people, activeStop.refId) : null;
  const activeWorkshop = activeStop?.kind === 'workshop' ? byId(workshops, activeStop.refId) : null;

  const chatModal = (
    <Modal open={modal === 'intake' || modal === 'checkin'} onClose={close} labelledBy="chat-title" className="modal-chat">
      <SlackChat
        key={modal}
        titleId="chat-title"
        title="Compass"
        subtitle={modal === 'intake' ? `Direct message · ${keyPerson.name} added Compass` : 'Direct message · only you can see this'}
        me={me}
        script={script}
        onComplete={modal === 'intake' ? onIntakeComplete : onCheckInComplete}
        onClose={close}
      />
    </Modal>
  );

  if (!card) {
    return (
      <section className="layer" aria-labelledby="me-heading">
        <div className="intro">
          <div className="eyebrow">Your map · Week 1</div>
          <h1 id="me-heading">Every career starts with a conversation.</h1>
          <p>Your key person has invited you to a 3-minute chat. It turns what you want into your Ambition Card and your first route.</p>
        </div>
        <div className="b-panel b-empty">
          <section>
            <p className="b-quote"><strong>{keyPerson.name}:</strong> Hi {student.firstName}, welcome to RBC! Here is a 3-minute chat so we can plan your term around what you want.</p>
            <div className="b-actions">
              <button className="primary-button" type="button" onClick={openIntake}>Open the 3-minute chat</button>
              <button className="text-button" type="button" onClick={() => applyCard(DEMO_ANSWERS)}>Skip: load demo card</button>
            </div>
          </section>
        </div>
        {chatModal}
      </section>
    );
  }

  const home = teamRegion(student.teamId);
  const destination = byId(destinations, primaryGoal.destinationId);
  const route = curve(home, destination);
  const positions = stopPositions(route, student.stops.length);
  const peoplePins = [
    { person: manager, x: home.x - 110, y: home.y - 62, role: 'manager' },
    { person: keyPerson, x: home.x - 118, y: home.y + 48, role: 'key person' },
    { person: contact, x: home.x + 70, y: home.y - 112, role: 'program contact' },
  ];

  const pins = [
    { id: 'you', x: home.x, y: home.y, label: 'You are here', size: 'lg' },
    { id: 'destination', x: destination.x, y: destination.y, icon: 'star', label: destination.short, sublabel: 'your destination', labelPosition: 'above' },
    ...student.stops.map((stop, i) => ({
      id: stop.id,
      ...positions[i],
      tone: STOP_TONE[stop.state],
      label: stopLabel(stop),
      sublabel: STOP_STATE_LABEL[stop.state],
      ariaLabel: `${stop.title}, ${STOP_STATE_LABEL[stop.state]}`,
      onClick: () => { setSlot(null); setModal({ stopId: stop.id }); },
    })),
    ...peoplePins.map(({ person, x, y, role }) => ({ id: person.id, x, y, size: 'sm', tone: 'blue', label: firstName(person.name), sublabel: role })),
  ];
  const links = peoplePins.map(({ person, x, y }) => ({ id: person.id, from: home, to: { x, y } }));

  return (
    <section className="layer" aria-labelledby="me-heading">
      <div className="intro">
        <div className="eyebrow">Your map · Week {student.currentWeek}</div>
        <h1 id="me-heading">Your term, charted.</h1>
        <p>Small steps toward the work you want to explore.</p>
      </div>

      <div className="layer-grid">
        <section className="card map-card" aria-label="Your career map">
          <div className="map-heading">
            <div>
              <h2>A route into {destination.short.toLowerCase()}</h2>
              <p>{done} of {student.stops.length} stops done{waiting ? ` · ${waiting} waiting on you` : ''}</p>
            </div>
            <span className="map-stamp">{student.city} · simulated</span>
          </div>
          {stalled && (
            <div className="b-alert" role="note">
              <span>This route hasn't moved in two check-ins. Only you can see this.</span>
              {waitingCoffee && <button className="text-button" type="button" onClick={() => setModal({ stopId: waitingCoffee.id })}>Book the coffee chat</button>}
              {!student.followUp && <button className="text-button" type="button" onClick={() => setModal('follow-up')}>Ask {firstName(contact.name)} for help</button>}
            </div>
          )}
          <div className="map-wrap">
            <ChartMap
              title={`${student.firstName}'s route toward ${destination.label}`}
              description="Your team, your goal, the stops along the way and the people connected to you."
              regions={regions}
              routes={[{ id: 'primary', d: route.d, stalled }]}
              pins={pins}
              links={links}
            />
          </div>
          <div className="map-footer">
            <div className="legend">
              <span className="legend-item"><span className="legend-dot" />Done</span>
              <span className="legend-item"><span className="legend-dot ring" />Booked</span>
              <span className="legend-item"><span className="legend-dot gold" />Waiting on you</span>
              <span className="legend-item"><span className="legend-dot dim" />Open</span>
              <span className="legend-item"><span className="legend-dot blue" />Your people</span>
            </div>
            <span className="map-hint">Select a stop to open it</span>
          </div>
        </section>

        <aside className="b-panel" aria-label="Your Ambition Card, stops and check-in">
          <section>
            <div className="b-section-head">
              <h3>Ambition Card</h3>
              <button className="text-button" type="button" onClick={openIntake}>Redo chat</button>
            </div>
            <ul className="b-list">
              {card.goals.map((goal) => (
                <li key={goal.id}>
                  <strong>{goal.title}</strong>
                  <span>{goal.detail}</span>
                  <Toggle checked={goal.shared} onChange={(value) => setGoalShared(goal.id, value)} label={`${firstName(manager.name)} can see this`} />
                </li>
              ))}
            </ul>
            <p className="b-meta">Feedback style: {card.feedbackStyle}</p>
            {card.concerns.length > 0 && <p className="b-meta">Private note (only you): {card.concerns.join(', ')}</p>}
            <Toggle
              checked={card.shareProgress}
              onChange={(value) => updateStudent((s) => ({ ...s, card: { ...s.card, shareProgress: value } }))}
              label={`Share route progress with ${firstName(manager.name)}`}
            />
          </section>

          <section>
            <h3>Stops</h3>
            <ul className="b-list">
              {student.stops.map((stop) => (
                <li key={stop.id}>
                  <button type="button" className="b-row" onClick={() => { setSlot(null); setModal({ stopId: stop.id }); }}>
                    <span>{stop.title}{stop.slot ? ` · ${stop.slot}` : ''}</span>
                    <span className={`b-state ${stop.state}`}>{STOP_STATE_LABEL[stop.state]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Check-in</h3>
            {checkedIn ? (
              <p className="b-meta">Checked in for week {student.currentWeek}. Next one in two weeks.</p>
            ) : (
              <div className="b-actions">
                <span className="b-meta">Week {student.currentWeek} · 10 seconds</span>
                <button className="primary-button" type="button" onClick={openCheckIn}>Open check-in</button>
              </div>
            )}
          </section>

          <section>
            <h3>Help</h3>
            {student.followUp ? (
              <p className="b-meta">Follow-up requested. {student.followUp.identity === 'named' ? `${firstName(contact.name)} will reach out to you.` : 'Sent anonymously.'}</p>
            ) : (
              <div className="b-actions">
                <span className="b-meta">{contact.name}, program contact</span>
                <button className="text-button" type="button" onClick={() => setModal('follow-up')}>Ask for help</button>
              </div>
            )}
          </section>
        </aside>
      </div>

      {chatModal}

      <Modal open={Boolean(activeStop)} onClose={close} labelledBy="stop-title">
        {activeStop && (
          <>
            <ModalHeader id="stop-title" title={activeMentor ? 'A coffee chat along your route' : 'A workshop along your route'} onClose={close} />
            <div className="modal-body">
              {activeMentor ? (
                <>
                  <p className="b-label">Outlook · mock invite</p>
                  <h3 className="b-title">15 minutes with {activeMentor.name}</h3>
                  <p className="b-meta">{activeMentor.role}. Volunteer mentor for {destination.label.toLowerCase()}.</p>
                  {activeStop.state === 'waiting-on-you' ? (
                    <>
                      <p className="b-meta">{firstName(activeMentor.name)} replied with times. Pick one:</p>
                      <div className="b-options">
                        {activeMentor.availability.map((time) => (
                          <button key={time} type="button" className="secondary-button" aria-pressed={slot === time} onClick={() => setSlot(time)}>{time}</button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="b-meta">{activeStop.slot ?? 'Time agreed'} · Webex: webex.example.com/compass-demo (mock)</p>
                  )}
                </>
              ) : (
                <>
                  <p className="b-label">Program workshop</p>
                  <h3 className="b-title">{activeStop.title}</h3>
                  <p className="b-meta">Week {activeWorkshop?.week} · run by the early talent program team.</p>
                </>
              )}
              <div className="modal-footer">
                <button className="secondary-button" type="button" onClick={close}>Close</button>
                {activeStop.state === 'waiting-on-you' && (
                  <button className="primary-button" type="button" disabled={!slot} onClick={() => { setStop(activeStop.id, { state: 'booked', slot }); close(); notify('Invite sent (mock). It will appear in both Outlook calendars with a Webex link.'); }}>
                    Send invite
                  </button>
                )}
                {activeStop.state === 'open' && (
                  <button className="primary-button" type="button" onClick={() => { setStop(activeStop.id, { state: 'booked' }); close(); notify('Seat saved.'); }}>Save my seat</button>
                )}
                {activeStop.state === 'booked' && (
                  <button className="primary-button" type="button" onClick={() => { setStop(activeStop.id, { state: 'done' }); close(); notify('Stop done. Your route moved forward.'); }}>Mark as done</button>
                )}
              </div>
            </div>
          </>
        )}
      </Modal>

      <Modal open={modal === 'follow-up'} onClose={close} labelledBy="follow-up-title">
        <ModalHeader id="follow-up-title" title="Ask for a follow-up" onClose={close} />
        <div className="modal-body">
          <p className="b-meta">{contact.name}, your program contact, will see this request. You choose whether she knows it is you.</p>
          <div className="b-options stacked">
            <button className="secondary-button" type="button" onClick={() => requestFollowUp('named')}>
              Share my name: {firstName(contact.name)} reaches out to you directly
            </button>
            <button className="secondary-button" type="button" onClick={() => requestFollowUp('anonymous')}>
              Stay anonymous: counts toward cohort patterns only
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
