"use client"; 

import { Button } from '@/components/ui/button';
import { Brain, UploadCloud, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { Flashcard, AIGenerateRequest } from '@/types';
import { DarkModeToggle } from '@/components/dark-mode-toggle';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const difficultyLevelsForAI = ["Easy", "Medium", "Hard"] as const;
const questionNumberOptions = [5, 10, 15, 20] as const;

export default function StartPage() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState<(typeof difficultyLevelsForAI)[number]>("Medium");
  const [aiQuestionCount, setAiQuestionCount] = useState<(typeof questionNumberOptions)[number]>(5);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    const storedDarkMode = localStorage.getItem('flashlearn-darkmode');
    if (storedDarkMode) {
      const newMode = storedDarkMode === 'true';
      setIsDarkMode(newMode);
      document.documentElement.classList.toggle('dark', newMode);
    }
  }, []);

  const toggleDarkModeHandler = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      document.documentElement.classList.toggle('dark', newMode);
      localStorage.setItem('flashlearn-darkmode', String(newMode));
      return newMode;
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a .csv file.",
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast({ title: "Error Reading File", description: "Could not read the file content.", variant: "destructive" });
        return;
      }
      try {
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        const importedCards: Flashcard[] = lines.map((line, index) => {
          const parts = line.split(',');
          if (parts.length < 2) {
            throw new Error(`Line ${index + 1} does not have enough columns (question,answer). Found: "${line}"`);
          }
          const question = parts[0].trim().replace(/^"|"$/g, '');
          const answer = parts.slice(1).join(',').trim().replace(/^"|"$/g, '');

          if (!question || !answer) {
            throw new Error(`Line ${index + 1} has empty question or answer. Question: "${question}", Answer: "${answer}"`);
          }
          return {
            id: `imported-${Date.now()}-${index}`,
            question: question,
            answer: answer,
          };
        });

        if (importedCards.length === 0) {
          toast({
            title: "Empty CSV",
            description: "The CSV file is empty or contains no valid flashcard data.",
            variant: "destructive",
          });
        } else {
          localStorage.setItem('flashlearn-custom-cards', JSON.stringify(importedCards));
          toast({
            title: "Import Successful",
            description: `${importedCards.length} flashcards imported and saved. Click 'Start Learning' to use them.`,
          });
        }
      } catch (error: any) {
        toast({
          title: "Import Error",
          description: error.message || "Failed to parse CSV file. Ensure format is: question,answer",
          variant: "destructive",
        });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
        toast({ title: "File Read Error", description: "An error occurred while reading the file.", variant: "destructive" });
        if (fileInputRef.current) fileInputRef.current.value = ""; 
    };
    reader.readAsText(file);
  };
  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a topic or text to generate flashcards from.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      toast({
        title: "AI Generation Started",
        description: "Generating flashcards from your topic...",
      });
        // Import the AI mock service
      const { ai } = await import('@/ai/mock-ai-service');
      
      // Generate flashcards with our mock AI service
      const generatedCards = await ai.generateFlashcards(aiTopic, aiDifficulty, aiQuestionCount);
      
      // Get any existing cards
      const existingCards = JSON.parse(localStorage.getItem('flashlearn-custom-cards') || '[]');
      
      // Combine and save all cards
      const allCards = [...existingCards, ...generatedCards];
      localStorage.setItem('flashlearn-custom-cards', JSON.stringify(allCards));
      
      toast({
        title: "Flashcards Generated",
        description: `${generatedCards.length} flashcards created for topic: "${aiTopic}". Click 'Start Learning' to use them.`,
      });
      
      // Reset fields and close dialog
      setAiTopic("");
      setAiDifficulty("Medium");
      setAiQuestionCount(5);
      setIsAiDialogOpen(false);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating flashcards. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 bg-background text-foreground transition-colors duration-300 min-h-screen relative">
      <div className="absolute top-4 right-4">
        <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkModeHandler} />
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileSelected} accept=".csv" className="hidden" />
      
      <header className="mb-8 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-primary text-standard-3d flex items-center justify-center">
          <Brain className="mr-3 sm:mr-4 h-12 w-12 sm:h-16 sm:w-16" /> FlashLearn
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-muted-foreground text-standard-3d">
          Master new concepts, one card at a time.
        </p>
      </header>

      <main className="mb-16 flex flex-col space-y-4 w-full max-w-xs sm:max-w-sm">
        <Link href="/learn" passHref>
          <Button 
            size="lg" 
            className="w-full py-3 sm:py-4 text-lg sm:text-xl btn-3d-effect btn-3d-primary text-standard-3d"
            aria-label="Start learning with flashcards"
          >
            Start Learning
          </Button>
        </Link>

        <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg"
              className="w-full py-3 sm:py-4 text-lg sm:text-xl btn-3d-effect btn-3d-primary text-standard-3d" 
              aria-label="Generate flashcards with AI"
            >
              <Sparkles className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" /> Generate with AI
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Generate Flashcards with AI</DialogTitle>
              <DialogDescription>
                Enter a topic or paste some text, choose a difficulty, and let AI create flashcards for you.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 md:grid-cols-4 md:items-center">
                <Label htmlFor="ai-topic" className="md:text-right md:col-span-1">
                  Topic/Text
                </Label>
                <Textarea
                  id="ai-topic"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g., 'Photosynthesis' or paste a paragraph here..."
                  className="md:col-span-3 h-24"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-8 md:items-center">
                <div className="grid gap-4 md:grid-cols-4 md:items-center md:col-span-4">
                  <Label htmlFor="ai-difficulty" className="md:text-right md:col-span-1">
                    Difficulty
                  </Label>
                  <Select 
                    value={aiDifficulty}
                    onValueChange={(value) => setAiDifficulty(value as (typeof difficultyLevelsForAI)[number])}
                  >
                    <SelectTrigger id="ai-difficulty" className="md:col-span-3">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevelsForAI.map(level => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 md:grid-cols-4 md:items-center md:col-span-4">
                  <Label htmlFor="ai-question-count" className="md:text-right md:col-span-1">
                    Questions
                  </Label>
                  <Select 
                    value={aiQuestionCount.toString()}
                    onValueChange={(value) => setAiQuestionCount(parseInt(value) as (typeof questionNumberOptions)[number])}
                  >
                    <SelectTrigger id="ai-question-count" className="md:col-span-3">
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionNumberOptions.map(count => (
                        <SelectItem key={count} value={count.toString()}>
                          {count}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleAiGenerate} className="btn-3d-effect btn-3d-primary">
                Generate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button 
          size="lg"
          onClick={handleUploadClick}
          className="w-full py-3 sm:py-4 text-lg sm:text-xl btn-3d-effect btn-3d-primary text-standard-3d" 
          aria-label="Upload custom flashcards from a CSV file"
        >
          <UploadCloud className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" /> Upload Custom Cards
        </Button>
      </main>

      {currentYear !== null && (
        <footer className="absolute bottom-4 text-xs sm:text-sm text-muted-foreground text-standard-3d">
          <p>© {currentYear} FlashLearn. Your journey to knowledge begins here.</p>
        </footer>
      )}
    </div>
  );
}
