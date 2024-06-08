import { useEffect, useState } from 'react';

import { scrollToTop } from '~/utils/scrollToTop';

interface UseScrollToTopReturn {
  isVisible: boolean;
  scrollToTop: () => void;
}

export const useScrollToTop = (appearanceHeight = 230): UseScrollToTopReturn => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    if (typeof window !== 'undefined') {
      if (window.scrollY > appearanceHeight) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { isVisible, scrollToTop };
};
