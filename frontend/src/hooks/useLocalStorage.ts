import { useState, useEffect, useCallback } from "react";

type SetValue<T> = T | ((prevValue: T) => T);

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: SetValue<T>) => {
      if (typeof window === "undefined") {
        console.warn(
          `Tried setting localStorage key "${key}" even though environment is not a browser`
        );
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.localStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
        window.dispatchEvent(new Event("local-storage"));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new Event("local-storage"));
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [initialValue, key]);

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleStorageChange);
    };
  }, [readValue]);

  return [storedValue, setValue, removeValue];
}

export interface StudyProgress {
  flashcardProgress: Record<string, { reviewed: number[]; mastered: number[] }>;
  quizScores: Record<string, { score: number; total: number; date: string }[]>;
  notes: Record<string, { content: string; updatedAt: string }>;
  lastVisited: string[];
  streak: number;
  lastStudyDate: string | null;
}

const defaultProgress: StudyProgress = {
  flashcardProgress: {},
  quizScores: {},
  notes: {},
  lastVisited: [],
  streak: 0,
  lastStudyDate: null,
};

export function useStudyProgress() {
  const [progress, setProgress, clearProgress] = useLocalStorage<StudyProgress>(
    "padhai-study-progress",
    defaultProgress
  );

  const updateFlashcardProgress = useCallback(
    (deckId: string, cardId: number, mastered: boolean) => {
      setProgress((prev) => {
        const deckProgress = prev.flashcardProgress[deckId] || { reviewed: [], mastered: [] };
        const reviewed = [...new Set([...deckProgress.reviewed, cardId])];
        const masteredCards = mastered
          ? [...new Set([...deckProgress.mastered, cardId])]
          : deckProgress.mastered.filter((id) => id !== cardId);

        return {
          ...prev,
          flashcardProgress: {
            ...prev.flashcardProgress,
            [deckId]: { reviewed, mastered: masteredCards },
          },
        };
      });
    },
    [setProgress]
  );

  const saveQuizScore = useCallback(
    (quizId: string, score: number, total: number) => {
      setProgress((prev) => ({
        ...prev,
        quizScores: {
          ...prev.quizScores,
          [quizId]: [
            ...(prev.quizScores[quizId] || []),
            { score, total, date: new Date().toISOString() },
          ],
        },
      }));
    },
    [setProgress]
  );

  const saveNote = useCallback(
    (noteId: string, content: string) => {
      setProgress((prev) => ({
        ...prev,
        notes: {
          ...prev.notes,
          [noteId]: { content, updatedAt: new Date().toISOString() },
        },
      }));
    },
    [setProgress]
  );

  const updateStreak = useCallback(() => {
    const today = new Date().toDateString();
    setProgress((prev) => {
      if (prev.lastStudyDate === today) {
        return prev;
      }

      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = prev.lastStudyDate === yesterday ? prev.streak + 1 : 1;

      return {
        ...prev,
        streak: newStreak,
        lastStudyDate: today,
      };
    });
  }, [setProgress]);

  const addToLastVisited = useCallback(
    (path: string) => {
      setProgress((prev) => ({
        ...prev,
        lastVisited: [path, ...prev.lastVisited.filter((p) => p !== path)].slice(0, 10),
      }));
    },
    [setProgress]
  );

  return {
    progress,
    updateFlashcardProgress,
    saveQuizScore,
    saveNote,
    updateStreak,
    addToLastVisited,
    clearProgress,
  };
}
