import { RefObject, useEffect, useState } from 'react';

export const useIntersectionObserver = (refs: Array<RefObject<HTMLElement>>, options?: IntersectionObserverInit) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, {
      root: document.querySelector('#polls-container'),
      rootMargin: '0px 0px -80% 0px',
      threshold: 0.5,
      ...options
    });

    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, [refs, options]);

  return activeId;
};
