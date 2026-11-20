// Talks to n8n when VITE_N8N_INTAKE_URL is set, otherwise (or on any failure)
// returns a cached Ambition Card so the live demo never breaks.

import { destinations } from '../data/cohort.js';

const INTAKE_URL = import.meta.env.VITE_N8N_INTAKE_URL;
const TIMEOUT_MS = 8000;

const GOAL_DETAIL = {
  product: 'See how customer needs turn into product decisions.',
  ai: 'Get hands-on with how RBC builds and uses models.',
  leadership: 'Practise guiding a team and making decisions with others.',
};
const SKILLS = {
  'sharing-ideas': 'Share ideas in planning conversations',
  'technical-depth': 'Build technical depth',
  customers: 'Work closer to customers',
};
const CONCERNS = {
  'no-network': 'Not knowing anyone outside my team',
  'no-real-work': 'Not getting meaningful work',
};
const FEEDBACK = {
  often: 'Quick and often',
  'one-on-one': 'In my 1:1s',
  written: 'Written, so I can reflect',
};

export function inferDestination(text = '') {
  if (/\b(ai|ml|machine|data|model)/i.test(text)) return 'ai';
  if (/lead|manag|people|team/i.test(text)) return 'leadership';
  return 'product';
}

export function cachedAmbitionCard(answers) {
  const destinationId = destinations.some((d) => d.id === answers.explore) ? answers.explore : inferDestination(answers.explore);
  const destination = destinations.find((d) => d.id === destinationId);
  const share = answers.share !== 'private';
  return {
    goals: [
      {
        id: 'goal-explore',
        destinationId,
        title: `Explore ${destination.label.toLowerCase()}`,
        detail: GOAL_DETAIL[destinationId],
        shared: share,
      },
      {
        id: 'goal-skill',
        destinationId: null,
        title: SKILLS[answers.skill] ?? answers.skill ?? 'Share ideas in planning conversations',
        detail: 'A skill to practise this term.',
        shared: share,
      },
    ],
    concerns: answers.concern && answers.concern !== 'none' ? [CONCERNS[answers.concern] ?? answers.concern] : [],
    feedbackStyle: FEEDBACK[answers.feedback] ?? answers.feedback ?? 'Quick and often',
    shareFeedbackStyle: share,
    shareProgress: share,
  };
}

// Expected n8n response: { goals: [{ title, detail, destinationId }], concerns: [string], feedbackStyle: string }
function mergeLiveCard(live, fallback) {
  const goals = Array.isArray(live?.goals) && live.goals.length
    ? live.goals.map((g, i) => ({
        id: fallback.goals[i]?.id ?? `goal-${i}`,
        destinationId: destinations.some((d) => d.id === g.destinationId) ? g.destinationId : null,
        title: String(g.title ?? fallback.goals[i]?.title ?? 'A goal'),
        detail: String(g.detail ?? ''),
        shared: fallback.goals[0].shared,
      }))
    : fallback.goals;
  return {
    ...fallback,
    goals,
    concerns: Array.isArray(live?.concerns) ? live.concerns.map(String) : fallback.concerns,
    feedbackStyle: live?.feedbackStyle ? String(live.feedbackStyle) : fallback.feedbackStyle,
  };
}

export async function buildAmbitionCard(answers) {
  const fallback = cachedAmbitionCard(answers);
  if (!INTAKE_URL) return { card: fallback, source: 'cached' };
  try {
    const response = await fetch(INTAKE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`n8n responded ${response.status}`);
    return { card: mergeLiveCard(await response.json(), fallback), source: 'live' };
  } catch (error) {
    console.warn('Compass: n8n intake failed, using cached card.', error);
    return { card: fallback, source: 'cached' };
  }
}
