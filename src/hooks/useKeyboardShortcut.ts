import { useEffect, useCallback } from "react";

type KeyHandler = () => void;

export function useKeyboardShortcut(
  key: string,
  callback: KeyHandler,
  modifiers: { ctrl?: boolean; meta?: boolean; shift?: boolean } = {}
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const ctrlMatch = !modifiers.ctrl || event.ctrlKey;
      const metaMatch = !modifiers.meta || event.metaKey;
      const shiftMatch = !modifiers.shift || event.shiftKey;
      const keyMatch = event.key.toLowerCase() === key.toLowerCase();

      if (keyMatch && ctrlMatch && metaMatch && shiftMatch) {
        event.preventDefault();
        callback();
      }

      // Also match ctrl OR meta for cross-platform
      if (
        keyMatch &&
        (modifiers.ctrl || modifiers.meta) &&
        (event.ctrlKey || event.metaKey) &&
        shiftMatch
      ) {
        event.preventDefault();
        callback();
      }
    },
    [key, callback, modifiers]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
