'use client';

import { getActiveRequests, subscribeRequests } from '@/lib/loading-store';
import { cn } from '@/lib/utils';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

const MIN_VISIBLE_MS = 250;
const SAFETY_TIMEOUT_MS = 8000;
const IDLE_CHECK_MS = 80;

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeRequests = useSyncExternalStore(
    subscribeRequests,
    getActiveRequests,
    () => 0,
  );

  const [navigating, setNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  const startPathKey = useRef<string | null>(null);
  const arrivedRef = useRef(false);
  const startedAt = useRef(0);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (idleTimer.current) clearTimeout(idleTimer.current);
  }, []);

  const finish = useCallback(() => {
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    setProgress(1);
    const elapsed = Date.now() - startedAt.current;
    const delay = Math.max(0, MIN_VISIBLE_MS - elapsed);
    hideTimer.current = setTimeout(() => {
      setNavigating(false);
      setProgress(0);
    }, delay + 150);
  }, []);

  const start = useCallback(
    (pathKey: string) => {
      clearTimers();
      startPathKey.current = pathKey;
      arrivedRef.current = false;
      startedAt.current = Date.now();
      setNavigating(true);
      setProgress(0.08);
      safetyTimer.current = setTimeout(finish, SAFETY_TIMEOUT_MS);
    },
    [clearTimers, finish],
  );

  // Intercept clicks on internal links to start the transition before the
  // route actually changes (App Router gives no earlier navigation signal).
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

      const anchor = (event.target as HTMLElement)?.closest('a');
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      const samePath =
        url.pathname === window.location.pathname &&
        url.search === window.location.search;
      if (samePath) return;

      start(`${url.pathname}${url.search}`);
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [start]);

  // Ramp progress up gradually while the route hasn't settled yet.
  useEffect(() => {
    if (!navigating) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 0.9 ? prev + (0.9 - prev) * 0.1 : prev));
    }, 200);
    return () => clearInterval(interval);
  }, [navigating]);

  // Mark arrival once the new route has actually rendered, then wait for
  // in-flight page data requests (SWR via lib/fetcher) to settle before
  // hiding the bar, with a short debounce to absorb late-starting fetches.
  useEffect(() => {
    if (!navigating) return;

    const currentKey = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    if (currentKey === startPathKey.current) {
      arrivedRef.current = true;
    }
    if (!arrivedRef.current) return;

    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      if (getActiveRequests() === 0) finish();
    }, IDLE_CHECK_MS);

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [pathname, searchParams, activeRequests, navigating, finish]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  if (!navigating && progress === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-100 h-0.5">
      <div
        className={cn(
          'h-full bg-primary shadow-[0_0_8px_var(--color-primary)] transition-[width,opacity] duration-200 ease-out',
          progress >= 1 ? 'opacity-0' : 'opacity-100',
        )}
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
