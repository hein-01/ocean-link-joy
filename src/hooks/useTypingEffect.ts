import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export const useTypingEffect = (text: string, speed: number = 100) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize the text to prevent unnecessary re-renders
  const memoizedText = useMemo(() => text, [text]);

  const resetTyping = useCallback(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsTyping(true);
  }, []);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isTyping || !memoizedText) return;

    if (currentIndex < memoizedText.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayedText(prev => prev + memoizedText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
    } else {
      // Pause typing and reset after a delay
      setIsTyping(false);
      timeoutRef.current = setTimeout(() => {
        resetTyping();
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [currentIndex, memoizedText, speed, isTyping, resetTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return displayedText || 'Search';
};