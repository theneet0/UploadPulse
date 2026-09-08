import { Capacitor } from '@capacitor/core';

export const isAndroid =
  Capacitor.getPlatform() === 'android' ||
  /Android/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '');

export const isWails = !!(
  typeof window !== 'undefined' &&
  window.go &&
  window.go.main &&
  window.go.main.App
);

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return isAndroid || window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
