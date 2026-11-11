import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Edit3, FlipHorizontal, Network, ClipboardList } from 'lucide-react';

const mockCourse = {
  id: '1',
  title: 'Quantum Physics',
  description: 'Explore the fascinating world of quantum mechanics',
  progress: 75
};

const learningPath = [
  { id: 1, title: 'Wave-Particle Duality', completed: true },
  { id: 2, title: 'Schrödinger Equation', completed: true },
  { id: 3, title: 'Quantum Entanglement', completed: true },
  { id: 4, title: 'Heisenberg Uncertainty', completed: false },
  { id: 5, title: 'Quantum Tunneling', completed: false },
  { id: 6, title: 'Quantum Computing', completed: false },
];

const artifacts = [
  { id: 1, type: 'Notes', count: 24, icon: Edit3 },
  { id: 2, type: 'Flashcards', count: 156, icon: FlipHorizontal },
  { id: 3, type: 'Mind Maps', count: 8, icon: Network },
  { id: 4, type: 'Tests', count: 12, icon: ClipboardList },
];

export default function MinimalCoursePage() {
  const [view, setView] = useState<'course' | 'library'>('course');

  if (view === 'library') {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Library</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setView('course')}
                >
                  <h3 className="font-semibold mb-2">Course {item}</h3>
                  <p className="text-sm text-muted-foreground">Click to view details</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4">
        <button
          onClick={() => setView('library')}
          className="w-12 h-12 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Back to Library"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-3">{mockCourse.title}</h1>
            <p className="text-muted-foreground mb-6">{mockCourse.description}</p>
            
            {/* Progress Bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all" 
                  style={{ width: `${mockCourse.progress}%` }}
                />
              </div>
              <span className="text-sm font-medium">{mockCourse.progress}%</span>
            </div>
          </div>

          {/* Learning Path */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Learning Path</h2>
            <div className="space-y-3">
              {learningPath.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                >
                  {topic.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={topic.completed ? 'text-foreground' : 'text-muted-foreground'}>
                    {topic.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Study Artifacts */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Study Materials</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {artifacts.map((artifact) => (
                <div
                  key={artifact.id}
                  className="bg-card border border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <artifact.icon className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <div className="text-2xl font-bold mb-1">{artifact.count}</div>
                  <div className="text-sm text-muted-foreground">{artifact.type}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}