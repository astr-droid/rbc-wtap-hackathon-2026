// Simulated cohort for the Compass proof of concept. NOT real RBC data.
// Owner: Person C. Every layer reads from this file, so keep field names stable
// and tell the team before renaming anything.

export const COHORT_WEEK = 8;
export const DEMO_STUDENT_ID = 's-maya';
export const CITIES = ['Toronto', 'Montreal', 'Vancouver', 'Calgary'];

// Terrain: groups of teams drawn as regions on the chart (abstract, not geography).
// Coordinates are in the map's 760 x 400 viewBox.
export const regions = [
  { id: 'cloud', name: 'Cloud Platform', caption: 'infra · tooling', x: 150, y: 90, rx: 70, ry: 42 },
  { id: 'product-studio', name: 'Product Studio', caption: 'planning · discovery', x: 545, y: 100, rx: 85, ry: 50 },
  { id: 'digital-banking', name: 'Digital Banking', caption: 'apps · payments', x: 195, y: 270, rx: 80, ry: 50 },
  { id: 'risk', name: 'Risk Analytics', caption: 'controls · insight', x: 410, y: 300, rx: 60, ry: 36 },
  { id: 'ai-lab', name: 'AI & Data Lab', caption: 'models · analytics', x: 620, y: 285, rx: 80, ry: 50 },
];

// Destinations: the goals students can choose.
export const destinations = [
  { id: 'product', label: 'Product management', short: 'Product', regionId: 'product-studio', x: 545, y: 100 },
  { id: 'ai', label: 'AI and machine learning', short: 'AI & ML', regionId: 'ai-lab', x: 620, y: 285 },
  { id: 'leadership', label: 'Leading people', short: 'Leadership', regionId: null, x: 360, y: 58 },
];

// Org chart stand-in for Workday. `offers` = destinations a team can give real work toward.
// Three teams offer AI work.
export const teams = [
  { id: 't-payments', name: 'Payments Apps', regionId: 'digital-banking', offers: ['product'] },
  { id: 't-mobile', name: 'Mobile Banking', regionId: 'digital-banking', offers: [] },
  { id: 't-discovery', name: 'Product Discovery', regionId: 'product-studio', offers: ['product', 'leadership'] },
  { id: 't-design', name: 'Service Design', regionId: 'product-studio', offers: ['product'] },
  { id: 't-models', name: 'Model Development', regionId: 'ai-lab', offers: ['ai'] },
  { id: 't-insights', name: 'Data Insights', regionId: 'ai-lab', offers: ['ai'] },
  { id: 't-fraud', name: 'Fraud Analytics', regionId: 'risk', offers: ['ai'] },
  { id: 't-platform', name: 'Platform Engineering', regionId: 'cloud', offers: ['leadership'] },
];

// People. Volunteer mentors opted in and shared when they are free. Two cover AI.
export const people = [
  { id: 'p-priya', name: 'Priya Raman', role: 'Engineering manager, Payments Apps', kind: 'manager', teamId: 't-payments' },
  { id: 'p-sam', name: 'Sam Lee', role: 'Key person, Payments Apps', kind: 'key-person', teamId: 't-payments' },
  { id: 'p-nadia', name: 'Nadia Fraser', role: 'Program contact, Early Talent', kind: 'program-contact' },
  { id: 'p-jordan', name: 'Jordan Patel', role: 'Senior product manager', kind: 'mentor', teamId: 't-discovery', mentorFor: ['product'], availability: ['Tue 10:00', 'Thu 14:00', 'Fri 11:30'] },
  { id: 'p-elena', name: 'Elena Brooks', role: 'Product owner', kind: 'mentor', teamId: 't-design', mentorFor: ['product'], availability: ['Mon 13:00', 'Wed 15:30'] },
  { id: 'p-marcus', name: 'Marcus Webb', role: 'Product lead', kind: 'mentor', teamId: 't-discovery', mentorFor: ['product'], availability: ['Thu 09:30'] },
  { id: 'p-amara', name: 'Amara Okafor', role: 'Data scientist', kind: 'mentor', teamId: 't-models', mentorFor: ['ai'], availability: ['Wed 11:00', 'Fri 14:00'] },
  { id: 'p-luis', name: 'Luis Ortega', role: 'ML engineer', kind: 'mentor', teamId: 't-fraud', mentorFor: ['ai'], availability: ['Tue 15:00'] },
  { id: 'p-grace', name: 'Grace Liu', role: 'Engineering director', kind: 'mentor', teamId: 't-platform', mentorFor: ['leadership'], availability: ['Mon 10:00', 'Thu 16:00'] },
  { id: 'p-tom', name: 'Tom Bergeron', role: 'Team lead', kind: 'mentor', teamId: 't-mobile', mentorFor: ['leadership'], availability: ['Wed 09:00'] },
  { id: 'p-ines', name: 'Inès Moreau', role: 'Delivery manager', kind: 'mentor', teamId: 't-payments', mentorFor: ['leadership'], availability: ['Fri 10:00'] },
];

// Existing program sessions. One covers AI.
export const workshops = [
  { id: 'w-welcome', title: 'Welcome to tech', destinationId: null, week: 1 },
  { id: 'w-product', title: 'How product decisions get made', destinationId: 'product', week: 4 },
  { id: 'w-ai', title: 'Applied ML at RBC', destinationId: 'ai', week: 6 },
];

// The demo student. `card` is filled by the Ambition Card chat.
const maya = {
  id: 's-maya',
  name: 'Maya Chen',
  firstName: 'Maya',
  initials: 'MC',
  type: 'Co-op',
  city: 'Toronto',
  teamId: 't-payments',
  managerId: 'p-priya',
  keyPersonId: 'p-sam',
  programContactId: 'p-nadia',
  currentWeek: 3,
  card: null,
  // Voice: private to Maya. Week 1 already said "not yet", so a second "not yet" stalls the route.
  checkIns: [{ week: 1, goalId: 'goal-explore', answer: 'not-yet' }],
  wins: [{ week: 2, text: 'Shipped my first fix to the payments form', shared: true }],
  // Participation: set when the card is built (see suggestStops in lib/routes.js).
  stops: [],
  lastActiveWeek: 3,
  connectionsOutsideTeam: 1,
  followUp: null,
};

// The other 24. Planted patterns: 9 want AI (8 others want product, 7 leadership),
// 6 quiet for 4+ weeks,
// Vancouver has few connections outside their team, 3 follow-up requests.
const OTHERS = [
  // name, city, type, teamId, interests, lastActiveWeek, connectionsOutsideTeam
  ['Arjun Mehta', 'Toronto', 'Co-op', 't-mobile', ['ai'], 7, 3],
  ['Bea Laurent', 'Montreal', 'New grad', 't-payments', ['ai'], 4, 1],
  ['Chris Osei', 'Vancouver', 'Co-op', 't-platform', ['leadership'], 8, 0],
  ['Dana Kowalski', 'Calgary', 'Co-op', 't-fraud', ['ai'], 8, 2],
  ['Eli Haddad', 'Toronto', 'New grad', 't-discovery', ['product'], 7, 4],
  ['Farah Siddiqui', 'Vancouver', 'Co-op', 't-mobile', ['ai'], 3, 0],
  ['Gabe Tremblay', 'Montreal', 'Co-op', 't-design', ['product'], 8, 2],
  ['Hana Kim', 'Toronto', 'Co-op', 't-payments', ['ai'], 6, 1],
  ['Ivan Petrov', 'Calgary', 'New grad', 't-platform', ['leadership'], 7, 2],
  ['Jade Nguyen', 'Vancouver', 'Co-op', 't-insights', ['ai'], 4, 1],
  ['Kofi Mensah', 'Toronto', 'New grad', 't-models', ['product'], 8, 3],
  ['Lena Fischer', 'Montreal', 'Co-op', 't-mobile', ['product'], 6, 2],
  ['Marco Rossi', 'Calgary', 'Co-op', 't-payments', ['leadership'], 4, 1],
  ['Nora Ali', 'Vancouver', 'New grad', 't-platform', ['ai'], 7, 0],
  ['Omar Farouk', 'Toronto', 'Co-op', 't-discovery', ['product'], 8, 4],
  ['Pia Andersen', 'Montreal', 'Co-op', 't-insights', ['ai'], 7, 2],
  ['Quinn Taylor', 'Vancouver', 'Co-op', 't-design', ['product'], 3, 0],
  ['Rosa Martinez', 'Toronto', 'New grad', 't-fraud', ['leadership'], 8, 3],
  ['Sami Rahman', 'Calgary', 'Co-op', 't-mobile', ['leadership'], 6, 2],
  ['Tara Singh', 'Toronto', 'Co-op', 't-platform', ['ai'], 7, 1],
  ['Uma Desai', 'Montreal', 'New grad', 't-payments', ['product'], 8, 3],
  ['Victor Chen', 'Vancouver', 'Co-op', 't-mobile', ['leadership'], 4, 1],
  ['Wen Li', 'Calgary', 'Co-op', 't-design', ['product'], 7, 2],
  ['Yara Haddad', 'Toronto', 'New grad', 't-discovery', ['leadership'], 8, 3],
];

const FOLLOW_UPS = {
  'Farah Siddiqui': { status: 'open', identity: 'named', week: 7 },
  'Marco Rossi': { status: 'resolved', identity: 'anonymous', week: 5 },
  'Quinn Taylor': { status: 'open', identity: 'anonymous', week: 8 },
};

const slug = (name) => `s-${name.split(' ')[0].toLowerCase()}`;

export const students = [
  maya,
  ...OTHERS.map(([name, city, type, teamId, interests, lastActiveWeek, connectionsOutsideTeam]) => ({
    id: slug(name),
    name,
    firstName: name.split(' ')[0],
    type,
    city,
    teamId,
    interests,
    lastActiveWeek,
    connectionsOutsideTeam,
    followUp: FOLLOW_UPS[name] ?? null,
    card: null,
    checkIns: [],
    wins: [],
    stops: [],
  })),
];

// Ghosting is visible from both sides: three AI mentor requests have no reply.
export const mentorRequests = [
  { studentId: 's-arjun', mentorId: 'p-amara', week: 5, status: 'no-reply' },
  { studentId: 's-hana', mentorId: 'p-amara', week: 6, status: 'no-reply' },
  { studentId: 's-pia', mentorId: 'p-luis', week: 6, status: 'no-reply' },
  { studentId: 's-dana', mentorId: 'p-luis', week: 4, status: 'done' },
];

// Pre-generated manager suggestions, keyed by destination. `{name}` is replaced at render time.
export const projectSuggestions = {
  product: [
    { title: 'Invite {name} to listen in', detail: 'Include {name} in an upcoming feature-planning discussion. No prep or ownership needed.' },
    { title: 'Offer a small, bounded task', detail: 'Ask {name} to summarize one customer need or trade-off before a planning session.' },
  ],
  ai: [
    { title: 'Find one small AI task', detail: 'Ask {name} to evaluate an existing model output or label a sample dataset with the team.' },
    { title: 'Pair with a data colleague', detail: 'Set up a 30-minute walkthrough of how the team uses analytics today.' },
  ],
  leadership: [
    { title: 'Let {name} run a stand-up', detail: 'One stand-up a week is a low-risk way to practise facilitation.' },
    { title: 'Shadow a planning decision', detail: 'Bring {name} into one prioritization conversation and debrief afterwards.' },
  ],
  skill: [
    { title: 'Make space for a perspective', detail: 'In your next 1:1, ask what {name} noticed and what they would like to try next.' },
  ],
};

// Chronicle stories. The headline counts are computed live from the data (see CohortLayer).
export const chronicleStories = [
  {
    id: 'ai-gap',
    destinationId: 'ai',
    regionId: 'ai-lab',
    title: 'High interest, limited opportunity',
    summary: 'Several students say their day-to-day work leaves no room to explore AI.',
    counterStory: 'Two students found a way in by pairing with Fraud Analytics on a small model review.',
    action: 'Recruit AI mentors and ask managers to find small AI tasks inside existing roles.',
    followThrough: 'Next: check whether more AI routes are moving by week 12.',
    actions: [
      { id: 'recruit-mentors', label: 'Recruit 3 AI mentors' },
      { id: 'run-workshop', label: 'Add an AI workshop' },
    ],
  },
  { id: 'week-3-dip', title: 'The week 3 confidence dip', summary: 'Check-in confidence drops around week 3, then recovers for students with a booked coffee chat.' },
  { id: 'vancouver-gap', title: 'The Vancouver connection gap', summary: 'Vancouver students have fewer connections outside their own team.' },
  { id: 'midterm-disconnect', title: 'The midterm disconnect', summary: 'Students and managers expect different things from midterm feedback.' },
];
