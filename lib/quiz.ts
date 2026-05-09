/**
 * Design Match Quiz logic — Phase 3
 *
 * Quiz determines the client's design personality across 5 questions.
 * Results map to one of 4 Ukiyo design profiles.
 * Replace QUESTIONS and scoring logic with real content in Phase 3.
 */

export type DesignProfile =
  | 'wabi-sabi'
  | 'refined-minimal'
  | 'warm-maximalist'
  | 'editorial-bold';

export interface QuizQuestion {
  id: string;
  question: string;
  options: { label: string; value: string; weight: Record<DesignProfile, number> }[];
}

export interface QuizResult {
  profile: DesignProfile;
  title: string;
  tagline: string;
  description: string;
  palette: string[];
  service: string;
}

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'When you walk into a room, what do you notice first?',
    options: [
      { label: 'The quality of natural light', value: 'a', weight: { 'wabi-sabi': 3, 'refined-minimal': 2, 'warm-maximalist': 0, 'editorial-bold': 1 } },
      { label: 'The colours and textures together', value: 'b', weight: { 'wabi-sabi': 1, 'refined-minimal': 0, 'warm-maximalist': 3, 'editorial-bold': 2 } },
      { label: 'How it\'s laid out and flows', value: 'c', weight: { 'wabi-sabi': 1, 'refined-minimal': 3, 'warm-maximalist': 1, 'editorial-bold': 1 } },
      { label: 'Whether it feels like nobody else has it', value: 'd', weight: { 'wabi-sabi': 0, 'refined-minimal': 1, 'warm-maximalist': 1, 'editorial-bold': 3 } },
    ],
  },
  {
    id: 'q2',
    question: 'Your ideal Saturday morning at home looks like:',
    options: [
      { label: 'Slow coffee, natural light, nothing to do', value: 'a', weight: { 'wabi-sabi': 3, 'refined-minimal': 2, 'warm-maximalist': 0, 'editorial-bold': 0 } },
      { label: 'Hosting brunch with people you love', value: 'b', weight: { 'wabi-sabi': 0, 'refined-minimal': 0, 'warm-maximalist': 3, 'editorial-bold': 1 } },
      { label: 'Everything in its place, everything working', value: 'c', weight: { 'wabi-sabi': 1, 'refined-minimal': 3, 'warm-maximalist': 0, 'editorial-bold': 1 } },
      { label: 'Showing someone the space for the first time', value: 'd', weight: { 'wabi-sabi': 0, 'refined-minimal': 0, 'warm-maximalist': 1, 'editorial-bold': 3 } },
    ],
  },
  {
    id: 'q3',
    question: 'Which word best describes your current home?',
    options: [
      { label: 'Cluttered', value: 'a', weight: { 'wabi-sabi': 1, 'refined-minimal': 2, 'warm-maximalist': 1, 'editorial-bold': 0 } },
      { label: 'Comfortable but boring', value: 'b', weight: { 'wabi-sabi': 0, 'refined-minimal': 0, 'warm-maximalist': 2, 'editorial-bold': 3 } },
      { label: 'Almost right', value: 'c', weight: { 'wabi-sabi': 2, 'refined-minimal': 2, 'warm-maximalist': 2, 'editorial-bold': 2 } },
      { label: 'Not me at all', value: 'd', weight: { 'wabi-sabi': 1, 'refined-minimal': 1, 'warm-maximalist': 1, 'editorial-bold': 3 } },
    ],
  },
  {
    id: 'q4',
    question: 'Pick a material palette:',
    options: [
      { label: 'Raw plaster, aged wood, unlacquered brass', value: 'a', weight: { 'wabi-sabi': 3, 'refined-minimal': 1, 'warm-maximalist': 1, 'editorial-bold': 0 } },
      { label: 'White marble, polished chrome, glass', value: 'b', weight: { 'wabi-sabi': 0, 'refined-minimal': 3, 'warm-maximalist': 0, 'editorial-bold': 1 } },
      { label: 'Velvet, handloom fabric, terracotta', value: 'c', weight: { 'wabi-sabi': 1, 'refined-minimal': 0, 'warm-maximalist': 3, 'editorial-bold': 1 } },
      { label: 'Dark stone, matte black, smoked glass', value: 'd', weight: { 'wabi-sabi': 0, 'refined-minimal': 1, 'warm-maximalist': 0, 'editorial-bold': 3 } },
    ],
  },
  {
    id: 'q5',
    question: 'A space is successful when:',
    options: [
      { label: 'It makes you exhale the moment you enter', value: 'a', weight: { 'wabi-sabi': 3, 'refined-minimal': 1, 'warm-maximalist': 1, 'editorial-bold': 0 } },
      { label: 'Everything works together perfectly', value: 'b', weight: { 'wabi-sabi': 0, 'refined-minimal': 3, 'warm-maximalist': 1, 'editorial-bold': 1 } },
      { label: 'People never want to leave it', value: 'c', weight: { 'wabi-sabi': 1, 'refined-minimal': 0, 'warm-maximalist': 3, 'editorial-bold': 1 } },
      { label: 'Nobody has ever seen anything like it', value: 'd', weight: { 'wabi-sabi': 0, 'refined-minimal': 1, 'warm-maximalist': 0, 'editorial-bold': 3 } },
    ],
  },
];

export const RESULTS: Record<DesignProfile, QuizResult> = {
  'wabi-sabi': {
    profile: 'wabi-sabi',
    title: 'The Wabi-Sabi Soul',
    tagline: 'You find beauty in imperfection.',
    description: 'Your ideal space breathes. Raw materials, soft light, and the quiet confidence of things that weren\'t trying too hard. You want a home that feels lived-in before anyone lives in it.',
    palette: ['#D4C5A9', '#8B7355', '#2C1810', '#C4A882'],
    service: 'residential-design',
  },
  'refined-minimal': {
    profile: 'refined-minimal',
    title: 'The Refined Minimalist',
    tagline: 'You want less — but better.',
    description: 'Every object earns its place in your world. You appreciate considered restraint, precision of detail, and the luxury of a room that doesn\'t shout. Quality over quantity, always.',
    palette: ['#F5F0E8', '#2C1810', '#B8860B', '#EDE8DF'],
    service: 'residential-design',
  },
  'warm-maximalist': {
    profile: 'warm-maximalist',
    title: 'The Warm Maximalist',
    tagline: 'More is more — when it\'s right.',
    description: 'You believe a home should be full of things that tell stories. Layered rugs, collected objects, rooms that feel like they\'ve been loved for decades. Warmth over minimalism, always.',
    palette: ['#C4834A', '#8B4513', '#D4A853', '#2C1810'],
    service: 'residential-design',
  },
  'editorial-bold': {
    profile: 'editorial-bold',
    title: 'The Editorial Bold',
    tagline: 'You want a space nobody forgets.',
    description: 'Safe is boring to you. You respond to spaces that take a stance — dark drama, unexpected material combinations, rooms that feel like they were designed by someone with a point of view.',
    palette: ['#1A1A1A', '#B8860B', '#2C2C2C', '#8B7355'],
    service: 'design-consultation',
  },
};

/**
 * Score a completed quiz and return the matching profile.
 * answers: Record<questionId, optionValue>
 */
export function scoreQuiz(answers: Record<string, string>): QuizResult {
  const scores: Record<DesignProfile, number> = {
    'wabi-sabi': 0,
    'refined-minimal': 0,
    'warm-maximalist': 0,
    'editorial-bold': 0,
  };

  QUESTIONS.forEach((q) => {
    const answer = answers[q.id];
    if (!answer) return;
    const option = q.options.find((o) => o.value === answer);
    if (!option) return;
    (Object.keys(scores) as DesignProfile[]).forEach((profile) => {
      scores[profile] += option.weight[profile];
    });
  });

  const winner = (Object.keys(scores) as DesignProfile[]).reduce((a, b) =>
    scores[a] >= scores[b] ? a : b
  );

  return RESULTS[winner];
}
