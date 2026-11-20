// The privacy rules from the brief, in one place. Every non-student view goes through here.
//
//                      Student      Manager                   Program team
// Voice (check-ins,    own, full    nothing                   anonymous patterns only
//   reflections,
//   concerns)
// Participation        own, full    only stops student shares by name, for outreach
// Goals                own          approved goals only       pooled and anonymous

import { CITIES, COHORT_WEEK, destinations, people, teams, workshops } from '../data/cohort.js';
import { byId, studentInterests } from './routes.js';

export const MIN_GROUP_SIZE = 5;
export const QUIET_WEEKS = 4;

export const suppress = (count) => (count < MIN_GROUP_SIZE ? null : count);

export function managerView(student) {
  const { card } = student;
  if (!card) return null;
  return {
    id: student.id,
    name: student.name,
    firstName: student.firstName,
    type: student.type,
    team: byId(teams, student.teamId)?.name,
    goals: card.goals.filter((g) => g.shared).map(({ id, title, detail, destinationId }) => ({ id, title, detail, destinationId })),
    feedbackStyle: card.shareFeedbackStyle ? card.feedbackStyle : null,
    stops: card.shareProgress ? student.stops.map(({ id, title, kind, state }) => ({ id, title, kind, state })) : [],
    wins: student.wins.filter((w) => w.shared).map(({ week, text }) => ({ week, text })),
  };
}

// Pooled, anonymous demand compared with supply. Demand under 5 is hidden.
export function demandAndSupply(students) {
  return destinations.map((destination) => {
    const demand = students.filter((s) => studentInterests(s).includes(destination.id)).length;
    const mentors = people.filter((p) => p.kind === 'mentor' && p.mentorFor?.includes(destination.id)).length;
    const sessions = workshops.filter((w) => w.destinationId === destination.id).length;
    const offeringTeams = teams.filter((t) => t.offers.includes(destination.id)).length;
    return {
      destination,
      demand: suppress(demand),
      mentors,
      workshops: sessions,
      teams: offeringTeams,
      gap: demand < MIN_GROUP_SIZE ? 0 : demand / Math.max(1, mentors + sessions),
    };
  });
}

// Demand split by a field such as city or type. Each group under 5 is hidden.
export function demandByGroup(students, destinationId, field, groups) {
  return groups.map((group) => ({
    group,
    count: suppress(students.filter((s) => s[field] === group && studentInterests(s).includes(destinationId)).length),
  }));
}

export const GROUPINGS = [
  { field: 'type', label: 'By program', groups: ['Co-op', 'New grad'] },
  { field: 'city', label: 'By city', groups: CITIES },
];

// Participation only, by name. Never includes anything the student wrote.
// The demo student runs on their own timeline (currentWeek), so measure quiet time from that.
export function quietQueue(students, week = COHORT_WEEK) {
  const weeksQuiet = (s) => (s.currentWeek ?? week) - s.lastActiveWeek;
  return students
    .filter((s) => weeksQuiet(s) >= QUIET_WEEKS)
    .map((s) => ({ id: s.id, name: s.name, city: s.city, type: s.type, weeksQuiet: weeksQuiet(s) }))
    .sort((a, b) => b.weeksQuiet - a.weeksQuiet);
}

export function followUpQueue(students) {
  return students
    .filter((s) => s.followUp)
    .map((s) => ({
      id: s.id,
      label: s.followUp.identity === 'named' ? s.name : 'Anonymous student',
      status: s.followUp.status,
      week: s.followUp.week,
    }));
}

export function unansweredMentorRequests(requests) {
  const byMentor = {};
  requests.filter((r) => r.status === 'no-reply').forEach((r) => {
    byMentor[r.mentorId] = (byMentor[r.mentorId] ?? 0) + 1;
  });
  return Object.entries(byMentor).map(([mentorId, count]) => ({ mentor: byId(people, mentorId), count }));
}
