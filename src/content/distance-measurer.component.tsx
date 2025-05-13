import { useCallback, useEffect, useState } from 'react';
import styles from './distance-measurer.styles.module.css'

export const DistanceMeasurer = () => {
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Handlers for Ctrl key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey) setCtrlPressed(true);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (!e.ctrlKey) {
      setCtrlPressed(false);
      setHoveredId(null); // Clear hover states when Ctrl released
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Handlers for elements
  const handleMouseEnter = (id: string) => {
    if (ctrlPressed) setHoveredId(id);
  };

  const handleMouseLeave = (id: string) => {
    if (hoveredId === id) setHoveredId(null);
  };

  const handleClick = (id: string) => {
    if (ctrlPressed) {
      setSelectedIds((prev) => new Set(prev).add(id));
    }
  };

  return (
    <div className={styles.distanceMeasurer}>
      <h1>Lorem ipsum dolor sit amet.</h1>
    </div>
  )
}