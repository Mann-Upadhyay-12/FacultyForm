import { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Clock } from 'lucide-react';

const mockTests = [
  { id: 1, name: 'Chapter 1: Introduction', score: 95, totalQuestions: 20, date: '2 days ago' },
  { id: 2, name: 'Chapter 2: Wave Mechanics', score: 87, totalQuestions: 25, date: '5 days ago' },
  { id: 3, name: 'Chapter 3: Quantum States', score: 78, totalQuestions: 30, date: '1 week ago' },
  { id: 4, name: 'Midterm Practice', score: 92, totalQuestions: 50, date: '2 weeks ago' },
];

const mockQuestions = [
  {
    id: 1,
    question: 'What is the Heisenberg Uncertainty Principle?',
    userAnswer: 'A principle stating you cannot simultaneously measure position and momentum with precision',
    correctAnswer: 'A principle stating you cannot simultaneously measure position and momentum with precision',
    isCorrect: true,
  },
  {
    id: 2,
    question: 'Define superposition in quantum mechanics.',
    userAnswer: 'A quantum system can exist in multiple states',
    correctAnswer: 'A quantum system can exist in multiple states simultaneously until measured',
    isCorrect: false,
  },
  {
    id: 3,
    question: 'What experiment demonstrated wave-particle duality?',
    userAnswer: 'Double-slit experiment',
    correctAnswer: 'Double-slit experiment',
    isCorrect: true,
  },
];

export default function MinimalTestReviews() {
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [view, setView] = useState<'tests' | 'course'>('tests');

  if (view === 'course') {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => setView('tests')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tests
            </button>
            <h1 className="text-4xl font-bold mb-3">Quantum Physics</h1>
            <p className="text-muted-foreground">Course overview and content</p>
          </div>
        </div>
      </div>
    );
  }

  const currentTest = mockTests.find(t => t.id === selectedTest);

  // Test List View
  if (!selectedTest) {
    return (
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4">
          <button
            onClick={() => setView('course')}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Back to Course"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-4xl font-bold mb-8">Test Reviews</h1>

            {/* Test List */}
            <div className="space-y-3">
              {mockTests.map((test) => (
                <div
                  key={test.id}
                  onClick={() => setSelectedTest(test.id)}
                  className="flex items-center justify-between p-5 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{test.name}</h3>
                      <span className={`text-sm font-medium ${test.score >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                        {test.score}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{test.totalQuestions} questions</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {test.date}
                      </span>
                    </div>
                  </div>
                  {test.score >= 90 && (
                    <Trophy className="w-6 h-6 text-yellow-500 ml-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test Detail View
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4">
        <button
          onClick={() => setSelectedTest(null)}
          className="w-12 h-12 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Back to Tests"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-4xl font-bold mb-8">{currentTest?.name}</h1>

          {/* Score */}
          <div className="text-center mb-12 p-8 bg-card border border-border rounded-lg">
            <div className="text-6xl font-bold mb-2">{currentTest?.score}%</div>
            <p className="text-muted-foreground">
              {currentTest && Math.round((currentTest.score / 100) * currentTest.totalQuestions)} / {currentTest?.totalQuestions} correct
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {mockQuestions.map((q) => (
              <div key={q.id} className="p-6 bg-card border border-border rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  {q.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium mb-3">{q.question}</h3>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Your answer: </span>
                        <span className={q.isCorrect ? 'text-foreground' : 'text-red-600'}>
                          {q.userAnswer}
                        </span>
                      </div>
                      
                      {!q.isCorrect && (
                        <div>
                          <span className="text-muted-foreground">Correct answer: </span>
                          <span className="text-green-600">{q.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}