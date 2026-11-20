import { people, regions, teams, workshops } from '../data/cohort.js';

export const byId = (list, id) => list.find((item) => item.id === id);

export function teamRegion(teamId) {
  return byId(regions, byId(teams, teamId)?.regionId);
}

export const STOP_STATE_LABEL = {
  open: 'Open',
  booked: 'Booked',
  done: 'Done',
  'waiting-on-you': 'Waiting on you',
  'waiting-on-mentor': 'Waiting on mentor',
};

// Builds the starting stops for a new route: the welcome workshop, a volunteer mentor
// who has replied and is waiting on the student, and a workshop on that route.
export function suggestStops(destinationId) {
  const stops = [{ id: 'stop-w-welcome', kind: 'workshop', refId: 'w-welcome', title: 'Welcome to tech', state: 'done' }];
  const mentor = people.find((p) => p.kind === 'mentor' && p.mentorFor?.includes(destinationId));
  if (mentor) {
    stops.push({ id: `stop-${mentor.id}`, kind: 'coffee', refId: mentor.id, title: `Coffee chat with ${mentor.name}`, state: 'waiting-on-you' });
  }
  const workshop = workshops.find((w) => w.destinationId === destinationId);
  if (workshop) {
    stops.push({ id: `stop-${workshop.id}`, kind: 'workshop', refId: workshop.id, title: workshop.title, state: 'open' });
  }
  return stops.map((stop) => ({ ...stop, destinationId }));
}

// A gentle quadratic curve between two points, so routes read like sea lanes.
export function curve(from, to, bend = 0.22) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const c = { x: mx - (to.y - from.y) * bend, y: my + (to.x - from.x) * bend };
  return { from, to, c, d: `M${from.x} ${from.y} Q${c.x} ${c.y} ${to.x} ${to.y}` };
}

export function pointOn({ from, c, to }, t) {
  const u = 1 - t;
  return {
    x: u * u * from.x + 2 * u * t * c.x + t * t * to.x,
    y: u * u * from.y + 2 * u * t * c.y + t * t * to.y,
  };
}

// Places n stops evenly along the route, leaving room at both ends.
export function stopPositions(route, n) {
  return Array.from({ length: n }, (_, i) => pointOn(route, 0.22 + (0.48 * i) / Math.max(1, n - 1)));
}

// A route is stalled when the last two check-ins on that goal both said "not yet".
export function isStalled(student, goalId) {
  const recent = student.checkIns.filter((c) => c.goalId === goalId).slice(-2);
  return recent.length === 2 && recent.every((c) => c.answer === 'not-yet');
}

export function studentInterests(student) {
  if (student.card) {
    return [...new Set(student.card.goals.map((g) => g.destinationId).filter(Boolean))];
  }
  return student.interests ?? [];
}
