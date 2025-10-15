import { useEffect, useRef, useCallback, useMemo, useState } from 'react';

/**
 * Debounce hook for search/filter inputs
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook for scroll/resize events
 */
export function useThrottle(value, interval = 200) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= interval) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, interval - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, interval]);

  return throttledValue;
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      ...options
    });

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [targetRef, isIntersecting];
}

/**
 * Virtual scrolling helper for large lists
 */
export function useVirtualScroll(items, itemHeight, containerHeight) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + 2
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        height: itemHeight
      }
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);

  const totalHeight = items.length * itemHeight;

  const onScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return { visibleItems, totalHeight, onScroll };
}

/**
 * Memoize expensive computations
 */
export function useMemoizedValue(computeFn, deps) {
  return useMemo(computeFn, deps);
}

/**
 * Image lazy loading helper
 */
export function useLazyImage(src) {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.01,
    rootMargin: '100px'
  });

  useEffect(() => {
    if (isIntersecting && src && !imageSrc) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
      };
    }
  }, [isIntersecting, src, imageSrc]);

  return [imageRef, imageSrc];
}

/**
 * Performance monitoring
 */
export function measurePerformance(label) {
  const start = performance.now();

  return () => {
    const end = performance.now();
    const duration = end - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  };
}

/**
 * Request Animation Frame hook for smooth animations
 */
export function useAnimationFrame(callback) {
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const animate = useCallback((time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);
}

/**
 * Batch updates for better performance
 */
export function batchUpdates(updates) {
  if (typeof React.unstable_batchedUpdates === 'function') {
    React.unstable_batchedUpdates(() => {
      updates.forEach(update => update());
    });
  } else {
    updates.forEach(update => update());
  }
}

/**
 * Optimize re-renders with React.memo comparator
 */
export function arePropsEqual(prevProps, nextProps, keys) {
  if (!keys || keys.length === 0) {
    return Object.keys(prevProps).every(
      key => prevProps[key] === nextProps[key]
    );
  }
  
  return keys.every(key => prevProps[key] === nextProps[key]);
}

/**
 * Cancel pending async operations
 */
export function useCancelablePromise() {
  const pendingPromises = useRef([]);

  useEffect(() => {
    return () => {
      pendingPromises.current.forEach(promise => promise.cancel());
    };
  }, []);

  const makeCancelable = useCallback((promise) => {
    let hasCanceled = false;

    const wrappedPromise = new Promise((resolve, reject) => {
      promise.then(
        val => hasCanceled ? reject({ isCanceled: true }) : resolve(val),
        error => hasCanceled ? reject({ isCanceled: true }) : reject(error)
      );
    });

    wrappedPromise.cancel = () => {
      hasCanceled = true;
    };

    pendingPromises.current.push(wrappedPromise);

    return wrappedPromise;
  }, []);

  return makeCancelable;
}
