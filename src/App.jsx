// Shell. Owner: Person A.
// Holds the shared cohort state and switches between the three zoom levels of the one map.

import { useCallback, useState } from 'react';
import Toast from './components/Toast.jsx';
import { DEMO_STUDENT_ID, people, students as initialStudents } from './data/cohort.js';
import CohortLayer from './layers/CohortLayer.jsx';
import MeLayer from './layers/MeLayer.jsx';
import TeamLayer from './layers/TeamLayer.jsx';
import { byId } from './lib/routes.js';

const initials = (name) => name.split(' ').map((part) => part[0]).join('');

export default function App() {
  const [layer, setLayer] = useState('me');
  const [students, setStudents] = useState(initialStudents);
  const [toast, setToast] = useState(null);

  const student = students.find((s) => s.id === DEMO_STUDENT_ID);
  const manager = byId(people, student.managerId);
  const contact = byId(people, student.programContactId);

  const notify = useCallback((message) => setToast({ message, at: Date.now() }), []);
  const clearToast = useCallback(() => setToast(null), []);
  const updateStudent = useCallback((updater) => {
    setStudents((list) => list.map((s) => (s.id === DEMO_STUDENT_ID ? updater(s) : s)));
  }, []);

  const layers = [
    { id: 'me', label: 'Me', viewer: student.name, note: 'Your private reflections stay yours.' },
    { id: 'team', label: 'My team', viewer: manager.name, note: `Only goals ${student.firstName} chose to share.` },
    { id: 'cohort', label: 'The cohort', viewer: contact.name, note: 'Pooled and anonymous. Groups under 5 hidden.' },
  ];
  const current = layers.find((l) => l.id === layer);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">✳</span>
          <span className="brand-name">Compass</span>
          <span className="brand-caption">career, in motion</span>
        </div>
        <div className="top-right">
          <span className="simulated">Simulated cohort</span>
          <span className="profile" aria-label={`Viewing as ${current.viewer}`}>
            <span className="avatar">{initials(current.viewer)}</span>
            <span className="profile-name">{current.viewer}</span>
          </span>
        </div>
      </header>

      <nav className="viewbar" aria-label="Map zoom level">
        <div className="view-tabs" role="tablist" aria-label="Choose a zoom level">
          {layers.map((l) => (
            <button key={l.id} className="tab" type="button" role="tab" aria-selected={layer === l.id} onClick={() => setLayer(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
        <div className="privacy-note"><span aria-hidden="true">●</span> One map, three zoom levels. {current.note}</div>
      </nav>

      <main key={layer} className="layer-enter">
        {layer === 'me' && <MeLayer student={student} updateStudent={updateStudent} notify={notify} />}
        {layer === 'team' && <TeamLayer student={student} notify={notify} />}
        {layer === 'cohort' && <CohortLayer students={students} notify={notify} />}
      </main>

      <footer className="footer-note">Compass proof of concept · simulated early talent data · not connected to RBC systems</footer>
      <Toast toast={toast} onDone={clearToast} />
    </div>
  );
}
