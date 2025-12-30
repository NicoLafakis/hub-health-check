import { useState, useEffect, useCallback } from 'react';

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      for (const shortcut of shortcuts) {
        const matchKey = shortcut.key.toLowerCase() === key;
        const matchCtrl = !!shortcut.ctrl === ctrl;
        const matchShift = !!shortcut.shift === shift;
        const matchAlt = !!shortcut.alt === alt;

        if (matchKey && matchCtrl && matchShift && matchAlt) {
          // Don't trigger if user is typing in an input
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            if (!shortcut.allowInInput) return;
          }

          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setSearch('');
  }, []);
  const toggle = useCallback(() => setIsOpen(o => !o), []);

  return { isOpen, search, setSearch, open, close, toggle };
}
