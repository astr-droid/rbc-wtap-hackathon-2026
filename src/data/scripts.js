// Conversation scripts for the faked Slack-style chat. Edit the copy here.
// A step with `choices` or `allowText` waits for an answer. `when` hides a step
// unless it returns true for the answers so far.

export const COMPASS = { name: 'Compass', initials: '✳', isApp: true };

export function intakeScript({ student, keyPerson, manager }) {
  const from = { name: keyPerson.name, initials: keyPerson.name.split(' ').map((n) => n[0]).join('') };
  return [
    {
      id: 'intro',
      from,
      text: `Hi ${student.firstName}, welcome to RBC! Here is a 3-minute chat so we can plan your term around what you want. Compass will take it from here.`,
    },
    {
      id: 'explore',
      from: COMPASS,
      text: `Hi ${student.firstName}. What would you most like to explore this term?`,
      choices: [
        { value: 'product', label: 'Product management' },
        { value: 'ai', label: 'AI and machine learning' },
        { value: 'leadership', label: 'Leading people' },
      ],
      allowText: true,
    },
    {
      id: 'skill',
      from: COMPASS,
      text: 'Nice. What is one skill you want to build?',
      choices: [
        { value: 'sharing-ideas', label: 'Sharing ideas in meetings' },
        { value: 'technical-depth', label: 'Technical depth' },
        { value: 'customers', label: 'Working with customers' },
      ],
      allowText: true,
    },
    {
      id: 'concern',
      from: COMPASS,
      text: 'Anything you are unsure about as you start? This stays private to you.',
      choices: [
        { value: 'no-network', label: 'Not knowing anyone outside my team' },
        { value: 'no-real-work', label: 'Not getting meaningful work' },
        { value: 'none', label: 'Nothing right now' },
      ],
      allowText: true,
    },
    {
      id: 'feedback',
      from: COMPASS,
      text: 'How do you like to get feedback?',
      choices: [
        { value: 'often', label: 'Quick and often' },
        { value: 'one-on-one', label: 'In my 1:1s' },
        { value: 'written', label: 'Written, so I can reflect' },
      ],
    },
    {
      id: 'share',
      from: COMPASS,
      text: `Can I share your goals with your manager, ${manager.name.split(' ')[0]}? Your private notes never go to them, and you can change this anytime.`,
      choices: [
        { value: 'shared', label: 'Share my goals' },
        { value: 'private', label: 'Keep them to me for now' },
      ],
    },
    {
      id: 'done',
      from: COMPASS,
      text: 'Thanks. Building your Ambition Card and your first route now…',
    },
  ];
}

export function checkInScript({ goal, mentor }) {
  return [
    {
      id: 'progress',
      from: COMPASS,
      text: `You wanted to ${goal.title.charAt(0).toLowerCase()}${goal.title.slice(1)}. Have you had a chance in the last two weeks?`,
      choices: [
        { value: 'yes', label: 'Yes, a little' },
        { value: 'not-yet', label: 'Not yet' },
        { value: 'changed', label: 'My goals changed' },
      ],
    },
    {
      id: 'next',
      from: COMPASS,
      when: (a) => a.progress === 'not-yet' && Boolean(mentor),
      text: mentor
        ? `Thanks for being honest. ${mentor.name}, a ${mentor.role.toLowerCase()}, replied to your coffee chat and is waiting on you. Want to book 15 minutes?`
        : '',
      choices: [
        { value: 'book', label: 'Book it' },
        { value: 'later', label: 'Maybe later' },
      ],
    },
    {
      id: 'win',
      from: COMPASS,
      when: (a) => a.progress === 'yes',
      text: 'Great. Want to log a win? Your manager only sees wins you choose to share.',
      choices: [
        { value: 'log', label: 'Log a win' },
        { value: 'skip', label: 'Not now' },
      ],
    },
    {
      id: 'changed-note',
      from: COMPASS,
      when: (a) => a.progress === 'changed',
      text: 'No problem. Goals move. You can redo your Ambition Card anytime from your map.',
    },
    {
      id: 'thanks',
      from: COMPASS,
      text: 'Got it. Only you can see this check-in.',
    },
  ];
}
