export type LessonKind =
  | "baseline"
  | "concept"
  | "drill"
  | "checkpoint"
  | "palace"
  | "people"
  | "numbers"
  | "mission";

export type CourseLesson = {
  id: string;
  title: string;
  summary: string;
  kind: LessonKind;
  minutes: number;
  xp: number;
};

export type CourseUnit = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  color: string;
  lessons: CourseLesson[];
};

export type TeachingPage =
  | {
      type: "teach";
      eyebrow: string;
      title: string;
      body: string;
      example: string;
    }
  | {
      type: "question";
      question: string;
      choices: string[];
      correctIndex: number;
      explanation: string;
    };

export const COURSE_UNITS: CourseUnit[] = [
  {
    id: "foundations",
    number: 1,
    title: "Notice & Connect",
    subtitle: "Build the attention and imagery skills every memory system uses.",
    color: "#66f0c2",
    lessons: [
      { id: "foundation-baseline", title: "Your starting point", summary: "Understand active memory and record a simple baseline.", kind: "baseline", minutes: 4, xp: 10 },
      { id: "foundation-attention", title: "Attention is an action", summary: "Replace passive looking with deliberate feature scanning.", kind: "concept", minutes: 5, xp: 10 },
      { id: "foundation-association", title: "Connect two ideas", summary: "Fuse unrelated objects into one retrievable scene.", kind: "drill", minutes: 5, xp: 15 },
      { id: "foundation-motion", title: "Make it move", summary: "Use impact, transformation, and exaggeration instead of static images.", kind: "concept", minutes: 5, xp: 10 },
      { id: "foundation-senses", title: "Use every sense", summary: "Add sound, touch, smell, and emotion to visual scenes.", kind: "drill", minutes: 6, xp: 15 },
      { id: "foundation-story", title: "Build a story chain", summary: "Link a short sequence without losing its order.", kind: "drill", minutes: 7, xp: 15 },
      { id: "foundation-checkpoint", title: "Foundation checkpoint", summary: "Prove you can choose and apply the right encoding move.", kind: "checkpoint", minutes: 6, xp: 25 },
    ],
  },
  {
    id: "palaces",
    number: 2,
    title: "Build Your First Palace",
    subtitle: "Turn familiar places into reliable ordered memory infrastructure.",
    color: "#76a6ff",
    lessons: [
      { id: "palace-why-space", title: "Why places stick", summary: "Learn why spatial routes outperform unanchored lists.", kind: "concept", minutes: 5, xp: 10 },
      { id: "palace-choose-route", title: "Choose a familiar route", summary: "Select a place you can walk mentally without effort.", kind: "palace", minutes: 8, xp: 15 },
      { id: "palace-clean-loci", title: "Pick clean loci", summary: "Choose permanent, distinctive stops that cannot be confused.", kind: "palace", minutes: 10, xp: 15 },
      { id: "palace-forward", title: "Walk it forward", summary: "Stabilize the route in one direction before adding information.", kind: "drill", minutes: 8, xp: 15 },
      { id: "palace-backward", title: "Walk it backward", summary: "Test whether each locus has a stable independent position.", kind: "drill", minutes: 8, xp: 15 },
      { id: "palace-place-ten", title: "Place your first ten", summary: "Attach vivid objects to ten ordered locations.", kind: "palace", minutes: 12, xp: 20 },
      { id: "palace-checkpoint", title: "Palace checkpoint", summary: "Recall ten items forward, backward, and by position.", kind: "checkpoint", minutes: 10, xp: 30 },
    ],
  },
  {
    id: "sequences",
    number: 3,
    title: "Lists & Sequences",
    subtitle: "Choose between stories, pegs, and journeys for ordered information.",
    color: "#c295ff",
    lessons: [
      { id: "sequence-link-method", title: "The link method", summary: "Connect each item causally to the next.", kind: "concept", minutes: 6, xp: 10 },
      { id: "sequence-shopping", title: "Shopping-list sprint", summary: "Encode a practical ten-item list as a moving story.", kind: "drill", minutes: 8, xp: 15 },
      { id: "sequence-pegs", title: "Quick number pegs", summary: "Use rhyme and shape anchors for short indexed lists.", kind: "concept", minutes: 8, xp: 15 },
      { id: "sequence-journey", title: "Lists on a journey", summary: "Move longer lists onto stable palace loci.", kind: "palace", minutes: 10, xp: 20 },
      { id: "sequence-random-access", title: "Recall by position", summary: "Jump to an item without replaying the whole chain.", kind: "drill", minutes: 8, xp: 20 },
      { id: "sequence-checkpoint", title: "Twenty-word challenge", summary: "Select a method and retrieve a complete ordered list.", kind: "checkpoint", minutes: 12, xp: 35 },
    ],
  },
  {
    id: "people",
    number: 4,
    title: "People & Names",
    subtitle: "Make a face become its own cue for a name and personal detail.",
    color: "#f6b85f",
    lessons: [
      { id: "people-feature", title: "Spot the standout feature", summary: "Find the facial detail that will act as the anchor.", kind: "people", minutes: 6, xp: 15 },
      { id: "people-name-image", title: "Turn names into images", summary: "Translate sounds and meanings into concrete objects.", kind: "people", minutes: 8, xp: 15 },
      { id: "people-anchor", title: "Attach image to face", summary: "Make the name-image physically affect the chosen feature.", kind: "drill", minutes: 8, xp: 20 },
      { id: "people-detail", title: "Add one personal detail", summary: "Extend the same scene to occupation or interest.", kind: "people", minutes: 8, xp: 20 },
      { id: "people-delay", title: "Remember tomorrow", summary: "Use delayed recall instead of immediate familiarity.", kind: "drill", minutes: 6, xp: 20 },
      { id: "people-checkpoint", title: "Ten-person checkpoint", summary: "Retrieve names and details from unfamiliar faces.", kind: "checkpoint", minutes: 15, xp: 40 },
    ],
  },
  {
    id: "knowledge",
    number: 5,
    title: "Words & Knowledge",
    subtitle: "Compress vocabulary, chapters, and abstract ideas into usable cues.",
    color: "#ff8f9f",
    lessons: [
      { id: "knowledge-phonetic", title: "Build a phonetic bridge", summary: "Turn unfamiliar sounds into familiar concrete images.", kind: "concept", minutes: 7, xp: 15 },
      { id: "knowledge-abstract", title: "Make abstractions tangible", summary: "Create physical symbols for ideas you cannot picture directly.", kind: "drill", minutes: 8, xp: 20 },
      { id: "knowledge-keywords", title: "Distill trigger words", summary: "Reduce a dense passage to a small set of recall cues.", kind: "concept", minutes: 10, xp: 20 },
      { id: "knowledge-mind-map", title: "Branch a mind map", summary: "Organize concepts by relationship before memorizing them.", kind: "drill", minutes: 12, xp: 20 },
      { id: "knowledge-study-palace", title: "Build a study route", summary: "Place five concepts along a dedicated technical palace.", kind: "palace", minutes: 15, xp: 25 },
      { id: "knowledge-checkpoint", title: "Teach it back", summary: "Reconstruct a short lesson from cues without notes.", kind: "checkpoint", minutes: 15, xp: 40 },
    ],
  },
  {
    id: "numbers",
    number: 6,
    title: "Numbers & DOMINIC",
    subtitle: "Translate abstract digits into people, actions, and memorable scenes.",
    color: "#65d6ff",
    lessons: [
      { id: "numbers-code", title: "Meet the digit code", summary: "Learn the letter mapping behind two-digit identities.", kind: "numbers", minutes: 8, xp: 15 },
      { id: "numbers-first-cast", title: "Create 00–19", summary: "Build your first twenty distinct people.", kind: "numbers", minutes: 15, xp: 25 },
      { id: "numbers-actions", title: "Give everyone an action", summary: "Assign one unmistakable movement and prop to each person.", kind: "numbers", minutes: 15, xp: 25 },
      { id: "numbers-compress", title: "Compress four digits", summary: "Combine one person with another person's action.", kind: "drill", minutes: 10, xp: 25 },
      { id: "numbers-everyday", title: "Dates, PINs, and facts", summary: "Apply the system to numbers that matter outside practice.", kind: "mission", minutes: 10, xp: 25 },
      { id: "numbers-checkpoint", title: "Twenty-digit challenge", summary: "Encode five scenes and retrieve a complete number string.", kind: "checkpoint", minutes: 15, xp: 45 },
    ],
  },
  {
    id: "real-world",
    number: 7,
    title: "Real-World Recall",
    subtitle: "Transfer deliberate encoding into rooms, meetings, and conversations.",
    color: "#ffcf5a",
    lessons: [
      { id: "world-sweep", title: "The clockwise sweep", summary: "Scan an environment methodically instead of staring broadly.", kind: "mission", minutes: 7, xp: 20 },
      { id: "world-reconstruct", title: "Reconstruct a room", summary: "Recall positions, colors, people, and anomalies.", kind: "drill", minutes: 10, xp: 25 },
      { id: "world-dialogue", title: "Catch three keywords", summary: "Select and chain the key turns in a conversation.", kind: "people", minutes: 8, xp: 25 },
      { id: "world-meeting", title: "Use the meeting room", summary: "Place discussion points on nearby furniture in real time.", kind: "palace", minutes: 10, xp: 25 },
      { id: "world-speech", title: "Speak without notes", summary: "Anchor the structure of a short talk along a route.", kind: "mission", minutes: 12, xp: 30 },
      { id: "world-checkpoint", title: "Field mission", summary: "Complete and verify a real-world observation or dialogue task.", kind: "checkpoint", minutes: 15, xp: 50 },
    ],
  },
  {
    id: "mastery",
    number: 8,
    title: "Speed & Mastery",
    subtitle: "Integrate the systems and build fast, reliable conversion reflexes.",
    color: "#ff7a59",
    lessons: [
      { id: "mastery-full-cast", title: "Complete 00–99", summary: "Finish a distinct hundred-person DOMINIC roster.", kind: "numbers", minutes: 25, xp: 35 },
      { id: "mastery-speed", title: "Sub-two-second recall", summary: "Drill every number pair until translation is automatic.", kind: "drill", minutes: 15, xp: 35 },
      { id: "mastery-cards", title: "Translate a deck", summary: "Map card values and suits into memorable characters.", kind: "numbers", minutes: 20, xp: 40 },
      { id: "mastery-half-deck", title: "Half-deck journey", summary: "Compress twenty-six cards into thirteen loci.", kind: "palace", minutes: 20, xp: 45 },
      { id: "mastery-full-deck", title: "Full-deck journey", summary: "Place twenty-six compound scenes and reconstruct the deck.", kind: "checkpoint", minutes: 30, xp: 60 },
      { id: "mastery-final", title: "Final benchmark", summary: "Repeat the baseline and compare accuracy, speed, and retention.", kind: "checkpoint", minutes: 30, xp: 75 },
    ],
  },
];

export const ALL_LESSONS = COURSE_UNITS.flatMap((unit) => unit.lessons);

export const FOUNDATION_CONTENT: Record<string, TeachingPage[]> = {
  "foundation-baseline": [
    { type: "teach", eyebrow: "The core idea", title: "Memory begins with deliberate attention.", body: "Memory is not a passive recording. Information has to be noticed, translated, and deliberately retrieved. This course trains each of those actions separately before combining them.", example: "A room you walked through absent-mindedly leaves little trace. A room scanned for five specific colors gives your brain clear retrieval cues." },
    { type: "question", question: "Which action creates the strongest starting point for memory?", choices: ["Reading the same line repeatedly", "Choosing specific details to notice", "Waiting for the information to feel familiar"], correctIndex: 1, explanation: "Specific attention gives the brain something concrete to encode. Familiarity alone is not reliable recall." },
  ],
  "foundation-attention": [
    { type: "teach", eyebrow: "Observation", title: "Scan features, not labels.", body: "Naming an object is only the beginning. Deliberate observation separates it into texture, color variation, shape, position, damage, reflection, and movement.", example: "Instead of “silver watch,” notice the brushed dial, a scratch near two o’clock, the worn leather edge, and the uneven second hand." },
    { type: "question", question: "Which observation is most useful for later recall?", choices: ["It was a normal pen", "It looked expensive", "The blue cap had two tooth marks beside the clip"], correctIndex: 2, explanation: "Concrete, verifiable features create distinctive retrieval cues." },
  ],
  "foundation-motion": [
    { type: "teach", eyebrow: "Active imagery", title: "Static pictures fade. Events stay.", body: "Make objects collide, transform, leak, explode, chase, or replace one another. Scale and surprise make the interaction more distinctive.", example: "Do not place a strawberry beside a hammer. Swing the hammer into it and feel cold juice spray across your face." },
    { type: "question", question: "Which scene forms the strongest association?", choices: ["A key resting beside a cloud", "A key unlocks a cloud and a thunderstorm pours out", "A key and a cloud on a white background"], correctIndex: 1, explanation: "The second scene has action, causality, surprise, and a clear relationship between both objects." },
  ],
  "foundation-senses": [
    { type: "teach", eyebrow: "Multi-sensory cinema", title: "Give the scene a body.", body: "Sight is useful, but sound, touch, smell, movement, and emotion make a mental event easier to distinguish and revisit.", example: "A toaster ejects alarm clocks: hear the metallic ringing, smell scorched wire, feel the hot chrome, and react to the shock." },
    { type: "question", question: "A scene is visually clear but still forgettable. What should you add first?", choices: ["Smaller objects", "More empty background", "Physical sensation, sound, or emotion"], correctIndex: 2, explanation: "Additional senses and emotion create more retrieval paths than sight alone." },
  ],
  "foundation-story": [
    { type: "teach", eyebrow: "The link method", title: "Let each item cause the next.", body: "For short sequences, build a continuous chain. Every object must act on the next object so each image provides the cue for what follows.", example: "A candle melts onto a bicycle; the bicycle crashes into a piano; the piano fires oranges from its keys." },
    { type: "question", question: "Why is the story method best kept to short sequences?", choices: ["Stories cannot contain concrete objects", "One broken link can hide everything that follows", "It only works with numbers"], correctIndex: 1, explanation: "A chain depends on each previous link. Palaces are better when you need long sequences or random access." },
  ],
  "foundation-checkpoint": [
    { type: "question", question: "You need to remember “umbrella + engine.” Which encoding is strongest?", choices: ["An umbrella lying near an engine", "An engine roars inside an umbrella and blasts oily rain", "The words written in large letters"], correctIndex: 1, explanation: "Strong encoding combines interaction, movement, sensory detail, and surprise." },
    { type: "question", question: "Which detail reflects deliberate observation?", choices: ["There were some chairs", "The room was nice", "The left chair had a torn green seam and one missing floor pad"], correctIndex: 2, explanation: "Useful observations are specific enough to verify after recall." },
    { type: "question", question: "What is the main weakness of a long story chain?", choices: ["It uses too many senses", "It cannot preserve order", "A missed link can block later items"], correctIndex: 2, explanation: "That dependency is why the course next introduces stable spatial loci." },
  ],
};

export function getLesson(lessonId: string) {
  return ALL_LESSONS.find((lesson) => lesson.id === lessonId);
}

export function getNextLessonId(completedLessonIds: string[]) {
  return ALL_LESSONS.find((lesson) => !completedLessonIds.includes(lesson.id))?.id ?? null;
}

export function isLessonPlayable(lessonId: string) {
  return lessonId === "foundation-association" || Boolean(FOUNDATION_CONTENT[lessonId]);
}
