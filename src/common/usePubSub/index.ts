import { useEffect, useRef } from 'react';
import { EventEmitter } from 'eventemitter3';

const emitter = new EventEmitter();

/**
 * usePub: Returns a function to emit events.
 */
export const usePub = <T = any>() => {
  return (event: string | symbol, data?: T) => {
    emitter.emit(event, data);
  };
};

/**
 * useSub: Subscribes to an event and handles cleanup.
 * Uses a ref for the callback to avoid stale closure issues
 * without needing to re-subscribe on every render.
 */
export const useSub = <T = any>(
  event: string | symbol,
  callback: (data: T) => void
) => {
  // Keep track of the latest callback without re-subscribing
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (data: T) => callbackRef.current(data);

    emitter.on(event, handler);

    return () => {
      emitter.off(event, handler);
    };
  }, [event]);
};
