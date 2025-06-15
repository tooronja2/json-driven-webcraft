
import { useEffect, useRef, useState } from "react";

export function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        setRevealed(true);
        observer.disconnect();
      }
    };
    const observer = new window.IntersectionObserver(handleIntersect, {
      threshold: 0.15,
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}
