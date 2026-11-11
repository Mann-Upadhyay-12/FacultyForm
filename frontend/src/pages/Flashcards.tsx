import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  RotateCcw, 
  Check, 
  X,
  Star,
  Flame,
  Brain
} from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const mockDecks = [
  { id: 1, name: 'Wave-Particle Duality', cards: 24, mastered: 18 },
  { id: 2, name: 'Quantum States', cards: 32, mastered: 12 },
  { id: 3, name: 'Schrödinger Equation', cards: 28, mastered: 20 },
];

const mockCards = [
  { 
    id: 1, 
    front: 'What is the Heisenberg Uncertainty Principle?', 
    back: 'The principle states that you cannot simultaneously know the exact position and momentum of a particle with absolute precision.' 
  },
  { 
    id: 2, 
    front: 'Define Wave-Particle Duality', 
    back: 'Wave-particle duality is the concept that every particle or quantum entity exhibits both wave and particle properties.' 
  },
  { 
    id: 3, 
    front: 'What is Quantum Entanglement?', 
    back: 'Quantum entanglement is a phenomenon where particles become interconnected such that the state of one instantly influences the state of another, regardless of distance.' 
  },
  { 
    id: 4, 
    front: 'What is the Schrödinger Equation?', 
    back: 'The Schrödinger equation is a mathematical equation that describes how the quantum state of a physical system changes over time.' 
  },
];

export default function Flashcards() {
  const { courseId } = useParams();
  const [, navigate] = useLocation();
  const [selectedDeck, setSelectedDeck] = useState<number | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [streak, setStreak] = useState(7);
  const [cardsReviewed, setCardsReviewed] = useState(0);

  const handleRate = (rating: 'easy' | 'hard') => {
    setCardsReviewed(prev => prev + 1);
    if (rating === 'easy') {
      setStreak(prev => prev + 1);
    }
    
    // Move to next card
    setTimeout(() => {
      setIsFlipped(false);
      if (currentCardIndex < mockCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        setCurrentCardIndex(0);
      }
    }, 300);
  };

  const currentCard = mockCards[currentCardIndex];

  if (!selectedDeck) {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => navigate('/@me/content')}
                    className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Library
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => navigate(`/@me/content/${courseId}`)}
                    className="cursor-pointer hover:text-primary transition-colors"
                  >
                    Quantum Physics
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink className="text-primary">Flashcards</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Deck Selection */}
        <div className="max-w-7xl mx-auto p-8">
          <div
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2">
              Flashcard Decks
            </h1>
            <p className="text-muted-foreground">Master concepts through spaced repetition</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDecks.map((deck) => (
              <div
                key={deck.id}
                onClick={() => setSelectedDeck(deck.id)}
                className="cursor-pointer"
              >
                <Card className="border hover:border-primary/60 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge>
                        {deck.cards} cards
                      </Badge>
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4">{deck.name}</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-bold text-primary">
                          {Math.round((deck.mastered / deck.cards) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(deck.mastered / deck.cards) * 100} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => setSelectedDeck(null)}
                    className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Decks
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div
                className="flex items-center gap-2"
              >
                <Flame className="w-6 h-6 text-orange-500" />
                <span className="text-2xl font-bold text-orange-500">{streak}</span>
                <span className="text-sm text-muted-foreground">day streak</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-lg font-bold">{cardsReviewed}/{mockCards.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Area */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="flex flex-col items-center">
          {/* Progress */}
          <div
            className="w-full mb-8"
          >
            <Progress value={(currentCardIndex / mockCards.length) * 100} className="h-3" />
            <p className="text-center mt-2 text-sm text-muted-foreground">
              Card {currentCardIndex + 1} of {mockCards.length}
            </p>
          </div>

          {/* Card */}
          <div
            className="w-full max-w-2xl mb-8"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <Card className="min-h-[400px] relative border-2 hover:border-primary/60 transition-all shadow-lg">
              <CardContent className="p-12 flex items-center justify-center h-full min-h-[400px]">
                {isFlipped ? (
                  <div className="text-center">
                    <Badge className="mb-6">
                      Answer
                    </Badge>
                    <p className="text-xl leading-relaxed">
                      {currentCard.back}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Badge className="mb-6">
                      Question
                    </Badge>
                    <p className="text-2xl font-semibold leading-relaxed">
                      {currentCard.front}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <p className="text-center mt-4 text-sm text-muted-foreground">
              Click card to flip
            </p>
          </div>

          {/* Actions */}
          {isFlipped && (
            <div
              className="flex gap-6"
            >
              <div>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleRate('hard')}
                  className="border-2 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 text-red-500 rounded-full px-8 group"
                >
                  <X className="w-5 h-5 mr-2" />
                  Hard
                </Button>
              </div>

              <div>
                <Button
                  size="lg"
                  onClick={() => handleRate('easy')}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full px-8 shadow-lg"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Easy
                </Button>
              </div>

              <div>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsFlipped(false)}
                  className="border-2 border-primary/50 hover:bg-primary/10 hover:border-primary rounded-full px-8"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Review Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
