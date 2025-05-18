"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Flashcard } from '@/types';
import { FlashcardCard } from './flashcard-card';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from './dark-mode-toggle';
import { shuffleArray, cn } from '@/lib/utils';
import { RotateCcw, CheckCircle, XCircle, Brain, ListRestart, Lightbulb } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useConfetti } from "@/hooks/use-confetti";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const defaultFlashcardsData: Flashcard[] = [
  // Language Learning
  { id: 'll1', question: 'Hola (Spanish)', answer: 'Hello', category: 'Language Learning', hint: 'A common greeting.', difficulty: 'Easy' },
  { id: 'll2', question: 'Merci (French)', answer: 'Thank you', category: 'Language Learning', hint: 'Expressing gratitude.', difficulty: 'Easy' },
  { id: 'll3', question: 'Konnichiwa (Japanese)', answer: 'Good afternoon / Hello', category: 'Language Learning', hint: 'Used during a specific time of day.', difficulty: 'Medium' },
  // Programming Concepts
  { id: 'pc1', question: 'What is an API?', answer: 'Application Programming Interface', category: 'Programming Concepts', hint: 'It allows different software to communicate.', difficulty: 'Medium' },
  { id: 'pc2', question: 'What does DRY stand for?', answer: "Don't Repeat Yourself", category: 'Programming Concepts', hint: 'A principle for reducing repetition in code.', difficulty: 'Easy' },
  { id: 'pc3', question: "What is 'git'?", answer: 'A distributed version control system', category: 'Programming Concepts', hint: 'Think of saving and tracking changes to code.', difficulty: 'Medium' },
  // Mental Math
  { id: 'mm1', question: '12 x 12?', answer: '144', category: 'Mental Math', hint: 'A dozen dozens.', difficulty: 'Easy' },
  { id: 'mm2', question: 'Square root of 81?', answer: '9', category: 'Mental Math', hint: 'What number multiplied by itself equals 81?', difficulty: 'Easy' },
  { id: 'mm3', question: '7 x 8?', answer: '56', category: 'Mental Math', hint: 'Think of days in a week and a bit more.', difficulty: 'Medium' },
  // General Knowledge
  { id: 'gk1', question: 'What is the capital of Australia?', answer: 'Canberra', category: 'General Knowledge', hint: 'It is not Sydney or Melbourne.', difficulty: 'Medium' },
  { id: 'gk2', question: "Who wrote 'Romeo and Juliet'?", answer: 'William Shakespeare', category: 'General Knowledge', hint: 'A famous playwright from England.', difficulty: 'Easy' },
  { id: 'gk3', question: 'What is the tallest mountain in the world?', answer: 'Mount Everest', category: 'General Knowledge', hint: 'Located in the Himalayas. One was reclassified as a dwarf planet.', difficulty: 'Hard' },
  // Interview Questions
  { id: 'iq1', question: 'Tell me about yourself (common prompt)', answer: 'Focus on skills, experience, and career goals relevant to the role', category: 'Interview Questions', hint: 'Keep it professional and concise.', difficulty: 'Medium' },
  { id: 'iq2', question: 'Why are you interested in this role?', answer: 'Align your interests with company values and job description', category: 'Interview Questions', hint: 'Connect your skills to the job requirements.', difficulty: 'Medium' },
  { id: 'iq3', question: 'What is your biggest weakness?', answer: 'Frame it as an area for growth, with steps taken to improve', category: 'Interview Questions', hint: 'Be honest but also show self-awareness and improvement.', difficulty: 'Hard' },
  // Science Facts
  { id: 'sf1', question: 'What is the chemical symbol for Gold?', answer: 'Au', category: 'Science Facts', hint: 'Think of pirates and treasure.', difficulty: 'Easy' },
  { id: 'sf2', question: 'What force pulls objects towards the Earth?', answer: 'Gravity', category: 'Science Facts', hint: 'Discovered by Isaac Newton (allegedly from an apple).', difficulty: 'Easy' },
  { id: 'sf3', question: 'How many planets are in our solar system?', answer: '8 (Pluto is a dwarf planet)', category: 'Science Facts', hint: 'One was reclassified as a dwarf planet.', difficulty: 'Medium' },
  // Positive Affirmations
  { id: 'pa1', question: 'I am capable of...', answer: '...achieving my goals.', category: 'Positive Affirmations', hint: 'Focus on your personal strengths and ambitions.', difficulty: 'Easy' },
  { id: 'pa2', question: 'Today, I will focus on...', answer: '...my strengths and opportunities.', category: 'Positive Affirmations', hint: 'Direct your energy towards positive aspects.', difficulty: 'Easy' },
  { id: 'pa3', question: 'I choose to be...', answer: '...positive and resilient.', category: 'Positive Affirmations', hint: 'Embrace mental fortitude and optimism.', difficulty: 'Easy' },
];


const LOCAL_STORAGE_CUSTOM_CARDS_KEY = 'flashlearn-custom-cards';
const LOCAL_STORAGE_DARK_MODE_KEY = 'flashlearn-darkmode';

const categories = [
  "All Categories",
  "Language Learning",
  "Programming Concepts",
  "Mental Math",
  "General Knowledge",
  "Interview Questions",
  "Science Facts",
  "Positive Affirmations",
];

const questionNumberOptions = [5, 10, 15, 20];
const difficultyLevels = ["All Levels", "Easy", "Medium", "Hard"] as const;


export function FlashcardViewer() {
  const [activeFlashcards, setActiveFlashcards] = useState<Flashcard[]>(defaultFlashcardsData);
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  
  const [firstEncounterKnownIds, setFirstEncounterKnownIds] = useState<Set<string>>(new Set());
  const [firstEncounterDontKnowIds, setFirstEncounterDontKnowIds] = useState<Set<string>>(new Set());
  const [allEncounteredIds, setAllEncounteredIds] = useState<Set<string>>(new Set());

  const [initialCardCount, setInitialCardCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [knowAnimationTrigger, setKnowAnimationTrigger] = useState<'idle' | 'know'>('idle');
  const [knowIconAnimation, setKnowIconAnimation] = useState(false);
  const [showOuterSplash, setShowOuterSplash] = useState(false);

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [customCardsLoaded, setCustomCardsLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedNumberOfQuestions, setSelectedNumberOfQuestions] = useState<number>(10);
  const [selectedDifficulty, setSelectedDifficulty] = useState<(typeof difficultyLevels)[number]>("All Levels");
  const [showHintText, setShowHintText] = useState(false);
  // Track whether a session was just completed to show confetti
  const [showSessionCompleteConfetti, setShowSessionCompleteConfetti] = useState(false);

  // Add confetti hook - only show when session is complete
  const { Confetti, burstConfetti } = useConfetti({
    recycle: false,
    numberOfPieces: 300,
  });


  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCardsJson = localStorage.getItem(LOCAL_STORAGE_CUSTOM_CARDS_KEY);
      if (storedCardsJson) {
        const storedCards = JSON.parse(storedCardsJson) as Flashcard[];
        if (Array.isArray(storedCards) && storedCards.length > 0) {
          setActiveFlashcards(storedCards.map(card => ({ ...card, hint: card.hint || undefined, difficulty: card.difficulty || undefined }))); 
          setCustomCardsLoaded(true);
        } else {
          localStorage.removeItem(LOCAL_STORAGE_CUSTOM_CARDS_KEY);
          setActiveFlashcards(defaultFlashcardsData);
          setCustomCardsLoaded(false);
        }
      } else {
        setActiveFlashcards(defaultFlashcardsData);
        setCustomCardsLoaded(false);
      }
    } catch (e) {
      console.error("Failed to load or parse custom cards from localStorage", e);
      setActiveFlashcards(defaultFlashcardsData); 
      setCustomCardsLoaded(false);
    }
  }, []);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem(LOCAL_STORAGE_DARK_MODE_KEY);
    if (storedDarkMode) {
      const newMode = storedDarkMode === 'true';
      setIsDarkMode(newMode);
      document.documentElement.classList.toggle('dark', newMode);
    }
  }, []);


  const initializeSession = useCallback(() => {
    let cardsToUse: Flashcard[] = [...activeFlashcards];

    if (selectedCategory !== "All Categories") {
      cardsToUse = cardsToUse.filter(card => card.category === selectedCategory);
    }
    
    if (selectedDifficulty !== "All Levels") {
      cardsToUse = cardsToUse.filter(card => card.difficulty === selectedDifficulty);
    }


    if (cardsToUse.length === 0) {
      toast({
        title: "No Cards",
        description: `There are no flashcards for the selected category: ${selectedCategory} and difficulty: ${selectedDifficulty}. Import some or reset to default.`,
        variant: "destructive",
      });
      setSessionActive(false);
      setDeck([]);
      setInitialCardCount(0);
      return;
    }

    let shuffled = shuffleArray(cardsToUse);
    
    if (shuffled.length > selectedNumberOfQuestions) {
      shuffled = shuffled.slice(0, selectedNumberOfQuestions);
    }
    
    if (shuffled.length === 0) { 
        toast({
            title: "No Cards",
            description: `Not enough cards for the selected number (${selectedNumberOfQuestions}) in category: ${selectedCategory} and difficulty: ${selectedDifficulty}.`,
            variant: "destructive",
        });
        setSessionActive(false);
        setDeck([]);
        setInitialCardCount(0);
        return;
    }

    setDeck(shuffled);
    setInitialCardCount(shuffled.length);
    setIsFlipped(false);
    setSessionActive(true);
    setFirstEncounterKnownIds(new Set());
    setFirstEncounterDontKnowIds(new Set());
    setAllEncounteredIds(new Set());    setKnowAnimationTrigger('idle');
    setTimeElapsed(0);
    setShowHintText(false);
    // Reset confetti flag when starting a new session
    setShowSessionCompleteConfetti(false);
  }, [activeFlashcards, toast, selectedCategory, selectedNumberOfQuestions, selectedDifficulty]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    if (sessionActive && deck.length > 0) { 
      intervalId = setInterval(() => {
        setTimeElapsed(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [sessionActive, deck]); 

  const toggleDarkModeHandler = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      document.documentElement.classList.toggle('dark', newMode);
      localStorage.setItem(LOCAL_STORAGE_DARK_MODE_KEY, String(newMode));
      return newMode;
    });
  };

  const currentCard = deck.length > 0 ? deck[0] : null;

  const handleFlip = () => {
    if (knowAnimationTrigger === 'know') return;
    setShowHintText(false); // Always hide hint text area on any flip
    setIsFlipped(prev => !prev);
  }

  const handleKnow = () => {
    if (!currentCard || knowAnimationTrigger === 'know') return;
    setShowHintText(false);
    setKnowIconAnimation(true);
    setTimeout(() => setKnowIconAnimation(false), 300); 

    setShowOuterSplash(true);
    setTimeout(() => setShowOuterSplash(false), 500);


    setKnowAnimationTrigger('know');

    setTimeout(() => {
      if (!allEncounteredIds.has(currentCard.id)) {
        setFirstEncounterKnownIds(prev => new Set(prev).add(currentCard.id));
        setAllEncounteredIds(prev => new Set(prev).add(currentCard.id));
      }      const newDeck = deck.slice(1);
      setDeck(newDeck);
      if (newDeck.length === 0) {
        setSessionActive(false);
        // Flag that we've completed a session and should show confetti
        setShowSessionCompleteConfetti(true);
        // Celebrate completion with confetti!
        burstConfetti(5000);
      }
      setIsFlipped(false);
      setKnowAnimationTrigger('idle');
    }, 700); 
  };

  const handleDontKnow = () => {
    if (!currentCard || knowAnimationTrigger === 'know') return;
    setShowHintText(false);    if (!allEncounteredIds.has(currentCard.id)) {
      setFirstEncounterDontKnowIds(prev => new Set(prev).add(currentCard.id));
      setAllEncounteredIds(prev => new Set(prev).add(currentCard.id));
    }
      // If this is the last card in the initial deck and we're going to see it again
    if (deck.length === 1) {
      setSessionActive(false);
      // Flag that we've completed a session and should show confetti
      setShowSessionCompleteConfetti(true);
      // Celebrate completion with confetti!
      burstConfetti(5000);
      setDeck([]);
    } else {
      const newDeck = [...deck.slice(1), currentCard];
      setDeck(newDeck);
    }
    setIsFlipped(false);
  };

  const handleResetToDefault = () => {
    localStorage.removeItem(LOCAL_STORAGE_CUSTOM_CARDS_KEY);
    setActiveFlashcards(defaultFlashcardsData); 
    setCustomCardsLoaded(false);
    setSelectedCategory("All Categories");
    setSelectedNumberOfQuestions(10);
    setSelectedDifficulty("All Levels");
    toast({
      title: "Flashcards Reset",
      description: "Flashcards have been reset to the default set. Start a new session to use these cards.",
    });
    setSessionActive(false); 
    setDeck([]); 
    setInitialCardCount(0); 
    setShowHintText(false);
  };


  const progress = initialCardCount > 0 ? ((initialCardCount - deck.length) / initialCardCount) * 100 : 0;

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground transition-colors duration-300">
      {/* Render confetti when active */}      {/* Only render confetti component on session completion */}
      {showSessionCompleteConfetti && <Confetti />}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={handleResetToDefault} aria-label="Reset flashcards to default">
          <ListRestart className="h-5 w-5" />
        </Button>
        <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkModeHandler} />
      </div>
      
      <header className="mb-6 text-center">
        <h1 className="text-5xl font-bold text-primary text-standard-3d flex items-center justify-center">
          <Brain className="mr-3 h-12 w-12" /> FlashLearn
        </h1>
      </header>

      <main className="flex flex-col items-center w-full">
        {sessionActive && currentCard ? (
          <>
            <div className="mb-2 text-lg font-semibold text-foreground text-standard-3d">
              Time: {formatTime(timeElapsed)}
            </div>
            <div className="mb-4 text-base text-progress-3d text-standard-3d">
              Progress: {initialCardCount - deck.length} / {initialCardCount}
            </div>
            <div 
              className="w-full h-6 max-w-md sm:w-96 mb-6 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden relative"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Session progress"
            >
              <div 
                className="h-full transition-all duration-300 ease-linear bg-gradient-to-r from-amber-400 via-red-500 to-orange-600 via-red-500 to-amber-400 animate-realistic-fire bg-[length:300%_100%]" 
                style={{ width: `${progress}%`}}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-white" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.6)' }}>
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <FlashcardCard 
              card={currentCard} 
              isFlipped={isFlipped} 
              onFlip={handleFlip} 
              animationTrigger={knowAnimationTrigger}
            />
            <div className="flex flex-row gap-4 w-full max-w-md sm:w-96 mt-4">
              <Button 
                onClick={handleDontKnow} 
                disabled={knowAnimationTrigger === 'know'}
                className="w-1/2 bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-lg btn-3d-effect btn-3d-accent text-standard-3d"
                aria-label="Mark card as 'Don't Know'"
              >
                <XCircle className="mr-2 h-5 w-5" />
                Don't Know
              </Button>
              <div className="relative w-1/2"> 
                <Button 
                  onClick={handleKnow} 
                  disabled={knowAnimationTrigger === 'know'}
                  className="w-full bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90 text-[hsl(var(--success-foreground))] py-3 text-lg btn-3d-effect btn-3d-success text-standard-3d"
                  aria-label="Mark card as 'Know'"
                >
                  <CheckCircle className={cn("mr-2 h-5 w-5", knowIconAnimation && "animate-pulse-strong")} />
                  Know
                </Button>
                {showOuterSplash && (
                  <span className="outer-splash-element animate-outer-splash"></span>
                )}
              </div>
            </div>
            
            {currentCard && !isFlipped && knowAnimationTrigger === 'idle' && (
              <div className="mt-4 w-full max-w-md sm:w-96 flex flex-col items-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentCard?.hint) { 
                      setShowHintText(prev => !prev);
                    }
                  }}
                  disabled={!currentCard?.hint || knowAnimationTrigger === 'know'}
                  className="w-full sm:w-auto px-6 py-2 text-sm btn-3d-effect text-standard-3d"
                  aria-live="polite"
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  {currentCard?.hint ? (showHintText ? 'Hide Hint' : 'Show Hint') : 'No Hint Available'}
                </Button>
                {currentCard?.hint && showHintText && (
                  <p className="mt-3 p-3 bg-card/70 text-card-foreground rounded-md text-sm text-center text-standard-3d">
                    {currentCard.hint}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8 bg-card text-card-foreground rounded-xl shadow-xl max-w-md w-full">
            <h2 className="text-3xl font-bold mb-4 text-primary text-standard-3d">
              {initialCardCount > 0 && deck.length === 0 && sessionActive === false ? "Session Complete!" : (activeFlashcards.length > 0 ? "Ready to Learn!" : "No Flashcards Loaded")}
            </h2>
            
            {initialCardCount > 0 && deck.length === 0 && sessionActive === false && ( 
              <>
                <p className="text-lg mb-1 text-standard-3d">Category: {selectedCategory}</p>
                <p className="text-lg mb-1 text-standard-3d">Difficulty: {selectedDifficulty}</p>
                <p className="text-lg mb-1 text-standard-3d">Questions: {initialCardCount}</p>
                <p className="text-lg mb-2 text-green-600 dark:text-green-400 text-standard-3d">Known on first try: {firstEncounterKnownIds.size}</p>
                <p className="text-lg mb-2 text-red-600 dark:text-red-400 text-standard-3d">Needed review: {firstEncounterDontKnowIds.size}</p>
                <p className="text-lg mb-6 text-standard-3d">Total Time: {formatTime(timeElapsed)}</p>
              </>
            )}

            {activeFlashcards.length === 0 && (
                <p className="text-lg mb-4 text-standard-3d">
                    No flashcards loaded. Please import a CSV file or reset to the default set.
                </p>
            )}

            {!(initialCardCount > 0 && deck.length === 0 && sessionActive === false) && activeFlashcards.length > 0 && (
              <div className="space-y-4 mb-6 w-full">
                <div>
                  <Label htmlFor="category-select" className="block text-sm font-medium text-muted-foreground mb-1 text-standard-3d">Select Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category-select" className="w-full text-standard-3d">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category} className="text-standard-3d">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="number-questions-select" className="block text-sm font-medium text-muted-foreground mb-1 text-standard-3d">Number of Questions</Label>
                  <Select 
                    value={String(selectedNumberOfQuestions)} 
                    onValueChange={(value) => setSelectedNumberOfQuestions(Number(value))}
                  >
                    <SelectTrigger id="number-questions-select" className="w-full text-standard-3d">
                      <SelectValue placeholder="Select number of questions" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionNumberOptions.map(num => (
                        <SelectItem key={num} value={String(num)} className="text-standard-3d">
                          {num} Questions
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty-select" className="block text-sm font-medium text-muted-foreground mb-1 text-standard-3d">Select Difficulty</Label>
                  <Select 
                    value={selectedDifficulty} 
                    onValueChange={(value) => setSelectedDifficulty(value as (typeof difficultyLevels)[number])}
                  >
                    <SelectTrigger id="difficulty-select" className="w-full text-standard-3d">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map(level => (
                        <SelectItem key={level} value={level} className="text-standard-3d">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}            <Button              onClick={() => {
                // Reset the confetti flag when starting a new session
                setShowSessionCompleteConfetti(false);
                // Start the session 
                initializeSession();
              }}
              className="py-3 text-lg px-6 btn-3d-effect btn-3d-primary text-standard-3d"
              disabled={activeFlashcards.length === 0}
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              {initialCardCount > 0 && deck.length === 0 && sessionActive === false ? "Start New Session" : "Start Session"}
            </Button>
            
            {!sessionActive && deck.length === 0 && !customCardsLoaded && activeFlashcards.length > 0 && (
               (selectedCategory === "All Categories" || activeFlashcards.some(card => card.category === selectedCategory)) &&
              <p className="mt-4 text-sm text-muted-foreground text-standard-3d">
                NOTE : default cards will be used
              </p>
            )}
          </div>
        )}      </main>
    </div>
  );
}


