
import { useState } from 'react';

export const useUILayoutController = () => {
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);

  const toggleLibraryCollapse = () => {
    setIsLibraryCollapsed(prev => !prev);
  };

  return {
    isLibraryCollapsed,
    toggleLibraryCollapse,
  };
};
