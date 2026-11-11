export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
}

export interface NavSection {
  id:string;
  title?: string;
  items: NavItem[];
}

export interface ContentCard {
  id: string;
  title: string;
  category: string;
  image: string;
  href: string;
  date?: string;
  readTime?: string;
  description?: string;
  progress?: number;  // e.g., 2 (topics covered out of 5)
  topics?: number;
}

export interface PromptSuggestion {
  id: string;
  text: string;
}

// New interfaces for learning content
export interface Course {
  id: string;
  name: string;  // Slug: "my-course"
  description?: string;
  visibility: 'private' | 'shared_link' | 'public';
  shareId?: string;
  progress: number;  // Topics completed
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;  // Slug: "my-topic"
  orderIndex: number;
  progress: 'not_started' | 'in_progress' | 'completed';
  pdfs: PDF[];
  summary?: Summary;
  notes: Note[];
}

export interface PDF {
  id: string;
  filename: string;
  url: string;  // Mock or S3
  pages: number;
}

export interface Summary {
  id: string;
  content: string;  // Markdown
  generatedAt: string;
}

export interface Note {
  id: string;
  content: string;
  type: 'text' | 'ai_chat';
  createdAt: string;
}

export interface Cycle {
  id: string;
  topicsCovered: number;
  totalTopics: number;
  readyForTest: boolean;
  test?: Test;
}

export interface Test {
  id: string;
  questions: Question[];
  score?: number;
  completedAt?: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  userAnswer?: number;
}

export interface Aid {
  id:string;
  type: 'mindmap' | 'flashcard';
  content: any;  // JSON: { nodes: [...] } or { cards: [{front, back}] }
}

export interface Feedback {
  wrongs: { qIndex: number; explanation: string }[];
}

export interface AidSummary {
  id: string;
  type: 'flashcard' | 'quiz' | 'mindmap';
  title: string;
  count: number;  // e.g., 10 cards
  href: string;  // e.g., "/revise/flashcards/:id"
  preview?: string;  // Snippet
}


// Navigation data
export const navigationData: NavSection[] = [
  {
    id: "main",
    items: [
      { id: "home", label: "Home", href: "/" },
      { id: "research", label: "Research", href: "/research" },
      { id: "library", label: "My Library", href: "/library" },
    ],
  },
  {
    id: "features",
    items: [
      { id: "flashcards", label: "Flashcards", href: "/flashcards" },
      { id: "quizzes", label: "Practice Quizzes", href: "/quizzes" },
      { id: "summaries", label: "Summaries", href: "/summaries" },
      { id: "notes", label: "Smart Notes", href: "/notes" },
    ],
  },
  {
    id: "resources",
    items: [
      { id: "saved", label: "Saved Items", href: "/saved" },
      { id: "history", label: "Chat History", href: "/history" },
      { id: "settings", label: "Settings", href: "/settings" },
    ],
  },
];
export const ModenavigationData: NavSection[] = [
  {
    id: "Modes",
    items: [
      { id: "research", label: "reseach", href: "/" },
      { id: "focus", label: "focus", href: "/mode/focus" },
      { id: "work", label: "Work", href: "/mode/work" },
      { id: "Test", label: "Test", href: "/mode/test" },
    ],
  },
];

// Prompt suggestions
export const promptSuggestions: PromptSuggestion[] = [
  { id: "summarize", text: "Summarize this document" },
  { id: "explain", text: "Explain this concept" },
  { id: "quiz", text: "Create a quiz" },
  { id: "flashcards", text: "Generate flashcards" },
  { id: "notes", text: "Take smart notes" },
];

// Featured content cards
export const featuredCards: ContentCard[] = [
  {
    id: "card-1",
    title: "Introduction to Machine Learning",
    category: "Computer Science",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&fit=crop",
    href: "/@me/content/ml-intro",
    date: "Dec 10, 2024",
    readTime: "8 min min read",
    description: "A comprehensive guide to getting started with machine learning",
    progress: 5,
  },
  {
    id: "card-2",
    title: "Quantum Physics Fundamentals",
    category: "Physics",
    image: "https://images.unsplash.com/photo-1635070041078-ebec7560ff3e?w=800&auto=format&fit=crop",
    href: "/@me/content/quantum-physics",
    date: "Dec 9, 2024",
    readTime: "12 min read",
    description: "Understanding the basics of quantum mechanics",
    progress: 5,
  },
  {
    id: "card-3",
    title: "Advanced Calculus Techniques",
    category: "Mathematics",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop",
    href: "/@me/content/calculus",
    date: "Dec 8, 2024",
    readTime: "10 min read",
    description: "Master advanced integration and differentiation",
    progress: 5,
  },
  {
    id: "card-4",
    title: "Modern European History",
    category: "History",
    image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop",
    href: "/@me/content/european-history",
    date: "Dec 7, 2024",
    readTime: "15 min read",
    description: "Key events that shaped modern Europe",
    progress: 5,
  },
  {
    id: "card-5",
    title: "Organic Chemistry Reactions",
    category: "Chemistry",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop",
    href: "/@me/content/organic-chem",
    date: "Dec 6, 2024",
    readTime: "11 min read",
    description: "Essential organic chemistry reaction mechanisms",
    progress: 5,
  },
];

// Recent study materials
export const recentCards: ContentCard[] = [
  {
    id: "recent-1",
    title: "Biology: Cell Structure",
    category: "Biology",
    image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&auto=format&fit=crop",
    href: "/@me/content/cell-structure",
    date: "Dec 11, 2024",
    readTime: "6 min read",
    progress: 5,
  },
  {
    id: "recent-2",
    title: "Spanish Grammar Essentials",
    category: "Languages",
    image: "https://images.unsplash.com/photo-1543109740-4bdb38fda756?w=800&auto=format&fit=crop",
    href: "/@me/content/spanish-grammar",
    date: "Dec 10, 2024",
    readTime: "9 min read",
    progress: 5,
  },
  {
    id: "recent-3",
    title: "Economics: Supply & Demand",
    category: "Economics",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop",
    href: "/@me/content/economics",
    date: "Dec 9, 2024",
    readTime: "7 min read",
    progress: 5,
  },
];

export const questions: Question[] = [
  {
    id: "q1",
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Lisbon"],
    correctIndex: 2,
  },
  {
    id: "q2",
    question: "Who wrote 'Hamlet'?",
    options: ["Tolstoy", "Shakespeare", "Hemingway", "Fitzgerald"],
    correctIndex: 1,
  },
  {
    id: "q3",
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "22"],
    correctIndex: 1,
  },
  {
    id: "q4",
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctIndex: 1,
  },
  {
    id: "q5",
    question: "What language is primarily used for styling web pages?",
    options: ["JavaScript", "HTML", "Python", "CSS"],
    correctIndex: 3,
  },
];


// Mock functions to simulate API
let mockCourses: Course[] = [
  {
    id: "course-1",
    name: "my-course",
    description: "AI System Design Basics",
    visibility: "private",
    progress: 2,
    topics: [
      {
        id: "topic-1",
        name: "my-topic",
        orderIndex: 1,
        progress: "in_progress",
        pdfs: [
          { id: "pdf-1", filename: "system-design.pdf", url: "http://localhost:8127/myfile.pdf", pages: 10 }
        ],
        summary: {
          id: "sum-1",
          content: "# System Design Summary\nKey concepts: Scalability, microservices, databases. Focus on API gateways for routing.",
          generatedAt: new Date().toISOString()
        },
        notes: [
          { id: "note-1", content: "Note: Use Go for perf.", type: "text", createdAt: new Date().toISOString() },
          { id: "note-2", content: "AI: Explain sharding.", type: "ai_chat", createdAt: new Date().toISOString() }
        ]
      },
      // Add 1-2 more topics for cycle demo
      {
        id: "topic-2",
        name: "databases",
        orderIndex: 2,
        progress: "completed",
        pdfs: [{ id: "pdf-2", filename: "db.pdf", url: "http://localhost:8127/db.pdf", pages: 8 }],
        summary: { id: "sum-2", content: "Postgres schemas for isolation.", generatedAt: new Date().toISOString() },
        notes: []
      }
    ]
  },
  {
    id: "ml-intro",
    name: "ml-intro",
    description: "AI System Design Basics",
    visibility: "public",
    progress: 1,
    topics: [
      {
        id: "ml-topic-1",
        name: "introduction",
        orderIndex: 1,
        progress: "in_progress",
        pdfs: [
          { id: "pdf-3", filename: "ml-intro.pdf", url: "http://localhost:8127/myfile.pdf", pages: 15 }
        ],
        summary: {
          id: "sum-3",
          content: "# Introduction to Machine Learning\nThis topic covers the basics of machine learning...",
          generatedAt: new Date().toISOString()
        },
        notes: []
      },
      {
        id: "ml-topic-2",
        name: "supervised-learning",
        orderIndex: 2,
        progress: "not_started",
        pdfs: [],
        summary: undefined,
        notes: []
      }
    ]
  }
];

export function getUserCourses(): Course[] {
  return mockCourses;
}

export function getTopicData(courseSlug: string, topicSlug: string): {
  course: Course;
  topic: Topic;
  cycle: Cycle;
  test?: Test;
  aids?: Aid[];
  feedback?: Feedback;
} {
  const course = mockCourses.find(c => c.name === courseSlug);
  if (!course) {
    // Auto-create mock
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      name: courseSlug,
      description: `Mock course for ${courseSlug}`,
      visibility: "private",
      progress: 0,
      topics: [{
        id: `topic-${Date.now()}`,
        name: topicSlug,
        orderIndex: 1,
        progress: "not_started" as const,
        pdfs: [],
        summary: undefined,
        notes: []
      }]
    };
    mockCourses.push(newCourse);
    return { course: newCourse, topic: newCourse.topics[0], cycle: { id: 'c1', topicsCovered: 0, totalTopics: 5, readyForTest: false } };
  }
  const topic = course.topics.find(t => t.name === topicSlug) || course.topics[0];  // Fallback
  const topicsCovered = course.topics.filter(t => t.progress === 'completed').length;
  const cycle: Cycle = {
    id: 'cycle-1',
    topicsCovered,
    totalTopics: course.topics.length,
    readyForTest: topicsCovered >= 2,
    test: topicsCovered >= 2 ? {
      id: 'test-1',
      questions: questions.slice(0, 5),  // From your existing
      score: undefined
    } : undefined
  };
  // Mock aids if test ready
  const aids: Aid[] = cycle.readyForTest ? [
    { id: 'aid-1', type: 'mindmap', content: { nodes: [{ id: '1', label: 'System Design' }, { id: '2', label: 'Microservices', parent: '1' }] } },
    { id: 'aid-2', type: 'flashcard', content: { cards: [{ front: 'What is sharding?', back: 'DB partitioning' }] } }
  ] : [];
  return { course, topic, cycle, test: cycle.test, aids };
}

export function updateProgress(courseSlug: string, topicSlug: string, newProgress: Topic['progress']): Course {
  const course = mockCourses.find(c => c.name === courseSlug);
  if (course) {
    const topic = course.topics.find(t => t.name === topicSlug);
    if (topic) topic.progress = newProgress;
    course.progress = course.topics.filter(t => t.progress === 'completed').length;
  }
  return course!;
}

export function addNote(courseSlug: string, topicSlug: string, note: Omit<Note, 'id' | 'createdAt'>): Note {
  const { topic } = getTopicData(courseSlug, topicSlug);
  const newNote: Note = { ...note, id: `note-${Date.now()}`, createdAt: new Date().toISOString() };
  topic.notes.push(newNote);
  return newNote;
}

export function generateTest(_courseSlug: string, _topicSlug: string): Test {
  // Mock gen: Use existing questions, randomize
  return {
    id: `test-${Date.now()}`,
    questions: questions.sort(() => Math.random() - 0.5).slice(0, 6)
  };
}

export function submitTest(_testId: string, answers: number[]): { score: number; feedback: Feedback; aids: Aid[] } {
  // Mock scoring
  const test = questions.slice(0, 6);  // Assume
  const score = answers.filter((ans, i) => ans === test[i].correctIndex).length;
  const wrongs = test.map((q, i) => {
    const answer = answers[i];
    if (answer !== q.correctIndex) {
      return {
        qIndex: i,
        explanation: `Correct is ${q.options[q.correctIndex]}. Why? ${q.question} involves...`
      };
    }
    return null;
  }).filter((w): w is { qIndex: number; explanation: string } => w !== null);

  const aids: Aid[] = [ /* mock mindmap/flashcards based on wrongs */ ];
  return { score, feedback: { wrongs }, aids };
}

export function getCourseAids(_courseId: string): AidSummary[] {
  // Mock: Generate based on course progress
  return [
    { id: "aid-fc1", type: "flashcard", title: "System Design Flashcards", count: 15, href: "/revise/flashcards/my-course", preview: "What is sharding?" },
    { id: "aid-q1", type: "quiz", title: "Topic 1 Quiz", count: 6, href: "/test/quiz/my-course", preview: "Capital of France?" },
    { id: "aid-mm1", type: "mindmap", title: "Course Mindmap", count: 8, href: "/revise/mindmap/my-course", preview: "Central: Microservices → Branches: DB, API" }
  ];
}
